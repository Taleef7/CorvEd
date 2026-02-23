// E3 T3.2: tutor dashboard stub (full implementation in E10)
// Closes #21

import { createClient } from '@/lib/supabase/server'

export default async function TutorPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('display_name')
    .eq('user_id', user?.id ?? '')
    .single()

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Tutor Dashboard
      </h1>
      <p className="text-sm text-zinc-500">
        Welcome, {profile?.display_name ?? 'Tutor'}. Your sessions and notes
        will appear here in a future release.
      </p>
    </div>
  )
}
