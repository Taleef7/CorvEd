// E3 T3.2: admin layout — enforces admin role server-side
// Closes #21

export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/sign-in')

  // Use admin client to bypass RLS and verify admin role
  const adminClient = createAdminClient()
  const { data: roles } = await adminClient
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)

  const isAdmin = roles?.some((r) => r.role === 'admin') ?? false
  if (!isAdmin) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Admin nav */}
      <header className="border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-bold text-zinc-900 dark:text-zinc-50">
              CorvEd <span className="text-xs font-normal text-indigo-600">Admin</span>
            </span>
            <nav className="hidden items-center gap-4 text-sm text-zinc-600 sm:flex dark:text-zinc-400">
              <Link href="/admin" className="hover:text-zinc-900 dark:hover:text-zinc-100">
                Dashboard
              </Link>
              <Link
                href="/admin/users"
                className="hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Users
              </Link>
              <Link
                href="/admin/requests"
                className="hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Requests
              </Link>
              <Link
                href="/admin/payments"
                className="hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Payments
              </Link>
              <Link
                href="/admin/tutors"
                className="hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Tutors
              </Link>
              <Link
                href="/admin/matches"
                className="hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Matches
              </Link>
            </nav>
          </div>
          <form action="/auth/sign-out" method="post">
            <button
              type="submit"
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}
