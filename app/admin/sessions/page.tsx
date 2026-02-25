// E8 T8.4 S8.2: Admin sessions overview — list all sessions, update status, reschedule
// Closes #57 #53

export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { SESSION_STATUS_LABELS, SESSION_STATUS_COLOURS, formatSessionTime, type SessionStatus } from '@/lib/utils/session'
import { SessionStatusForm, RescheduleForm } from './SessionActions'
import Link from 'next/link'

const ADMIN_TIMEZONE = 'Asia/Karachi'

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
    tutor_user_id: string
    tutor_profiles: {
      user_profiles: { display_name: string } | null
    } | null
    requests: {
      id: string
      level: string
      subjects: { name: string } | null
      user_profiles: { display_name: string } | null
    } | null
  } | null
}

export default async function AdminSessionsPage() {
  const admin = createAdminClient()

  const { data: sessionsData } = await admin
    .from('sessions')
    .select(
      `id, scheduled_start_utc, scheduled_end_utc, status, tutor_notes, match_id,
       matches!sessions_match_id_fkey (
         meet_link, request_id, tutor_user_id,
         tutor_profiles!matches_tutor_user_id_fkey (
           user_profiles!tutor_user_id ( display_name )
         ),
         requests!matches_request_id_fkey (
           id, level,
           subjects ( name ),
           user_profiles!requests_created_by_user_id_fkey ( display_name )
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
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Sessions</h1>
        <p className="text-sm text-zinc-500">
          {upcoming.length} upcoming · {past.length} past
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-2xl bg-white px-8 py-12 text-center shadow-sm dark:bg-zinc-900">
          <p className="text-zinc-500">No sessions yet.</p>
          <p className="mt-1 text-sm text-zinc-400">
            Generate sessions from a{' '}
            <Link href="/admin/matches" className="text-indigo-600 hover:underline dark:text-indigo-400">
              match detail page
            </Link>{' '}
            once the schedule and Meet link are set.
          </p>
        </div>
      ) : (
        <>
          {/* Upcoming sessions */}
          {upcoming.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Upcoming ({upcoming.length})
              </h2>
              <div className="space-y-3">
                {upcoming.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    adminTimezone={ADMIN_TIMEZONE}
                    showActions
                  />
                ))}
              </div>
            </section>
          )}

          {/* Past sessions */}
          {past.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Past ({past.length})
              </h2>
              <div className="space-y-3">
                {past.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    adminTimezone={ADMIN_TIMEZONE}
                    showActions={false}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

function SessionCard({
  session,
  adminTimezone,
  showActions,
}: {
  session: SessionRow
  adminTimezone: string
  showActions: boolean
}) {
  const match = session.matches
  const req = match?.requests
  const tutorProfile = match?.tutor_profiles
  const studentName =
    (req?.user_profiles as { display_name: string } | null)?.display_name ?? '—'
  const tutorName =
    (tutorProfile?.user_profiles as { display_name: string } | null)?.display_name ?? '—'
  const subjectName = (req?.subjects as { name: string } | null)?.name ?? '—'
  const timeDisplay = formatSessionTime(session.scheduled_start_utc, adminTimezone)
  const requestId = match?.request_id ?? ''

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-medium text-zinc-900 dark:text-zinc-100">{timeDisplay}</p>
          <p className="text-sm text-zinc-500">
            {subjectName} · {studentName} ↔ {tutorName}
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

      {showActions && (
        <div className="mt-3 flex flex-wrap items-start gap-3">
          <SessionStatusForm
            sessionId={session.id}
            matchId={session.match_id}
            requestId={requestId}
            currentStatus={session.status}
          />
          <RescheduleForm
            sessionId={session.id}
            scheduledStartUtc={session.scheduled_start_utc}
            adminTimezone={adminTimezone}
          />
        </div>
      )}
    </div>
  )
}

