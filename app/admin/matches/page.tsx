// E7 T7.1 T7.4: Admin matches index — list all matches with status and key details
// Closes #47 #50

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { LEVEL_LABELS } from '@/lib/utils/request'
import { AdminPagination, PAGE_SIZE } from '@/components/AdminPagination'

const MATCH_STATUS_COLOURS: Record<string, string> = {
  matched: 'border-2 border-[#1040C0] bg-[#1040C0] text-white',
  active: 'border-2 border-[#121212] bg-[#121212] text-white',
  paused: 'border-2 border-[#F0C020] bg-[#F0C020] text-[#121212]',
  ended: 'border-2 border-[#D02020] bg-[#D02020]/10 text-[#D02020]',
}

type MatchRow = {
  id: string
  status: string
  meet_link: string | null
  assigned_at: string
  tutor_user_id: string
  tutor_profiles: {
    user_profiles: { display_name: string } | null
  } | null
  requests: {
    id: string
    level: string
    subjects: { name: string } | null
    user_profiles: { display_name: string } | null
  } | null
}

export default async function AdminMatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const currentPage = Math.max(1, parseInt(page ?? '1', 10) || 1)
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const admin = createAdminClient()

  const { data: matchesData, count: totalCount } = await admin
    .from('matches')
    .select(
      `id, status, meet_link, assigned_at, tutor_user_id,
       tutor_profiles!matches_tutor_user_id_fkey (
         user_profiles!tutor_user_id ( display_name )
       ),
       requests!matches_request_id_fkey (
         id, level,
         subjects ( name ),
         user_profiles!requests_created_by_user_id_fkey ( display_name )
       )`,
      { count: 'exact' }
    )
    .order('assigned_at', { ascending: false })
    .range(from, to)

  const matches = (matchesData ?? []) as unknown as MatchRow[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-[#121212]">Matches</h1>
        <p className="text-sm text-[#121212]/60">
          {totalCount ?? matches.length} match{(totalCount ?? matches.length) !== 1 ? 'es' : ''}
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="border-4 border-[#121212] bg-white px-8 py-12 text-center">
          <p className="text-[#121212]/60">No matches yet.</p>
          <p className="mt-1 text-sm text-[#121212]/40">
            Assign tutors to{' '}
            <Link
              href="/admin/requests?status=ready_to_match"
              className="font-bold text-[#1040C0] underline-offset-4 hover:underline"
            >
              ready-to-match requests
            </Link>{' '}
            to create matches.
          </p>
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
                  Subject / Level
                </th>
                <th className="px-4 py-3 text-left font-semibold text-white">
                  Tutor
                </th>
                <th className="px-4 py-3 text-left font-semibold text-white">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-semibold text-white">
                  Meet Link
                </th>
                <th className="px-4 py-3 text-left font-semibold text-white">
                  Assigned
                </th>
                <th className="px-4 py-3 text-left font-semibold text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {matches.map((match) => {
                const req = match.requests
                const subjectName = (req?.subjects as { name: string } | null)?.name ?? '—'
                const levelLabel = req ? (LEVEL_LABELS[req.level] ?? req.level) : '—'
                const studentName =
                  (req?.user_profiles as { display_name: string } | null)?.display_name ?? '—'
                const tutorName =
                  (match.tutor_profiles?.user_profiles as { display_name: string } | null)
                    ?.display_name ?? '—'
                const assignedDate = new Date(match.assigned_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })

                return (
                  <tr key={match.id} className="hover:bg-[#F0F0F0]/50">
                    <td className="px-4 py-3 font-medium text-[#121212]">
                      {studentName}
                    </td>
                    <td className="px-4 py-3 text-[#121212]/70 ">
                      {subjectName} · {levelLabel}
                    </td>
                    <td className="px-4 py-3 text-[#121212]/70 ">{tutorName}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider border-2 ${MATCH_STATUS_COLOURS[match.status] ?? 'bg-[#E0E0E0] text-[#121212]/80'}`}
                      >
                        {match.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#121212]/60 ">
                      {match.meet_link ? (
                        <a
                          href={match.meet_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-[#1040C0] underline-offset-4 hover:underline"
                        >
                          Link ↗
                        </a>
                      ) : (
                        <span className="italic text-[#121212]/40">Not set</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#121212]/60 ">{assignedDate}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/matches/${match.id}`}
                        className=" border border-[#B0B0B0] px-3 py-1.5 text-xs font-medium text-[#121212]/80 transition hover:border-[#1040C0] hover:text-[#1040C0] "
                      >
                        Manage →
                      </Link>
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
        baseHref="/admin/matches"
      />
    </div>
  )
}

