// E3 S3.1: sign-in form  separated so useSearchParams() can be in a Suspense boundary
// Closes #18 #20

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { buildAuthCallbackUrl, safeNext } from '@/lib/auth/utils'
import {
  BauhausLogo,
  BauhausLabel,
  BauhausInput,
  BauhausFieldError,
  BauhausServerError,
  BauhausButton,
  BauhausDivider,
  GoogleIcon,
} from '@/components/ui/bauhaus'

const signInSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})
type SignInData = z.infer<typeof signInSchema>

export function SignInForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = safeNext(searchParams.get('next'))

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInData>({ resolver: zodResolver(signInSchema) })

  async function onSubmit(data: SignInData) {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (error) {
      setServerError('Invalid email or password. Please try again.')
      return
    }
    router.push(next)
  }

  async function signInWithGoogle() {
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: buildAuthCallbackUrl(window.location.origin, { next }),
      },
    })
  }

  const busy = isSubmitting || googleLoading

  return (
    <>
      {/* Header with back button and logo */}
      <div className="border-b-2 border-[#121212] bg-[#F0F0F0] px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-bold text-[#121212] hover:text-[#D02020] transition-colors"
            aria-label="Back to home"
          >
            <span className="text-xl">←</span>
            <span className="text-sm uppercase tracking-wider">Back</span>
          </Link>
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <BauhausLogo size="sm" />
          </Link>
        </div>
      </div>

      {/* Form content */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-black uppercase tracking-tighter text-[#121212] leading-tight">
              Sign In
            </h1>
            <p className="mt-1 text-sm text-[#121212]/60">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/sign-up"
                className="font-bold text-[#1040C0] underline underline-offset-2 hover:text-[#D02020]"
              >
                Sign up
              </Link>
            </p>
          </div>

          <BauhausServerError message={serverError} />

          {/* Google OAuth */}
          <BauhausButton
            type="button"
            variant="outline"
            fullWidth
            onClick={signInWithGoogle}
            disabled={busy}
          >
            <GoogleIcon />
            {googleLoading ? 'Redirecting...' : 'Sign in with Google'}
          </BauhausButton>

          <BauhausDivider label="or continue with email" />

          {/* Email / password form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <BauhausLabel htmlFor="signin-email">Email</BauhausLabel>
              <BauhausInput
                id="signin-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                hasError={!!errors.email}
                {...register('email')}
              />
              <BauhausFieldError message={errors.email?.message} />
            </div>

            <div>
              <BauhausLabel htmlFor="signin-password">Password</BauhausLabel>
              <BauhausInput
                id="signin-password"
                type="password"
                autoComplete="current-password"
                placeholder="........"
                hasError={!!errors.password}
                {...register('password')}
              />
              <BauhausFieldError message={errors.password?.message} />
            </div>

            <BauhausButton type="submit" variant="red" fullWidth disabled={busy}>
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </BauhausButton>
          </form>
        </div>
      </div>
    </>
  )
}
