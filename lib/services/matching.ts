// E6 T6.4: Shared tutor query pattern for matching (E7 will extend this)
// Closes #43

import { createAdminClient } from '@/lib/supabase/admin'

type TutorSubjectRow = {
  subject_id: number
  level: string
}

type TutorWithSubjects = {
  tutor_user_id: string
  approved: boolean
  bio: string | null
  timezone: string
  created_at: string
  user_profiles: { display_name: string; whatsapp_number: string | null } | null
  tutor_subjects: TutorSubjectRow[]
  tutor_availability: { windows: { day: number; start: string; end: string }[] } | null
}

/**
 * Fetch all approved tutors, optionally filtered by subject and level.
 * Used in admin tutor directory and (in E7) in the matching screen.
 *
 * @param subjectId - filter by specific subject_id (optional)
 * @param level     - filter by 'o_levels' or 'a_levels' (optional)
 */
export async function fetchApprovedTutors(subjectId?: number, level?: string) {
  const admin = createAdminClient()

  const query = admin
    .from('tutor_profiles')
    .select(
      `tutor_user_id, approved, bio, timezone, created_at,
       user_profiles!tutor_user_id ( display_name, whatsapp_number ),
       tutor_subjects ( subject_id, level, subjects ( name ) ),
       tutor_availability ( windows )`
    )
    .eq('approved', true)
    .order('created_at', { ascending: false })

  const { data, error } = await query
  if (error) throw new Error(`Failed to fetch tutors: ${error.message}`)

  let tutors = (data ?? []) as unknown as TutorWithSubjects[]

  // Client-side filtering by subject/level (small dataset for MVP)
  if (subjectId) {
    tutors = tutors.filter((t) =>
      t.tutor_subjects.some((s) => s.subject_id === subjectId)
    )
  }
  if (level) {
    tutors = tutors.filter((t) =>
      t.tutor_subjects.some((s) => s.level === level)
    )
  }

  return tutors
}
