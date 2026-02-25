// E7 T7.1 T7.4: Admin matches index — list all matches with status and key details
// Closes #47 #50

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { LEVEL_LABELS } from '@/lib/utils/request'

const MATCH_STATUS_COLOURS: Record<string, string> = {
  matched: 'bg-purple-100 text-purple-800',
  active: 'bg-green-100 text-green-800',
  paused: 'bg-orange-100 text-orange-800',
  ended: 'bg-red-100 text-red-800',
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

export default async function AdminMatchesPage() {
  const admin = createAdminClient()

  const { data: matchesData } = await admin
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
       )`
    )
    .order('assigned_at', { ascending: false })

  const matches = (matchesData ?? []) as unknown as MatchRow[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Matches</h1>
        <p className="text-sm text-zinc-500">
          {matches.length} match{matches.length !== 1 ? 'es' : ''}
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="rounded-2xl bg-white px-8 py-12 text-center shadow-sm dark:bg-zinc-900">
          <p className="text-zinc-500">No matches yet.</p>
          <p className="mt-1 text-sm text-zinc-400">
            Assign tutors to{' '}
            <Link
              href="/admin/requests?status=ready_to_match"
              className="text-indigo-600 hover:underline dark:text-indigo-400"
            >
              ready-to-match requests
            </Link>{' '}
            to create matches.
          </p>
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
                  Subject / Level
                </th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400">
                  Tutor
                </th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400">
                  Meet Link
                </th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400">
                  Assigned
                </th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
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
                  <tr key={match.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                      {studentName}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {subjectName} · {levelLabel}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{tutorName}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${MATCH_STATUS_COLOURS[match.status] ?? 'bg-zinc-100 text-zinc-700'}`}
                      >
                        {match.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {match.meet_link ? (
                        <a
                          href={match.meet_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          Link ↗
                        </a>
                      ) : (
                        <span className="italic text-zinc-400">Not set</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{assignedDate}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/matches/${match.id}`}
                        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-600 dark:text-zinc-300"
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
    </div>
  )
}

