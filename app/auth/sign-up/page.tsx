// E3 S3.1: sign-up page (email/password + Google OAuth)
// Closes #18 #20

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { buildAuthCallbackUrl } from '@/lib/auth/utils'
import {
  AUTH_THROTTLE_MESSAGE,
  checkClientAuthThrottle,
  getFriendlyAuthErrorMessage,
} from '@/lib/auth/throttle'
import {
  BauhausLogo,
  BauhausLabel,
  BauhausInput,
  BauhausSelect,
  BauhausFieldError,
  BauhausServerError,
  BauhausButton,
  BauhausDivider,
  BauhausGeometricPanel,
  GoogleIcon,
} from '@/components/ui/bauhaus'

const signUpSchema = z
  .object({
    display_name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
    timezone: z.string().min(1, 'Please select a timezone'),
    child_name: z.string().optional(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

type SignUpData = z.infer<typeof signUpSchema>

const TIMEZONES = [
  { value: 'Asia/Karachi', label: 'Asia/Karachi (PKT, UTC+5)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST, UTC+4)' },
  { value: 'Asia/Riyadh', label: 'Asia/Riyadh (AST, UTC+3)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST)' },
  { value: 'America/New_York', label: 'America/New_York (EST/EDT)' },
  { value: 'America/Chicago', label: 'America/Chicago (CST/CDT)' },
  { value: 'America/Denver', label: 'America/Denver (MST/MDT)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST/PDT)' },
  { value: 'America/Toronto', label: 'America/Toronto (EST/EDT)' },
  { value: 'America/Vancouver', label: 'America/Vancouver (PST/PDT)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT, UTC+8)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST, UTC+9)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEDT/AEST)' },
  { value: 'Pacific/Auckland', label: 'Pacific/Auckland (NZST/NZDT)' },
]

export default function SignUpPage() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [accountType, setAccountType] = useState<'student' | 'parent' | 'tutor'>('student')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { timezone: 'Asia/Karachi' },
  })

  async function onSubmit(data: SignUpData) {
    setServerError(null)
    const throttle = checkClientAuthThrottle('sign_up', window.localStorage)
    if (!throttle.allowed) {
      setServerError(AUTH_THROTTLE_MESSAGE)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.display_name,
          timezone: data.timezone,
          role: accountType,
          ...(accountType === 'parent' && data.child_name ? { child_name: data.child_name } : {}),
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setServerError(
        getFriendlyAuthErrorMessage(
          error.message,
          'Could not create the account. Check the details and try again.',
        ),
      )
      return
    }
    router.push('/auth/verify')
  }

  async function signInWithGoogle() {
    setServerError(null)
    const throttle = checkClientAuthThrottle('oauth', window.localStorage)
    if (!throttle.allowed) {
      setServerError(AUTH_THROTTLE_MESSAGE)
      return
    }

    setGoogleLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: buildAuthCallbackUrl(window.location.origin, {
          flow: 'signup',
          accountType: accountType === 'parent' ? 'parent' : 'student',
        }),
      },
    })
    if (error) {
      setGoogleLoading(false)
      setServerError(
        getFriendlyAuthErrorMessage(
          error.message,
          'Could not start Google sign-up. Please try again.',
        ),
      )
    }
  }

  const busy = isSubmitting || googleLoading

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Right — geometric panel (shown on desktop only, renders first in DOM for visual balance) */}
      <div className="order-last lg:order-first">
        <BauhausGeometricPanel bg="#D02020" />
      </div>

      {/* Left — form */}
      <div className="flex flex-col bg-[#F0F0F0]">
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
            <div className="mb-6">
              <h1 className="text-3xl font-black uppercase tracking-tighter text-[#121212] leading-tight">
                Create Account
              </h1>
              <p className="mt-1 text-sm text-[#121212]/60">
                Already have an account?{' '}
                <Link
                  href="/auth/sign-in"
                  className="font-bold text-[#1040C0] underline underline-offset-2 hover:text-[#D02020]"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Account type selector */}
            <div className="mb-6">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-[#121212]/50">I am a</p>
              <div className="grid grid-cols-3 gap-1.5">
                {(['student', 'parent', 'tutor'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setAccountType(type)}
                    className={[
                      'border-2 py-2.5 text-[11px] font-black uppercase tracking-wide transition',
                      accountType === type
                        ? 'border-[#1040C0] bg-[#1040C0] text-white'
                        : 'border-[#D0D0D0] bg-white hover:border-[#1040C0] text-[#121212]',
                    ].join(' ')}
                  >
                    {type === 'student' ? 'Student' : type === 'parent' ? 'Parent' : 'Tutor'}
                  </button>
                ))}
              </div>
            </div>

            {/* Tutor redirect panel */}
            {accountType === 'tutor' && (
              <div className="mb-6 border-2 border-[#1040C0] bg-[#1040C0]/5 p-5 text-center">
                <p className="text-sm font-black uppercase tracking-wide text-[#121212] mb-2">
                  Applying as a Tutor?
                </p>
                <p className="text-xs text-[#121212]/60 mb-4 leading-relaxed">
                  Tutors have a separate application with additional fields.
                </p>
                <Link
                  href="/auth/sign-up/tutor"
                  className="inline-block border-2 border-[#1040C0] bg-[#1040C0] text-white px-5 py-2 text-xs font-black uppercase tracking-widest hover:bg-[#1040C0]/90 transition"
                >
                  Go to Tutor Application →
                </Link>
              </div>
            )}

          <BauhausServerError message={serverError} />

          {/* Google OAuth — only for student/parent */}
          {accountType !== 'tutor' && (
            <BauhausButton
              type="button"
              variant="outline"
              fullWidth
              onClick={signInWithGoogle}
              disabled={busy}
            >
              <GoogleIcon />
              {googleLoading ? 'Redirecting...' : 'Sign up with Google'}
            </BauhausButton>
          )}

          {accountType !== 'tutor' && <BauhausDivider label="or continue with email" />}

          {/* Sign-up form — hidden when tutor tab is active */}
          {accountType !== 'tutor' && (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <BauhausLabel htmlFor="su-name">Full name</BauhausLabel>
              <BauhausInput
                id="su-name"
                type="text"
                autoComplete="name"
                placeholder="Ahmed Khan"
                hasError={!!errors.display_name}
                {...register('display_name')}
              />
              <BauhausFieldError message={errors.display_name?.message} />
            </div>

            <div>
              <BauhausLabel htmlFor="su-email" required>Email</BauhausLabel>
              <BauhausInput
                id="su-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                hasError={!!errors.email}
                {...register('email')}
              />
              <BauhausFieldError message={errors.email?.message} />
            </div>

            <div>
              <BauhausLabel htmlFor="su-pw">Password</BauhausLabel>
              <BauhausInput
                id="su-pw"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                hasError={!!errors.password}
                {...register('password')}
              />
              <BauhausFieldError message={errors.password?.message} />
            </div>

            <div>
              <BauhausLabel htmlFor="su-pw2">Confirm password</BauhausLabel>
              <BauhausInput
                id="su-pw2"
                type="password"
                autoComplete="new-password"
                placeholder="........"
                hasError={!!errors.confirm_password}
                {...register('confirm_password')}
              />
              <BauhausFieldError message={errors.confirm_password?.message} />
            </div>

            <div>
              <BauhausLabel htmlFor="su-tz">Timezone</BauhausLabel>
              <BauhausSelect
                id="su-tz"
                hasError={!!errors.timezone}
                {...register('timezone')}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </BauhausSelect>
              <BauhausFieldError message={errors.timezone?.message} />
            </div>

            {/* Parent: child's name */}
            {accountType === 'parent' && (
              <div>
                <BauhausLabel htmlFor="su-childname">
                  Child&apos;s full name
                  <span className="ml-1 text-[#121212]/40 font-normal normal-case">(optional)</span>
                </BauhausLabel>
                <BauhausInput
                  id="su-childname"
                  type="text"
                  autoComplete="off"
                  placeholder="e.g. Ali Hassan"
                  {...register('child_name')}
                />
              </div>
            )}

            <BauhausButton type="submit" variant="red" fullWidth disabled={busy}>
              {isSubmitting
                ? 'Creating account...'
                : accountType === 'parent'
                ? 'Create Parent Account'
                : 'Create Account'}
            </BauhausButton>
          </form>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
