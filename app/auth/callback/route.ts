// E3 T3.1: OAuth / email-confirmation callback handler
// Closes #20

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { safeNext, shouldPromoteOAuthParentSignup } from '@/lib/auth/utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = safeNext(searchParams.get('next'))
  const flow = searchParams.get('flow')
  const accountType = searchParams.get('account_type')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // After OAuth/email-confirm, check whether profile is complete
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const [{ data: profile }, { data: roleRows }] = await Promise.all([
          supabase
            .from('user_profiles')
            .select('primary_role, whatsapp_number, created_at')
            .eq('user_id', user.id)
            .single(),
          supabase.from('user_roles').select('role').eq('user_id', user.id),
        ])

        if (
          profile &&
          shouldPromoteOAuthParentSignup({
            flow,
            accountType,
            primaryRole: profile.primary_role,
            assignedRoles: (roleRows ?? []).map((row) => row.role),
            whatsappNumber: profile.whatsapp_number,
            profileCreatedAt: profile.created_at,
          })
        ) {
          const admin = createAdminClient()
          const [{ error: profileUpdateError }, { error: parentRoleError }, { error: removeStudentError }] =
            await Promise.all([
              admin.from('user_profiles').update({ primary_role: 'parent' }).eq('user_id', user.id),
              admin.from('user_roles').upsert({ user_id: user.id, role: 'parent' }),
              admin.from('user_roles').delete().eq('user_id', user.id).eq('role', 'student'),
            ])

          if (profileUpdateError || parentRoleError || removeStudentError) {
            return NextResponse.redirect(`${origin}/auth/sign-in?error=auth_callback_failed`)
          }
        }

        // New users who haven't set their WhatsApp number yet go to profile-setup
        if (!profile?.whatsapp_number) {
          return NextResponse.redirect(`${origin}/auth/profile-setup`)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(
    `${origin}/auth/sign-in?error=auth_callback_failed`
  )
}
