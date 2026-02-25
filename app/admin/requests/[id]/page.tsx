// E7 T7.2 E11 T11.3: Admin request detail + matching screen + WhatsApp link
// Closes #48 #76

export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchApprovedTutors } from '@/lib/services/matching'
import { STATUS_COLOURS, STATUS_LABELS, LEVEL_LABELS } from '@/lib/utils/request'
import { AssignTutorForm } from './AssignTutorForm'
import { WhatsAppLink } from '@/components/WhatsAppLink'

const EXAM_BOARD_LABELS: Record<string, string> = {
  cambridge: 'Cambridge',
  edexcel: 'Edexcel',
  other: 'Other',
  unspecified: 'Not specified',
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type RequestData = {
  id: string
  status: string
  level: string
  subject_id: number
  exam_board: string
  goals: string | null
  timezone: string
  availability_windows: unknown
  preferred_start_date: string | null
  for_student_name: string | null
  requester_role: string
  created_at: string
  subjects: { name: string } | null
  user_profiles: { display_name: string; whatsapp_number: string | null } | null
}

type MatchData = {
  id: string
  status: string
  meet_link: string | null
  schedule_pattern: {
    timezone?: string
    days?: number[]
    time?: string
    duration_mins?: number
  } | null
  assigned_at: string
  tutor_user_id: string
  user_profiles: { display_name: string } | null
}

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const admin = createAdminClient()

  const [{ data: requestData }, { data: matchData }] = await Promise.all([
    admin
      .from('requests')
      .select(
        `id, status, level, subject_id, exam_board, goals, timezone,
         availability_windows, preferred_start_date, for_student_name,
         requester_role, created_at,
         subjects ( name ),
         user_profiles!requests_created_by_user_id_fkey ( display_name, whatsapp_number )`
      )
      .eq('id', id)
      .maybeSingle(),
    admin
      .from('matches')
      .select(
        `id, status, meet_link, schedule_pattern, assigned_at, tutor_user_id,
         user_profiles!matches_tutor_user_id_fkey ( display_name )`
      )
      .eq('request_id', id)
      .maybeSingle(),
  ])

  if (!requestData) notFound()

  const request = requestData as unknown as RequestData
  const match = matchData as unknown as MatchData | null
  const profile = request.user_profiles
  const subjectName = (request.subjects as { name: string } | null)?.name ?? '—'
  const levelLabel = LEVEL_LABELS[request.level] ?? request.level
  const requestStatus = request.status as keyof typeof STATUS_COLOURS
  const submittedDate = new Date(request.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Fetch eligible tutors only for ready_to_match requests
  const eligibleTutors =
    request.status === 'ready_to_match'
      ? await fetchApprovedTutors(request.subject_id, request.level)
      : []

  // Format availability for display
  let availabilityDisplay: string = '—'
  if (request.availability_windows) {
    if (typeof request.availability_windows === 'string') {
      availabilityDisplay = request.availability_windows
    } else if (Array.isArray(request.availability_windows)) {
      availabilityDisplay = JSON.stringify(request.availability_windows)
    }
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/admin/requests"
        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline dark:text-indigo-400"
      >
        ← Back to Requests
      </Link>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left panel: Request details */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white px-6 py-6 shadow-sm dark:bg-zinc-900">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  Request Details
                </h1>
                <p className="mt-0.5 text-sm text-zinc-500">Submitted {submittedDate}</p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLOURS[requestStatus] ?? 'bg-zinc-100 text-zinc-700'}`}
              >
                {STATUS_LABELS[requestStatus] ?? request.status}
              </span>
            </div>

            <hr className="my-5 border-zinc-200 dark:border-zinc-700" />

            {/* Student */}
            <section className="space-y-1.5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Student
              </h2>
              <p className="text-sm text-zinc-800 dark:text-zinc-200">
                <span className="font-medium">
                  {request.requester_role === 'parent' && request.for_student_name
                    ? request.for_student_name
                    : (profile?.display_name ?? '—')}
                </span>
                {request.requester_role === 'parent' && (
                  <span className="ml-2 text-zinc-500">
                    (Parent: {profile?.display_name ?? '—'})
                  </span>
                )}
              </p>
              {profile?.whatsapp_number && (
                <p className="flex items-center gap-2 text-sm text-zinc-500">
                  📱 {profile.whatsapp_number}
                  <WhatsAppLink number={profile.whatsapp_number} label="Open chat" />
                </p>
              )}
            </section>

            <hr className="my-5 border-zinc-200 dark:border-zinc-700" />

            {/* Subject info */}
            <section className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Subject &amp; Level
              </h2>
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Subject</dt>
                  <dd className="font-medium text-zinc-800 dark:text-zinc-200">{subjectName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Level</dt>
                  <dd className="font-medium text-zinc-800 dark:text-zinc-200">{levelLabel}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Exam board</dt>
                  <dd className="font-medium text-zinc-800 dark:text-zinc-200">
                    {EXAM_BOARD_LABELS[request.exam_board] ?? request.exam_board}
                  </dd>
                </div>
              </dl>
            </section>

            <hr className="my-5 border-zinc-200 dark:border-zinc-700" />

            {/* Schedule preferences */}
            <section className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Schedule Preferences
              </h2>
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Timezone</dt>
                  <dd className="font-medium text-zinc-800 dark:text-zinc-200">
                    {request.timezone}
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-zinc-500">Availability</dt>
                  <dd className="font-medium text-zinc-800 dark:text-zinc-200">
                    {availabilityDisplay}
                  </dd>
                </div>
                {request.preferred_start_date && (
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Preferred start</dt>
                    <dd className="font-medium text-zinc-800 dark:text-zinc-200">
                      {request.preferred_start_date}
                    </dd>
                  </div>
                )}
              </dl>
            </section>

            {request.goals && (
              <>
                <hr className="my-5 border-zinc-200 dark:border-zinc-700" />
                <section className="space-y-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Goals
                  </h2>
                  <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                    {request.goals}
                  </p>
                </section>
              </>
            )}
          </div>

          {/* Matched state: show match info */}
          {match && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-5 dark:border-emerald-800 dark:bg-emerald-900/10">
              <h2 className="font-semibold text-emerald-800 dark:text-emerald-300">
                ✅ Matched
              </h2>
              <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
                Tutor:{' '}
                <span className="font-medium">
                  {(match.user_profiles as { display_name: string } | null)?.display_name ?? '—'}
                </span>
              </p>
              {match.meet_link && (
                <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
                  Meet:{' '}
                  <a
                    href={match.meet_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                  >
                    {match.meet_link}
                  </a>
                </p>
              )}
              {match.schedule_pattern?.days && match.schedule_pattern.days.length > 0 && (
                <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
                  Schedule:{' '}
                  {match.schedule_pattern.days.map((d) => DAY_NAMES[d]).join(', ')}{' '}
                  {match.schedule_pattern.time && `at ${match.schedule_pattern.time}`}{' '}
                  {match.schedule_pattern.timezone && `(${match.schedule_pattern.timezone})`}
                </p>
              )}
              <Link
                href={`/admin/matches/${match.id}`}
                className="mt-3 inline-flex items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                View Match →
              </Link>
            </div>
          )}
        </div>

        {/* Right panel: Eligible tutors + assignment form */}
        <div>
          {request.status === 'ready_to_match' ? (
            <AssignTutorForm
              requestId={request.id}
              requestTimezone={request.timezone}
              eligibleTutors={eligibleTutors}
            />
          ) : request.status === 'matched' || request.status === 'active' ? (
            <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500">
                This request has already been matched. Use the match detail page to manage the
                tutor assignment.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500">
                This request is in <strong>{STATUS_LABELS[requestStatus] ?? request.status}</strong>{' '}
                status. Matching is available once payment is verified and status advances to
                &ldquo;Ready to Match&rdquo;.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
