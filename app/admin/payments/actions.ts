// E5 T5.3 S5.2: Admin payment server actions — mark paid / rejected
// Closes #35 #32

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

export async function markPaymentPaid(
  paymentId: string,
  packageId: string,
  requestId: string
) {
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
      details: { package_id: packageId, request_id: requestId },
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
      details: { rejection_note: rejectionNote },
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
