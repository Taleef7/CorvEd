// E7 T7.1: Admin requests inbox — filterable list of all requests
// Closes #47

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { STATUS_COLOURS, STATUS_LABELS, LEVEL_LABELS } from '@/lib/utils/request'
import { RequestFilters } from './RequestFilters'

const STATUS_PRIORITY: Record<string, number> = {
  ready_to_match: 0,
  new: 1,
  payment_pending: 2,
  matched: 3,
  active: 4,
  paused: 5,
  ended: 6,
}

const ALL_STATUSES = [
  'new',
  'payment_pending',
  'ready_to_match',
  'matched',
  'active',
  'paused',
  'ended',
]

type PackageRow = { tier_sessions: number; status: string }

type RequestRow = {
  id: string
  status: string
  level: string
  subject_id: number
  created_at: string
  subjects: { name: string } | null
  user_profiles: { display_name: string; whatsapp_number: string | null } | null
  packages: PackageRow[]
}

type FilterStatus = 'all' | (typeof ALL_STATUSES)[number]

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; subject?: string; level?: string }>
}) {
  const { status, subject, level } = await searchParams
  const activeStatus: FilterStatus = ALL_STATUSES.includes(status ?? '') ? status! : 'all'

  const admin = createAdminClient()

  const [{ data: requestsData }, { data: subjectsData }] = await Promise.all([
    admin
      .from('requests')
      .select(
        `id, status, level, subject_id, created_at,
         subjects ( name ),
         user_profiles!requests_created_by_user_id_fkey ( display_name, whatsapp_number ),
         packages ( tier_sessions, status )`
      ),
    admin.from('subjects').select('id, name').eq('active', true).order('sort_order'),
  ])

  let requests = (requestsData ?? []) as unknown as RequestRow[]
  const subjects = (subjectsData ?? []) as { id: number; name: string }[]

  // Apply filters
  if (activeStatus !== 'all') {
    requests = requests.filter((r) => r.status === activeStatus)
  }
  if (subject) {
    requests = requests.filter((r) => String(r.subject_id) === subject)
  }
  if (level) {
    requests = requests.filter((r) => r.level === level)
  }

  // Sort: ready_to_match first, then by created_at within each status
  requests.sort((a, b) => {
    const pa = STATUS_PRIORITY[a.status] ?? 99
    const pb = STATUS_PRIORITY[b.status] ?? 99
    if (pa !== pb) return pa - pb
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })

  const statusLinks: { label: string; value: FilterStatus }[] = [
    { label: 'All', value: 'all' },
    { label: 'New', value: 'new' },
    { label: 'Payment Pending', value: 'payment_pending' },
    { label: 'Ready to Match', value: 'ready_to_match' },
    { label: 'Matched', value: 'matched' },
    { label: 'Active', value: 'active' },
    { label: 'Paused', value: 'paused' },
    { label: 'Ended', value: 'ended' },
  ]

  function buildStatusHref(newStatus: FilterStatus) {
    const qs = Object.entries({ status: newStatus !== 'all' ? newStatus : undefined, subject, level })
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&')
    return `/admin/requests${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Requests</h1>
        <p className="text-sm text-zinc-500">
          {requests.length} request{requests.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-1.5">
        {statusLinks.map(({ label, value }) => (
          <Link
            key={value}
            href={buildStatusHref(value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              activeStatus === value
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Subject / level client filters */}
      <RequestFilters
        subjects={subjects}
        activeStatus={activeStatus}
        activeSubject={subject}
        activeLevel={level}
      />

      {/* Table */}
      {requests.length === 0 ? (
        <div className="rounded-2xl bg-white px-8 py-12 text-center shadow-sm dark:bg-zinc-900">
          <p className="text-zinc-500">No requests match the current filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-700">
            <thead className="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400">
                  Student
                </th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400">
                  Level
                </th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400">
                  Subject
                </th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400">
                  Package
                </th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400">
                  Date
                </th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {requests.map((req) => {
                const profile = req.user_profiles
                const subjectName = (req.subjects as { name: string } | null)?.name ?? '—'
                const levelLabel = LEVEL_LABELS[req.level] ?? req.level
                const pkgArray = (req.packages ?? []) as PackageRow[]
                const activePkg =
                  pkgArray.find((p) => p.status === 'active') ?? pkgArray[0] ?? null
                const requestStatus = req.status as keyof typeof STATUS_COLOURS
                const dateLabel = new Date(req.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })

                return (
                  <tr key={req.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                      {profile?.display_name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{levelLabel}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{subjectName}</td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {activePkg ? `${activePkg.tier_sessions} sessions` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOURS[requestStatus] ?? 'bg-zinc-100 text-zinc-700'}`}
                      >
                        {STATUS_LABELS[requestStatus] ?? req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{dateLabel}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {req.status === 'ready_to_match' ? (
                          <Link
                            href={`/admin/requests/${req.id}`}
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                          >
                            Match →
                          </Link>
                        ) : (
                          <Link
                            href={`/admin/requests/${req.id}`}
                            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-600 dark:text-zinc-300"
                          >
                            View
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
