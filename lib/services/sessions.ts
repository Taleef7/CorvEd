// E8 T8.1 T8.3 T8.4: Session server actions — generate, status update, reschedule
// Closes #54 #56 #57

'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { generateSessions as generateSessionSlots } from '@/lib/services/scheduling'
import { revalidatePath } from 'next/cache'

// ── Auth helper ────────────────────────────────────────────────────────────────

async function requireAdmin(): Promise<string> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized: not authenticated')

  const admin = createAdminClient()
  const { data: roles } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)

  const isAdmin = roles?.some((r) => r.role === 'admin') ?? false
  if (!isAdmin) throw new Error('Unauthorized: admin role required')

  return user.id
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
    const adminUserId = await requireAdmin()
    const admin = createAdminClient()

    // Fetch match
    const { data: match, error: matchErr } = await admin
      .from('matches')
      .select('schedule_pattern, request_id, meet_link, status')
      .eq('id', matchId)
      .single()

    if (matchErr || !match) throw new Error('Match not found.')
    if (!match.schedule_pattern) throw new Error('Match has no schedule pattern set.')
    if (!match.meet_link) throw new Error('Match has no Meet link set. Set the Meet link first.')

    // Fetch active package
    const { data: pkg, error: pkgErr } = await admin
      .from('packages')
      .select('tier_sessions, start_date, end_date')
      .eq('request_id', match.request_id)
      .eq('status', 'active')
      .maybeSingle()

    if (pkgErr || !pkg) throw new Error('No active package found for this match.')

    // Check if sessions already exist
    const { count: existingCount } = await admin
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .eq('match_id', matchId)

    if ((existingCount ?? 0) > 0) {
      throw new Error(
        `Sessions already generated for this match (${existingCount} sessions exist). Delete them first if you need to regenerate.`,
      )
    }

    const sessionTimes = generateSessionSlots(
      match.schedule_pattern as Parameters<typeof generateSessionSlots>[0],
      pkg.start_date,
      pkg.end_date,
      pkg.tier_sessions,
    )

    if (sessionTimes.length === 0) {
      throw new Error(
        'No sessions could be generated. Check that the schedule days fall within the package date range.',
      )
    }

    const rows = sessionTimes.map((s) => ({
      match_id: matchId,
      scheduled_start_utc: s.start_utc,
      scheduled_end_utc: s.end_utc,
      status: 'scheduled' as const,
    }))

    const { error: insertErr } = await admin.from('sessions').insert(rows)
    if (insertErr) throw new Error(`Failed to insert sessions: ${insertErr.message}`)

    // Advance match and request to active
    await admin.from('matches').update({ status: 'active' }).eq('id', matchId)
    await admin.from('requests').update({ status: 'active' }).eq('id', match.request_id)

    // Audit log
    await admin.from('audit_logs').insert([
      {
        actor_user_id: adminUserId,
        action: 'sessions_generated',
        entity_type: 'match',
        entity_id: matchId,
        details: { session_count: rows.length },
      },
    ])

    revalidatePath(`/admin/matches/${matchId}`)
    revalidatePath('/admin/sessions')
    revalidatePath('/admin/matches')

    return { count: rows.length }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}

// ── T8.3: Session Status Update ───────────────────────────────────────────────

const SESSION_CONSUMING_STATUSES = ['done', 'no_show_student'] as const

/**
 * Update a session's status (and optionally tutor notes).
 * Atomically increments packages.sessions_used when the status consumes a session.
 */
export async function updateSessionStatus({
  sessionId,
  matchId,
  requestId,
  status,
  tutorNotes,
}: {
  sessionId: string
  matchId: string
  requestId: string
  status: 'done' | 'no_show_student' | 'no_show_tutor' | 'rescheduled'
  tutorNotes?: string
}): Promise<{ error?: string }> {
  try {
    const adminUserId = await requireAdmin()
    const admin = createAdminClient()

    // Update session
    const { error: updateErr } = await admin
      .from('sessions')
      .update({
        status,
        tutor_notes: tutorNotes ?? null,
        updated_by_user_id: adminUserId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)

    if (updateErr) throw new Error(`Failed to update session: ${updateErr.message}`)

    // Increment sessions_used atomically if status consumes a session
    if (SESSION_CONSUMING_STATUSES.includes(status as (typeof SESSION_CONSUMING_STATUSES)[number])) {
      const { error: rpcErr } = await admin.rpc('increment_sessions_used', {
        p_request_id: requestId,
      })
      if (rpcErr) {
        console.error('increment_sessions_used RPC failed:', rpcErr.message)
      }
    }

    // Audit log
    await admin.from('audit_logs').insert([
      {
        actor_user_id: adminUserId,
        action: 'session_status_updated',
        entity_type: 'session',
        entity_id: sessionId,
        details: { status, tutor_notes: tutorNotes ?? null, match_id: matchId },
      },
    ])

    revalidatePath('/admin/sessions')
    revalidatePath('/tutor/sessions')

    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}

// ── T8.4: Reschedule Session ──────────────────────────────────────────────────

/**
 * Reschedule a session: update scheduled_start_utc, scheduled_end_utc,
 * set status to 'rescheduled', and write an audit log.
 * Does NOT increment sessions_used.
 */
export async function rescheduleSession({
  sessionId,
  newStartUtc,
  newEndUtc,
  reason,
}: {
  sessionId: string
  newStartUtc: string   // ISO UTC string
  newEndUtc: string     // ISO UTC string
  reason?: string
}): Promise<{ error?: string }> {
  try {
    const adminUserId = await requireAdmin()
    const admin = createAdminClient()

    const { error: updateErr } = await admin
      .from('sessions')
      .update({
        scheduled_start_utc: newStartUtc,
        scheduled_end_utc: newEndUtc,
        status: 'rescheduled',
        updated_by_user_id: adminUserId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)

    if (updateErr) throw new Error(`Failed to reschedule session: ${updateErr.message}`)

    await admin.from('audit_logs').insert([
      {
        actor_user_id: adminUserId,
        action: 'session_rescheduled',
        entity_type: 'session',
        entity_id: sessionId,
        details: {
          new_start_utc: newStartUtc,
          new_end_utc: newEndUtc,
          reason: reason ?? null,
        },
      },
    ])

    revalidatePath('/admin/sessions')
    revalidatePath('/tutor/sessions')
    revalidatePath('/dashboard/sessions')

    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}
