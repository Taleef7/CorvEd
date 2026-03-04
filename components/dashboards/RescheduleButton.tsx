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
        className="inline-flex min-h-[36px] items-center gap-1 border-2 border-[#121212] bg-white px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#121212] shadow-[3px_3px_0px_0px_#121212] transition hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
      >
        📲 Reschedule
      </a>
      {isWithin24Hours && (
        <p className="text-xs font-bold text-[#D02020]">
          ⚠️ Less than 24 hours away — late reschedule may apply policy
        </p>
      )}
    </div>
  )
}
