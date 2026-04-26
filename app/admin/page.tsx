// E3 T3.2 / T3.4: Admin overview page
// Closes #21 #23

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function AdminPage() {
  const admin = createAdminClient()
  const nowIso = new Date().toISOString()

  const [newLeads, pendingPayments, pendingTutors, newRequests, upcomingSessions, activeSubjects] = await Promise.all([
    admin.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    admin.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('tutor_profiles').select('tutor_user_id', { count: 'exact', head: true }).eq('approved', false),
    admin.from('requests').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    admin.from('sessions').select('id', { count: 'exact', head: true }).eq('status', 'scheduled').gte('scheduled_start_utc', nowIso),
    admin.from('subjects').select('id', { count: 'exact', head: true }).eq('active', true),
  ])

  const counts: Record<string, { count: number; countLabel: string }> = {
    '/admin/leads': { count: newLeads.count ?? 0, countLabel: 'new' },
    '/admin/payments': { count: pendingPayments.count ?? 0, countLabel: 'pending' },
    '/admin/tutors': { count: pendingTutors.count ?? 0, countLabel: 'pending' },
    '/admin/requests': { count: newRequests.count ?? 0, countLabel: 'new' },
    '/admin/sessions': { count: upcomingSessions.count ?? 0, countLabel: 'upcoming' },
    '/admin/subjects': { count: activeSubjects.count ?? 0, countLabel: 'active' },
  }

  const CARDS = [
    { href: '/admin/leads', title: 'Leads', desc: 'Review Phase 0 intake records and track WhatsApp follow-up.', accent: 'yellow' as const },
    { href: '/admin/users', title: 'User Management', desc: 'View all users, assign or remove roles, and set primary roles.', accent: 'blue' as const },
    { href: '/admin/requests', title: 'Requests', desc: 'Review and manage student tutoring requests.', accent: 'red' as const },
    { href: '/admin/payments', title: 'Payments', desc: 'Verify bank transfers and activate packages.', accent: 'yellow' as const },
    { href: '/admin/tutors', title: 'Tutors', desc: 'Approve tutor applications and manage tutor profiles.', accent: 'blue' as const },
    { href: '/admin/matches', title: 'Matches', desc: 'Assign tutors to students and manage schedules.', accent: 'red' as const },
    { href: '/admin/sessions', title: 'Sessions', desc: 'Monitor session status and attendance.', accent: 'yellow' as const },
    { href: '/admin/subjects', title: 'Subjects', desc: 'Add, activate, or deactivate subjects for the student request form.', accent: 'blue' as const },
    { href: '/admin/audit', title: 'Audit Log', desc: 'View recent platform events: payments, approvals, session updates.', accent: 'blue' as const },
    { href: '/admin/analytics', title: 'Analytics', desc: 'Active students, upcoming sessions, missed sessions, and pending action items.', accent: 'red' as const },
  ]

  return (
    <div>
      {/* Page header */}
      <div className="mb-8 border-b-4 border-[#121212] pb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-[#121212]/50">Admin Panel</p>
        <h1 className="mt-1 text-4xl font-black uppercase tracking-tighter text-[#121212] leading-none">
          Dashboard
        </h1>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((c) => (
          <AdminCard
            key={c.href}
            href={c.href}
            title={c.title}
            desc={c.desc}
            accent={c.accent}
            count={counts[c.href]?.count}
            countLabel={counts[c.href]?.countLabel}
          />
        ))}
      </div>
    </div>
  )
}

const ACCENT_CLASSES = {
  red: 'bg-[#D02020]',
  blue: 'bg-[#1040C0]',
  yellow: 'bg-[#F0C020]',
}

function AdminCard({
  href,
  title,
  desc,
  accent,
  count,
  countLabel,
}: {
  href: string
  title: string
  desc: string
  accent: 'red' | 'blue' | 'yellow'
  count?: number
  countLabel?: string
}) {
  return (
    <Link
      href={href}
      className="group relative block border-4 border-[#121212] bg-white p-6 shadow-[6px_6px_0px_0px_#121212] transition-transform hover:-translate-y-1"
    >
      {/* Geometric corner accent */}
      <span
        aria-hidden="true"
        className={`absolute top-3 right-3 h-3 w-3 ${ACCENT_CLASSES[accent]}`}
      />
      <h2 className="text-sm font-black uppercase tracking-wider text-[#121212] group-hover:text-[#1040C0]">
        {title}
      </h2>
      <p className="mt-2 text-xs leading-relaxed text-[#121212]/60">{desc}</p>
      {count !== undefined && count > 0 && (
        <p className="mt-3 text-xs font-bold text-[#D02020]">
          {count} {countLabel}
        </p>
      )}
    </Link>
  )
}
