// E7 T7.4 S7.2: Admin match detail page — view match, reassign tutor, edit schedule
// Closes #50 #46

export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchApprovedTutors } from '@/lib/services/matching'
import { LEVEL_LABELS } from '@/lib/utils/request'
import { ReassignTutorForm, EditMatchForm } from './MatchActions'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const MATCH_STATUS_COLOURS: Record<string, string> = {
  matched: 'bg-purple-100 text-purple-800',
  active: 'bg-green-100 text-green-800',
  paused: 'bg-orange-100 text-orange-800',
  ended: 'bg-red-100 text-red-800',
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
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: matchData } = await admin
    .from('matches')
    .select(
      `id, status, meet_link, schedule_pattern, assigned_at, created_at, updated_at,
       tutor_user_id, assigned_by_user_id, request_id,
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

  const assignedDate = new Date(match.assigned_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Fetch eligible tutors for reassignment (same subject + level as the request)
  const eligibleTutors = request
    ? await fetchApprovedTutors(request.subject_id, request.level)
    : []

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back link */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/matches"
          className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline dark:text-indigo-400"
        >
          ← Back to Matches
        </Link>
        {request && (
          <Link
            href={`/admin/requests/${request.id}`}
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            View Request →
          </Link>
        )}
      </div>

      {/* Match header */}
      <div className="rounded-2xl bg-white px-6 py-6 shadow-sm dark:bg-zinc-900">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Match Detail</h1>
            <p className="mt-0.5 text-sm text-zinc-500">Assigned {assignedDate}</p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${MATCH_STATUS_COLOURS[match.status] ?? 'bg-zinc-100 text-zinc-700'}`}
          >
            {match.status}
          </span>
        </div>

        <hr className="my-5 border-zinc-200 dark:border-zinc-700" />

        {/* Match info grid */}
        <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-zinc-500">Student</dt>
            <dd className="font-medium text-zinc-800 dark:text-zinc-200">{studentName}</dd>
            {studentProfile?.whatsapp_number && (
              <dd className="text-xs text-zinc-400">📱 {studentProfile.whatsapp_number}</dd>
            )}
          </div>

          <div>
            <dt className="text-zinc-500">Tutor</dt>
            <dd className="font-medium text-zinc-800 dark:text-zinc-200">
              {tutorUserProfile?.display_name ?? '—'}
            </dd>
            <dd className="text-xs text-zinc-400">{tutorProfile?.timezone}</dd>
            {tutorUserProfile?.whatsapp_number && (
              <dd className="text-xs text-zinc-400">📱 {tutorUserProfile.whatsapp_number}</dd>
            )}
          </div>

          <div>
            <dt className="text-zinc-500">Subject</dt>
            <dd className="font-medium text-zinc-800 dark:text-zinc-200">{subjectName}</dd>
          </div>

          <div>
            <dt className="text-zinc-500">Level</dt>
            <dd className="font-medium text-zinc-800 dark:text-zinc-200">{levelLabel}</dd>
          </div>

          <div>
            <dt className="text-zinc-500">Google Meet Link</dt>
            <dd className="font-medium text-zinc-800 dark:text-zinc-200">
              {match.meet_link ? (
                <a
                  href={match.meet_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  {match.meet_link}
                </a>
              ) : (
                <span className="italic text-zinc-400">Not set</span>
              )}
            </dd>
          </div>

          <div>
            <dt className="text-zinc-500">Schedule</dt>
            <dd className="font-medium text-zinc-800 dark:text-zinc-200">
              {schedule?.days && schedule.days.length > 0 ? (
                <>
                  {schedule.days.map((d) => DAY_NAMES[d]).join(', ')}
                  {schedule.time && ` at ${schedule.time}`}
                  {schedule.timezone && ` (${schedule.timezone})`}
                </>
              ) : (
                <span className="italic text-zinc-400">Not set</span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      {/* Admin actions */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
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
          <div className="rounded-xl border border-dashed border-zinc-300 p-4 dark:border-zinc-600">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              📅 Generate Sessions
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Session generation (E8) will be available once Epic E8 is implemented.
            </p>
          </div>
        )}
      </div>

      {/* Audit info */}
      <p className="text-xs text-zinc-400">
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
