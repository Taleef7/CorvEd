// C5: shared auth server actions — CSRF-protected by default
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/** Sign out the current user and redirect to sign-in page. */
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/sign-in')
}
