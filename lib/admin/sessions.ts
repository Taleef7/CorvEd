import type { Database } from '@/lib/supabase/database.types'

type SessionStatus = Database['public']['Enums']['session_status_enum']

export type AdminSessionStatusFilter = SessionStatus | 'no_show'

const CONCRETE_SESSION_STATUSES = [
  'scheduled',
  'done',
  'rescheduled',
  'no_show_student',
  'no_show_tutor',
] as const satisfies SessionStatus[]

export function resolveAdminSessionStatusFilter(raw: string | undefined): SessionStatus[] {
  if (!raw) return []
  if (raw === 'no_show') return ['no_show_student', 'no_show_tutor']

  return CONCRETE_SESSION_STATUSES.includes(raw as SessionStatus) ? [raw as SessionStatus] : []
}

export function getAdminSessionStatusFilterOptions(): Array<{ value: string; label: string }> {
  return [
    { value: '', label: 'All statuses' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'done', label: 'Done' },
    { value: 'rescheduled', label: 'Rescheduled' },
    { value: 'no_show', label: 'No-show (all)' },
    { value: 'no_show_student', label: 'No-show (student)' },
    { value: 'no_show_tutor', label: 'No-show (tutor)' },
  ]
}
