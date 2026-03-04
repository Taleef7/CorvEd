import { createAdminClient } from "@/lib/supabase/admin";

/** Valid request status transitions */
export const VALID_TRANSITIONS: Record<string, string[]> = {
  new: ["payment_pending", "ended"],
  payment_pending: ["ready_to_match", "ended"],
  ready_to_match: ["matched", "ended"],
  matched: ["active", "ended"],
  active: ["paused", "ended"],
  paused: ["active", "ended"],
  ended: [],
};

export function isValidTransition(from: string, to: string): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Fetch a request by ID with full joins (admin use) */
export async function getRequestById(requestId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("requests")
    .select(
      `
      id, level, subject_id, status, goals, availability, timezone,
      for_student_name, requester_role, created_at, updated_at,
      created_by_user_id,
      subjects ( name ),
      user_profiles!requests_created_by_user_id_fkey ( display_name, whatsapp_number )
    `,
    )
    .eq("id", requestId)
    .maybeSingle();

  return data;
}
