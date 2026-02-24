// E3 T3.2: role-aware dashboard redirect
// E4 T4.3: student dashboard with requests list
// E5 T5.4: package summary card per request
// Closes #21, #29, #36

export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { STATUS_LABELS, STATUS_COLOURS, RequestStatus, LEVEL_LABELS } from '@/lib/utils/request'
import { PackageSummary } from '@/components/dashboards/PackageSummary'

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
    .select('primary_role, whatsapp_number')
    .eq('user_id', user.id)
    .single()

  if (!profile?.whatsapp_number) {
    redirect('/auth/profile-setup')
  }

  const role = profile?.primary_role ?? 'student'

  if (role === 'admin') redirect('/admin')
  if (role === 'tutor') redirect('/tutor')

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
