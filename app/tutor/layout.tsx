// E3 T3.2: tutor layout — enforces tutor role server-side
// Closes #21

export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { signOut } from '@/app/auth/actions'
import Link from 'next/link'

export default async function TutorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/sign-in')

  // Use admin client to bypass RLS and verify tutor role
  const adminClient = createAdminClient()
  const { data: roles } = await adminClient
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)

  const isTutor = roles?.some((r) => r.role === 'tutor' || r.role === 'admin') ?? false
  if (!isTutor) redirect('/dashboard')

  const navLinks = [
    { href: '/tutor', label: 'Dashboard' },
    { href: '/tutor/sessions', label: 'Sessions' },
    { href: '/tutor/profile', label: 'Profile' },
    { href: '/tutor/conduct', label: 'Code of Conduct' },
  ]

  return (
    <div className="min-h-screen bg-[#F0F0F0]">
      {/* Tutor nav — Bauhaus header with yellow accent */}
      <header className="border-b-4 border-[#121212] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1" aria-hidden="true">
              <div className="h-4 w-4 rounded-full bg-[#D02020]" />
              <div className="h-4 w-4 bg-[#F0C020]" />
              <div className="h-4 w-4" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', background: '#1040C0' }} />
            </div>
            <Link href="/tutor" className="font-black uppercase tracking-tighter text-[#121212]">
              CorvEd
            </Link>
            <span className="border-2 border-[#F0C020] bg-[#F0C020] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#121212]">
              Tutor
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Tutor navigation">
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

          {/* Sign out */}
          <form action={signOut}>
            <button
              type="submit"
              className="border-2 border-[#121212] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#121212] hover:bg-[#121212] hover:text-white transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>

        {/* Mobile nav */}
        <div className="overflow-x-auto border-t-2 border-[#121212]/10 lg:hidden">
          <nav className="flex min-w-max gap-0" aria-label="Tutor navigation">
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