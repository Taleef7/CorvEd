// E8 T8.3: Session status helpers (labels, badge colours)
// Closes #56

export type SessionStatus =
  | 'scheduled'
  | 'done'
  | 'rescheduled'
  | 'no_show_student'
  | 'no_show_tutor'

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  scheduled: 'Scheduled',
  done: 'Done',
  rescheduled: 'Rescheduled',
  no_show_student: 'Student No-show',
  no_show_tutor: 'Tutor No-show',
}

export const SESSION_STATUS_COLOURS: Record<SessionStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  done: 'bg-green-100 text-green-800',
  rescheduled: 'bg-yellow-100 text-yellow-800',
  no_show_student: 'bg-red-100 text-red-700',
  no_show_tutor: 'bg-orange-100 text-orange-800',
}

/**
 * Format a UTC ISO timestamp for display in a given IANA timezone.
 * Returns a human-readable string like "Mon, Feb 23 at 07:00 PM".
 */
export function formatSessionTime(utcIso: string, userTimezone: string): string {
  return new Intl.DateTimeFormat('en-PK', {
    timeZone: userTimezone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(utcIso))
}
