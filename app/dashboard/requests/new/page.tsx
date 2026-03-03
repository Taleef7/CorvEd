// E4 T4.1: New tutoring request page (Server Component)
// Loads subjects server-side for reliable data, then renders the client form.

export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import RequestForm from './RequestForm'

export default async function NewRequestPage() {
  const supabase = await createClient()

  // Try fetching subjects with the user's session first
  const { data: subjects, error: subjectsError } = await supabase
    .from('subjects')
    .select('id, name, code')
    .eq('active', true)
    .order('sort_order')

  // If RLS blocks the read, fall back to the admin client for this reference data
  let resolvedSubjects = subjects
  if (subjectsError || !subjects || subjects.length === 0) {
    if (subjectsError) {
      console.error('[NewRequestPage] Subjects fetch failed (RLS?):', subjectsError.message)
    }
    const admin = createAdminClient()
    const { data: adminSubjects, error: adminError } = await admin
      .from('subjects')
      .select('id, name, code')
      .eq('active', true)
      .order('sort_order')
    if (adminError) {
      console.error('[NewRequestPage] Admin subjects fetch also failed:', adminError.message)
    }
    resolvedSubjects = adminSubjects
  }

  // Pre-fill timezone from user profile
  const { data: { user } } = await supabase.auth.getUser()
  let initialTimezone = 'Asia/Karachi'
  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('timezone')
      .eq('user_id', user.id)
      .single()
    if (profile?.timezone) initialTimezone = profile.timezone
  }

  return (
    <RequestForm
      subjects={resolvedSubjects ?? []}
      initialTimezone={initialTimezone}
    />
  )
}
