// E9 T9.1: Shared "Next Session" card used on both the main dashboard and the sessions page.
// Extracts the duplicated card JSX into one place to keep both views in sync.

import Link from 'next/link'
import { formatSessionTime } from '@/lib/utils/session'
import { getLevelLabel } from '@/lib/utils/request'
import { RescheduleButton } from '@/components/dashboards/RescheduleButton'

export type NextSessionData = {
  scheduled_start_utc: string
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

export type NextSessionCardProps = {
  session: NextSessionData
  userTimezone: string
  /** Server-computed timestamp (ms) for the 24-hour late-reschedule check. */
  serverNowMs: number
  /** Optional href shown as a "View all sessions →" link at the bottom. */
  viewAllHref?: string
}

export function NextSessionCard({
  session,
  userTimezone,
  serverNowMs,
  viewAllHref,
}: NextSessionCardProps) {
  const match = session.matches
  const subjectName = (match?.requests?.subjects as { name: string } | null)?.name ?? '—'
  const levelLabel = getLevelLabel(match?.requests?.level)
  const tutorName =
    (match?.tutor_profiles?.user_profiles as { display_name: string } | null)?.display_name ?? '—'

  return (
    <div className="rounded-2xl bg-indigo-50 px-6 py-5 shadow-sm dark:bg-indigo-900/20">
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
        🎓 Your Next Session
      </p>
      <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-50">
        {formatSessionTime(session.scheduled_start_utc, userTimezone)}
      </p>
      <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
        {subjectName} — {levelLabel}
      </p>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">With: {tutorName}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {match?.meet_link && (
          <a
            href={match.meet_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            🔗 Join Google Meet
          </a>
        )}
        <RescheduleButton
          subject={subjectName}
          level={levelLabel}
          scheduledStartUtc={session.scheduled_start_utc}
          studentTimezone={userTimezone}
          serverNowMs={serverNowMs}
        />
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="mt-3 inline-block text-xs text-indigo-600 hover:underline dark:text-indigo-400"
        >
          View all sessions →
        </Link>
      )}
    </div>
  )
}
