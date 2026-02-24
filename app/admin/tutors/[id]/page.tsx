// E6 T6.3 T6.4 S6.2: Admin tutor detail page — full profile view with approve/revoke
// Closes #42 #43 #39

export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { ApproveButton, RevokeButton } from '../TutorActions'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type AvailWindow = { day: number; start: string; end: string }

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const period = h < 12 ? 'AM' : 'PM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`
}

export default async function AdminTutorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: tutorData } = await admin
    .from('tutor_profiles')
    .select(
      `tutor_user_id, approved, bio, timezone, created_at, updated_at,
       user_profiles!tutor_user_id ( display_name, whatsapp_number ),
       tutor_subjects ( subject_id, level, subjects ( name ) ),
       tutor_availability ( windows )`
    )
    .eq('tutor_user_id', id)
    .maybeSingle()

  if (!tutorData) notFound()

  const tutor = tutorData as unknown as {
    tutor_user_id: string
    approved: boolean
    bio: string | null
    timezone: string
    created_at: string
    updated_at: string
    user_profiles: { display_name: string; whatsapp_number: string | null } | null
    tutor_subjects: { subject_id: number; level: string; subjects: { name: string } | null }[]
    tutor_availability: { windows: AvailWindow[] } | null
  }

  const profile = tutor.user_profiles
  const windows = tutor.tutor_availability?.windows ?? []

  // Group subjects by name
  const subjectMap = new Map<string, string[]>()
  for (const s of tutor.tutor_subjects) {
    const name = s.subjects?.name ?? `Subject ${s.subject_id}`
    const lvl = s.level === 'o_levels' ? 'O Levels' : 'A Levels'
    const existing = subjectMap.get(name) ?? []
    existing.push(lvl)
    subjectMap.set(name, existing)
  }

  const appliedDate = new Date(tutor.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Back link */}
      <Link
        href="/admin/tutors"
        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline dark:text-indigo-400"
      >
        ← Back to Tutors
      </Link>

      <div className="rounded-2xl bg-white px-6 py-8 shadow-sm dark:bg-zinc-900">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {profile?.display_name ?? '—'}
            </h1>
            <p className="mt-0.5 text-sm text-zinc-500">Applied {appliedDate}</p>
          </div>
          <div className="flex items-center gap-3">
            {tutor.approved ? (
              <>
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  ✅ Approved
                </span>
                <RevokeButton tutorUserId={tutor.tutor_user_id} />
              </>
            ) : (
              <>
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                  ⏳ Pending approval
                </span>
                <ApproveButton tutorUserId={tutor.tutor_user_id} />
              </>
            )}
          </div>
        </div>

        <hr className="my-6 border-zinc-200 dark:border-zinc-700" />

        {/* Contact */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Contact
          </h2>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            <span className="font-medium">WhatsApp:</span>{' '}
            {profile?.whatsapp_number ?? (
              <span className="italic text-zinc-400">not provided</span>
            )}
          </p>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            <span className="font-medium">Timezone:</span> {tutor.timezone}
          </p>
        </section>

        <hr className="my-6 border-zinc-200 dark:border-zinc-700" />

        {/* Bio */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Bio</h2>
          {tutor.bio ? (
            <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
              {tutor.bio}
            </p>
          ) : (
            <p className="italic text-sm text-zinc-400">No bio provided.</p>
          )}
        </section>

        <hr className="my-6 border-zinc-200 dark:border-zinc-700" />

        {/* Subjects */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Subjects &amp; Levels
          </h2>
          {subjectMap.size === 0 ? (
            <p className="italic text-sm text-zinc-400">No subjects selected.</p>
          ) : (
            <ul className="space-y-1">
              {Array.from(subjectMap.entries()).map(([name, levels]) => (
                <li key={name} className="text-sm text-zinc-700 dark:text-zinc-300">
                  <span className="font-medium">{name}</span> — {levels.join(', ')}
                </li>
              ))}
            </ul>
          )}
        </section>

        <hr className="my-6 border-zinc-200 dark:border-zinc-700" />

        {/* Availability */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Availability
          </h2>
          {windows.length === 0 ? (
            <p className="italic text-sm text-zinc-400">No availability set.</p>
          ) : (
            <ul className="space-y-1">
              {windows
                .sort((a, b) => a.day - b.day || a.start.localeCompare(b.start))
                .map((w, i) => (
                  <li key={i} className="text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="font-medium">{DAY_NAMES[w.day]}:</span>{' '}
                    {formatTime(w.start)} – {formatTime(w.end)}
                  </li>
                ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
