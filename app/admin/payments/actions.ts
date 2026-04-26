// E5 T5.3 S5.2: Admin payment server actions — mark paid / rejected
// Closes #35 #32

'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { revalidatePath } from 'next/cache'
import { markPaidSchema, rejectPaymentSchema } from '@/lib/validators/payment'
import { sanitizeAuditDetails } from '@/lib/audit/sanitize'

export async function markPaymentPaid(
  paymentId: string,
  packageId: string,
  requestId: string
) {
  // Validate inputs
  const parsed = markPaidSchema.safeParse({ paymentId, packageId, requestId })
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const adminUserId = await requireAdmin()
  const admin = createAdminClient()

  // Only update if payment is currently pending (prevents double-processing)
  const { data: updatedPayments, error: paymentError } = await admin
    .from('payments')
    .update({
      status: 'paid',
      verified_by_user_id: adminUserId,
      verified_at: new Date().toISOString(),
    })
    .eq('id', paymentId)
    .eq('status', 'pending')
    .select()

  if (paymentError) throw new Error(`Failed to update payment: ${paymentError.message}`)
  if (!updatedPayments || updatedPayments.length === 0) {
    throw new Error('Payment is not in pending status — no update applied.')
  }

  const { error: pkgError } = await admin
    .from('packages')
    .update({ status: 'active' })
    .eq('id', packageId)

  if (pkgError) {
    // Best-effort rollback: revert payment to pending
    const { error: rollbackErr } = await admin
      .from('payments')
      .update({ status: 'pending', verified_by_user_id: null, verified_at: null })
      .eq('id', paymentId)
    if (rollbackErr) {
      console.error('Rollback failed for payment', paymentId, rollbackErr.message)
    }
    throw new Error(`Failed to activate package: ${pkgError.message}`)
  }

  const { error: reqError } = await admin
    .from('requests')
    .update({ status: 'ready_to_match' })
    .eq('id', requestId)

  if (reqError) {
    // Best-effort rollback: revert package and payment
    const { error: rollbackPkgErr } = await admin
      .from('packages')
      .update({ status: 'pending' })
      .eq('id', packageId)
    if (rollbackPkgErr) {
      console.error('Rollback failed for package', packageId, rollbackPkgErr.message)
    }
    const { error: rollbackPayErr } = await admin
      .from('payments')
      .update({ status: 'pending', verified_by_user_id: null, verified_at: null })
      .eq('id', paymentId)
    if (rollbackPayErr) {
      console.error('Rollback failed for payment', paymentId, rollbackPayErr.message)
    }
    throw new Error(`Failed to advance request: ${reqError.message}`)
  }

  const { error: auditError } = await admin.from('audit_logs').insert([
    {
      actor_user_id: adminUserId,
      action: 'payment_marked_paid',
      entity_type: 'payment',
      entity_id: paymentId,
      details: sanitizeAuditDetails({ package_id: packageId, request_id: requestId }),
    },
  ])
  if (auditError) {
    console.error('Audit log insert failed (payment_marked_paid):', auditError.message)
  }

  revalidatePath('/admin/payments')
}

export async function markPaymentRejected(
  paymentId: string,
  rejectionNote: string
) {
  // Validate inputs
  const parsed = rejectPaymentSchema.safeParse({ paymentId, rejectionNote })
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const adminUserId = await requireAdmin()
  const admin = createAdminClient()

  // Only update if payment is currently pending (prevents double-processing)
  const { data: updatedPayments, error } = await admin
    .from('payments')
    .update({
      status: 'rejected',
      rejection_note: rejectionNote || null,
      verified_by_user_id: adminUserId,
      verified_at: new Date().toISOString(),
    })
    .eq('id', paymentId)
    .eq('status', 'pending')
    .select()

  if (error) throw new Error(`Failed to reject payment: ${error.message}`)
  if (!updatedPayments || updatedPayments.length === 0) {
    throw new Error('Payment is not in pending status — no update applied.')
  }

  const { error: auditError } = await admin.from('audit_logs').insert([
    {
      actor_user_id: adminUserId,
      action: 'payment_marked_rejected',
      entity_type: 'payment',
      entity_id: paymentId,
      details: sanitizeAuditDetails({ rejection_note: rejectionNote }),
    },
  ])
  if (auditError) {
    console.error('Audit log insert failed (payment_marked_rejected):', auditError.message)
  }

  revalidatePath('/admin/payments')
}

export async function getPaymentProofUrl(proofPath: string): Promise<string | null> {
  await requireAdmin()
  const admin = createAdminClient()

  const { data } = await admin.storage
    .from('payment-proofs')
    .createSignedUrl(proofPath, 300)

  return data?.signedUrl ?? null
}
