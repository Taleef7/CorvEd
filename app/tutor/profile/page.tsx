// E6 T6.1 T6.3: Tutor profile / application page
// Closes #40 #42

export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { TutorProfileForm } from './TutorProfileForm'

type Subject = { id: number; name: string; code: string }

export default async function TutorProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/sign-in')

  const adminClient = createAdminClient()

  // Fetch subjects list and existing tutor profile in parallel
  const [
    { data: subjectsData },
    { data: profileData },
    { data: subjectsData2 },
    { data: availData },
    { data: userProfile },
  ] = await Promise.all([
    adminClient.from('subjects').select('id, name, code').eq('active', true).order('sort_order'),
    adminClient
      .from('tutor_profiles')
      .select('approved, bio, timezone')
      .eq('tutor_user_id', user.id)
      .maybeSingle(),
    adminClient
      .from('tutor_subjects')
      .select('subject_id, level')
      .eq('tutor_user_id', user.id),
    adminClient
      .from('tutor_availability')
      .select('windows')
      .eq('tutor_user_id', user.id)
      .maybeSingle(),
    adminClient
      .from('user_profiles')
      .select('display_name, timezone')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  const subjects = (subjectsData ?? []) as Subject[]
  const profile = profileData ?? null
  const existingSubjects = (subjectsData2 ?? []) as {
    subject_id: number
    level: 'o_levels' | 'a_levels'
  }[]
  const windows = (availData?.windows ?? []) as { day: number; start: string; end: string }[]

  const defaultValues = profile
    ? {
        bio: profile.bio ?? '',
        timezone: profile.timezone ?? userProfile?.timezone ?? 'Asia/Karachi',
        subjectEntries: existingSubjects,
        availWindows: windows,
      }
    : {
        bio: '',
        timezone: userProfile?.timezone ?? 'Asia/Karachi',
        subjectEntries: [],
        availWindows: [],
      }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Tutor Profile</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Welcome, {userProfile?.display_name ?? 'Tutor'}. Fill in your teaching profile and
          availability so the admin can review and approve your application.
        </p>
      </div>

      <div className="rounded-2xl bg-white px-6 py-8 shadow-sm dark:bg-zinc-900">
        <TutorProfileForm
          subjects={subjects}
          defaultValues={defaultValues}
          approved={profile?.approved ?? null}
        />
      </div>
    </div>
  )
}
