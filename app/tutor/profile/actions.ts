// E6 T6.1: Server action to save/update the tutor profile
// Closes #40

'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

type SubjectEntry = { subject_id: number; level: 'o_levels' | 'a_levels' }
type AvailabilityWindow = { day: number; start: string; end: string }

export async function saveTutorProfile(
  bio: string,
  timezone: string,
  subjects: SubjectEntry[],
  availability: AvailabilityWindow[]
): Promise<{ error?: string }> {
  // 1. Verify the caller is authenticated via the user-scoped client (cookie-based session).
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // 2. Use the admin client for all mutations so RLS policies (including the
  //    self-referential subquery in tutor_profiles_update_own) don't silently block writes.
  //    We manually enforce ownership by always scoping writes to user.id.
  const admin = createAdminClient()

  // 3. Upsert tutor_profiles (approved stays false on first insert; admin controls it)
  const { error: profileError } = await admin.from('tutor_profiles').upsert({
    tutor_user_id: user.id,
    bio,
    timezone,
  })
  if (profileError) return { error: `Failed to save profile: ${profileError.message}` }

  // 4. Update tutor_subjects safely: upsert provided rows, then delete stale ones.
  if (subjects.length > 0) {
    const { error: upsertError } = await admin.from('tutor_subjects').upsert(
      subjects.map((s) => ({ tutor_user_id: user.id, subject_id: s.subject_id, level: s.level })),
      { onConflict: 'tutor_user_id,subject_id,level' }
    )
    if (upsertError) return { error: `Failed to save subjects: ${upsertError.message}` }
  }

  // Remove stale (subject_id, level) combinations that are no longer in the new list.
  const { data: currentSubjects, error: fetchError } = await admin
    .from('tutor_subjects')
    .select('subject_id, level')
    .eq('tutor_user_id', user.id)
  if (fetchError) return { error: `Failed to read subjects: ${fetchError.message}` }

  const newKeys = new Set(subjects.map((s) => `${s.subject_id}:${s.level}`))
  const toDelete = (currentSubjects ?? []).filter(
    (row) => !newKeys.has(`${row.subject_id}:${row.level}`)
  )
  if (toDelete.length > 0) {
    const orFilter = toDelete
      .map((row) => `and(subject_id.eq.${row.subject_id},level.eq.${row.level})`)
      .join(',')
    const { error: delError } = await admin
      .from('tutor_subjects')
      .delete()
      .eq('tutor_user_id', user.id)
      .or(orFilter)
    if (delError) return { error: `Failed to remove old subjects: ${delError.message}` }
  }

  // 5. Upsert tutor_availability
  const { error: availError } = await admin.from('tutor_availability').upsert({
    tutor_user_id: user.id,
    windows: availability,
  })
  if (availError) return { error: `Failed to save availability: ${availError.message}` }

  revalidatePath('/tutor/profile')
  return {}
}
