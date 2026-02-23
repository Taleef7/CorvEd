// E3 S3.1: sign-out route handler
// Handles POST /auth/sign-out — clears session and redirects to sign-in
// Closes #18

import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()

  const url = request.nextUrl.clone()
  url.pathname = '/auth/sign-in'
  return NextResponse.redirect(url, 303)
}
