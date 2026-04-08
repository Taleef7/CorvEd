import type { Database } from '@/lib/supabase/database.types'

export type SessionStatus = Database['public']['Enums']['session_status_enum']

const SESSION_CONSUMING_STATUSES = ['done', 'no_show_student'] as const satisfies SessionStatus[]

function isConsuming(status: SessionStatus): boolean {
  return SESSION_CONSUMING_STATUSES.includes(status as (typeof SESSION_CONSUMING_STATUSES)[number])
}

export function getSessionUsageAdjustment(
  previousStatus: SessionStatus,
  nextStatus: SessionStatus,
): -1 | 0 | 1 {
  const wasConsuming = isConsuming(previousStatus)
  const isNowConsuming = isConsuming(nextStatus)

  if (isNowConsuming && !wasConsuming) return 1
  if (wasConsuming && !isNowConsuming) return -1
  return 0
}

export function isSessionCompletionAllowed({
  scheduledStartUtc,
  now = new Date(),
}: {
  scheduledStartUtc: string
  now?: Date
}): boolean {
  return new Date(scheduledStartUtc).getTime() <= now.getTime()
}
