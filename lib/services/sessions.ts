// E8 T8.1 T8.3 T8.4: Session server actions — generate, status update, reschedule
// Closes #54 #56 #57

"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { generateSessions as generateSessionSlots, SchedulePattern } from "@/lib/services/scheduling";
import {
  getSessionUsageAdjustment,
  isSessionCompletionAllowed,
} from "@/lib/services/session-status-transitions";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { revalidatePath } from "next/cache";

// ── Auth helpers ───────────────────────────────────────────────────────────────

async function requireAuthenticatedUser(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized: not authenticated");
  return user.id;
}

// ── T8.1: Session Generation ──────────────────────────────────────────────────

/**
 * Generate N sessions for a match based on the match's schedule_pattern and
 * the active package's start_date, end_date, and tier_sessions.
 * Advances match.status and requests.status to 'active'.
 */
export async function generateSessionsForMatch(
  matchId: string,
): Promise<{ error?: string; count?: number }> {
  try {
    const adminUserId = await requireAdmin();
    const admin = createAdminClient();

    // Fetch match
    const { data: match, error: matchErr } = await admin
      .from("matches")
      .select("schedule_pattern, request_id, meet_link, status")
      .eq("id", matchId)
      .single();

    if (matchErr || !match) throw new Error("Match not found.");
    if (!match.schedule_pattern)
      throw new Error("Match has no schedule pattern set.");
    if (!match.meet_link)
      throw new Error("Match has no Meet link set. Set the Meet link first.");

    // Fetch active package
    const { data: pkg, error: pkgErr } = await admin
      .from("packages")
      .select("tier_sessions, start_date, end_date")
      .eq("request_id", match.request_id)
      .eq("status", "active")
      .maybeSingle();

    if (pkgErr || !pkg)
      throw new Error("No active package found for this match.");

    // Check if sessions already exist
    const { count: existingCount } = await admin
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("match_id", matchId);

    if ((existingCount ?? 0) > 0) {
      throw new Error(
        `Sessions already generated for this match (${existingCount} sessions exist). Delete them first if you need to regenerate.`,
      );
    }

    const sessionTimes = generateSessionSlots(
      match.schedule_pattern as unknown as SchedulePattern,
      pkg.start_date,
      pkg.end_date,
      pkg.tier_sessions,
    );

    if (sessionTimes.length === 0) {
      throw new Error(
        "No sessions could be generated. Check that the schedule days fall within the package date range.",
      );
    }

    const rows = sessionTimes.map((s) => ({
      match_id: matchId,
      scheduled_start_utc: s.start_utc,
      scheduled_end_utc: s.end_utc,
      status: "scheduled" as const,
    }));

    const { error: insertErr } = await admin.from("sessions").insert(rows);
    if (insertErr)
      throw new Error(`Failed to insert sessions: ${insertErr.message}`);

    // Advance match to active — roll back sessions if this fails
    const { error: matchUpdateErr } = await admin
      .from("matches")
      .update({ status: "active" })
      .eq("id", matchId);
    if (matchUpdateErr) {
      await admin.from("sessions").delete().eq("match_id", matchId);
      throw new Error(`Failed to activate match: ${matchUpdateErr.message}`);
    }

    // Advance request to active — roll back sessions and match status if this fails
    const { error: requestUpdateErr } = await admin
      .from("requests")
      .update({ status: "active" })
      .eq("id", match.request_id);
    if (requestUpdateErr) {
      await admin.from("sessions").delete().eq("match_id", matchId);
      await admin
        .from("matches")
        .update({ status: match.status })
        .eq("id", matchId);
      throw new Error(
        `Failed to activate request: ${requestUpdateErr.message}`,
      );
    }

    // Audit log
    await admin.from("audit_logs").insert([
      {
        actor_user_id: adminUserId,
        action: "sessions_generated",
        entity_type: "match",
        entity_id: matchId,
        details: { session_count: rows.length },
      },
    ]);

    revalidatePath(`/admin/matches/${matchId}`);
    revalidatePath("/admin/sessions");
    revalidatePath("/admin/matches");

    return { count: rows.length };
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
}

// ── Delete Sessions for a Match ───────────────────────────────────────────────

/**
 * Delete all sessions for a match and revert match + request status back to
 * 'matched' so the admin can edit the schedule and regenerate.
 */
export async function deleteSessionsForMatch(
  matchId: string,
): Promise<{ error?: string; count?: number }> {
  try {
    const adminUserId = await requireAdmin();
    const admin = createAdminClient();

    // Fetch match
    const { data: match, error: matchErr } = await admin
      .from("matches")
      .select("request_id, status")
      .eq("id", matchId)
      .single();
    if (matchErr || !match) throw new Error("Match not found.");

    // Count sessions before deleting (for audit log)
    const { count: existingCount } = await admin
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("match_id", matchId);

    if ((existingCount ?? 0) === 0) {
      throw new Error("No sessions to delete for this match.");
    }

    // Delete all sessions for this match
    const { error: deleteErr } = await admin
      .from("sessions")
      .delete()
      .eq("match_id", matchId);
    if (deleteErr) throw new Error(`Failed to delete sessions: ${deleteErr.message}`);

    // Reset sessions_used to 0 on the active package — the deleted sessions may have
    // had their counts incremented (done / no_show_student) and those increments are
    // no longer meaningful against the fresh set of sessions about to be regenerated.
    const { error: pkgResetErr } = await admin
      .from("packages")
      .update({ sessions_used: 0 })
      .eq("request_id", match.request_id)
      .eq("status", "active");
    if (pkgResetErr) throw new Error(`Failed to reset sessions_used: ${pkgResetErr.message}`);

    // Revert match + request status back to 'matched' so sessions can be regenerated
    if (match.status === "active") {
      const { error: matchRevertErr } = await admin
        .from("matches")
        .update({ status: "matched" })
        .eq("id", matchId);
      if (matchRevertErr) throw new Error(`Failed to revert match status: ${matchRevertErr.message}`);

      const { error: reqRevertErr } = await admin
        .from("requests")
        .update({ status: "matched" })
        .eq("id", match.request_id);
      if (reqRevertErr) throw new Error(`Failed to revert request status: ${reqRevertErr.message}`);
    }

    await admin.from("audit_logs").insert([
      {
        actor_user_id: adminUserId,
        action: "sessions_deleted",
        entity_type: "match",
        entity_id: matchId,
        details: { session_count: existingCount ?? 0, request_id: match.request_id, sessions_used_reset: true },
      },
    ]);

    revalidatePath(`/admin/matches/${matchId}`);
    revalidatePath("/admin/sessions");
    revalidatePath("/admin/matches");

    return { count: existingCount ?? 0 };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
}

// ── T8.3: Session Status Update (admin) ──────────────────────────────────────

/**
 * Admin: update a session's status (and optionally tutor notes).
 * Guards against double-incrementing sessions_used when transitioning
 * between consuming/non-consuming statuses.
 */
export async function updateSessionStatus({
  sessionId,
  matchId,
  requestId,
  status,
  tutorNotes,
}: {
  sessionId: string;
  matchId: string;
  requestId: string;
  status: "done" | "no_show_student" | "no_show_tutor" | "rescheduled";
  tutorNotes?: string;
}): Promise<{ error?: string }> {
  try {
    const adminUserId = await requireAdmin();
    const admin = createAdminClient();

    // Fetch current session status to keep package usage counters in sync.
    const { data: current, error: fetchErr } = await admin
      .from("sessions")
      .select("status")
      .eq("id", sessionId)
      .single();
    if (fetchErr || !current) throw new Error("Session not found.");

    // Update session
    const { error: updateErr } = await admin
      .from("sessions")
      .update({
        status,
        tutor_notes: tutorNotes ?? null,
        updated_by_user_id: adminUserId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    if (updateErr)
      throw new Error(`Failed to update session: ${updateErr.message}`);

    const usageAdjustment = getSessionUsageAdjustment(current.status, status);
    if (usageAdjustment === 1) {
      const { error: rpcErr } = await admin.rpc("increment_sessions_used", {
        p_request_id: requestId,
      });
      if (rpcErr)
        throw new Error(`Failed to increment sessions_used: ${rpcErr.message}`);
    }
    if (usageAdjustment === -1) {
      const { error: rpcErr } = await admin.rpc("decrement_sessions_used", {
        p_request_id: requestId,
      });
      if (rpcErr)
        throw new Error(`Failed to decrement sessions_used: ${rpcErr.message}`);
    }

    // Audit log
    await admin.from("audit_logs").insert([
      {
        actor_user_id: adminUserId,
        action: "session_status_updated",
        entity_type: "session",
        entity_id: sessionId,
        details: {
          previous_status: current.status,
          status,
          tutor_notes: tutorNotes ?? null,
          match_id: matchId,
        },
      },
    ]);

    revalidatePath("/admin/sessions");
    revalidatePath("/tutor/sessions");
    revalidatePath("/dashboard/sessions");

    return {};
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
}

/**
 * Tutor: update a session's status using the tutor_update_session RPC.
 * The RPC enforces authorization (only the assigned tutor or admin).
 * Allowed statuses: done, no_show_student, no_show_tutor.
 */
export async function tutorUpdateSessionStatus({
  sessionId,
  status,
  tutorNotes,
}: {
  sessionId: string;
  status: "done" | "no_show_student" | "no_show_tutor";
  tutorNotes?: string;
}): Promise<{ error?: string }> {
  try {
    await requireAuthenticatedUser();
    const supabase = await createClient();

    const { data: session, error: sessionErr } = await supabase
      .from("sessions")
      .select("scheduled_start_utc")
      .eq("id", sessionId)
      .single();

    if (sessionErr || !session) throw new Error("Session not found.");
    if (!isSessionCompletionAllowed({ scheduledStartUtc: session.scheduled_start_utc })) {
      throw new Error("Session has not started yet.");
    }

    // Use the security-definer RPC which handles authorization and sessions_used increment
    const { error } = await supabase.rpc("tutor_update_session", {
      p_session_id: sessionId,
      p_status: status,
      p_notes: tutorNotes ?? "",
    });

    if (error) throw new Error(error.message);

    revalidatePath("/tutor/sessions");
    revalidatePath("/admin/sessions");
    revalidatePath("/dashboard/sessions");

    return {};
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
}

// ── T8.4: Reschedule Session ──────────────────────────────────────────────────

/**
 * Reschedule a session: update scheduled_start_utc, scheduled_end_utc,
 * and reset status to 'scheduled' so the session can still be marked done/no-show.
 * The reschedule event is recorded in the audit log.
 * Does NOT increment sessions_used.
 */
export async function rescheduleSession({
  sessionId,
  newStartUtc,
  newEndUtc,
  reason,
}: {
  sessionId: string;
  newStartUtc: string; // ISO UTC string
  newEndUtc: string; // ISO UTC string
  reason?: string;
}): Promise<{ error?: string }> {
  try {
    const adminUserId = await requireAdmin();
    const admin = createAdminClient();

    // Prevent rescheduling to a past datetime
    if (new Date(newStartUtc) < new Date()) {
      throw new Error("Cannot reschedule a session to a past date and time.");
    }

    const { error: updateErr } = await admin
      .from("sessions")
      .update({
        scheduled_start_utc: newStartUtc,
        scheduled_end_utc: newEndUtc,
        // Reset to 'scheduled' so the session can still be marked done/no-show
        status: "scheduled",
        updated_by_user_id: adminUserId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    if (updateErr)
      throw new Error(`Failed to reschedule session: ${updateErr.message}`);

    await admin.from("audit_logs").insert([
      {
        actor_user_id: adminUserId,
        action: "session_rescheduled",
        entity_type: "session",
        entity_id: sessionId,
        details: {
          new_start_utc: newStartUtc,
          new_end_utc: newEndUtc,
          reason: reason ?? null,
        },
      },
    ]);

    revalidatePath("/admin/sessions");
    revalidatePath("/tutor/sessions");
    revalidatePath("/dashboard/sessions");

    return {};
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
}
