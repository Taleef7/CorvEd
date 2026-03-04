// E4 T4.2: Request detail / confirmation page
// E5 S5.1: links to package selection with requestId param
// Closes #28 #31

import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { STATUS_LABELS, STATUS_COLOURS, RequestStatus, LEVEL_LABELS, formatAvailabilityWindows } from '@/lib/utils/request'
import { CancelRequestButton } from './CancelRequestButton'

export const dynamic = 'force-dynamic'

const EXAM_BOARD_LABELS: Record<string, string> = {
  cambridge: 'Cambridge',
  edexcel: 'Edexcel',
  other: 'Other',
  unspecified: 'Not specified',
}

function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${STATUS_COLOURS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

function NextStepBanner({ status, requestId, preferredTier }: { status: RequestStatus; requestId: string; preferredTier?: number | null }) {
  if (status === 'new') {
    const packageUrl = preferredTier
      ? `/dashboard/packages/new?requestId=${requestId}&tier=${preferredTier}`
      : `/dashboard/packages/new?requestId=${requestId}`
    return (
      <div className="border-l-4 border-[#1040C0] bg-[#1040C0]/5 p-4">
        <p className="text-sm font-medium text-[#121212]">
          {preferredTier
            ? `Next step: Confirm your ${preferredTier}-session package and pay to begin matching.`
            : 'Next step: Select a package and pay to begin the matching process.'}
        </p>
        <Link
          href={packageUrl}
          className="mt-3 inline-flex items-center border-2 border-[#121212] bg-[#1040C0] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-[3px_3px_0px_0px_#121212] transition hover:-translate-y-0.5"
        >
          {preferredTier ? 'Continue to Payment →' : 'Select Package →'}
        </Link>
      </div>
    )
  }

  if (status === 'payment_pending') {
    return (
      <div className="border-l-4 border-[#F0C020] bg-[#F0C020]/20 p-4">
        <p className="text-sm font-medium text-[#121212]">
          Payment pending verification. We&apos;ll notify you on WhatsApp once confirmed.
        </p>
      </div>
    )
  }

  if (status === 'ready_to_match') {
    return (
      <div className="border-l-4 border-[#1040C0] bg-[#1040C0]/5 p-4">
        <p className="text-sm font-medium text-[#121212]">
          Payment confirmed ✅ We&apos;re finding the best teacher for you.
        </p>
      </div>
    )
  }

  if (status === 'matched' || status === 'active') {
    return (
      <div className="border-2 border-[#121212] bg-white p-4">
        <p className="text-sm font-medium text-[#121212]">
          You&apos;ve been matched! See your dashboard for session details.
        </p>
        <Link
          href="/dashboard"
          className="mt-3 inline-flex items-center border-2 border-[#121212] bg-[#1040C0] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-[3px_3px_0px_0px_#121212] transition hover:-translate-y-0.5"
        >
          Go to Dashboard →
        </Link>
      </div>
    )
  }

  if (status === 'paused') {
    return (
      <div className="border-l-4 border-[#F0C020] bg-[#F0C020]/10 p-4">
        <p className="text-sm font-medium text-[#121212]">
          Your tutoring is currently paused. Contact us on WhatsApp to resume.
        </p>
      </div>
    )
  }

  if (status === 'ended') {
    return (
      <div className="border-l-4 border-[#D02020] bg-[#D02020]/5 p-4">
        <p className="text-sm font-medium text-[#D02020]">
          This tutoring engagement has ended.
        </p>
        <Link
          href="/dashboard/requests/new"
          className="mt-3 inline-flex items-center border-2 border-[#121212] bg-[#1040C0] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-[3px_3px_0px_0px_#121212] transition hover:-translate-y-0.5"
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
    <div className="min-h-screen bg-[#F0F0F0] px-4 py-10">
      <div className="mx-auto w-full max-w-lg space-y-6">
        {/* Confirmation banner */}
        <div className="border-4 border-[#121212] bg-white px-8 py-8">
          <div className="mb-1 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-[#121212]">
              Request received
            </h1>
          </div>
          <p className="text-sm text-[#121212]/60">
            We&apos;ve received your request for{' '}
            <span className="font-semibold text-[#121212]/80">
              {LEVEL_LABELS[request.level] ?? request.level} — {subjectName}
            </span>
            .
          </p>
        </div>

        {/* Next step banner */}
        <NextStepBanner status={status} requestId={request.id} preferredTier={request.preferred_package_tier} />

        {/* Request summary */}
        <div className="border-4 border-[#121212] bg-white px-8 py-8">
          <h2 className="mb-4 text-base font-semibold text-[#121212]">
            Request summary
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-[#121212]/60">Level</dt>
              <dd className="font-medium text-[#121212]">
                {LEVEL_LABELS[request.level] ?? request.level}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#121212]/60">Subject</dt>
              <dd className="font-medium text-[#121212]">{subjectName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#121212]/60">Exam board</dt>
              <dd className="font-medium text-[#121212]">
                {EXAM_BOARD_LABELS[request.exam_board] ?? request.exam_board}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#121212]/60">Timezone</dt>
              <dd className="font-medium text-[#121212]">{request.timezone}</dd>
            </div>
            {request.availability_windows && (
              <div className="flex flex-col gap-1">
                <dt className="text-[#121212]/60">Availability</dt>
                <dd className="whitespace-pre-line font-medium text-[#121212] text-xs">
                  {formatAvailabilityWindows(request.availability_windows)}
                </dd>
              </div>
            )}
            {request.goals && (
              <div className="flex flex-col gap-1">
                <dt className="text-[#121212]/60">Goals</dt>
                <dd className="font-medium text-[#121212]">{request.goals}</dd>
              </div>
            )}
            {request.preferred_start_date && (
              <div className="flex justify-between">
                <dt className="text-[#121212]/60">Preferred start</dt>
                <dd className="font-medium text-[#121212]">
                  {request.preferred_start_date}
                </dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-[#121212]/60">Status</dt>
              <dd>
                <StatusBadge status={status} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#121212]/60">Submitted</dt>
              <dd className="font-medium text-[#121212]">{submittedAt}</dd>
            </div>
          </dl>
        </div>

        {/* Cancel button — only for unpaid requests */}
        {(status === 'new' || status === 'payment_pending') && (
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="text-sm font-bold text-[#1040C0] underline-offset-4 hover:underline"
            >
              ← Back to dashboard
            </Link>
            <CancelRequestButton requestId={request.id} />
          </div>
        )}

        {status !== 'new' && status !== 'payment_pending' && (
          <div className="text-center">
            <Link
              href="/dashboard"
              className="text-sm font-bold text-[#1040C0] underline-offset-4 hover:underline"
            >
              ← Back to dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
