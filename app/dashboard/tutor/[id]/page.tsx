// D4: Read-only tutor profile page for students
// Students can view their assigned tutor's profile

export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LEVEL_LABELS } from '@/lib/utils/request'

export default async function StudentTutorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: tutorUserId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/sign-in')

  // Verify the student is matched with this tutor
  const { data: match } = await supabase
    .from('matches')
    .select('id, requests!matches_request_id_fkey(created_by_user_id)')
    .eq('tutor_user_id', tutorUserId)
    .limit(1)
    .maybeSingle()

  const request = match?.requests as { created_by_user_id: string } | null
  if (!match || !request || request.created_by_user_id !== user.id) {
    redirect('/dashboard')
  }

  // Fetch tutor profile
  const [{ data: profile }, { data: tutorProfile }, { data: tutorSubjects }] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('display_name')
      .eq('user_id', tutorUserId)
      .single(),
    supabase
      .from('tutor_profiles')
      .select('bio, experience_years, education, teaching_approach')
      .eq('tutor_user_id', tutorUserId)
      .single(),
    supabase
      .from('tutor_subjects')
      .select('level, subjects(name)')
      .eq('tutor_user_id', tutorUserId),
  ])

  const displayName = profile?.display_name ?? 'Your Tutor'

  // Group subjects by level
  const subjectsByLevel: Record<string, string[]> = {}
  if (tutorSubjects) {
    for (const ts of tutorSubjects) {
      const subjectName = (ts.subjects as { name: string } | null)?.name ?? 'Unknown'
      const levelKey = ts.level as string
      if (!subjectsByLevel[levelKey]) subjectsByLevel[levelKey] = []
      subjectsByLevel[levelKey].push(subjectName)
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F0F0] px-4 py-10">
      <div className="mx-auto w-full max-w-lg space-y-6">
        <Link
          href="/dashboard"
          className="text-sm font-bold text-[#1040C0] underline-offset-4 hover:underline"
        >
          ← Back to dashboard
        </Link>

        {/* Tutor name card */}
        <div className="border-4 border-[#121212] bg-white p-6 shadow-[6px_6px_0px_0px_#121212]">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center border-2 border-[#121212] bg-[#1040C0] text-xl font-black text-white">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#121212]">{displayName}</h1>
              <p className="text-xs font-bold uppercase tracking-widest text-[#121212]/40">
                Your Tutor
              </p>
            </div>
          </div>
        </div>

        {/* Bio */}
        {tutorProfile?.bio && (
          <div className="border-4 border-[#121212] bg-white p-6">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-[#121212]/50">
              About
            </h2>
            <p className="text-sm leading-relaxed text-[#121212]/80">{tutorProfile.bio}</p>
          </div>
        )}

        {/* Subjects & Levels */}
        {Object.keys(subjectsByLevel).length > 0 && (
          <div className="border-4 border-[#121212] bg-white p-6">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-[#121212]/50">
              Subjects
            </h2>
            <div className="space-y-3">
              {Object.entries(subjectsByLevel).map(([level, subjects]) => (
                <div key={level}>
                  <p className="text-xs font-bold text-[#1040C0] uppercase">
                    {LEVEL_LABELS[level] ?? level}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {subjects.map((s) => (
                      <span
                        key={s}
                        className="border-2 border-[#121212] bg-[#F0F0F0] px-2 py-0.5 text-xs font-medium text-[#121212]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience & Education */}
        {(tutorProfile?.experience_years || tutorProfile?.education || tutorProfile?.teaching_approach) && (
          <div className="border-4 border-[#121212] bg-white p-6 space-y-3">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-[#121212]/50">
              Qualifications
            </h2>
            {tutorProfile.experience_years != null && (
              <div>
                <p className="text-xs font-bold text-[#121212]/40">Experience</p>
                <p className="text-sm text-[#121212]">{tutorProfile.experience_years} years</p>
              </div>
            )}
            {tutorProfile.education && (
              <div>
                <p className="text-xs font-bold text-[#121212]/40">Education</p>
                <p className="text-sm text-[#121212]">{tutorProfile.education}</p>
              </div>
            )}
            {tutorProfile.teaching_approach && (
              <div>
                <p className="text-xs font-bold text-[#121212]/40">Teaching Approach</p>
                <p className="text-sm text-[#121212]/80">{tutorProfile.teaching_approach}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
