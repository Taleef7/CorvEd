// E12 T12.4: Admin analytics dashboard — active students, upcoming/missed sessions, pending items
// Closes #81

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { getExpiringPackages } from '@/lib/services/payments'

export default async function AdminAnalyticsPage() {
  const admin = createAdminClient()
  const now = new Date()
  const plus7 = new Date(now.getTime() + 7 * 86400000).toISOString()
  const minus7 = new Date(now.getTime() - 7 * 86400000).toISOString()
  const nowIso = now.toISOString()

  // Fetch expiring packages for renewal alerts
  const expiringPackages = await getExpiringPackages(5)

  // Fetch student names for expiring packages
  let renewalAlerts: { packageId: string; studentName: string; sessionsRemaining: number; endDate: string }[] = []
  if (expiringPackages.length > 0) {
    const requestIds = expiringPackages.map((p) => p.request_id)
    const { data: requests } = await admin
      .from('requests')
      .select('id, created_by_user_id, subjects(name)')
      .in('id', requestIds)

    if (requests) {
      const userIds = [...new Set(requests.map((r: { created_by_user_id: string }) => r.created_by_user_id))]
      const { data: profiles } = await admin
        .from('user_profiles')
        .select('user_id, display_name')
        .in('user_id', userIds)

      const profileMap = new Map((profiles ?? []).map((p: { user_id: string; display_name: string }) => [p.user_id, p.display_name]))
      const requestMap = new Map(requests.map((r: { id: string; created_by_user_id: string; subjects: { name: string } | { name: string }[] | null }) => [r.id, r]))

      renewalAlerts = expiringPackages.map((pkg) => {
        const req = requestMap.get(pkg.request_id) as { created_by_user_id: string; subjects: { name: string } | { name: string }[] | null } | undefined
        const name = req ? (profileMap.get(req.created_by_user_id) ?? 'Unknown') : 'Unknown'
        return {
          packageId: pkg.id,
          studentName: name,
          sessionsRemaining: pkg.tier_sessions - pkg.sessions_used,
          endDate: pkg.end_date,
        }
      })
    }
  }

  const [
    activeStudents,
    activeTutors,
    upcomingSessions,
    missedSessions,
    unmarkedSessions,
    pendingPayments,
    pendingTutors,
  ] = await Promise.all([
    // Active students: unique users with active requests
    admin.from('requests').select('created_by_user_id').eq('status', 'active'),
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

  const firstError =
    activeStudents.error ||
    activeTutors.error ||
    upcomingSessions.error ||
    missedSessions.error ||
    unmarkedSessions.error ||
    pendingPayments.error ||
    pendingTutors.error

  if (firstError) {
    throw new Error(`Failed to load analytics metrics: ${firstError.message}`)
  }

  const metrics = {
    activeStudents: new Set(
      (activeStudents.data ?? []).map((r: { created_by_user_id: string }) => r.created_by_user_id)
    ).size,
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
        <h1 className="text-3xl font-black uppercase tracking-tighter text-[#121212]">Analytics</h1>
        <p className="mt-1 text-sm text-[#121212]/60">
          Platform health snapshot — refreshed on every page load.
        </p>
      </div>

      {/* ── Primary metrics ── */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#121212]/40">
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
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#121212]/40">
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

      {/* ── Renewal Alerts ── */}
      {renewalAlerts.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#121212]/40">
            Renewals Due (Next 5 Days)
          </h2>
          <div className="border-4 border-[#121212] bg-[#F0C020]/10 divide-y-2 divide-[#121212]">
            {renewalAlerts.map((alert) => (
              <div key={alert.packageId} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-bold text-[#121212]">{alert.studentName}</p>
                  <p className="text-xs text-[#121212]/50">
                    {alert.sessionsRemaining} sessions left · Expires {alert.endDate}
                  </p>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#F0C020] border-2 border-[#121212] bg-white px-2 py-1">
                  Renewal Due
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Action items ── */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#121212]/40">
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
    'border-4 border-[#121212] p-5 transition'

  const styles: Record<string, string> = {
    normal:
      'bg-white',
    warning:
      'border-l-[#F0C020] bg-[#F0C020]/10',
    attention:
      'bg-[#D02020]/5 border-l-[#D02020]',
  }

  const valueStyles: Record<string, string> = {
    normal: 'text-[#121212]',
    warning: 'text-[#121212]',
    attention: 'text-[#121212]',
  }

  const content = (
    <div className={`${base} ${styles[variant]} ${href ? 'hover:shadow-md cursor-pointer' : ''}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <p className="text-xs font-bold uppercase tracking-widest text-[#121212]/60">
          {label}
        </p>
      </div>
      <p className={`text-4xl font-bold ${valueStyles[variant]}`}>{value}</p>
      <p className="mt-1 text-xs text-[#121212]/40">{unit}</p>
      {href && linkLabel && (
        <p className="mt-3 text-xs font-medium text-[#1040C0]">
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
