// E8 S8.1: Student sessions list — upcoming and past sessions with timezone display and Meet link
// Closes #52

export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  SESSION_STATUS_LABELS,
  SESSION_STATUS_COLOURS,
  formatSessionTime,
  type SessionStatus,
} from '@/lib/utils/session'

type SessionRow = {
  id: string
  scheduled_start_utc: string
  scheduled_end_utc: string
  status: SessionStatus
  tutor_notes: string | null
  matches: {
    meet_link: string | null
    tutor_profiles: {
      user_profiles: { display_name: string } | null
    } | null
    requests: {
      subjects: { name: string } | null
    } | null
  } | null
}

export default async function StudentSessionsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/sign-in')

  // Get user's timezone from profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('timezone, display_name')
    .eq('user_id', user.id)
    .single()

  const userTimezone = profile?.timezone ?? 'UTC'

  // Fetch sessions for this student (via matches → requests)
  const { data: sessionsData } = await supabase
    .from('sessions')
    .select(
      `id, scheduled_start_utc, scheduled_end_utc, status, tutor_notes,
       matches!sessions_match_id_fkey (
         meet_link,
         tutor_profiles!matches_tutor_user_id_fkey (
           user_profiles!tutor_user_id ( display_name )
         ),
         requests!matches_request_id_fkey (
           subjects ( name )
         )
       )`
    )
    .order('scheduled_start_utc', { ascending: true })

  const sessions = (sessionsData ?? []) as unknown as SessionRow[]

  const nowIso = new Date().toISOString()
  const upcoming = sessions.filter((s) => s.scheduled_start_utc >= nowIso)
  const past = sessions.filter((s) => s.scheduled_start_utc < nowIso)

  // Next upcoming session
  const nextSession = upcoming[0] ?? null

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">My Sessions</h1>

        {/* Next session card */}
        {nextSession ? (
          <div className="rounded-2xl bg-indigo-50 px-6 py-5 shadow-sm dark:bg-indigo-900/20">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
              Next Session
            </p>
            <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {formatSessionTime(nextSession.scheduled_start_utc, userTimezone)}
            </p>
            <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
              {(nextSession.matches?.requests?.subjects as { name: string } | null)?.name ?? '—'} ·
              Tutor:{' '}
              {(nextSession.matches?.tutor_profiles?.user_profiles as { display_name: string } | null)
                ?.display_name ?? '—'}
            </p>
            {nextSession.matches?.meet_link && (
              <a
                href={nextSession.matches.meet_link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Join Meet →
              </a>
            )}
          </div>
        ) : (
          <div className="rounded-2xl bg-white px-6 py-8 text-center shadow-sm dark:bg-zinc-900">
            <p className="text-zinc-500">No upcoming sessions scheduled.</p>
          </div>
        )}

        {/* Upcoming sessions list */}
        {upcoming.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Upcoming Sessions ({upcoming.length})
            </h2>
            {upcoming.map((session) => (
              <SessionCard key={session.id} session={session} userTimezone={userTimezone} />
            ))}
          </section>
        )}

        {/* Past sessions */}
        {past.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Past Sessions ({past.length})
            </h2>
            {past.map((session) => (
              <SessionCard key={session.id} session={session} userTimezone={userTimezone} />
            ))}
          </section>
        )}

        {sessions.length === 0 && (
          <div className="rounded-2xl bg-white px-6 py-8 text-center shadow-sm dark:bg-zinc-900">
            <p className="text-zinc-500">No sessions found.</p>
            <p className="mt-1 text-sm text-zinc-400">
              Sessions will appear here once your tutor match is confirmed and sessions are
              generated.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function SessionCard({
  session,
  userTimezone,
}: {
  session: SessionRow
  userTimezone: string
}) {
  const match = session.matches
  const tutorName =
    (match?.tutor_profiles?.user_profiles as { display_name: string } | null)?.display_name ?? '—'
  const subjectName = (match?.requests?.subjects as { name: string } | null)?.name ?? '—'

  return (
    <div className="rounded-xl bg-white px-5 py-4 shadow-sm dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <p className="font-medium text-zinc-900 dark:text-zinc-100">
            {formatSessionTime(session.scheduled_start_utc, userTimezone)}
          </p>
          <p className="text-sm text-zinc-500">
            {subjectName} · {tutorName}
          </p>
          {session.tutor_notes && session.status !== 'scheduled' && (
            <p className="mt-1 text-xs text-zinc-400 italic">Note: {session.tutor_notes}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${SESSION_STATUS_COLOURS[session.status] ?? 'bg-zinc-100 text-zinc-700'}`}
          >
            {SESSION_STATUS_LABELS[session.status] ?? session.status}
          </span>
          {match?.meet_link && session.status === 'scheduled' && (
            <a
              href={match.meet_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Join Meet →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
