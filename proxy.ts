// E3 T3.1 / T3.2: session management + role-based route protection
// C2: enhanced with role-based middleware, email verification check
// Closes #20 #21

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — must call getUser() to properly refresh the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  const protectedPaths = ['/dashboard', '/tutor', '/admin']
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))

  // Redirect unauthenticated users to sign-in, preserving the full path + query
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    const next = pathname + request.nextUrl.search
    url.pathname = '/auth/sign-in'
    url.searchParams.set('next', next)
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  const authPages = ['/auth/sign-in', '/auth/sign-up']
  if (user && authPages.some((p) => pathname === p)) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // --- C2: Role-based enforcement & email verification for protected routes ---
  if (isProtected && user) {
    // Check email verification for email/password users
    // OAuth users (Google, GitHub, etc.) have email_confirmed_at set automatically
    const isEmailProvider = user.app_metadata?.provider === 'email'
    const isEmailVerified = !!user.email_confirmed_at

    if (isEmailProvider && !isEmailVerified && pathname !== '/auth/verify') {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/verify'
      return NextResponse.redirect(url)
    }

    // Fetch primary_role from user_profiles for role-based route protection
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('primary_role')
      .eq('user_id', user.id)
      .single()

    const primaryRole = profile?.primary_role

    // Redirect non-admin users away from /admin/*
    if (pathname.startsWith('/admin') && primaryRole !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // Redirect non-tutor users away from /tutor/*
    // (admins are allowed to access tutor routes per existing layout logic)
    if (
      pathname.startsWith('/tutor') &&
      primaryRole !== 'tutor' &&
      primaryRole !== 'admin'
    ) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/tutor/:path*',
    '/admin/:path*',
    '/auth/sign-in',
    '/auth/sign-up',
  ],
}
