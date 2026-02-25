// E3 T3.2 / T3.4: Admin overview page
// Closes #21 #23

import Link from 'next/link'

export default function AdminPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Admin Dashboard
      </h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AdminCard
          href="/admin/users"
          title="User Management"
          description="View all users, assign or remove roles, and set primary roles."
        />
        <AdminCard
          href="/admin/requests"
          title="Requests"
          description="Review and manage student tutoring requests."
        />
        <AdminCard
          href="/admin/payments"
          title="Payments"
          description="Verify bank transfers and activate packages."
        />
        <AdminCard
          href="/admin/tutors"
          title="Tutors"
          description="Approve tutor applications and manage tutor profiles."
        />
        <AdminCard
          href="/admin/matches"
          title="Matches"
          description="Assign tutors to students and manage schedules."
        />
        <AdminCard
          href="/admin/sessions"
          title="Sessions"
          description="Monitor session status and attendance."
        />
        <AdminCard
          href="/admin/audit"
          title="Audit Log"
          description="View recent platform events: payments, approvals, session updates."
        />
        <AdminCard
          href="/admin/analytics"
          title="Analytics"
          description="Active students, upcoming sessions, missed sessions, and pending action items."
        />
      </div>
    </div>
  )
}

function AdminCard({
  href,
  title,
  description,
}: {
  href: string
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-indigo-600"
    >
      <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
    </Link>
  )
}
