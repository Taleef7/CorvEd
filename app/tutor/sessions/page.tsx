// E8 S8.1 S8.2 E10 T10.1: Tutor sessions — grid layout, student filter chips, view toggle
// Closes #52 #53 #68

export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  SESSION_STATUS_LABELS,
  SESSION_STATUS_COLOURS,
  type SessionStatus,
} from '@/lib/utils/session'
import { getLevelLabel } from '@/lib/utils/request'
import { SessionCompleteForm } from '@/components/dashboards/SessionCompleteForm'
import { StudentChips, TutorViewControls, type SessionView } from './TutorSessionFilters'

type TutorSessionRow = {
  id: string
  scheduled_start_utc: string
  status: SessionStatus
  tutor_notes: string | null
  matches: {
    meet_link: string | null
    requests: {
      level: string | null
      for_student_name: string | null
      subjects: { name: string } | null
      user_profiles: { user_id: string; display_name: string } | null
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

export default async function TutorSessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string; child?: string; view?: string; status?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/sign-in')

  const params = await searchParams
  const filterStudentId = params.student ?? ''
  const filterChildName = params.child // undefined = no filter, '' = self-request, name = parent's child
  const view = (params.view === 'past' ? 'past' : 'upcoming') as SessionView
  const filterStatus = params.status ?? ''

  const { data: tutorProfile } = await supabase
    .from('tutor_profiles')
    .select('timezone')
    .eq('tutor_user_id', user.id)
    .single()

  const tutorTimezone = tutorProfile?.timezone ?? 'Asia/Karachi'

  const { data: rawData } = await supabase
    .from('sessions')
    .select(
      `id, scheduled_start_utc, status, tutor_notes,
       matches!sessions_match_id_fkey (
         meet_link,
         requests!matches_request_id_fkey (
           level, for_student_name,
           subjects ( name ),
           user_profiles!requests_created_by_user_id_fkey ( user_id, display_name )
         )
       )`,
    )
    .order('scheduled_start_utc', { ascending: true })

  const allSessions = (rawData ?? []) as unknown as TutorSessionRow[]

  const nowIso = new Date().toISOString()
  const todayStr = localDateStr(nowIso, tutorTimezone)

  // ── Derive unique students (for chips) ──────────────────────────────────────
  type StudentEntry = { userId: string; forStudentName: string | null; displayName: string; upcomingCount: number }
  const studentMap = new Map<string, StudentEntry>()
  for (const sess of allSessions) {
    const up = sess.matches?.requests?.user_profiles as
      | { user_id: string; display_name: string }
      | null
    if (!up?.user_id) continue
    const forStudentName = sess.matches?.requests?.for_student_name ?? null
    const key = `${up.user_id}:${forStudentName ?? ''}`
    const studentDisplayName = forStudentName ?? up.display_name
    if (!studentMap.has(key)) {
      studentMap.set(key, {
        userId: up.user_id,
        forStudentName,
        displayName: studentDisplayName,
        upcomingCount: 0,
      })
    }
    if (sess.scheduled_start_utc >= nowIso) {
      studentMap.get(key)!.upcomingCount++
    }
  }
  const students = [...studentMap.values()].sort((a, b) =>
    a.displayName.localeCompare(b.displayName),
  )

  // ── Global stats (always from all sessions, unfiltered) ─────────────────────
  const allUpcoming = allSessions.filter((s) => s.scheduled_start_utc >= nowIso)
  const todayCount = allUpcoming.filter(
    (s) => localDateStr(s.scheduled_start_utc, tutorTimezone) === todayStr,
  ).length
  const doneCount = allSessions.filter((s) => s.status === 'done').length

  // ── Apply filters ───────────────────────────────────────────────────────────
  let filtered = allSessions
  if (filterStudentId) {
    filtered = filtered.filter((s) => {
      const req = s.matches?.requests
      const uid = (req?.user_profiles as { user_id: string } | null)?.user_id
      if (uid !== filterStudentId) return false
      if (filterChildName !== undefined) {
        const forStudentName = req?.for_student_name ?? null
        const expectedName = filterChildName === '' ? null : filterChildName
        return forStudentName === expectedName
      }
      return true
    })
  }
  if (filterStatus) {
    filtered = filtered.filter((s) => s.status === filterStatus)
  }

  const upcomingSessions = filtered.filter((s) => s.scheduled_start_utc >= nowIso)
  const pastSessions = [...filtered.filter((s) => s.scheduled_start_utc < nowIso)].reverse()
  const displayed = view === 'past' ? pastSessions : upcomingSessions
  const selectedStudent = filterStudentId
    ? [...studentMap.values()].find(
        (s) =>
          s.userId === filterStudentId &&
          (filterChildName !== undefined
            ? (s.forStudentName ?? '') === filterChildName
            : true),
      )
    : undefined

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-3xl font-black uppercase tracking-tighter text-[#121212]">
        My Sessions
      </h1>

      {/* Stats strip */}
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Upcoming', value: allUpcoming.length },
          {
            label: 'Today',
            value: todayCount,
            accent: todayCount > 0,
          },
          { label: 'Done', value: doneCount },
          { label: 'Students', value: students.length },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`border-2 px-4 py-3 ${
              stat.accent ? 'border-[#1040C0] bg-[#1040C0]/5' : 'border-[#D0D0D0] bg-white'
            }`}
          >
            <dd
              className={`text-2xl font-black ${stat.accent ? 'text-[#1040C0]' : 'text-[#121212]'}`}
            >
              {stat.value}
            </dd>
            <dt className="text-xs font-medium uppercase tracking-widest text-[#121212]/50">
              {stat.label}
            </dt>
          </div>
        ))}
      </dl>

      {/* Student filter chips (only when there are multiple students) */}
      {students.length > 1 && (
        <StudentChips students={students} activeStudentId={filterStudentId} activeChildName={filterChildName} />
      )}

      {allSessions.length === 0 ? (
        <div className="border-4 border-[#121212] bg-white px-8 py-12 text-center">
          <p className="text-[#121212]/60">No sessions scheduled yet.</p>
        </div>
      ) : (
        <>
          {/* View toggle + status filter */}
          <TutorViewControls
            studentId={filterStudentId || undefined}
            childName={filterChildName}
            view={view}
            status={filterStatus}
            upcomingCount={upcomingSessions.length}
            pastCount={pastSessions.length}
          />

          {/* Session grid */}
          {displayed.length === 0 ? (
            <div className="border-4 border-[#121212] bg-white px-8 py-10 text-center">
              <p className="text-sm text-[#121212]/50">
                No {view} sessions
                {selectedStudent ? ` for ${selectedStudent.displayName}` : ''}
                {filterStatus ? ` with status "${filterStatus.replace(/_/g, ' ')}"` : ''}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {displayed.map((session) => {
                const req = session.matches?.requests
                const studentName =
                  req?.for_student_name ??
                  (req?.user_profiles as { display_name: string } | null)?.display_name ?? '—'
                const subjectName = (req?.subjects as { name: string } | null)?.name ?? '—'
                const levelLabel = getLevelLabel(req?.level)
                const isUpcoming = session.scheduled_start_utc >= nowIso
                const isToday =
                  isUpcoming &&
                  localDateStr(session.scheduled_start_utc, tutorTimezone) === todayStr
                const meetLink = session.matches?.meet_link

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
                            {fmtTime(session.scheduled_start_utc, tutorTimezone)}
                          </p>
                          <p className="mt-0.5 text-xs text-[#121212]/50">
                            {fmtDate(session.scheduled_start_utc, tutorTimezone)}
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
                        <p className="text-xs text-[#121212]/50">Student: {studentName}</p>
                        {session.tutor_notes && (
                          <p className="mt-1 text-xs italic text-[#121212]/40">
                            Note: {session.tutor_notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions footer */}
                    <div className="flex flex-wrap items-center gap-2 border-t-2 border-[#E8E8E8] p-3">
                      {meetLink && (
                        <a
                          href={meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center border-2 border-[#1040C0] px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-[#1040C0] transition hover:bg-[#1040C0] hover:text-white"
                        >
                          Join Meet →
                        </a>
                      )}
                      <SessionCompleteForm sessionId={session.id} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
