'use server'

import { revalidatePath } from 'next/cache'
import { PACKAGES, type PackageTier } from '@/lib/config/pricing'
import { isPaymentProofPathForPackage } from '@/lib/payments/proofs'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

function getPackageTier(tier: number): PackageTier | null {
  return PACKAGES.some((pkg) => pkg.tier === tier) ? (tier as PackageTier) : null
}

/**
 * Generate a signed URL for a payment proof file.
 * Only the owner of the payment can request this.
 */
export async function getPaymentProofSignedUrl(
  proofPath: string,
  packageId: string
): Promise<{ url: string | null; error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { url: null, error: 'Not authenticated' }
  }

  // Verify the user owns this payment
  const { data: payment } = await supabase
    .from('payments')
    .select('id, payer_user_id, proof_path')
    .eq('package_id', packageId)
    .maybeSingle()

  if (!payment || payment.payer_user_id !== user.id) {
    return { url: null, error: 'Unauthorized' }
  }

  if (
    !payment.proof_path
    || payment.proof_path !== proofPath
    || !isPaymentProofPathForPackage({ proofPath, userId: user.id, packageId })
  ) {
    return { url: null, error: 'Proof not found' }
  }

  const { data } = await supabase.storage
    .from('payment-proofs')
    .createSignedUrl(proofPath, 300) // 5 minute expiry

  return { url: data?.signedUrl ?? null, error: null }
}

export async function checkoutPackage(
  requestId: string,
  tier: number,
): Promise<{ packageId: string | null; error: string | null }> {
  const selectedTier = getPackageTier(tier)
  if (!selectedTier) {
    return { packageId: null, error: 'Invalid package selection.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { packageId: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase.rpc('checkout_package', {
    p_request_id: requestId,
    p_tier_sessions: selectedTier,
  })

  if (error || !data) {
    return {
      packageId: null,
      error: error?.message ?? 'Failed to create package. Please try again.',
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/requests')
  revalidatePath(`/dashboard/packages/${data}`)

  return { packageId: data, error: null }
}

export async function updatePendingPaymentDetails(
  paymentId: string,
  reference: string | null,
  proofPath: string | null,
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: payment } = await supabase
    .from('payments')
    .select('id, package_id, payer_user_id, status')
    .eq('id', paymentId)
    .single()

  if (!payment || payment.payer_user_id !== user.id) {
    return { success: false, error: 'Unauthorized' }
  }

  if (payment.status !== 'pending') {
    return { success: false, error: 'Payment is not in pending status' }
  }

  if (
    proofPath
    && !isPaymentProofPathForPackage({
      proofPath,
      userId: user.id,
      packageId: payment.package_id,
    })
  ) {
    return { success: false, error: 'Invalid proof path' }
  }

  const admin = createAdminClient()
  const { data: updated, error } = await admin
    .from('payments')
    .update({
      reference: reference?.trim() || null,
      proof_path: proofPath,
      rejection_note: null,
      verified_by_user_id: null,
      verified_at: null,
    })
    .eq('id', paymentId)
    .eq('payer_user_id', user.id)
    .eq('status', 'pending')
    .select('id, package_id')

  if (error || !updated || updated.length === 0) {
    return { success: false, error: 'Failed to save payment details. Please try again.' }
  }

  revalidatePath(`/dashboard/packages/${payment.package_id}`)
  revalidatePath('/admin/payments')

  return { success: true, error: null }
}

/**
 * Resubmit a rejected payment — resets status to pending.
 */
export async function resubmitRejectedPayment(
  paymentId: string,
  reference: string | null,
  proofPath: string | null
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Verify the user owns this payment and it's rejected
  const { data: payment } = await supabase
    .from('payments')
    .select('id, package_id, payer_user_id, status')
    .eq('id', paymentId)
    .single()

  if (!payment || payment.payer_user_id !== user.id) {
    return { success: false, error: 'Unauthorized' }
  }

  if (payment.status !== 'rejected') {
    return { success: false, error: 'Payment is not in rejected status' }
  }

  if (
    proofPath
    && !isPaymentProofPathForPackage({
      proofPath,
      userId: user.id,
      packageId: payment.package_id,
    })
  ) {
    return { success: false, error: 'Invalid proof path' }
  }

  const admin = createAdminClient()

  // Reset payment to pending with new proof/reference. The admin client is used
  // after ownership validation because the payer RLS update policy only permits
  // edits to already-pending rows.
  const { data: updated, error } = await admin
    .from('payments')
    .update({
      status: 'pending',
      reference: reference?.trim() || null,
      proof_path: proofPath,
      rejection_note: null,
      verified_by_user_id: null,
      verified_at: null,
    })
    .eq('id', paymentId)
    .eq('payer_user_id', user.id)
    .eq('status', 'rejected')
    .select('id, package_id')

  if (error || !updated || updated.length === 0) {
    return { success: false, error: 'Failed to resubmit payment. Please try again.' }
  }

  revalidatePath(`/dashboard/packages/${updated[0].package_id}`)
  revalidatePath('/admin/payments')

  return { success: true, error: null }
}
