'use server'

import { createClient } from '@/lib/supabase/server'

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

  if (!payment.proof_path || payment.proof_path !== proofPath) {
    return { url: null, error: 'Proof not found' }
  }

  const { data } = await supabase.storage
    .from('payment-proofs')
    .createSignedUrl(proofPath, 300) // 5 minute expiry

  return { url: data?.signedUrl ?? null, error: null }
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
    .select('id, payer_user_id, status')
    .eq('id', paymentId)
    .single()

  if (!payment || payment.payer_user_id !== user.id) {
    return { success: false, error: 'Unauthorized' }
  }

  if (payment.status !== 'rejected') {
    return { success: false, error: 'Payment is not in rejected status' }
  }

  // Reset payment to pending with new proof/reference
  const { error } = await supabase
    .from('payments')
    .update({
      status: 'pending',
      reference: reference?.trim() || null,
      proof_path: proofPath,
      verified_by_user_id: null,
      verified_at: null,
    })
    .eq('id', paymentId)

  if (error) {
    return { success: false, error: 'Failed to resubmit payment. Please try again.' }
  }

  return { success: true, error: null }
}
