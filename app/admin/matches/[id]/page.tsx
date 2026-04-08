// E7 T7.4 S7.2 E8 T8.1 E11 T11.2: Admin match detail page — view match, reassign tutor, edit schedule, generate sessions, WhatsApp actions
// Closes #50 #46 #54 #75

export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchApprovedTutors } from '@/lib/services/matching'
import { LEVEL_LABELS } from '@/lib/utils/request'
import { ReassignTutorForm, EditMatchForm, GenerateSessionsForm, DeleteSessionsForm, AdminNotesForm } from './MatchActions'
import { CopyMessageButton } from '@/components/CopyMessageButton'
import { WhatsAppLink } from '@/components/WhatsAppLink'
import { templates } from '@/lib/whatsapp/templates'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const MATCH_STATUS_COLOURS: Record<string, string> = {
  matched: 'border-2 border-[#1040C0] bg-[#1040C0]/10 text-[#1040C0]',
  active: 'border-2 border-[#121212] bg-[#121212] text-white',
  paused: 'border-2 border-[#F0C020] bg-[#F0C020] text-[#121212]',
  ended: 'border-2 border-[#D02020] bg-[#D02020]/10 text-[#D02020]',
}

type SchedulePattern = {
  timezone?: string
  days?: number[]
  time?: string
  duration_mins?: number
}

type MatchDetail = {
  id: string
  status: string
  meet_link: string | null
  schedule_pattern: SchedulePattern | null
  assigned_at: string
  created_at: string
  updated_at: string
  tutor_user_id: string
  assigned_by_user_id: string | null
  request_id: string
  admin_notes: string | null
  tutor_profiles: {
    bio: string | null
    timezone: string
    user_profiles: { display_name: string; whatsapp_number: string | null } | null
  } | null
  requests: {
    id: string
    level: string
    subject_id: number
    goals: string | null
    timezone: string
    for_student_name: string | null
    requester_role: string
    subjects: { name: string } | null
    user_profiles: { display_name: string; whatsapp_number: string | null } | null
  } | null
}

