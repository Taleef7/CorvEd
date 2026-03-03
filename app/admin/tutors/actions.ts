// E6 T6.2: Admin server actions for tutor approval workflow
// Closes #41

'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { revalidatePath } from 'next/cache'

/** Set tutor_profiles.approved = true and write audit log. */
export async function approveTutor(tutorUserId: string): Promise<{ error?: string }> {
  try {
    const adminUserId = await requireAdmin()
    const admin = createAdminClient()

    const { error } = await admin
      .from('tutor_profiles')
      .update({ approved: true, updated_at: new Date().toISOString() })
      .eq('tutor_user_id', tutorUserId)

    if (error) throw new Error(`Failed to approve tutor: ${error.message}`)

    const { error: auditError } = await admin.from('audit_logs').insert([
      {
        actor_user_id: adminUserId,
        action: 'tutor_approved',
        entity_type: 'tutor_profile',
        entity_id: tutorUserId,
        details: {},
      },
    ])
    if (auditError) {
      console.error('Audit log insert failed (tutor_approved):', auditError.message)
    }

    revalidatePath('/admin/tutors')
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}

/** Set tutor_profiles.approved = false and write audit log. */
export async function revokeTutorApproval(tutorUserId: string): Promise<{ error?: string }> {
  try {
    const adminUserId = await requireAdmin()
    const admin = createAdminClient()

    const { error } = await admin
      .from('tutor_profiles')
      .update({ approved: false, updated_at: new Date().toISOString() })
      .eq('tutor_user_id', tutorUserId)

    if (error) throw new Error(`Failed to revoke tutor approval: ${error.message}`)

    const { error: auditError } = await admin.from('audit_logs').insert([
      {
        actor_user_id: adminUserId,
        action: 'tutor_approval_revoked',
        entity_type: 'tutor_profile',
        entity_id: tutorUserId,
        details: {},
      },
    ])
    if (auditError) {
      console.error('Audit log insert failed (tutor_approval_revoked):', auditError.message)
    }

    revalidatePath('/admin/tutors')
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}
