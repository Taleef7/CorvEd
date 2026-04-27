// E7 T7.1: Admin requests inbox — filterable list of all requests
// Closes #47

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { STATUS_COLOURS, STATUS_LABELS, LEVEL_LABELS } from '@/lib/utils/request'
import { RequestFilters } from './RequestFilters'
import { AdminPagination, PAGE_SIZE } from '@/components/AdminPagination'
import { normalizeAdminRequestSearch } from '@/lib/admin/request-search'
import type { Database } from '@/lib/supabase/database.types'

type RequestStatusEnum = Database['public']['Enums']['request_status_enum']
type LevelEnum = Database['public']['Enums']['level_enum']

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
  for_student_name: string | null
  requester_role: string
  subjects: { name: string } | null
  user_profiles: { display_name: string; whatsapp_number: string | null } | null
  packages: PackageRow[]
}

type FilterStatus = 'all' | (typeof ALL_STATUSES)[number]

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; subject?: string; level?: string; q?: string; page?: string }>
}) {
  const { status, subject, level, q, page } = await searchParams
  const activeStatus: FilterStatus = ALL_STATUSES.includes(status ?? '') ? status! : 'all'
  const activeSearch = typeof q === 'string' ? q.trim() : ''
  const normalizedSearch = normalizeAdminRequestSearch(activeSearch)
  const currentPage = Math.max(1, parseInt(page ?? '1', 10) || 1)
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const admin = createAdminClient()

  // Build filtered query with server-side filtering
  let countQuery = admin.from('requests').select('id', { count: 'exact', head: true })
  let dataQuery = admin
    .from('requests')
    .select(
      `id, status, level, subject_id, created_at, for_student_name, requester_role,
       subjects ( name ),
       user_profiles!requests_created_by_user_id_fkey ( display_name, whatsapp_number ),
       packages ( tier_sessions, status )`
    )
    .order('created_at', { ascending: false })

  // Apply filters at DB level
  if (activeStatus !== 'all') {
    countQuery = countQuery.eq('status', activeStatus as RequestStatusEnum)
    dataQuery = dataQuery.eq('status', activeStatus as RequestStatusEnum)
  }
  if (subject) {
    countQuery = countQuery.eq('subject_id', Number(subject))
    dataQuery = dataQuery.eq('subject_id', Number(subject))
  }
  if (level) {
    countQuery = countQuery.eq('level', level as LevelEnum)
    dataQuery = dataQuery.eq('level', level as LevelEnum)
  }

  const subjectsQuery = admin.from('subjects').select('id, name').eq('active', true).order('sort_order')

  // Apply text search at DB level
  // For each token, find matching user IDs (display_name) and subject IDs (name),
  // then OR-filter across for_student_name, created_by_user_id, and subject_id.
  if (normalizedSearch) {
    const rawTokens = normalizedSearch.split(' ').filter(Boolean)
    // Sanitize: remove PostgREST or()-syntax metacharacters, then escape ILIKE wildcards
    const safeTokens = rawTokens
      .map((t) => t.replace(/[(),"]/g, '').replace(/[%_]/g, '\\$&'))
      .filter(Boolean)

    if (safeTokens.length > 0) {
      // Run all token lookups in parallel (2 queries per token, all concurrent)
      const lookups = await Promise.all(
        safeTokens.flatMap((token) => [
          admin.from('user_profiles').select('user_id').ilike('display_name', `%${token}%`),
          admin.from('subjects').select('id').ilike('name', `%${token}%`),
        ]),
      )

      // Apply per-token AND filters — each token must match at least one field
      for (let i = 0; i < safeTokens.length; i++) {
        const token = safeTokens[i]
        const { data: matchingUsers } = lookups[i * 2] as { data: { user_id: string }[] | null }
        const { data: matchingSubjects } = lookups[i * 2 + 1] as { data: { id: number }[] | null }

        const userIds = matchingUsers?.map((u) => u.user_id) ?? []
        const subjectIds = matchingSubjects?.map((s) => s.id) ?? []

        const orParts: string[] = [`for_student_name.ilike.%${token}%`]
        if (userIds.length > 0) orParts.push(`created_by_user_id.in.(${userIds.join(',')})`)
        if (subjectIds.length > 0) orParts.push(`subject_id.in.(${subjectIds.join(',')})`)

        countQuery = countQuery.or(orParts.join(','))
        dataQuery = dataQuery.or(orParts.join(','))
      }
    }
  }

  dataQuery = dataQuery.range(from, to)

  let requests: RequestRow[] = []
  let totalCount = 0
  let subjects: { id: number; name: string }[] = []

  const [{ count }, { data: requestsData }, { data: subjectsData }] = await Promise.all([
    countQuery,
    dataQuery,
    subjectsQuery,
  ])
  totalCount = count ?? 0
  requests = (requestsData ?? []) as unknown as RequestRow[]
  subjects = (subjectsData ?? []) as { id: number; name: string }[]

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
    const qs = Object.entries({ status: newStatus !== 'all' ? newStatus : undefined, subject, level, q: activeSearch || undefined })
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&')
    return `/admin/requests${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-[#121212]">Requests</h1>
        <p className="text-sm text-[#121212]/60">
          {totalCount} request{totalCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-1.5">
        {statusLinks.map(({ label, value }) => (
          <Link
            key={value}
            href={buildStatusHref(value)}
            className={` px-3 py-1.5 text-sm font-medium transition ${
              activeStatus === value
                ? 'bg-[#1040C0] text-white'
                : 'bg-white text-[#121212]/70 hover:bg-[#E0E0E0] '
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
        activeSearch={activeSearch}
      />

      {/* Table */}
      {requests.length === 0 ? (
        <div className="border-4 border-[#121212] bg-white px-8 py-12 text-center">
          <p className="text-[#121212]/60">No requests match the current filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border-4 border-[#121212] bg-white">
          <table className="min-w-full divide-y divide-[#D0D0D0] text-sm">
            <thead className="bg-[#121212]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-white">
                  Student
                </th>
                <th className="px-4 py-3 text-left font-semibold text-white">
                  Level
                </th>
                <th className="px-4 py-3 text-left font-semibold text-white">
                  Subject
                </th>
                <th className="px-4 py-3 text-left font-semibold text-white">
                  Package
                </th>
                <th className="px-4 py-3 text-left font-semibold text-white">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-semibold text-white">
                  Date
                </th>
                <th className="px-4 py-3 text-left font-semibold text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
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

                const studentName = req.for_student_name ?? profile?.display_name ?? '—'

                return (
                  <tr key={req.id} className="hover:bg-[#F0F0F0]/50">
                    <td className="px-4 py-3 font-medium text-[#121212]">
                      {studentName}
                      {req.requester_role === 'parent' && profile?.display_name && (
                        <span className="ml-1 text-xs text-[#121212]/50">
                          (Parent: {profile.display_name})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#121212]/70 ">{levelLabel}</td>
                    <td className="px-4 py-3 text-[#121212]/70 ">{subjectName}</td>
                    <td className="px-4 py-3 text-[#121212]/60 ">
                      {activePkg ? `${activePkg.tier_sessions} sessions` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider border-2 ${STATUS_COLOURS[requestStatus] ?? 'bg-[#E0E0E0] text-[#121212]/80'}`}
                      >
                        {STATUS_LABELS[requestStatus] ?? req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#121212]/60 ">{dateLabel}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {req.status === 'ready_to_match' ? (
                          <Link
                            href={`/admin/requests/${req.id}`}
                            className="inline-flex min-h-[36px] items-center border-2 border-[#121212] bg-[#1040C0] px-3 py-1 text-xs font-bold uppercase tracking-widest text-white shadow-[3px_3px_0px_0px_#121212] transition hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                          >
                            Match →
                          </Link>
                        ) : (
                          <Link
                            href={`/admin/requests/${req.id}`}
                            className=" border border-[#B0B0B0] px-3 py-1.5 text-xs font-medium text-[#121212]/80 transition hover:border-[#1040C0] hover:text-[#1040C0] "
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

      <AdminPagination
        currentPage={currentPage}
        totalCount={totalCount ?? 0}
        baseHref={buildStatusHref(activeStatus)}
      />
    </div>
  )
}
