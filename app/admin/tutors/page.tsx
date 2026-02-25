// E6 T6.4 S6.2: Admin tutor directory — list, filter, approve/revoke
// Closes #43 #39

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { ApproveButton, RevokeButton } from './TutorActions'
import { TutorFilters } from './TutorFilters'

type AvailWindow = { day: number; start: string; end: string }

type SubjectEntry = {
  subject_id: number
  level: string
  subjects: { name: string } | null
}

type TutorRow = {
  tutor_user_id: string
  approved: boolean
  bio: string | null
  timezone: string
  created_at: string
  user_profiles: { display_name: string; whatsapp_number: string | null } | null
  tutor_subjects: SubjectEntry[]
  tutor_availability: { windows: AvailWindow[] } | null
}

type FilterStatus = 'all' | 'pending' | 'approved'

function groupSubjects(subjects: SubjectEntry[]): string {
  if (!subjects || subjects.length === 0) return '—'
  const bySubject = new Map<string, string[]>()
  for (const s of subjects) {
    const name = s.subjects?.name ?? `Subject ${s.subject_id}`
    const lvl = s.level === 'o_levels' ? 'O' : 'A'
    const existing = bySubject.get(name) ?? []
    existing.push(lvl)
    bySubject.set(name, existing)
  }
  return Array.from(bySubject.entries())
    .map(([name, lvls]) => `${name} (${lvls.join(', ')})`)
    .join(' · ')
}

export default async function AdminTutorsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; subject?: string; level?: string }>
}) {
  const { status, subject, level } = await searchParams
  const activeStatus: FilterStatus =
    status === 'approved' ? 'approved' : status === 'pending' ? 'pending' : 'all'

  const admin = createAdminClient()

  const [{ data: tutorsData }, { data: subjectsData }] = await Promise.all([
    admin
      .from('tutor_profiles')
      .select(
        `tutor_user_id, approved, bio, timezone, created_at,
         user_profiles!tutor_user_id ( display_name, whatsapp_number ),
         tutor_subjects ( subject_id, level, subjects ( name ) ),
         tutor_availability ( windows )`
      )
      .order('created_at', { ascending: false }),
    admin.from('subjects').select('id, name').eq('active', true).order('sort_order'),
  ])

  let tutors = (tutorsData ?? []) as unknown as TutorRow[]
  const subjects = (subjectsData ?? []) as { id: number; name: string }[]

  // Apply filters
  if (activeStatus === 'approved') tutors = tutors.filter((t) => t.approved)
  if (activeStatus === 'pending') tutors = tutors.filter((t) => !t.approved)
  if (subject) {
    tutors = tutors.filter((t) =>
      t.tutor_subjects.some((s) => String(s.subject_id) === subject)
    )
  }
  if (level) {
    tutors = tutors.filter((t) => t.tutor_subjects.some((s) => s.level === level))
  }

  const statusLinks: { label: string; value: FilterStatus }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
  ]

  function buildStatusHref(newStatus: FilterStatus) {
    const qs = Object.entries({ status: newStatus, subject, level })
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&')
    return `/admin/tutors${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Tutors</h1>
        <p className="text-sm text-zinc-500">
          {tutors.length} tutor{tutors.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status filter (server-side links) */}
        <div className="flex gap-1">
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

        {/* Subject / level filters (client component — uses window.location) */}
        <TutorFilters
          subjects={subjects}
          activeSubject={subject}
          activeLevel={level}
          activeStatus={activeStatus}
        />
      </div>

      {/* Table */}
      {tutors.length === 0 ? (
        <div className="rounded-2xl bg-white px-8 py-12 text-center shadow-sm dark:bg-zinc-900">
          <p className="text-zinc-500">No tutors found matching the current filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-700">
            <thead className="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400">
                  Subjects &amp; Levels
                </th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400">
                  Timezone
                </th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400">
                  Applied
                </th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-600 dark:text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {tutors.map((tutor) => {
                const profile = tutor.user_profiles as {
                  display_name: string
                  whatsapp_number: string | null
                } | null
                const appliedDate = new Date(tutor.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })

                return (
                  <tr
                    key={tutor.tutor_user_id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                      {profile?.display_name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {groupSubjects(tutor.tutor_subjects)}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {tutor.timezone}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{appliedDate}</td>
                    <td className="px-4 py-3">
                      {tutor.approved ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          ✅ Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                          ⏳ Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {tutor.approved ? (
                          <RevokeButton tutorUserId={tutor.tutor_user_id} />
                        ) : (
                          <ApproveButton tutorUserId={tutor.tutor_user_id} />
                        )}
                        <Link
                          href={`/admin/tutors/${tutor.tutor_user_id}`}
                          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-600 dark:text-zinc-300"
                        >
                          View
                        </Link>
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
