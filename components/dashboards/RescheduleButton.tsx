'use client'

// E9 T9.4: "Reschedule via WhatsApp" button with prefilled message and 24-hour warning
// Closes #64

import { WHATSAPP_NUMBER } from '@/lib/config'

export interface RescheduleButtonProps {
  subject: string
  level: string
  scheduledStartUtc: string
  studentTimezone: string
  /** Server-computed timestamp (ms) for the 24-hour check. Avoids impure Date.now() in render. */
  serverNowMs?: number
}

function buildRescheduleMessage(session: RescheduleButtonProps): string {
  const sessionTime = new Intl.DateTimeFormat('en', {
    timeZone: session.studentTimezone,
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(session.scheduledStartUtc))

  // Use the session date for the TZ abbreviation so DST is correct for that date
  const tzAbbr =
    new Intl.DateTimeFormat('en', {
      timeZone: session.studentTimezone,
      timeZoneName: 'short',
    })
      .formatToParts(new Date(session.scheduledStartUtc))
      .find((p) => p.type === 'timeZoneName')?.value ?? ''

  return encodeURIComponent(
    `Hi CorvEd 👋 I'd like to reschedule my session.\n\n` +
      `Subject: ${session.subject} (${session.level})\n` +
      `Current time: ${sessionTime} (${tzAbbr})\n\n` +
      `My available alternate times:\n1. \n2. \n3. \n`,
  )
}

export function RescheduleButton({
  subject,
  level,
  scheduledStartUtc,
  studentTimezone,
  serverNowMs,
}: RescheduleButtonProps) {
  if (!WHATSAPP_NUMBER) return null

  const message = buildRescheduleMessage({ subject, level, scheduledStartUtc, studentTimezone })
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`

  // Use server-computed timestamp when available; fall back to client time otherwise
  const nowMs = serverNowMs ?? new Date().getTime()
  const msUntilSession = new Date(scheduledStartUtc).getTime() - nowMs
  const hoursUntilSession = msUntilSession / (1000 * 60 * 60)
  const isWithin24Hours = hoursUntilSession > 0 && hoursUntilSession < 24

  return (
    <div className="flex flex-col gap-1">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Reschedule ${subject} session via WhatsApp`}
        className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
      >
        📲 Reschedule
      </a>
      {isWithin24Hours && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          ⚠️ Less than 24 hours away — late reschedule may apply policy
        </p>
      )}
    </div>
  )
}
