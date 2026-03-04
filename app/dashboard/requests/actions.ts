// Student request actions: cancel unpaid requests
'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/lib/supabase/database.types'

/**
 * Student can cancel their own request if it hasn't been paid for.
 * Allowed statuses: 'new', 'payment_pending'
 * This will:
 * 1. Mark request as 'ended'
 * 2. Cancel any pending packages
 * 3. Cancel any pending payments
 */
export async function cancelRequest(requestId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Verify the request belongs to this user and is in a cancellable state
  const { data: request } = await supabase
    .from('requests')
    .select('id, status, created_by_user_id')
    .eq('id', requestId)
    .single()

  if (!request) return { error: 'Request not found' }
  if (request.created_by_user_id !== user.id) return { error: 'Not authorized' }

  const cancellableStatuses = ['new', 'payment_pending']
  if (!cancellableStatuses.includes(request.status)) {
    return { error: 'This request can no longer be cancelled. Contact us on WhatsApp for help.' }
  }

  // Use admin client for mutations to bypass RLS
  const admin = createAdminClient()

  // Cancel any pending packages
  const { data: packages } = await admin
    .from('packages')
    .select('id')
    .eq('request_id', requestId)
    .in('status', ['pending'])

  if (packages && packages.length > 0) {
    const pkgIds = packages.map((p) => p.id)

    // Cancel pending payments for those packages
    for (const pkgId of pkgIds) {
      await admin
        .from('payments')
        .update({ status: 'rejected' as Database['public']['Enums']['payment_status_enum'] })
        .eq('package_id', pkgId)
        .eq('status', 'pending')
    }

    // Cancel the packages themselves
    await admin
      .from('packages')
      .update({ status: 'expired' })
      .in('id', pkgIds)
  }

  // Mark request as ended
  const { error: updateError } = await admin
    .from('requests')
    .update({ status: 'ended' })
    .eq('id', requestId)

  if (updateError) return { error: `Failed to cancel request: ${updateError.message}` }

  // Write audit log
  await admin.from('audit_logs').insert([
    {
      actor_user_id: user.id,
      action: 'cancel_request',
      entity_type: 'request',
      entity_id: requestId,
      details: { cancelled_by: 'student', previous_status: request.status },
    },
  ])

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/requests/${requestId}`)
  return {}
}
