// E6 T6.1: Server action to save/update the tutor profile
// Closes #40

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type SubjectEntry = { subject_id: number; level: 'o_levels' | 'a_levels' }
type AvailabilityWindow = { day: number; start: string; end: string }

export async function saveTutorProfile(
  bio: string,
  timezone: string,
  subjects: SubjectEntry[],
  availability: AvailabilityWindow[]
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // 1. Upsert tutor_profiles (approved stays false on first insert; admin controls it)
  const { error: profileError } = await supabase.from('tutor_profiles').upsert({
    tutor_user_id: user.id,
    bio,
    timezone,
  })
  if (profileError) return { error: `Failed to save profile: ${profileError.message}` }

  // 2. Replace tutor_subjects: delete existing rows then re-insert
  const { error: deleteError } = await supabase
    .from('tutor_subjects')
    .delete()
    .eq('tutor_user_id', user.id)
  if (deleteError) return { error: `Failed to update subjects: ${deleteError.message}` }

  if (subjects.length > 0) {
    const { error: insertError } = await supabase.from('tutor_subjects').insert(
      subjects.map((s) => ({ tutor_user_id: user.id, subject_id: s.subject_id, level: s.level }))
    )
    if (insertError) return { error: `Failed to save subjects: ${insertError.message}` }
  }

  // 3. Upsert tutor_availability
  const { error: availError } = await supabase.from('tutor_availability').upsert({
    tutor_user_id: user.id,
    windows: availability,
  })
  if (availError) return { error: `Failed to save availability: ${availError.message}` }

  revalidatePath('/tutor/profile')
  return {}
}
