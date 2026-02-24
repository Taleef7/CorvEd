// E5 T5.4: Package summary card for student dashboard
// Closes #36

import Link from 'next/link'

export type PackageSummaryProps = {
  tier_sessions: number
  sessions_used: number
  start_date: string
  end_date: string
  status: 'pending' | 'active' | 'expired'
  packageId: string
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
}: PackageSummaryProps) {
  const sessionsRemaining = Math.max(0, tier_sessions - sessions_used)
  const pct = tier_sessions > 0 ? Math.min(100, Math.round((sessions_used / tier_sessions) * 100)) : 0

  if (status === 'pending') {
    return (
      <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-6 py-5 dark:border-yellow-800 dark:bg-yellow-900/20">
        <div className="flex items-center gap-2">
          <span className="text-lg">📦</span>
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Package Summary</h2>
        </div>
        <p className="mt-2 text-sm text-yellow-800 dark:text-yellow-300">
          ⏳ Payment pending verification. Sessions will appear once payment is confirmed.
        </p>
        <Link
          href={`/dashboard/packages/${packageId}`}
          className="mt-2 inline-block text-xs text-indigo-600 hover:underline dark:text-indigo-400"
        >
          View payment details →
        </Link>
      </div>
    )
  }

  if (status === 'expired') {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-5 dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          <span className="text-lg">📦</span>
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Package Summary</h2>
        </div>
        <p className="mt-2 text-sm text-zinc-500">
          Package expired ({formatDate(start_date)} → {formatDate(end_date)}).
        </p>
        <Link
          href="/dashboard/requests/new"
          className="mt-2 inline-block text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Renew →
        </Link>
      </div>
    )
  }

  // Active package
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-center gap-2">
        <span className="text-lg">📦</span>
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Package Summary</h2>
      </div>

      <dl className="mt-3 space-y-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-zinc-500">Package</dt>
          <dd className="font-medium text-zinc-800 dark:text-zinc-200">
            {tier_sessions} sessions/month
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-zinc-500">Month</dt>
          <dd className="font-medium text-zinc-800 dark:text-zinc-200">
            {formatDate(start_date)} → {formatDate(end_date)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-zinc-500">Sessions remaining</dt>
          <dd className="font-semibold text-indigo-600 dark:text-indigo-400">
            {sessionsRemaining} of {tier_sessions}
          </dd>
        </div>
      </dl>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-700">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-zinc-400">
          {sessions_used} of {tier_sessions} sessions used
        </p>
      </div>
    </div>
  )
}
