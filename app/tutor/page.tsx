// E3 T3.2: tutor dashboard stub (full implementation in E10)
// E10: Full tutor dashboard — next session card, session counts, links
// Closes #21 #65

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatSessionTime } from '@/lib/utils/session'
import { getLevelLabel } from '@/lib/utils/request'

export default async function TutorPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/sign-in')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('display_name')
    .eq('user_id', user.id)
    .single()

  // Get tutor's timezone
  const { data: tutorProfile } = await supabase
    .from('tutor_profiles')
    .select('timezone')
    .eq('tutor_user_id', user.id)
    .single()

  const tutorTimezone = tutorProfile?.timezone ?? 'UTC'

  // Fetch next upcoming session for this tutor
  const nowIso = new Date().toISOString()
  const { data: nextSessionData } = await supabase
    .from('sessions')
    .select(
      `id, scheduled_start_utc, status,
       matches!sessions_match_id_fkey (
         meet_link,
         requests!matches_request_id_fkey (
           level,
           subjects ( name ),
           user_profiles!requests_created_by_user_id_fkey ( display_name )
         )
       )`
    )
    .gte('scheduled_start_utc', nowIso)
    .in('status', ['scheduled', 'rescheduled'])
    .order('scheduled_start_utc', { ascending: true })
    .limit(1)
    .maybeSingle()

  // Fetch session counts using count-only queries (no row data transfer)
  const { count: upcomingCountRaw } = await supabase
    .from('sessions')
    .select('id', { count: 'exact', head: true })
    .gte('scheduled_start_utc', nowIso)

  const { count: completedCountRaw } = await supabase
    .from('sessions')
    .select('id', { count: 'exact', head: true })
    .in('status', ['done', 'no_show_student'])

  const upcomingCount = upcomingCountRaw ?? 0
  const completedCount = completedCountRaw ?? 0

  type NextSessionShape = {
    id: string
    scheduled_start_utc: string
    status: string
    matches: {
      meet_link: string | null
      requests: {
        level: string | null
        subjects: { name: string } | null
        user_profiles: { display_name: string } | null
      } | null
    } | null
  }

  const nextSession = nextSessionData as NextSessionShape | null
  const nextMatch = nextSession?.matches
  const nextReq = nextMatch?.requests
  const nextStudentName =
    (nextReq?.user_profiles as { display_name: string } | null)?.display_name ?? '—'
  const nextSubjectName = (nextReq?.subjects as { name: string } | null)?.name ?? '—'
  const nextLevel = getLevelLabel(nextReq?.level)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="border-b-4 border-[#121212] pb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-[#121212]/50">Tutor Portal</p>
        <h1 className="mt-1 text-4xl font-black uppercase tracking-tighter text-[#121212] leading-none">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-[#121212]/60">
          Welcome back, {profile?.display_name ?? 'Tutor'}.
        </p>
      </div>

      {/* Next Session */}
      {nextSession ? (
        <div className="relative border-4 border-[#121212] bg-[#1040C0] p-6 shadow-[6px_6px_0px_0px_#121212]">
          {/* Geometric decoration */}
          <div className="absolute top-4 right-4 h-8 w-8 rounded-full border-2 border-white opacity-40" aria-hidden="true" />
          <p className="text-xs font-bold uppercase tracking-widest text-white/70">Your Next Session</p>
          <p className="mt-2 text-2xl font-black uppercase tracking-tight text-white">
            {formatSessionTime(nextSession.scheduled_start_utc, tutorTimezone)}
          </p>
          <p className="mt-1 text-sm font-medium text-white/80">Student: {nextStudentName}</p>
          <p className="text-sm text-white/70">{nextSubjectName} — {nextLevel}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {nextMatch?.meet_link && (
              <a
                href={nextMatch.meet_link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Join Google Meet session"
                className="inline-flex min-h-[44px] items-center gap-2 border-2 border-white bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#1040C0] transition hover:bg-white/90 active:translate-y-px"
              >
                Join Google Meet
              </a>
            )}
            <Link
              href="/tutor/sessions"
              className="inline-flex min-h-[44px] items-center gap-2 border-2 border-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/10"
            >
              View All Sessions
            </Link>
          </div>
        </div>
      ) : (
        <div className="border-4 border-[#121212] bg-white p-6 shadow-[6px_6px_0px_0px_#121212]">
          <p className="text-xs font-bold uppercase tracking-widest text-[#121212]/50">Your Next Session</p>
          <p className="mt-2 text-sm text-[#121212]/70">
            No sessions scheduled yet. Your first student will appear here once matched.
          </p>
          <Link
            href="/tutor/sessions"
            className="mt-3 inline-flex min-h-[44px] items-center border-2 border-[#121212] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#121212] hover:bg-[#121212] hover:text-white transition-colors"
          >
            View Sessions
          </Link>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
        <div className="border-4 border-[#121212] bg-white p-5 shadow-[4px_4px_0px_0px_#121212]">
          <p className="text-xs font-bold uppercase tracking-widest text-[#121212]/50">Upcoming</p>
          <p className="mt-1 text-5xl font-black text-[#121212]">{upcomingCount}</p>
          <p className="text-xs text-[#121212]/50">sessions scheduled</p>
        </div>
        <div className="border-4 border-[#121212] bg-[#F0C020] p-5 shadow-[4px_4px_0px_0px_#121212]">
          <p className="text-xs font-bold uppercase tracking-widest text-[#121212]/70">Completed</p>
          <p className="mt-1 text-5xl font-black text-[#121212]">{completedCount}</p>
          <p className="text-xs text-[#121212]/70">sessions taught</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="border-4 border-[#121212] bg-white p-5 shadow-[4px_4px_0px_0px_#121212]">
        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#121212]/50">Quick Links</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/tutor/sessions"
            className="inline-flex min-h-[44px] items-center border-2 border-[#121212] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#121212] hover:bg-[#121212] hover:text-white transition-colors"
          >
            All Sessions
          </Link>
          <Link
            href="/tutor/profile"
            className="inline-flex min-h-[44px] items-center border-2 border-[#121212] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#121212] hover:bg-[#121212] hover:text-white transition-colors"
          >
            My Profile
          </Link>
          <Link
            href="/tutor/conduct"
            className="inline-flex min-h-[44px] items-center border-2 border-[#121212] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#121212] hover:bg-[#121212] hover:text-white transition-colors"
          >
            Code of Conduct
          </Link>
        </div>
      </div>
    </div>
  )
}

