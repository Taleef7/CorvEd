// E8 S8.1 E9 T9.2 T9.4: Student sessions — grid layout, subject filter chips, view toggle
// Closes #52, #62, #64

export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  SESSION_STATUS_LABELS,
  SESSION_STATUS_COLOURS,
  type SessionStatus,
} from '@/lib/utils/session'
import { getLevelLabel } from '@/lib/utils/request'
import Link from 'next/link'
import { RescheduleButton } from '@/components/dashboards/RescheduleButton'
import { NextSessionCard } from '@/components/dashboards/NextSessionCard'
import { SubjectChips, StudentViewControls, type SessionView } from './StudentSessionFilters'

type StudentSessionRow = {
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
      level: string | null
      subjects: { name: string } | null
    } | null
  } | null
}

function localDateStr(utcIso: string, tz: string) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date(utcIso))
}
function fmtTime(utcIso: string, tz: string) {
  return new Intl.DateTimeFormat('en-PK', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(utcIso))
}
function fmtDate(utcIso: string, tz: string) {
  return new Intl.DateTimeFormat('en-PK', {
    timeZone: tz,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(utcIso))
}

export default async function StudentSessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; view?: string; status?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/sign-in')

  const params = await searchParams
  const filterSubject = params.subject ? decodeURIComponent(params.subject) : ''
  const view = (params.view === 'past' ? 'past' : 'upcoming') as SessionView
  const filterStatus = params.status ?? ''

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('timezone, display_name')
    .eq('user_id', user.id)
    .single()

  const userTimezone = profile?.timezone ?? 'Asia/Karachi'

  const { data: rawData } = await supabase
    .from('sessions')
    .select(
      `id, scheduled_start_utc, scheduled_end_utc, status, tutor_notes,
       matches!sessions_match_id_fkey (
         meet_link,
         tutor_profiles!matches_tutor_user_id_fkey (
           user_profiles!tutor_user_id ( display_name )
         ),
         requests!matches_request_id_fkey (
           level,
           subjects ( name )
         )
       )`,
    )
    .order('scheduled_start_utc', { ascending: true })

  const allSessions = (rawData ?? []) as unknown as StudentSessionRow[]

  const nowIso = new Date().toISOString()
  const serverNowMs = new Date(nowIso).getTime()
  const todayStr = localDateStr(nowIso, userTimezone)
  const nextWeekIso = new Date(serverNowMs + 7 * 24 * 60 * 60 * 1000).toISOString()

  // ── Derive unique subjects (for chips) ──────────────────────────────────────
  const subjectSet = new Set<string>()
  for (const sess of allSessions) {
    const name = (sess.matches?.requests?.subjects as { name: string } | null)?.name
    if (name) subjectSet.add(name)
  }
  const subjects = [...subjectSet].sort()

  // ── Global stats (always from all sessions, unfiltered) ─────────────────────
  const allUpcoming = allSessions.filter((s) => s.scheduled_start_utc >= nowIso)
  const thisWeekCount = allUpcoming.filter((s) => s.scheduled_start_utc <= nextWeekIso).length
  const doneCount = allSessions.filter((s) => s.status === 'done').length

  // ── Apply filters ───────────────────────────────────────────────────────────
  let filtered = allSessions
  if (filterSubject) {
    filtered = filtered.filter(
      (s) =>
        (s.matches?.requests?.subjects as { name: string } | null)?.name === filterSubject,
    )
  }
  if (filterStatus) {
    filtered = filtered.filter((s) => s.status === filterStatus)
  }

  const upcomingSessions = filtered.filter((s) => s.scheduled_start_utc >= nowIso)
  const pastSessions = [...filtered.filter((s) => s.scheduled_start_utc < nowIso)].reverse()
  const displayed = view === 'past' ? pastSessions : upcomingSessions

  // Next session (unfiltered, always the true next one)
  const nextSession = allUpcoming[0] ?? null

  return (
    <div className="min-h-screen bg-[#F0F0F0] px-4 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-[#121212]">
          My Sessions
        </h1>

        {/* Stats strip */}
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {/* Upcoming — clickable filter */}
          <Link
            href="?view=upcoming"
            className={`border-2 px-4 py-3 transition hover:-translate-y-0.5 ${
              view === 'upcoming' && !filterStatus
                ? 'border-[#1040C0] bg-[#1040C0]/5'
                : 'border-[#121212] bg-white hover:shadow-[4px_4px_0px_0px_#121212]'
            }`}
          >
            <dd className={`text-2xl font-black ${view === 'upcoming' && !filterStatus ? 'text-[#1040C0]' : 'text-[#121212]'}`}>
              {allUpcoming.length}
            </dd>
            <dt className="text-xs font-medium uppercase tracking-widest text-[#121212]/50">
              Upcoming
            </dt>
          </Link>

          {/* This Week — accent, not a filter link */}
          <div
            className={`border-2 px-4 py-3 ${
              thisWeekCount > 0 ? 'border-[#F0C020] bg-[#F0C020]/10' : 'border-[#121212] bg-white'
            }`}
          >
            <dd className={`text-2xl font-black ${thisWeekCount > 0 ? 'text-[#121212]' : 'text-[#121212]'}`}>
              {thisWeekCount}
            </dd>
            <dt className="text-xs font-medium uppercase tracking-widest text-[#121212]/50">
              This Week
            </dt>
          </div>

          {/* Done — clickable filter */}
          <Link
            href="?view=past&status=done"
            className={`border-2 px-4 py-3 transition hover:-translate-y-0.5 ${
              view === 'past' && filterStatus === 'done'
                ? 'border-[#1040C0] bg-[#1040C0]/5'
                : 'border-[#121212] bg-white hover:shadow-[4px_4px_0px_0px_#121212]'
            }`}
          >
            <dd className={`text-2xl font-black ${view === 'past' && filterStatus === 'done' ? 'text-[#1040C0]' : 'text-[#121212]'}`}>
              {doneCount}
            </dd>
            <dt className="text-xs font-medium uppercase tracking-widest text-[#121212]/50">
              Done
            </dt>
          </Link>

          {/* Subjects — static info */}
          <div className="border-2 border-[#121212] bg-white px-4 py-3">
            <dd className="text-2xl font-black text-[#121212]">{subjects.length}</dd>
            <dt className="text-xs font-medium uppercase tracking-widest text-[#121212]/50">
              Subjects
            </dt>
          </div>
        </dl>

        {/* Next session hero — only shown when not filtering and there's an upcoming session */}
        {nextSession && !filterSubject && !filterStatus && view === 'upcoming' && (
          <NextSessionCard
            session={nextSession}
            userTimezone={userTimezone}
            serverNowMs={serverNowMs}
          />
        )}

        {allSessions.length === 0 ? (
          <div className="border-4 border-[#121212] bg-white px-6 py-10 text-center">
            <p className="text-[#121212]/60">No sessions found.</p>
            <p className="mt-1 text-sm text-[#121212]/40">
              Sessions will appear here once your tutor match is confirmed and sessions are
              generated.
            </p>
          </div>
        ) : (
          <>
            {/* Subject filter chips (only when there are multiple subjects) */}
            {subjects.length > 1 && (
              <SubjectChips subjects={subjects} activeSubject={filterSubject} />
            )}

            {/* View toggle + status filter */}
            <StudentViewControls
              subject={filterSubject || undefined}
              view={view}
              status={filterStatus}
              upcomingCount={upcomingSessions.length}
              pastCount={pastSessions.length}
            />

            {/* Session grid */}
            {displayed.length === 0 ? (
              <div className="border-4 border-[#121212] bg-white px-6 py-10 text-center">
                <p className="text-sm text-[#121212]/50">
                  No {view} sessions
                  {filterSubject ? ` for ${filterSubject}` : ''}
                  {filterStatus ? ` with status "${filterStatus.replace(/_/g, ' ')}"` : ''}.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {displayed.map((session) => {
                  const match = session.matches
                  const tutorName =
                    (match?.tutor_profiles?.user_profiles as { display_name: string } | null)
                      ?.display_name ?? '—'
                  const subjectName =
                    (match?.requests?.subjects as { name: string } | null)?.name ?? '—'
                  const levelLabel = getLevelLabel(match?.requests?.level)
                  const isJoinable =
                    session.status === 'scheduled' || session.status === 'rescheduled'
                  const isUpcoming = session.scheduled_start_utc >= nowIso
                  const isToday =
                    isUpcoming &&
                    localDateStr(session.scheduled_start_utc, userTimezone) === todayStr

                  return (
                    <div
                      key={session.id}
                      className={`flex flex-col border-4 bg-white ${
                        isToday ? 'border-[#1040C0]' : 'border-[#121212]'
                      }`}
                    >
                      {/* Today accent bar */}
                      {isToday && (
                        <div className="bg-[#1040C0] px-4 py-1.5">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-white">
                            Today
                          </p>
                        </div>
                      )}

                      {/* Card body */}
                      <div className="flex flex-1 flex-col gap-3 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xl font-black leading-none text-[#121212]">
                              {fmtTime(session.scheduled_start_utc, userTimezone)}
                            </p>
                            <p className="mt-0.5 text-xs text-[#121212]/50">
                              {fmtDate(session.scheduled_start_utc, userTimezone)}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              SESSION_STATUS_COLOURS[session.status] ??
                              'border-2 bg-[#E0E0E0] text-[#121212]/80'
                            }`}
                          >
                            {SESSION_STATUS_LABELS[session.status] ?? session.status}
                          </span>
                        </div>

                        <div>
                          <p className="font-semibold text-[#121212]">
                            {subjectName}
                            {levelLabel && levelLabel !== '—' && (
                              <span className="ml-1 font-normal text-[#121212]/50">
                                · {levelLabel}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-[#121212]/50">Tutor: {tutorName}</p>
                          {!isUpcoming && session.tutor_notes && (
                            <p className="mt-1 text-xs italic text-[#121212]/40">
                              Note: {session.tutor_notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions footer (upcoming joinable sessions only) */}
                      {isUpcoming && isJoinable && (
                        <div className="flex flex-wrap items-center gap-2 border-t-2 border-[#E8E8E8] p-3">
                          {match?.meet_link && (
                            <a
                              href={match.meet_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center border-2 border-[#1040C0] px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-[#1040C0] transition hover:bg-[#1040C0] hover:text-white"
                            >
                              Join Meet →
                            </a>
                          )}
                          <RescheduleButton
                            subject={subjectName}
                            level={levelLabel}
                            scheduledStartUtc={session.scheduled_start_utc}
                            studentTimezone={userTimezone}
                            serverNowMs={serverNowMs}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
