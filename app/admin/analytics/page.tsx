// E12 T12.4: Admin analytics dashboard — active students, upcoming/missed sessions, pending items
// Closes #81

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function AdminAnalyticsPage() {
  const admin = createAdminClient()
  const now = new Date()
  const plus7 = new Date(now.getTime() + 7 * 86400000).toISOString()
  const minus7 = new Date(now.getTime() - 7 * 86400000).toISOString()
  const nowIso = now.toISOString()

  const [
    activeStudents,
    activeTutors,
    upcomingSessions,
    missedSessions,
    unmarkedSessions,
    pendingPayments,
    pendingTutors,
  ] = await Promise.all([
    // Active students: requests with status = 'active'
    admin.from('requests').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    // Active tutors: tutor_profiles with approved = true
    admin
      .from('tutor_profiles')
      .select('tutor_user_id', { count: 'exact', head: true })
      .eq('approved', true),
    // Upcoming sessions: scheduled in the next 7 days
    admin
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'scheduled')
      .gte('scheduled_start_utc', nowIso)
      .lte('scheduled_start_utc', plus7),
    // Missed sessions (last 7 days): no-show by student or tutor
    admin
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .in('status', ['no_show_student', 'no_show_tutor'])
      .gte('scheduled_start_utc', minus7)
      .lte('scheduled_start_utc', nowIso),
    // Sessions not marked yet: scheduled but start time has passed
    admin
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'scheduled')
      .lt('scheduled_start_utc', nowIso),
    // Payments pending verification
    admin.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    // Tutor applications pending approval
    admin
      .from('tutor_profiles')
      .select('tutor_user_id', { count: 'exact', head: true })
      .eq('approved', false),
  ])

  const metrics = {
    activeStudents: activeStudents.count ?? 0,
    activeTutors: activeTutors.count ?? 0,
    upcomingSessions: upcomingSessions.count ?? 0,
    missedSessions: missedSessions.count ?? 0,
    unmarkedSessions: unmarkedSessions.count ?? 0,
    pendingPayments: pendingPayments.count ?? 0,
    pendingTutors: pendingTutors.count ?? 0,
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Analytics</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Platform health snapshot — refreshed on every page load.
        </p>
      </div>

      {/* ── Primary metrics ── */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Overview
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            label="Active Students"
            value={metrics.activeStudents}
            unit="students"
            icon="🎓"
            variant="normal"
          />
          <MetricCard
            label="Active Tutors"
            value={metrics.activeTutors}
            unit="tutors"
            icon="👩‍🏫"
            variant="normal"
          />
          <MetricCard
            label="Upcoming Sessions"
            value={metrics.upcomingSessions}
            unit="sessions · next 7 days"
            icon="📅"
            variant="normal"
          />
        </div>
      </section>

      {/* ── Sessions health ── */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Session Health
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <MetricCard
            label="Missed Sessions"
            value={metrics.missedSessions}
            unit="no-shows · last 7 days"
            icon="❌"
            variant="normal"
          />
          <MetricCard
            label="Not Marked Yet"
            value={metrics.unmarkedSessions}
            unit="sessions past due"
            icon="⚠️"
            variant={metrics.unmarkedSessions > 0 ? 'warning' : 'normal'}
            href="/admin/sessions"
            linkLabel="Review sessions →"
          />
        </div>
      </section>

      {/* ── Action items ── */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Action Required
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <MetricCard
            label="Pending Payments"
            value={metrics.pendingPayments}
            unit="awaiting verification"
            icon="💳"
            variant={metrics.pendingPayments > 0 ? 'attention' : 'normal'}
            href="/admin/payments"
            linkLabel="Review payments →"
          />
          <MetricCard
            label="Pending Tutor Applications"
            value={metrics.pendingTutors}
            unit="awaiting approval"
            icon="⏳"
            variant={metrics.pendingTutors > 0 ? 'attention' : 'normal'}
            href="/admin/tutors"
            linkLabel="Review tutors →"
          />
        </div>
      </section>
    </div>
  )
}

function MetricCard({
  label,
  value,
  unit,
  icon,
  variant,
  href,
  linkLabel,
}: {
  label: string
  value: number
  unit: string
  icon: string
  variant: 'normal' | 'warning' | 'attention'
  href?: string
  linkLabel?: string
}) {
  const base =
    'rounded-xl border p-5 shadow-sm transition'

  const styles: Record<string, string> = {
    normal:
      'border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900',
    warning:
      'border-amber-200 bg-amber-50 dark:border-amber-800/60 dark:bg-amber-950/30',
    attention:
      'border-orange-200 bg-orange-50 dark:border-orange-800/60 dark:bg-orange-950/30',
  }

  const valueStyles: Record<string, string> = {
    normal: 'text-zinc-900 dark:text-zinc-50',
    warning: 'text-amber-700 dark:text-amber-400',
    attention: 'text-orange-700 dark:text-orange-400',
  }

  const content = (
    <div className={`${base} ${styles[variant]} ${href ? 'hover:shadow-md cursor-pointer' : ''}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {label}
        </p>
      </div>
      <p className={`text-4xl font-bold ${valueStyles[variant]}`}>{value}</p>
      <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{unit}</p>
      {href && linkLabel && (
        <p className="mt-3 text-xs font-medium text-indigo-600 dark:text-indigo-400">
          {linkLabel}
        </p>
      )}
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }
  return content
}
