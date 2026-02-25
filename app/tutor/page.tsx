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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Tutor Dashboard</h1>
        <p className="text-sm text-zinc-500">
          Welcome back, {profile?.display_name ?? 'Tutor'}.
        </p>
      </div>

      {/* Next Session Card */}
      {nextSession ? (
        <div className="rounded-2xl bg-indigo-50 px-6 py-5 shadow-sm dark:bg-indigo-900/20">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
            📅 Your Next Session
          </p>
          <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {formatSessionTime(nextSession.scheduled_start_utc, tutorTimezone)}
          </p>
          <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
            Student: {nextStudentName}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {nextSubjectName} — {nextLevel}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {nextMatch?.meet_link && (
              <a
                href={nextMatch.meet_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                🔗 Join Google Meet
              </a>
            )}
            <Link
              href="/tutor/sessions"
              className="inline-flex items-center rounded-lg border border-indigo-300 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
            >
              View all sessions →
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white px-6 py-5 shadow-sm dark:bg-zinc-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            📅 Your Next Session
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            You have no sessions scheduled yet. Your first student will appear here once matched.
          </p>
          <Link
            href="/tutor/sessions"
            className="mt-2 inline-block text-xs text-indigo-600 hover:underline dark:text-indigo-400"
          >
            View sessions →
          </Link>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Upcoming</p>
          <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{upcomingCount}</p>
          <p className="text-xs text-zinc-400">sessions scheduled</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Completed</p>
          <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{completedCount}</p>
          <p className="text-xs text-zinc-400">sessions taught</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">Quick links</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/tutor/sessions"
            className="inline-flex items-center rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-600 dark:text-zinc-300"
          >
            📋 All Sessions
          </Link>
          <Link
            href="/tutor/profile"
            className="inline-flex items-center rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-600 dark:text-zinc-300"
          >
            👤 My Profile
          </Link>
        </div>
      </div>
    </div>
  )
}

