// E8 S8.1 S8.2: Tutor sessions list — upcoming and past sessions with status update
// Closes #52 #53

export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  SESSION_STATUS_LABELS,
  SESSION_STATUS_COLOURS,
  formatSessionTime,
  type SessionStatus,
} from '@/lib/utils/session'
import { SessionStatusForm } from '@/app/admin/sessions/SessionActions'

type SessionRow = {
  id: string
  scheduled_start_utc: string
  scheduled_end_utc: string
  status: SessionStatus
  tutor_notes: string | null
  match_id: string
  matches: {
    meet_link: string | null
    request_id: string
    requests: {
      subjects: { name: string } | null
      user_profiles: { display_name: string; timezone: string } | null
    } | null
  } | null
}

export default async function TutorSessionsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/sign-in')

  // Get tutor's timezone
  const { data: tutorProfile } = await supabase
    .from('tutor_profiles')
    .select('timezone')
    .eq('tutor_user_id', user.id)
    .single()

  const tutorTimezone = tutorProfile?.timezone ?? 'UTC'

  // Fetch sessions for this tutor
  const { data: sessionsData } = await supabase
    .from('sessions')
    .select(
      `id, scheduled_start_utc, scheduled_end_utc, status, tutor_notes, match_id,
       matches!sessions_match_id_fkey (
         meet_link, request_id,
         requests!matches_request_id_fkey (
           subjects ( name ),
           user_profiles!requests_created_by_user_id_fkey ( display_name, timezone )
         )
       )`
    )
    .order('scheduled_start_utc', { ascending: true })

  const sessions = (sessionsData ?? []) as unknown as SessionRow[]
  const upcoming = sessions.filter((s) => s.status === 'scheduled')
  const past = sessions.filter((s) => s.status !== 'scheduled')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">My Sessions</h1>
        <p className="text-sm text-zinc-500">
          {upcoming.length} upcoming · {past.length} past
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-2xl bg-white px-8 py-12 text-center shadow-sm dark:bg-zinc-900">
          <p className="text-zinc-500">No sessions scheduled yet.</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Upcoming ({upcoming.length})
              </h2>
              {upcoming.map((session) => (
                <TutorSessionCard
                  key={session.id}
                  session={session}
                  tutorTimezone={tutorTimezone}
                  showStatusForm
                />
              ))}
            </section>
          )}

          {past.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Past ({past.length})
              </h2>
              {past.map((session) => (
                <TutorSessionCard
                  key={session.id}
                  session={session}
                  tutorTimezone={tutorTimezone}
                  showStatusForm={false}
                />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  )
}

function TutorSessionCard({
  session,
  tutorTimezone,
  showStatusForm,
}: {
  session: SessionRow
  tutorTimezone: string
  showStatusForm: boolean
}) {
  const match = session.matches
  const req = match?.requests
  const studentName =
    (req?.user_profiles as { display_name: string } | null)?.display_name ?? '—'
  const subjectName = (req?.subjects as { name: string } | null)?.name ?? '—'
  const requestId = match?.request_id ?? ''

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-0.5">
          <p className="font-medium text-zinc-900 dark:text-zinc-100">
            {formatSessionTime(session.scheduled_start_utc, tutorTimezone)}
          </p>
          <p className="text-sm text-zinc-500">
            {subjectName} · Student: {studentName}
          </p>
          {session.tutor_notes && (
            <p className="text-xs text-zinc-400 italic">Note: {session.tutor_notes}</p>
          )}
          {match?.meet_link && (
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
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${SESSION_STATUS_COLOURS[session.status] ?? 'bg-zinc-100 text-zinc-700'}`}
        >
          {SESSION_STATUS_LABELS[session.status] ?? session.status}
        </span>
      </div>

      {showStatusForm && (
        <div className="mt-3">
          <SessionStatusForm
            sessionId={session.id}
            matchId={session.match_id}
            requestId={requestId}
            currentStatus={session.status}
          />
        </div>
      )}
    </div>
  )
}
