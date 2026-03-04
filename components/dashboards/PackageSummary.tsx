// E5 T5.4: Package summary card for student dashboard
// E9 T9.3: Renewal alert logic (≤3 sessions remaining or ≤5 days until package end)
// Closes #36, #63

import Link from 'next/link'
import { WHATSAPP_NUMBER } from '@/lib/config'

export type PackageSummaryProps = {
  tier_sessions: number
  sessions_used: number
  start_date: string
  end_date: string
  status: 'pending' | 'active' | 'expired'
  packageId: string
  /** Pre-computed on the server: days until package end_date (for renewal alert) */
  daysUntilEnd?: number
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function PackageSummary({
  tier_sessions,
  sessions_used,
  start_date,
  end_date,
  status,
  packageId,
  daysUntilEnd = 999,
}: PackageSummaryProps) {
  const sessionsRemaining = Math.max(0, tier_sessions - sessions_used)
  const pct = tier_sessions > 0 ? Math.min(100, Math.round((sessions_used / tier_sessions) * 100)) : 0

  if (status === 'pending') {
    return (
      <div className="border-l-4 border-[#F0C020] bg-[#F0C020]/10 px-5 py-4">
        <p className="text-sm font-medium text-[#121212]">
          ⏳ Payment pending verification — sessions will appear once confirmed.
        </p>
        <Link
          href={`/dashboard/packages/${packageId}`}
          className="mt-2 inline-flex min-h-[36px] items-center border-2 border-[#121212] bg-[#F0C020] px-4 py-1 text-xs font-bold uppercase tracking-widest text-[#121212] shadow-[3px_3px_0px_0px_#121212] transition hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
        >
          View Payment Details
        </Link>
      </div>
    )
  }

  if (status === 'expired') {
    return (
      <div className="border-4 border-[#121212] bg-[#E0E0E0] px-6 py-5">
        <p className="text-xs font-bold uppercase tracking-widest text-[#121212]/50">Package</p>
        <p className="mt-1 font-black text-[#121212]">Package Summary</p>
        <p className="mt-2 text-sm text-[#121212]/60">
          Expired — {formatDate(start_date)} to {formatDate(end_date)}.
        </p>
        <Link
          href="/dashboard/requests/new"
          className="mt-3 inline-flex min-h-[36px] items-center border-2 border-[#121212] bg-white px-4 py-1 text-xs font-bold uppercase tracking-widest text-[#121212] shadow-[3px_3px_0px_0px_#121212] transition hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
        >
          Renew Package
        </Link>
      </div>
    )
  }

  // Renewal alert: ≤3 sessions remaining OR ≤5 days until package end
  const showRenewalAlert = sessionsRemaining <= 3 || daysUntilEnd <= 5
  const renewalHref = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        `Hi CorvEd 👋 I'd like to renew my tutoring package.\n\nSessions remaining: ${sessionsRemaining}\nPackage ends: ${formatDate(end_date)}\n\nPlease share the renewal options. Thanks!`,
      )}`
    : undefined

  // Active package
  return (
    <div className="border-4 border-[#121212] bg-white px-6 py-5 shadow-[4px_4px_0px_0px_#121212]">
      <p className="text-xs font-bold uppercase tracking-widest text-[#121212]/50">Package</p>
      <p className="mt-1 font-black text-[#121212]">Package Summary</p>

      <dl className="mt-3 space-y-1.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-[#121212]/50">Tier</dt>
          <dd className="font-bold text-[#121212]">{tier_sessions} sessions / month</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[#121212]/50">Period</dt>
          <dd className="font-bold text-[#121212]">
            {formatDate(start_date)} – {formatDate(end_date)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[#121212]/50">Remaining</dt>
          <dd className="font-black text-[#1040C0]">
            {sessionsRemaining} of {tier_sessions}
          </dd>
        </div>
      </dl>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="h-3 w-full border-2 border-[#121212] bg-[#E0E0E0]">
          <div
            className="h-full bg-[#1040C0] transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-[#121212]/50">
          {sessions_used} of {tier_sessions} sessions used
        </p>
      </div>

      {/* Renewal alert */}
      {showRenewalAlert && (
        <div className="mt-4 border-l-4 border-[#D02020] bg-[#D02020]/5 px-3 py-2">
          <p className="text-xs font-bold text-[#D02020]">
            {sessionsRemaining === 0
              ? `Sessions used up. Renew to continue.`
              : `Only ${sessionsRemaining} session${sessionsRemaining === 1 ? '' : 's'} left${daysUntilEnd <= 5 ? ` — ${daysUntilEnd} day${daysUntilEnd === 1 ? '' : 's'} remaining` : ''}. Renew soon.`}
          </p>
          {renewalHref && (
            <a
              href={renewalHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex min-h-[36px] items-center border-2 border-[#D02020] bg-[#D02020] px-4 py-1 text-xs font-bold uppercase tracking-widest text-white shadow-[3px_3px_0px_0px_#121212] transition hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            >
              Chat to Renew
            </a>
          )}
        </div>
      )}
    </div>
  )
}
