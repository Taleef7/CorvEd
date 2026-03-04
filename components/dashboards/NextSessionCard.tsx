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
    <div className="border-4 border-[#121212] bg-[#1040C0] shadow-[6px_6px_0px_0px_#121212]">
      <div className="px-6 py-5">
        <p className="text-xs font-bold uppercase tracking-widest text-white/70">
          Your Next Session
        </p>
        <p className="mt-1 text-xl font-black text-white">
          {formatSessionTime(session.scheduled_start_utc, userTimezone)}
        </p>
        <p className="mt-0.5 text-sm font-medium text-white/80">
          {subjectName} — {levelLabel}
        </p>
        <p className="text-sm text-white/60">Tutor: {tutorName}</p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {match?.meet_link && (
            <a
              href={match.meet_link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Join Google Meet session"
              className="inline-flex min-h-[44px] items-center border-2 border-white bg-white px-5 py-2 text-xs font-bold uppercase tracking-widest text-[#1040C0] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] transition hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            >
              Join Google Meet
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
      </div>

      {viewAllHref && (
        <div className="border-t-2 border-white/20 px-6 py-3">
          <Link
            href={viewAllHref}
            className="text-xs font-bold uppercase tracking-widest text-white/70 underline-offset-4 hover:text-white hover:underline"
          >
            View All Sessions ›
          </Link>
        </div>
      )}
    </div>
  )
}
