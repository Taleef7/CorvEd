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
import { formatSessionTime } from '@/lib/utils/session'
import { PackageSummary } from '@/components/dashboards/PackageSummary'
import { RescheduleButton } from '@/components/dashboards/RescheduleButton'

function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOURS[status]}`}
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

  // Fetch next upcoming session for this student
  type NextSessionRow = {
    id: string
    scheduled_start_utc: string
    scheduled_end_utc: string
    status: string
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
  const { data: nextSessionData } = await supabase
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
    .eq('status', 'scheduled')
    .order('scheduled_start_utc', { ascending: true })
    .limit(1)
    .maybeSingle()

  const nextSession = nextSessionData as NextSessionRow | null

  // Fetch student's requests
  const { data: requests } = await supabase
    .from('requests')
    .select('id, level, subject_id, subjects(name), status, created_at')
    .eq('created_by_user_id', user.id)
    .order('created_at', { ascending: false })

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

  // Compute server-side "now" timestamp for renewal alert (avoids impure Date.now() in render)
  const serverNowMs = new Date().getTime()

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            My tutoring requests
          </h1>
          <Link
            href="/dashboard/requests/new"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            + New request
          </Link>
        </div>

        {/* Next Session Card (T9.1) */}
        {nextSession ? (
          <div className="rounded-2xl bg-indigo-50 px-6 py-5 shadow-sm dark:bg-indigo-900/20">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
              🎓 Your Next Session
            </p>
            <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {formatSessionTime(nextSession.scheduled_start_utc, userTimezone)}
            </p>
            <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
              {(nextSession.matches?.requests?.subjects as { name: string } | null)?.name ?? '—'}
              {nextSession.matches?.requests?.level
                ? ` — ${LEVEL_LABELS[nextSession.matches.requests.level] ?? nextSession.matches.requests.level}`
                : ''}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              With:{' '}
              {(
                nextSession.matches?.tutor_profiles?.user_profiles as
                  | { display_name: string }
                  | null
              )?.display_name ?? '—'}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {nextSession.matches?.meet_link && (
                <a
                  href={nextSession.matches.meet_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  🔗 Join Google Meet
                </a>
              )}
              <RescheduleButton
                subject={
                  (nextSession.matches?.requests?.subjects as { name: string } | null)?.name ?? '—'
                }
                level={
                  LEVEL_LABELS[nextSession.matches?.requests?.level ?? ''] ??
                  nextSession.matches?.requests?.level ??
                  '—'
                }
                scheduledStartUtc={nextSession.scheduled_start_utc}
                studentTimezone={userTimezone}
              />
            </div>
            <Link
              href="/dashboard/sessions"
              className="mt-3 inline-block text-xs text-indigo-600 hover:underline dark:text-indigo-400"
            >
              View all sessions →
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl bg-white px-6 py-5 shadow-sm dark:bg-zinc-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              🎓 Your Next Session
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Your sessions will appear here once your schedule is confirmed.
            </p>
            <Link
              href="/dashboard/sessions"
              className="mt-2 inline-block text-xs text-indigo-600 hover:underline dark:text-indigo-400"
            >
              View sessions →
            </Link>
          </div>
        )}

        {/* Requests list */}
        {!requests || requests.length === 0 ? (
          <div className="rounded-2xl bg-white px-8 py-12 text-center shadow-md dark:bg-zinc-900">
            <p className="text-zinc-500">You haven&apos;t submitted any tutoring requests yet.</p>
            <Link
              href="/dashboard/requests/new"
              className="mt-4 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Submit your first request
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
                    className="flex items-center justify-between rounded-xl bg-white px-6 py-4 shadow-sm transition hover:shadow-md dark:bg-zinc-900"
                  >
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                        {subjectName}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {LEVEL_LABELS[req.level] ?? req.level} · Submitted {date}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={status} />
                      <span className="text-zinc-400">→</span>
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
                      daysUntilEnd={Math.ceil(
                        (new Date(pkg.end_date).getTime() - serverNowMs) / (1000 * 60 * 60 * 24),
                      )}
                    />
                  ) : status === 'new' ? (
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 dark:border-indigo-900 dark:bg-indigo-900/20">
                      <p className="text-sm text-indigo-700 dark:text-indigo-300">
                        Select a package to begin the matching process.
                      </p>
                      <Link
                        href={`/dashboard/packages/new?requestId=${req.id}`}
                        className="mt-2 inline-flex items-center rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                      >
                        Select Package →
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
