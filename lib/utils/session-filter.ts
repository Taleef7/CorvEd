import type { SessionStatus } from '@/lib/utils/session'

export type SessionStatusFilter = SessionStatus | 'no_show'

export const SESSION_STATUS_FILTER_OPTIONS: { value: '' | SessionStatusFilter; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'done', label: 'Done' },
  { value: 'rescheduled', label: 'Rescheduled' },
  { value: 'no_show', label: 'No-shows' },
  { value: 'no_show_student', label: 'No-show (student)' },
  { value: 'no_show_tutor', label: 'No-show (tutor)' },
]

const SESSION_STATUS_FILTERS: Record<SessionStatusFilter, SessionStatus[]> = {
  scheduled: ['scheduled'],
  done: ['done'],
  rescheduled: ['rescheduled'],
  no_show: ['no_show_student', 'no_show_tutor'],
  no_show_student: ['no_show_student'],
  no_show_tutor: ['no_show_tutor'],
}

export function isSessionStatusFilter(value: string): value is SessionStatusFilter {
  return Object.prototype.hasOwnProperty.call(SESSION_STATUS_FILTERS, value)
}

export function getSessionStatusesForFilter(value: string): SessionStatus[] {
  if (!isSessionStatusFilter(value)) return []
  return SESSION_STATUS_FILTERS[value]
}

export function getSessionStatusFilterLabel(value: string): string {
  return SESSION_STATUS_FILTER_OPTIONS.find((option) => option.value === value)?.label ?? value
}
