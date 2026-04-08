import type { Database } from '@/lib/supabase/database.types'

type PaymentStatus = Database['public']['Enums']['payment_status_enum']

const PAYMENT_STATUS_PRIORITY: Record<PaymentStatus, number> = {
  paid: 4,
  pending: 3,
  refunded: 2,
  rejected: 1,
}

export function getHighestPriorityPaymentStatus(
  statuses: ReadonlyArray<PaymentStatus | string | null | undefined>,
): PaymentStatus | undefined {
  let highest: PaymentStatus | undefined
  let highestPriority = 0

  for (const status of statuses) {
    if (!status) continue

    const priority = PAYMENT_STATUS_PRIORITY[status as PaymentStatus] ?? 0
    if (priority > highestPriority) {
      highest = status as PaymentStatus
      highestPriority = priority
    }
  }

  return highest
}

export function getAdminUserPaymentBadge(status: string): { label: string; cls: string } {
  const map: Record<PaymentStatus, { label: string; cls: string }> = {
    paid: { label: 'Paid', cls: 'bg-green-100 text-green-800 border border-green-300' },
    pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-800 border border-yellow-300' },
    rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-800 border border-red-300' },
    refunded: { label: 'Refunded', cls: 'bg-slate-100 text-slate-700 border border-slate-300' },
  }

  return map[status as PaymentStatus] ?? { label: status, cls: 'bg-[#E0E0E0] text-[#121212]/60' }
}

export function buildAdminUpdateUserProfileAuditEntry({
  actorUserId,
  targetUserId,
  displayName,
}: {
  actorUserId: string
  targetUserId: string
  displayName: string
}) {
  return {
    actor_user_id: actorUserId,
    action: 'admin_update_user_profile',
    entity_type: 'user_profiles',
    entity_id: targetUserId,
    details: { display_name: displayName },
  }
}
