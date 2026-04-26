'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { sanitizeAuditDetails } from '@/lib/audit/sanitize'
import { leadStatusUpdateSchema } from '@/lib/validators/lead-admin'

export async function updateLeadStatus(formData: FormData) {
  const adminUserId = await requireAdmin()
  const parsed = leadStatusUpdateSchema.safeParse({
    leadId: formData.get('leadId'),
    status: formData.get('status'),
    admin_notes: formData.get('admin_notes') ?? '',
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((issue) => issue.message).join(', '))
  }

  const admin = createAdminClient()
  const { leadId, status, admin_notes } = parsed.data

  const { data: previousLead, error: fetchError } = await admin
    .from('leads')
    .select('id, status')
    .eq('id', leadId)
    .maybeSingle()

  if (fetchError) throw new Error(`Failed to load lead: ${fetchError.message}`)
  if (!previousLead) throw new Error('Lead not found.')

  const { error } = await admin
    .from('leads')
    .update({
      status,
      admin_notes: admin_notes?.trim() ? admin_notes.trim() : null,
    })
    .eq('id', leadId)

  if (error) throw new Error(`Failed to update lead: ${error.message}`)

  await admin.from('audit_logs').insert([
    {
      actor_user_id: adminUserId,
      action: 'lead_status_updated',
      entity_type: 'lead',
      entity_id: leadId,
      details: sanitizeAuditDetails({
        previous_status: previousLead.status,
        status,
        admin_notes,
      }),
    },
  ])

  revalidatePath('/admin')
  revalidatePath('/admin/analytics')
  revalidatePath('/admin/leads')
}
