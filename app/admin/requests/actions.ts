// E7 T7.3 T7.4: Admin server actions for tutor assignment and reassignment
// Closes #49 #50

'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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

/** Create a match record, advance request to 'matched', and write audit log. */
export async function assignTutor({
  requestId,
  tutorUserId,
  meetLink,
  schedulePattern,
}: {
  requestId: string
  tutorUserId: string
  meetLink?: string
  schedulePattern?: {
    timezone: string
    days: number[]
    time: string
    duration_mins: number
  }
}): Promise<{ error?: string; matchId?: string }> {
  try {
    const adminUserId = await requireAdmin()
    const admin = createAdminClient()

    const { data: match, error } = await admin
      .from('matches')
      .insert([
        {
          request_id: requestId,
          tutor_user_id: tutorUserId,
          status: 'matched',
          meet_link: meetLink || null,
          schedule_pattern: schedulePattern ?? null,
          assigned_by_user_id: adminUserId,
          assigned_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw new Error(`Failed to create match: ${error.message}`)

    // Advance request status to 'matched'
    const { error: reqError } = await admin
      .from('requests')
      .update({ status: 'matched', updated_at: new Date().toISOString() })
      .eq('id', requestId)

    if (reqError) throw new Error(`Failed to advance request: ${reqError.message}`)

    // Audit log
    const { error: auditError } = await admin.from('audit_logs').insert([
      {
        actor_user_id: adminUserId,
        action: 'tutor_assigned',
        entity_type: 'match',
        entity_id: match.id,
        details: { tutor_user_id: tutorUserId, request_id: requestId },
      },
    ])
    if (auditError) {
      console.error('Audit log insert failed (tutor_assigned):', auditError.message)
    }

    revalidatePath(`/admin/requests/${requestId}`)
    revalidatePath('/admin/requests')
    revalidatePath('/admin/matches')
    return { matchId: match.id }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}

/** Update match.tutor_user_id to a new tutor and write audit log (history kept). */
export async function reassignTutor({
  matchId,
  previousTutorUserId,
  newTutorUserId,
  reason,
}: {
  matchId: string
  previousTutorUserId: string
  newTutorUserId: string
  reason?: string
}): Promise<{ error?: string }> {
  try {
    const adminUserId = await requireAdmin()
    const admin = createAdminClient()

    const { error } = await admin
      .from('matches')
      .update({
        tutor_user_id: newTutorUserId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', matchId)

    if (error) throw new Error(`Failed to reassign tutor: ${error.message}`)

    const { error: auditError } = await admin.from('audit_logs').insert([
      {
        actor_user_id: adminUserId,
        action: 'tutor_reassigned',
        entity_type: 'match',
        entity_id: matchId,
        details: {
          old_tutor_user_id: previousTutorUserId,
          new_tutor_user_id: newTutorUserId,
          reason: reason || null,
        },
      },
    ])
    if (auditError) {
      console.error('Audit log insert failed (tutor_reassigned):', auditError.message)
    }

    revalidatePath(`/admin/matches/${matchId}`)
    revalidatePath('/admin/requests')
    revalidatePath('/admin/matches')
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}

/** Update the meet_link and/or schedule_pattern on an existing match. */
export async function updateMatchDetails({
  matchId,
  meetLink,
  schedulePattern,
}: {
  matchId: string
  meetLink?: string
  schedulePattern?: {
    timezone: string
    days: number[]
    time: string
    duration_mins: number
  }
}): Promise<{ error?: string }> {
  try {
    const adminUserId = await requireAdmin()
    const admin = createAdminClient()

    const { error } = await admin
      .from('matches')
      .update({
        meet_link: meetLink ?? null,
        schedule_pattern: schedulePattern ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', matchId)

    if (error) throw new Error(`Failed to update match: ${error.message}`)

    const { error: auditError } = await admin.from('audit_logs').insert([
      {
        actor_user_id: adminUserId,
        action: 'match_details_updated',
        entity_type: 'match',
        entity_id: matchId,
        details: { meet_link: meetLink ?? null },
      },
    ])
    if (auditError) {
      console.error('Audit log insert failed (match_details_updated):', auditError.message)
    }

    revalidatePath(`/admin/matches/${matchId}`)
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}
