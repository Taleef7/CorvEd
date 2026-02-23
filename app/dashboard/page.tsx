// E3 T3.2: role-aware dashboard redirect
// Closes #21

export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/sign-in')

  // Check if profile setup is complete
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('primary_role, whatsapp_number')
    .eq('user_id', user.id)
    .single()

  if (!profile?.whatsapp_number) {
    redirect('/auth/profile-setup')
  }

  const role = profile?.primary_role ?? 'student'

  if (role === 'admin') redirect('/admin')
  if (role === 'tutor') redirect('/tutor')

  // student / parent → student dashboard (implemented in E9)
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-lg rounded-2xl bg-white px-8 py-10 text-center shadow-md dark:bg-zinc-900">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Student Dashboard
        </h1>
        <p className="mt-3 text-sm text-zinc-500">
          Welcome! Your dashboard is coming soon. Sessions, schedule, and Meet
          links will appear here in a future release.
        </p>
      </div>
    </div>
  )
}
