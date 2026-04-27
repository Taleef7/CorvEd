// E8 T8.4 S8.2 E11 T11.2: Admin sessions — student picker + per-student session view with compact WA actions
// Closes #57 #53 #75

export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import {
  SESSION_STATUS_LABELS,
  SESSION_STATUS_COLOURS,
  formatSessionTime,
  type SessionStatus,
} from '@/lib/utils/session'
import {
  getSessionStatusesForFilter,
  getSessionStatusFilterLabel,
  isSessionStatusFilter,
} from '@/lib/utils/session-filter'
import { SessionStatusForm, RescheduleForm } from './SessionActions'
import { StudentSearchBar, SessionViewControls, type SessionView } from './SessionFilters'
import Link from 'next/link'
import { CopyMessageButton } from '@/components/CopyMessageButton'
import { WhatsAppLink } from '@/components/WhatsAppLink'
import { templates } from '@/lib/whatsapp/templates'

const ADMIN_TIMEZONE = 'Asia/Karachi'
const IMPOSSIBLE_ID = '00000000-0000-0000-0000-000000000000'

export default async function AdminSessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string; child?: string; view?: string; status?: string; search?: string }>
}) {
  const params = await searchParams
  const studentId = params.student
  const childParam = params.child // undefined = no filter, '' = self-request, name = parent's child
  const view = (params.view === 'past' ? 'past' : 'upcoming') as SessionView
  const filterStatus = params.status && isSessionStatusFilter(params.status) ? params.status : ''
  const studentSearch = params.search ?? ''

  const admin = createAdminClient()
  const nowIso = new Date().toISOString()

  // ── SCREEN A: Student picker (no ?student param) ────────────────────────────
  if (!studentId) {
    const { data: matchData } = await admin.from('matches').select(`
      id, request_id,
      requests!matches_request_id_fkey (
        id, level, created_by_user_id, for_student_name,
        subjects ( name ),
        user_profiles!requests_created_by_user_id_fkey ( user_id, display_name, whatsapp_number )
      )
    `)

    const matchIds = (matchData ?? []).map((m) => m.id)

    const { data: sessionRows } =
      matchIds.length > 0
        ? await admin
            .from('sessions')
            .select('match_id, scheduled_start_utc, status')
            .in('match_id', matchIds)
        : { data: [] as { match_id: string; scheduled_start_utc: string; status: SessionStatus }[] }

    const filteredStatuses = filterStatus ? getSessionStatusesForFilter(filterStatus) : []

    // Aggregate per student
    type StudentEntry = {
      userId: string
      forStudentName: string | null
      displayName: string
      whatsappNumber: string | null
      subjects: string[]
      matchIds: string[]
    }

    const studentMap = new Map<string, StudentEntry>()

    for (const match of matchData ?? []) {
      const req = match.requests as {
        id: string
        level: string
        created_by_user_id: string
        for_student_name: string | null
        subjects: { name: string } | null
        user_profiles: {
          user_id: string
          display_name: string
          whatsapp_number: string | null
        } | null
      } | null
      if (!req?.user_profiles) continue

      const uid = req.user_profiles.user_id
      const forStudentName = req.for_student_name ?? null
      const key = `${uid}:${forStudentName ?? ''}`
      const studentDisplayName = forStudentName ?? req.user_profiles.display_name
      if (!studentMap.has(key)) {
        studentMap.set(key, {
          userId: uid,
          forStudentName,
          displayName: studentDisplayName,
          whatsappNumber: req.user_profiles.whatsapp_number,
          subjects: [],
          matchIds: [],
        })
      }
      const entry = studentMap.get(key)!
      const subjectName = req.subjects?.name
      if (subjectName && !entry.subjects.includes(subjectName)) entry.subjects.push(subjectName)
      if (!entry.matchIds.includes(match.id)) entry.matchIds.push(match.id)
    }

    // Per-student upcoming/past session counts
    const studentCounts = new Map<string, { upcoming: number; past: number }>()
    for (const [compoundKey, st] of studentMap.entries()) {
      let upcoming = 0
      let past = 0
      for (const sess of sessionRows ?? []) {
        if (!st.matchIds.includes(sess.match_id)) continue
        if (sess.scheduled_start_utc >= nowIso) upcoming++
        else past++
      }
      studentCounts.set(compoundKey, { upcoming, past })
    }

    // Apply search filter and sort by most upcoming first
    let students = [...studentMap.values()]
    if (filteredStatuses.length > 0) {
      students = students.filter((student) =>
        (sessionRows ?? []).some(
          (session) =>
            student.matchIds.includes(session.match_id) &&
            filteredStatuses.includes(session.status as SessionStatus),
        ),
      )
    }
    if (studentSearch) {
      const q = studentSearch.toLowerCase()
      students = students.filter((s) => s.displayName.toLowerCase().includes(q))
    }
    students.sort(
      (a, b) =>
        (studentCounts.get(`${b.userId}:${b.forStudentName ?? ''}`)?.upcoming ?? 0) -
        (studentCounts.get(`${a.userId}:${a.forStudentName ?? ''}`)?.upcoming ?? 0),
    )

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[#121212]">
            Sessions
          </h1>
          <p className="text-sm text-[#121212]/60">
            {students.length} student{students.length !== 1 ? 's' : ''} with sessions
          </p>
        </div>

        <StudentSearchBar currentSearch={studentSearch} />

        {students.length === 0 ? (
          <div className="border-4 border-[#121212] bg-white px-8 py-12 text-center">
            <p className="text-[#121212]/60">
              {studentSearch ? 'No students match that search.' : 'No sessions yet.'}
            </p>
            {!studentSearch && (
              <p className="mt-1 text-sm text-[#121212]/40">
                Generate sessions from a{' '}
                <Link
                  href="/admin/matches"
                  className="font-bold text-[#1040C0] underline-offset-4 hover:underline"
                >
                  match detail page
                </Link>{' '}
                once the schedule and Meet link are set.
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y-2 divide-[#E0E0E0] border-4 border-[#121212] bg-white">
            {students.map((student) => {
              const counts = studentCounts.get(`${student.userId}:${student.forStudentName ?? ''}`) ?? { upcoming: 0, past: 0 }
              return (
                <div
                  key={`${student.userId}:${student.forStudentName ?? ''}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-[#F8F8F8]"
                >
                  <div>
                    <p className="font-semibold text-[#121212]">{student.displayName}</p>
                    <p className="text-xs text-[#121212]/50">
                      {student.subjects.join(' · ') || '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#121212]/50">
                      {counts.upcoming} upcoming · {counts.past} past
                    </span>
                    {student.whatsappNumber && (
                      <WhatsAppLink
                        number={student.whatsappNumber}
                        label="Open WhatsApp"
                        compact
                      />
                    )}
                    <a
                      href={`/admin/sessions?student=${student.userId}&child=${encodeURIComponent(student.forStudentName ?? '')}${filterStatus ? `&status=${encodeURIComponent(filterStatus)}${['done', 'rescheduled', 'no_show', 'no_show_student', 'no_show_tutor'].includes(filterStatus) ? '&view=past' : ''}` : ''}`}
                      className="border-2 border-[#121212] px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-[#121212] hover:bg-[#F0F0F0]"
                    >
                      View →
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ── SCREEN B: Per-student session view (?student=<uid>) ─────────────────────
  const [{ data: studentProfile }, { data: rawStudentRequests }] = await Promise.all([
    admin
      .from('user_profiles')
      .select('user_id, display_name, whatsapp_number')
      .eq('user_id', studentId)
      .single(),
    admin
      .from('requests')
      .select('id, level, for_student_name, subjects(name)')
      .eq('created_by_user_id', studentId),
  ])

  // Filter to the specific learner when child param is present
  // child='' means self-request (for_student_name IS NULL), child='Name' means parent request
  const studentRequests = childParam !== undefined
    ? (rawStudentRequests ?? []).filter((r) => {
        const fn = (r as { for_student_name: string | null }).for_student_name
        return (fn ?? null) === (childParam || null)
      })
    : rawStudentRequests

  const requestIds = (studentRequests ?? []).map((r) => r.id)
  const safeReqIds = requestIds.length > 0 ? requestIds : [IMPOSSIBLE_ID]

  // Map request_id → subject/level
  type ReqInfo = { level: string; subjectName: string }
  const reqInfoMap = new Map<string, ReqInfo>()
  for (const req of studentRequests ?? []) {
    reqInfoMap.set(req.id, {
      level: req.level as string,
      subjectName: (req.subjects as { name: string } | null)?.name ?? '—',
    })
  }

  // Matches for this student's requests
  const { data: matchData } = await admin
    .from('matches')
    .select(`
      id, meet_link, schedule_pattern, request_id,
      tutor_profiles!matches_tutor_user_id_fkey (
        user_profiles!tutor_user_id ( display_name, whatsapp_number )
      )
    `)
    .in('request_id', safeReqIds)

  type MatchInfo = {
    matchId: string
    meetLink: string | null
    durationMins: number
    scheduleTz: string
    requestId: string
    tutorName: string
    tutorWhatsApp: string | null
    subjectName: string
    level: string
  }

  const matchInfoMap = new Map<string, MatchInfo>()
  for (const m of matchData ?? []) {
    const sp = m.schedule_pattern as { timezone?: string; duration_mins?: number } | null
    const req = reqInfoMap.get(m.request_id)
    const tutorProfile = (
      m.tutor_profiles as {
        user_profiles: { display_name: string; whatsapp_number: string | null } | null
      } | null
    )?.user_profiles
    matchInfoMap.set(m.id, {
      matchId: m.id,
      meetLink: m.meet_link,
      durationMins: sp?.duration_mins ?? 60,
      scheduleTz: sp?.timezone ?? ADMIN_TIMEZONE,
      requestId: m.request_id,
      tutorName: tutorProfile?.display_name ?? '—',
      tutorWhatsApp: tutorProfile?.whatsapp_number ?? null,
      subjectName: req?.subjectName ?? '—',
      level: req?.level ?? '',
    })
  }

  const matchIds = (matchData ?? []).map((m) => m.id)
  const safeMatchIds = matchIds.length > 0 ? matchIds : [IMPOSSIBLE_ID]

  // Sessions — optionally filtered by status
  let sessionsQuery = admin
    .from('sessions')
    .select('id, scheduled_start_utc, scheduled_end_utc, status, tutor_notes, match_id')
    .in('match_id', safeMatchIds)
    .order('scheduled_start_utc', { ascending: true })

  if (filterStatus) {
    const statuses = getSessionStatusesForFilter(filterStatus)
    if (statuses.length === 1) {
      sessionsQuery = sessionsQuery.eq('status', statuses[0])
    } else if (statuses.length > 1) {
      sessionsQuery = sessionsQuery.in('status', statuses)
    }
  }

  const { data: sessionsData } = await sessionsQuery

  type SessionRow = {
    id: string
    scheduled_start_utc: string
    scheduled_end_utc: string
    status: SessionStatus
    tutor_notes: string | null
    match_id: string
  }

  const allSessions = (sessionsData ?? []) as SessionRow[]
  const upcomingSessions = allSessions.filter((s) => s.scheduled_start_utc >= nowIso)
  const pastSessions = [...allSessions.filter((s) => s.scheduled_start_utc < nowIso)].reverse()
  const displayed = view === 'past' ? pastSessions : upcomingSessions

  const subjectSummary = [
    ...new Set([...matchInfoMap.values()].map((m) => m.subjectName)),
  ].join(' · ')

  const studentName = childParam || studentProfile?.display_name || 'Student'
  const studentWhatsApp = studentProfile?.whatsapp_number ?? undefined

  return (
    <div className="space-y-6">
      {/* Back + student header */}
      <div>
        <a
          href="/admin/sessions"
          className="mb-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[#121212]/50 hover:text-[#121212]"
        >
          ← All students
        </a>
        <div className="flex flex-wrap items-start justify-between gap-4 border-4 border-[#121212] bg-white p-5">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-[#121212]">
              {studentName}
            </h1>
            <p className="mt-1 text-sm text-[#121212]/50">{subjectSummary || '—'}</p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <WhatsAppLink
              number={studentWhatsApp}
              label={`Chat with ${studentName}`}
            />
          </div>
        </div>
      </div>

      {/* View toggle + status filter */}
      <SessionViewControls
        studentId={studentId}
        childName={childParam}
        view={view}
        status={filterStatus}
        upcomingCount={upcomingSessions.length}
        pastCount={pastSessions.length}
      />

      {/* Session list */}
      {displayed.length === 0 ? (
        <div className="border-4 border-[#121212] bg-white px-8 py-10 text-center">
          <p className="text-sm text-[#121212]/50">
            No {view} sessions
            {filterStatus ? ` with status "${getSessionStatusFilterLabel(filterStatus)}"` : ''}.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((session) => {
            const info = matchInfoMap.get(session.match_id)
            const timeDisplay = formatSessionTime(session.scheduled_start_utc, ADMIN_TIMEZONE)
            const waTimeDisplay = formatSessionTime(
              session.scheduled_start_utc,
              info?.scheduleTz ?? ADMIN_TIMEZONE,
            )
            const isUpcoming = session.scheduled_start_utc >= nowIso

            const rem1hMsg = info?.meetLink
              ? templates.rem1h({
                  level: info.level,
                  subject: info.subjectName,
                  tutorName: info.tutorName,
                  time: waTimeDisplay,
                  tz: info.scheduleTz,
                  meetLink: info.meetLink,
                })
              : null

            const lateJoinMsg = info?.meetLink
              ? templates.lateJoin({
                  name: studentName,
                  time: waTimeDisplay,
                  meetLink: info.meetLink,
                })
              : null

            const studentNoShowMsg = templates.studentNoShow({
              name: studentName,
              time: waTimeDisplay,
            })
            const tutorNoShowMsg = templates.tutorNoShow({ name: studentName })

            return (
              <div key={session.id} className="border-4 border-[#121212] bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  {/* Session info */}
                  <div className="space-y-1">
                    <p className="font-semibold text-[#121212]">{timeDisplay}</p>
                    <p className="text-xs text-[#121212]/50">
                      {info?.subjectName ?? '—'} · {info?.tutorName ?? '—'}
                    </p>
                    {session.tutor_notes && (
                      <p className="text-xs italic text-[#121212]/40">
                        Note: {session.tutor_notes}
                      </p>
                    )}
                    {info?.meetLink && (
                      <a
                        href={info.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold uppercase tracking-widest text-[#1040C0] underline-offset-4 hover:underline"
                      >
                        Join Meet →
                      </a>
                    )}
                  </div>

                  {/* Compact WA icon buttons + status badge */}
                  <div className="flex items-center gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {rem1hMsg && (
                        <CopyMessageButton
                          message={rem1hMsg}
                          label="1hr reminder"
                          compact
                        />
                      )}
                      {lateJoinMsg && (
                        <CopyMessageButton
                          message={lateJoinMsg}
                          label="Late join"
                          compact
                        />
                      )}
                      <CopyMessageButton
                        message={studentNoShowMsg}
                        label="No-show (student)"
                        compact
                      />
                      <CopyMessageButton
                        message={tutorNoShowMsg}
                        label="No-show (tutor)"
                        compact
                      />
                    </div>

                    <div className="h-6 w-px bg-[#E0E0E0]" />

                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${SESSION_STATUS_COLOURS[session.status] ?? 'border-2 bg-[#E0E0E0] text-[#121212]/80'}`}
                    >
                      {SESSION_STATUS_LABELS[session.status] ?? session.status}
                    </span>
                  </div>
                </div>

                {/* Status update (all sessions) + reschedule (upcoming only) */}
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#E8E8E8] pt-3">
                  <SessionStatusForm
                    sessionId={session.id}
                    matchId={session.match_id}
                    requestId={info?.requestId ?? ''}
                    currentStatus={session.status}
                  />
                  {isUpcoming && (
                    <RescheduleForm
                      sessionId={session.id}
                      scheduledStartUtc={session.scheduled_start_utc}
                      adminTimezone={ADMIN_TIMEZONE}
                      durationMins={info?.durationMins ?? 60}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