export default async function AdminMatchDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ assigned?: string }>
}) {
  const { id } = await params
  const { assigned } = await searchParams
  const admin = createAdminClient()

  const { data: matchData } = await admin
    .from('matches')
    .select(
      `id, status, meet_link, schedule_pattern, assigned_at, created_at, updated_at,
       tutor_user_id, assigned_by_user_id, request_id, admin_notes,
       tutor_profiles!matches_tutor_user_id_fkey (
         bio, timezone,
         user_profiles!tutor_user_id ( display_name, whatsapp_number )
       ),
       requests!matches_request_id_fkey (
         id, level, subject_id, goals, timezone, for_student_name, requester_role,
         subjects ( name ),
         user_profiles!requests_created_by_user_id_fkey ( display_name, whatsapp_number )
       )`
    )
    .eq('id', id)
    .maybeSingle()

  if (!matchData) notFound()

  const match = matchData as unknown as MatchDetail
  const request = match.requests
  const tutorProfile = match.tutor_profiles
  const tutorUserProfile = tutorProfile?.user_profiles
  const studentProfile = request?.user_profiles
  const subjectName = (request?.subjects as { name: string } | null)?.name ?? '—'
  const levelLabel = request ? (LEVEL_LABELS[request.level] ?? request.level) : '—'
  const schedule = match.schedule_pattern

  const studentName =
    request?.requester_role === 'parent' && request?.for_student_name
      ? request.for_student_name
      : (studentProfile?.display_name ?? '—')

  const tutorName = tutorUserProfile?.display_name ?? '—'
  const schedDays = schedule?.days?.length
    ? schedule.days.map((d) => DAY_NAMES[d]).join(', ')
    : ''
  const schedTime = schedule?.time ?? ''
  const schedTz = schedule?.timezone ?? ''
  const meetLink = match.meet_link ?? ''

  // Pre-built template strings for WhatsApp buttons
  const matchedMsg =
    schedDays && schedTime && schedTz && meetLink
      ? templates.matched({
          tutorName,
          days: schedDays,
          time: schedTime,
          tz: schedTz,
          meetLink,
        })
      : null

  const rem1hStudentMsg =
    schedTime && schedTz && meetLink
      ? templates.rem1h({
          level: levelLabel,
          subject: subjectName,
          tutorName,
          time: schedTime,
          tz: schedTz,
          meetLink,
        })
      : null

  const tutorAvailCheckMsg = templates.tutorAvailCheck({
    tutorName,
    level: levelLabel,
    subject: subjectName,
    slot1: '[e.g. Mon 5:00 PM PKT]',
    slot2: '[e.g. Wed 5:00 PM PKT]',
  })

  const assignedDate = new Date(match.assigned_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Fetch eligible tutors for reassignment (same subject + level as the request)
  const eligibleTutors = request
    ? await fetchApprovedTutors(request.subject_id, request.level)
    : []

  // Session count for this match (to show delete option when sessions exist)
  const { count: sessionCount } = await admin
    .from('sessions')
    .select('id', { count: 'exact', head: true })
    .eq('match_id', match.id)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {assigned === '1' && (
        <div className="border-2 border-[#121212] bg-white px-6 py-4 text-[#121212]">
          <p className="font-semibold">Tutor assigned successfully.</p>
          <p className="mt-1 text-sm text-[#121212]/60">
            The request is now matched and ready for session generation or follow-up updates.
          </p>
        </div>
      )}

      {/* Back link */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/matches"
          className="inline-flex items-center gap-1 text-sm font-bold text-[#1040C0] underline-offset-4 hover:underline"
        >
          ← Back to Matches
        </Link>
        {request && (
          <Link
            href={`/admin/requests/${request.id}`}
            className="text-sm text-[#121212]/60 hover:text-[#121212]/80"
          >
            View Request →
          </Link>
        )}
      </div>

      {/* Match header */}
      <div className="border-4 border-[#121212] bg-white px-6 py-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-[#121212]">Match Detail</h1>
            <p className="mt-0.5 text-sm text-[#121212]/60">Assigned {assignedDate}</p>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${MATCH_STATUS_COLOURS[match.status] ?? 'bg-[#E0E0E0] text-[#121212]/80'}`}
          >
            {match.status}
          </span>
        </div>

        <hr className="my-5 border-[#D0D0D0]" />

        {/* Match info grid */}
        <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[#121212]/60">Student</dt>
            <dd className="font-medium text-[#121212]">{studentName}</dd>
            {studentProfile?.whatsapp_number && (
              <dd className="mt-1 flex items-center gap-2 text-xs text-[#121212]/40">
                📱 {studentProfile.whatsapp_number}
                <WhatsAppLink number={studentProfile.whatsapp_number} label="Open chat" />
              </dd>
            )}
          </div>

          <div>
            <dt className="text-[#121212]/60">Tutor</dt>
            <dd className="font-medium text-[#121212]">
              {tutorUserProfile?.display_name ?? '—'}
            </dd>
            <dd className="text-xs text-[#121212]/40">{tutorProfile?.timezone}</dd>
            {tutorUserProfile?.whatsapp_number && (
              <dd className="mt-1 flex items-center gap-2 text-xs text-[#121212]/40">
                📱 {tutorUserProfile.whatsapp_number}
                <WhatsAppLink number={tutorUserProfile.whatsapp_number} label="Open chat" />
              </dd>
            )}
          </div>

          <div>
            <dt className="text-[#121212]/60">Subject</dt>
            <dd className="font-medium text-[#121212]">{subjectName}</dd>
          </div>

          <div>
            <dt className="text-[#121212]/60">Level</dt>
            <dd className="font-medium text-[#121212]">{levelLabel}</dd>
          </div>

          <div>
            <dt className="text-[#121212]/60">Google Meet Link</dt>
            <dd className="font-medium text-[#121212]">
              {match.meet_link ? (
                <a
                  href={match.meet_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#1040C0] underline-offset-4 hover:underline"
                >
                  {match.meet_link}
                </a>
              ) : (
                <span className="italic text-[#121212]/40">Not set</span>
              )}
            </dd>
          </div>

          <div>
            <dt className="text-[#121212]/60">Schedule</dt>
            <dd className="font-medium text-[#121212]">
              {schedule?.days && schedule.days.length > 0 ? (
                <>
                  {schedule.days.map((d) => DAY_NAMES[d]).join(', ')}
                  {schedule.time && ` at ${schedule.time}`}
                  {schedule.timezone && ` (${schedule.timezone})`}
                </>
              ) : (
                <span className="italic text-[#121212]/40">Not set</span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      {/* Admin actions */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#121212]/50">
          Admin Actions
        </h2>

        <EditMatchForm
          matchId={match.id}
          currentMeetLink={match.meet_link}
          currentSchedule={schedule}
        />

        <ReassignTutorForm
          matchId={match.id}
          currentTutorUserId={match.tutor_user_id}
          eligibleTutors={eligibleTutors}
        />

        {schedule?.days && schedule.days.length > 0 && match.meet_link && (
          <GenerateSessionsForm matchId={match.id} />
        )}

        {(sessionCount ?? 0) > 0 && (
          <DeleteSessionsForm matchId={match.id} sessionCount={sessionCount ?? 0} />
        )}

        <AdminNotesForm matchId={match.id} currentNotes={match.admin_notes} />
      </div>

      {/* WhatsApp Actions */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#121212]/50">
          WhatsApp Messages
        </h2>
        <div className="border-2 border-[#D0D0D0] bg-white p-5 space-y-3">
          {matchedMsg ? (
            <div>
              <p className="mb-1 text-xs font-medium text-[#121212]/60">Match confirmed (to student)</p>
              <CopyMessageButton
                message={matchedMsg}
                whatsappNumber={studentProfile?.whatsapp_number ?? undefined}
                label="Copy matched message"
              />
            </div>
          ) : (
            <p className="text-xs text-[#121212]/40 italic">
              Set schedule and Meet link to enable match confirmation template.
            </p>
          )}

          {rem1hStudentMsg && (
            <div>
              <p className="mb-1 text-xs font-medium text-[#121212]/60">1-hour reminder (to student)</p>
              <CopyMessageButton
                message={rem1hStudentMsg}
                whatsappNumber={studentProfile?.whatsapp_number ?? undefined}
                label="Copy 1-hour reminder (student)"
              />
            </div>
          )}

          {rem1hStudentMsg && (
            <div>
              <p className="mb-1 text-xs font-medium text-[#121212]/60">1-hour reminder (to tutor)</p>
              <CopyMessageButton
                message={rem1hStudentMsg}
                whatsappNumber={tutorUserProfile?.whatsapp_number ?? undefined}
                label="Copy 1-hour reminder (tutor)"
              />
            </div>
          )}

          <div>
            <p className="mb-1 text-xs font-medium text-[#121212]/60">Tutor availability check</p>
            <CopyMessageButton
              message={tutorAvailCheckMsg}
              whatsappNumber={tutorUserProfile?.whatsapp_number ?? undefined}
              label="Copy tutor availability check"
            />
          </div>
        </div>
      </div>

      {/* Audit info */}
      <p className="text-xs text-[#121212]/40">
        Match ID: {match.id} · Last updated:{' '}
        {new Date(match.updated_at).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
      </p>
    </div>
  )
}
