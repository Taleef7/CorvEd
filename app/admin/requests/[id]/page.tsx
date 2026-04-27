// E7 T7.2 E11 T11.3: Admin request detail + matching screen + WhatsApp link
// Closes #48 #76

export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchApprovedTutors } from '@/lib/services/matching'
import { STATUS_COLOURS, STATUS_LABELS, LEVEL_LABELS } from '@/lib/utils/request'
import { AssignTutorForm } from './AssignTutorForm'
import { AdminRequestActions } from './AdminRequestActions'
import { WhatsAppLink } from '@/components/WhatsAppLink'
import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs'

const EXAM_BOARD_LABELS: Record<string, string> = {
  cambridge: 'Cambridge',
  edexcel: 'Edexcel',
  other: 'Other',
  unspecified: 'Not specified',
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

type AvailWindow = { day: number; start: string; end: string }

/** Compact 7-col availability calendar (server-rendered) */
function AvailCalendar({ windows }: { windows: AvailWindow[] }) {
  const byDay: Record<number, AvailWindow[]> = {}
  for (const w of windows) {
    if (!byDay[w.day]) byDay[w.day] = []
    byDay[w.day].push(w)
  }

  return (
    <div className="grid grid-cols-7 gap-px border border-[#D0D0D0] bg-[#D0D0D0] text-[9px] font-bold leading-tight">
      {DAY_SHORT.map((day, idx) => {
        const slots = byDay[idx] ?? []
        return (
          <div key={idx} className="bg-white">
            <div className={`px-0.5 py-0.5 text-center uppercase tracking-wide ${slots.length > 0 ? 'bg-[#1040C0] text-white' : 'text-[#121212]/30'}`}>
              {day}
            </div>
            <div className="space-y-px p-0.5 min-h-[28px]">
              {slots.length === 0 ? (
                <div className="text-center text-[#121212]/20 py-1">—</div>
              ) : (
                slots.map((s, si) => (
                  <div key={si} className="bg-[#1040C0]/10 px-0.5 py-0.5 text-center text-[#1040C0]">
                    {s.start}–{s.end}
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

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

  // Parse availability windows for the visual calendar
  const availWindows: AvailWindow[] = Array.isArray(request.availability_windows)
    ? (request.availability_windows as AvailWindow[])
    : []

  return (
    <div className="space-y-6">
      <AdminBreadcrumbs
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Requests', href: '/admin/requests' },
          { label: 'Request Detail' },
        ]}
      />

      {/* Back link */}
      <Link
        href="/admin/requests"
        className="inline-flex items-center gap-1 text-sm font-bold text-[#1040C0] underline-offset-4 hover:underline"
      >
        ← Back to Requests
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left panel: Request details */}
        <div className="space-y-4">
          <div className="border-4 border-[#121212] bg-white px-6 py-6">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-[#121212]">
                  Request Details
                </h1>
                <p className="mt-0.5 text-sm text-[#121212]/60">Submitted {submittedDate}</p>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${STATUS_COLOURS[requestStatus] ?? 'bg-[#E0E0E0] text-[#121212]/80'}`}
              >
                {STATUS_LABELS[requestStatus] ?? request.status}
              </span>
            </div>

            <hr className="my-5 border-[#D0D0D0]" />

            {/* Student */}
            <section className="space-y-1.5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[#121212]/60">
                Student
              </h2>
              <p className="text-sm text-[#121212]">
                <span className="font-medium">
                  {request.requester_role === 'parent' && request.for_student_name
                    ? request.for_student_name
                    : (profile?.display_name ?? '—')}
                </span>
                {request.requester_role === 'parent' && (
                  <span className="ml-2 text-[#121212]/60">
                    (Parent: {profile?.display_name ?? '—'})
                  </span>
                )}
              </p>
              {profile?.whatsapp_number && (
                <p className="flex items-center gap-2 text-sm text-[#121212]/60">
                  📱 {profile.whatsapp_number}
                  <WhatsAppLink number={profile.whatsapp_number} label="Open chat" />
                </p>
              )}
            </section>

            <hr className="my-5 border-[#D0D0D0]" />

            {/* Subject info */}
            <section className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[#121212]/60">
                Subject &amp; Level
              </h2>
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[#121212]/60">Subject</dt>
                  <dd className="font-medium text-[#121212]">{subjectName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#121212]/60">Level</dt>
                  <dd className="font-medium text-[#121212]">{levelLabel}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#121212]/60">Exam board</dt>
                  <dd className="font-medium text-[#121212]">
                    {EXAM_BOARD_LABELS[request.exam_board] ?? request.exam_board}
                  </dd>
                </div>
              </dl>
            </section>

            <hr className="my-5 border-[#D0D0D0]" />

            {/* Schedule preferences */}
            <section className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[#121212]/60">
                Schedule Preferences
              </h2>
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[#121212]/60">Timezone</dt>
                  <dd className="font-medium text-[#121212]">
                    {request.timezone}
                  </dd>
                </div>
                <div className="flex flex-col gap-1.5">
                  <dt className="text-[#121212]/60">Availability</dt>
                  <dd>
                    <AvailCalendar windows={availWindows} />
                  </dd>
                </div>
                {request.preferred_start_date && (
                  <div className="flex justify-between">
                    <dt className="text-[#121212]/60">Preferred start</dt>
                    <dd className="font-medium text-[#121212]">
                      {request.preferred_start_date}
                    </dd>
                  </div>
                )}
              </dl>
            </section>

            {request.goals && (
              <>
                <hr className="my-5 border-[#D0D0D0]" />
                <section className="space-y-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-[#121212]/60">
                    Goals
                  </h2>
                  <p className="whitespace-pre-wrap text-sm text-[#121212]/80">
                    {request.goals}
                  </p>
                </section>
              </>
            )}
          </div>

          {/* Matched state: show match info */}
          {match && (
            <div className="border-4 border-[#121212] bg-white px-6 py-5">
              <h2 className="font-semibold text-[#121212]/80">
                ✅ Matched
              </h2>
              <p className="mt-1 text-sm text-[#121212]/60">
                Tutor:{' '}
                <span className="font-medium text-[#121212]">
                  {(match.user_profiles as { display_name: string } | null)?.display_name ?? '—'}
                </span>
              </p>
              {match.meet_link && (
                <p className="mt-1 text-sm text-[#121212]/60">
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
                <p className="mt-1 text-sm text-[#121212]/60">
                  Schedule:{' '}
                  {match.schedule_pattern.days.map((d) => DAY_NAMES[d]).join(', ')}{' '}
                  {match.schedule_pattern.time && `at ${match.schedule_pattern.time}`}{' '}
                  {match.schedule_pattern.timezone && `(${match.schedule_pattern.timezone})`}
                </p>
              )}
              <Link
                href={`/admin/matches/${match.id}`}
                className="mt-3 inline-flex items-center border-2 border-[#121212] bg-[#1040C0] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-[3px_3px_0px_0px_#121212] transition hover:-translate-y-0.5"
              >
                View Match →
              </Link>
            </div>
          )}
        </div>

        {/* Right panel: Admin actions (sticky) + Eligible tutors */}
        <div className="space-y-4">
          {/* Admin actions — always visible at top */}
          <div className="lg:sticky lg:top-6">
            <AdminRequestActions requestId={request.id} currentStatus={request.status} />
          </div>

          {/* Tutor assignment / match state */}
          {request.status === 'ready_to_match' ? (
            <AssignTutorForm
              requestId={request.id}
              requestTimezone={request.timezone}
              requestAvailabilityWindows={availWindows}
              eligibleTutors={eligibleTutors}
            />
          ) : request.status === 'matched' || request.status === 'active' ? (
            <div className="border-4 border-[#121212] border border-[#D0D0D0] bg-white px-6 py-6">
              <p className="text-sm text-[#121212]/60">
                This request has already been matched. Use the match detail page to manage the
                tutor assignment.
              </p>
            </div>
          ) : (
            <div className="border-4 border-[#121212] border border-[#D0D0D0] bg-white px-6 py-6">
              <p className="text-sm text-[#121212]/60">
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
