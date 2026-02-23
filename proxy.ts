// E3 T3.1 / T3.2: session management + route protection proxy (Next.js 16)
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
