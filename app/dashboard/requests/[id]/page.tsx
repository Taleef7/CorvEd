// E4 T4.2: Request detail / confirmation page
// E5 S5.1: links to package selection with requestId param
// Closes #28 #31

import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { STATUS_LABELS, STATUS_COLOURS, RequestStatus } from '@/lib/utils/request'

export const dynamic = 'force-dynamic'

const LEVEL_LABELS: Record<string, string> = {
  o_levels: 'O Levels',
  a_levels: 'A Levels',
}

const EXAM_BOARD_LABELS: Record<string, string> = {
  cambridge: 'Cambridge',
  edexcel: 'Edexcel',
  other: 'Other',
  unspecified: 'Not specified',
}

function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLOURS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

function NextStepBanner({ status, requestId }: { status: RequestStatus; requestId: string }) {
  if (status === 'new') {
    return (
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-900/20">
        <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300">
          Next step: Select a package and pay to begin the matching process.
        </p>
        <Link
          href={`/dashboard/packages/new?requestId=${requestId}`}
          className="mt-3 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Select Package →
        </Link>
      </div>
    )
  }

  if (status === 'payment_pending') {
    return (
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
          Payment pending verification. We&apos;ll notify you on WhatsApp once confirmed.
        </p>
      </div>
    )
  }

  if (status === 'ready_to_match') {
    return (
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
          Payment confirmed ✅ We&apos;re finding the best teacher for you.
        </p>
      </div>
    )
  }

  if (status === 'matched' || status === 'active') {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
        <p className="text-sm font-medium text-green-800 dark:text-green-300">
          You&apos;ve been matched! See your dashboard for session details.
        </p>
        <Link
          href="/dashboard"
          className="mt-3 inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
        >
          Go to Dashboard →
        </Link>
      </div>
    )
  }

  if (status === 'paused') {
    return (
      <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
        <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
          Your tutoring is currently paused. Contact us on WhatsApp to resume.
        </p>
      </div>
    )
  }

  if (status === 'ended') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <p className="text-sm font-medium text-red-800 dark:text-red-300">
          This tutoring engagement has ended.
        </p>
        <Link
          href="/dashboard/requests/new"
          className="mt-3 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Start a new request →
        </Link>
      </div>
    )
  }

  return null
}

export default async function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  const { data: request } = await supabase
    .from('requests')
    .select('*, subjects(name)')
    .eq('id', id)
    .single()

  if (!request) notFound()
  if (request.created_by_user_id !== user.id) notFound()

  const status = request.status as RequestStatus
  const subjectName = (request.subjects as { name: string } | null)?.name ?? '—'
  const submittedAt = new Date(request.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-lg space-y-6">
        {/* Confirmation banner */}
        <div className="rounded-2xl bg-white px-8 py-8 shadow-md dark:bg-zinc-900">
          <div className="mb-1 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Request received
            </h1>
          </div>
          <p className="text-sm text-zinc-500">
            We&apos;ve received your request for{' '}
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {LEVEL_LABELS[request.level] ?? request.level} — {subjectName}
            </span>
            .
          </p>
        </div>

        {/* Next step banner */}
        <NextStepBanner status={status} requestId={request.id} />

        {/* Request summary */}
        <div className="rounded-2xl bg-white px-8 py-8 shadow-md dark:bg-zinc-900">
          <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Request summary
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Level</dt>
              <dd className="font-medium text-zinc-800 dark:text-zinc-200">
                {LEVEL_LABELS[request.level] ?? request.level}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Subject</dt>
              <dd className="font-medium text-zinc-800 dark:text-zinc-200">{subjectName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Exam board</dt>
              <dd className="font-medium text-zinc-800 dark:text-zinc-200">
                {EXAM_BOARD_LABELS[request.exam_board] ?? request.exam_board}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Timezone</dt>
              <dd className="font-medium text-zinc-800 dark:text-zinc-200">{request.timezone}</dd>
            </div>
            {request.availability_windows && (
              <div className="flex flex-col gap-1">
                <dt className="text-zinc-500">Availability</dt>
                <dd className="font-medium text-zinc-800 dark:text-zinc-200">
                  {typeof request.availability_windows === 'string'
                    ? request.availability_windows
                    : JSON.stringify(request.availability_windows)}
                </dd>
              </div>
            )}
            {request.goals && (
              <div className="flex flex-col gap-1">
                <dt className="text-zinc-500">Goals</dt>
                <dd className="font-medium text-zinc-800 dark:text-zinc-200">{request.goals}</dd>
              </div>
            )}
            {request.preferred_start_date && (
              <div className="flex justify-between">
                <dt className="text-zinc-500">Preferred start</dt>
                <dd className="font-medium text-zinc-800 dark:text-zinc-200">
                  {request.preferred_start_date}
                </dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-zinc-500">Status</dt>
              <dd>
                <StatusBadge status={status} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Submitted</dt>
              <dd className="font-medium text-zinc-800 dark:text-zinc-200">{submittedAt}</dd>
            </div>
          </dl>
        </div>

        <div className="text-center">
          <Link
            href="/dashboard"
            className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
          >
            ← Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
