// Student/parent dashboard layout — persistent navigation
// Resolves the #1 UX gap: students have no nav or sign-out capability

export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/auth/actions'
import Link from 'next/link'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/sign-in')

  // Fetch user profile for display name and role redirect
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('display_name, primary_role')
    .eq('user_id', user.id)
    .single()

  // Role-based redirect: admin and tutor should not use this layout
  if (profile?.primary_role === 'admin') redirect('/admin')
  if (profile?.primary_role === 'tutor') redirect('/tutor')

  const displayName = profile?.display_name ?? user.email ?? 'Student'

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/sessions', label: 'Sessions' },
    { href: '/dashboard/requests/new', label: 'New Request' },
  ]

  return (
    <div className="min-h-screen bg-[#F0F0F0]">
      {/* Student nav — Bauhaus header */}
      <header className="border-b-4 border-[#121212] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1" aria-hidden="true">
              <div className="h-4 w-4 rounded-full bg-[#D02020]" />
              <div className="h-4 w-4 bg-[#F0C020]" />
              <div
                className="h-4 w-4"
                style={{
                  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                  background: '#1040C0',
                }}
              />
            </div>
            <Link
              href="/dashboard"
              className="font-black uppercase tracking-tighter text-[#121212]"
            >
              CorvEd
            </Link>
            <span className="border-2 border-[#1040C0] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#1040C0]">
              Student
            </span>
          </div>

          {/* Desktop nav */}
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Student navigation"
          >
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#121212] hover:bg-[#121212] hover:text-white transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Profile + Sign out */}
          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-medium text-[#121212]/60 sm:inline">
              {displayName}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="border-2 border-[#121212] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#121212] hover:bg-[#121212] hover:text-white transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        {/* Mobile nav — horizontal scroll */}
        <div className="overflow-x-auto border-t-2 border-[#121212]/10 md:hidden">
          <nav
            className="flex min-w-max gap-0"
            aria-label="Student navigation"
          >
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#121212] hover:bg-[#121212] hover:text-white transition-colors whitespace-nowrap"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}
