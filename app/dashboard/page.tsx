// E3 T3.2: role-aware dashboard redirect
// E4 T4.3: student dashboard with requests list
// E5 T5.4: package summary card per request
// E9 T9.1: next session card (time + Meet link)
// E9 T9.3: package summary with renewal alert
// Closes #21, #29, #36, #61, #63

export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { STATUS_LABELS, STATUS_COLOURS, RequestStatus, LEVEL_LABELS } from '@/lib/utils/request'
import { PackageSummary } from '@/components/dashboards/PackageSummary'
import { NextSessionCard, type NextSessionData } from '@/components/dashboards/NextSessionCard'
import { OnboardingChecklist, type OnboardingStep } from '@/components/dashboards/OnboardingChecklist'
import { StatusBanner, getRequestStatusBanner } from '@/components/dashboards/StatusBanner'

function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${STATUS_COLOURS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/sign-in')

  // Check if profile setup is complete
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('primary_role, whatsapp_number, timezone')
    .eq('user_id', user.id)
    .single()

  if (!profile?.whatsapp_number) {
    redirect('/auth/profile-setup')
  }

  const role = profile?.primary_role ?? 'student'

  if (role === 'admin') redirect('/admin')
  if (role === 'tutor') redirect('/tutor')

  const userTimezone = profile?.timezone ?? 'UTC'

  // Fetch next session and requests in parallel (both independent)
  const [{ data: nextSessionData }, { data: requests }] = await Promise.all([
    supabase
      .from('sessions')
      .select(
        `id, scheduled_start_utc, scheduled_end_utc, status,
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
      .gt('scheduled_start_utc', new Date().toISOString())
      .in('status', ['scheduled', 'rescheduled'])
      .order('scheduled_start_utc', { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('requests')
      .select('id, level, subject_id, subjects(name), status, preferred_package_tier, created_at')
      .eq('created_by_user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  const nextSession = nextSessionData as NextSessionData | null

  // Fetch packages for these requests (for summary cards)
  type PackageRow = {
    id: string
    request_id: string
    tier_sessions: number
    sessions_used: number
    start_date: string
    end_date: string
    status: 'pending' | 'active' | 'expired'
  }
  let packagesByRequestId: Record<string, PackageRow> = {}
  if (requests && requests.length > 0) {
    const requestIds = requests.map((r) => r.id)
    const { data: packages } = await supabase
      .from('packages')
      .select('id, request_id, tier_sessions, sessions_used, start_date, end_date, status')
      .in('request_id', requestIds)
      .in('status', ['pending', 'active', 'expired'])
      .order('created_at', { ascending: false })

    if (packages) {
      packagesByRequestId = packages.reduce<Record<string, PackageRow>>((acc, pkg) => {
        // Keep only the first (most recent) package per request
        if (!acc[pkg.request_id]) {
          acc[pkg.request_id] = pkg as PackageRow
        }
        return acc
      }, {})
    }
  }

  // Check for onboarding progress
  const hasRequests = requests && requests.length > 0
  const hasPayment = hasRequests && Object.values(packagesByRequestId).some(
    (p) => p.status === 'active'
  )
  const { data: matchCheck } = hasRequests
    ? await supabase.from('matches').select('id').limit(1).maybeSingle()
    : { data: null }
  const hasMatch = !!matchCheck
  const { data: sessionCheck } = hasMatch
    ? await supabase.from('sessions').select('id').eq('status', 'done').limit(1).maybeSingle()
    : { data: null }
  const hasCompletedSession = !!sessionCheck

  const onboardingSteps: OnboardingStep[] = [
    {
      label: 'Complete your profile',
      completed: !!profile?.whatsapp_number,
      href: '/auth/profile-setup',
      ctaLabel: 'Set up profile',
    },
    {
      label: 'Submit a tutoring request',
      completed: !!hasRequests,
      href: '/dashboard/requests/new',
      ctaLabel: 'Create request',
    },
    {
      label: 'Make your payment',
      completed: !!hasPayment,
    },
    {
      label: 'Get matched with a tutor',
      completed: hasMatch,
    },
    {
      label: 'Complete your first session',
      completed: hasCompletedSession,
    },
  ]

  // Get status banner for the most recent active request
  const primaryRequest = requests?.[0]
  const statusBanner = primaryRequest ? getRequestStatusBanner(primaryRequest.status) : null

  // Compute server-side "now" timestamp for renewal alert (avoids impure Date.now() in render)
  const serverNowMs = new Date().getTime()

  return (
    <div className="min-h-screen bg-[#F0F0F0] px-4 py-10">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        {/* Status banner */}
        {statusBanner && (
          <StatusBanner message={statusBanner.message} variant={statusBanner.variant} />
        )}

        {/* Onboarding checklist */}
        <OnboardingChecklist steps={onboardingSteps} />

        {/* Header */}
        <div className="flex items-start justify-between border-b-4 border-[#121212] pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#121212]/50">Student</p>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-[#121212] leading-tight">
              My Requests
            </h1>
          </div>
          <Link
            href="/dashboard/requests/new"
            className="inline-flex min-h-[44px] items-center border-2 border-[#121212] bg-[#D02020] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-[4px_4px_0px_0px_#121212] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#121212]"
          >
            + New Request
          </Link>
        </div>

        {/* Next Session Card (T9.1) */}
        {nextSession ? (
          <NextSessionCard
            session={nextSession}
            userTimezone={userTimezone}
            serverNowMs={serverNowMs}
            viewAllHref="/dashboard/sessions"
          />
        ) : (
          <div className="border-4 border-[#121212] bg-white p-6 shadow-[6px_6px_0px_0px_#121212]">
            <p className="text-xs font-bold uppercase tracking-widest text-[#1040C0]">
              Your Next Session
            </p>
            <p className="mt-2 text-sm text-[#121212]/60">
              Sessions will appear here once your schedule is confirmed.
            </p>
            <Link
              href="/dashboard/sessions"
              className="mt-3 inline-flex min-h-[40px] items-center border-2 border-[#121212] bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#121212] shadow-[3px_3px_0px_0px_#121212] transition hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              View All Sessions
            </Link>
          </div>
        )}

        {/* Requests list */}
        {!requests || requests.length === 0 ? (
          <div className="border-4 border-[#121212] bg-white px-8 py-12 text-center shadow-[8px_8px_0px_0px_#121212]">
            <div aria-hidden="true" className="mx-auto mb-4 h-12 w-12 border-4 border-[#121212] bg-[#F0C020]" />
            <p className="font-bold text-[#121212]">No requests yet.</p>
            <p className="mt-1 text-sm text-[#121212]/60">Submit a tutoring request to get started.</p>
            <Link
              href="/dashboard/requests/new"
              className="mt-6 inline-flex min-h-[44px] items-center border-2 border-[#121212] bg-[#D02020] px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-[4px_4px_0px_0px_#121212] transition hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              Submit First Request
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const subj = req.subjects
              const subjectName =
                (Array.isArray(subj) ? subj[0]?.name : (subj as { name: string } | null)?.name) ??
                `Subject #${req.subject_id}`
              const status = req.status as RequestStatus
              const date = new Date(req.created_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
              const pkg = packagesByRequestId[req.id]
              return (
                <div key={req.id} className="space-y-2">
                  <Link
                    href={`/dashboard/requests/${req.id}`}
                    className="flex items-center justify-between border-4 border-[#121212] bg-white px-6 py-4 shadow-[4px_4px_0px_0px_#121212] transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#121212]"
                  >
                    <div>
                      <p className="font-bold text-[#121212]">{subjectName}</p>
                      <p className="mt-0.5 text-xs text-[#121212]/50">
                        {LEVEL_LABELS[req.level] ?? req.level} · Submitted {date}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={status} />
                      <span className="text-[#121212]/40 text-sm font-bold">›</span>
                    </div>
                  </Link>

                  {/* Package summary card */}
                  {pkg ? (
                    <PackageSummary
                      tier_sessions={pkg.tier_sessions}
                      sessions_used={pkg.sessions_used}
                      start_date={pkg.start_date}
                      end_date={pkg.end_date}
                      status={pkg.status}
                      packageId={pkg.id}
                      daysUntilEnd={Math.max(
                        0,
                        Math.ceil(
                          (new Date(pkg.end_date).getTime() - serverNowMs) / (1000 * 60 * 60 * 24),
                        ),
                      )}
                    />
                  ) : status === 'new' ? (
                    <div className="border-l-4 border-[#1040C0] bg-[#1040C0]/5 px-4 py-3">
                      <p className="text-sm font-medium text-[#1040C0]">
                        {req.preferred_package_tier
                          ? `Confirm your ${req.preferred_package_tier}-session package and pay to begin matching.`
                          : 'Select a package to begin the matching process.'}
                      </p>
                      <Link
                        href={
                          req.preferred_package_tier
                            ? `/dashboard/packages/new?requestId=${req.id}&tier=${req.preferred_package_tier}`
                            : `/dashboard/packages/new?requestId=${req.id}`
                        }
                        className="mt-2 inline-flex min-h-[36px] items-center border-2 border-[#1040C0] bg-[#1040C0] px-3 py-1 text-xs font-bold uppercase tracking-widest text-white shadow-[3px_3px_0px_0px_#121212] transition hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                      >
                        {req.preferred_package_tier ? 'Continue to Payment' : 'Select Package'}
                      </Link>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
