// Tutor application sign-up page
// Distinct from student/parent sign-up: collects professional background.
// Subjects and weekly availability are completed on /tutor/profile after verification.

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
} from '@/components/ui/bauhaus'

const tutorSignUpSchema = z
  .object({
    display_name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
    timezone: z.string().min(1, 'Please select a timezone'),
    bio: z
      .string()
      .min(30, 'Please write at least 30 characters about yourself')
      .max(600, 'Keep bio under 600 characters'),
    experience_years: z
      .string()
      .min(1, 'Please select your experience level'),
    education: z.string().min(3, 'Please enter your highest qualification'),
    teaching_approach: z.string().optional(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

type TutorSignUpData = z.infer<typeof tutorSignUpSchema>

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

const EXPERIENCE_OPTIONS = [
  { value: '0', label: 'Less than 1 year' },
  { value: '1', label: '1 – 2 years' },
  { value: '2', label: '2 – 5 years' },
  { value: '5', label: '5 – 10 years' },
  { value: '10', label: '10+ years' },
]

export default function TutorSignUpPage() {
  const [serverError, setServerError] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TutorSignUpData>({
    resolver: zodResolver(tutorSignUpSchema),
    defaultValues: { timezone: 'Asia/Karachi' },
  })

  const bio = watch('bio') ?? ''

  async function onSubmit(data: TutorSignUpData) {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.display_name,
          timezone: data.timezone,
          role: 'tutor',
          bio: data.bio,
          experience_years: data.experience_years,
          education: data.education,
          teaching_approach: data.teaching_approach ?? '',
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setServerError(error.message)
      return
    }
    router.push('/auth/verify')
  }

  const inputClass = `w-full border-2 border-[#B0B0B0] px-3 py-2 text-sm placeholder:text-[#121212]/40 
    focus:border-[#1040C0] focus:outline-none focus:ring-1 focus:ring-[#1040C0] bg-white`
  const labelClass = 'mb-1 block text-xs font-black uppercase tracking-widest text-[#121212]/60'

  const section = (step: number, title: string, children: React.ReactNode) => (
    <section className="border-2 border-[#E0E0E0] p-5 space-y-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-[#121212]/40">
        Step {step} — {title}
      </p>
      {children}
    </section>
  )

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Right panel — Bauhaus decoration */}
      <div className="order-last lg:order-first">
        <BauhausGeometricPanel bg="#1040C0" />
      </div>

      {/* Left — form */}
      <div className="flex flex-col bg-[#F0F0F0]">
        {/* Top bar */}
        <div className="border-b-2 border-[#121212] bg-[#F0F0F0] px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center gap-2 font-bold text-[#121212] hover:text-[#D02020] transition-colors"
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
        <div className="flex-1 overflow-y-auto px-6 py-10">
          <div className="mx-auto w-full max-w-md">
            {/* Header */}
            <div className="mb-2">
              <span className="inline-block bg-[#1040C0] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 mb-3">
                Tutor Application
              </span>
              <h1 className="text-3xl font-black uppercase tracking-tighter text-[#121212] leading-tight">
                Apply as a Tutor
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

            {/* Info note */}
            <div className="mb-6 border-l-4 border-[#F0C020] bg-white px-4 py-3">
              <p className="text-xs text-[#121212]/70 leading-relaxed">
                After verifying your email and signing in, you&apos;ll complete your tutor profile
                — including subjects taught and weekly availability. Applications are reviewed
                within 24–48 hours.
              </p>
            </div>

            <BauhausServerError message={serverError} />

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

              {/* Step 1: Account */}
              {section(1, 'Your Account', (
                <>
                  <div>
                    <BauhausLabel htmlFor="t-name">Full name *</BauhausLabel>
                    <BauhausInput
                      id="t-name"
                      type="text"
                      autoComplete="name"
                      placeholder="e.g. Sara Ahmed"
                      hasError={!!errors.display_name}
                      {...register('display_name')}
                    />
                    <BauhausFieldError message={errors.display_name?.message} />
                  </div>

                  <div>
                    <BauhausLabel htmlFor="t-email" required>Email *</BauhausLabel>
                    <BauhausInput
                      id="t-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      hasError={!!errors.email}
                      {...register('email')}
                    />
                    <BauhausFieldError message={errors.email?.message} />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <BauhausLabel htmlFor="t-pw">Password *</BauhausLabel>
                      <BauhausInput
                        id="t-pw"
                        type="password"
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        hasError={!!errors.password}
                        {...register('password')}
                      />
                      <BauhausFieldError message={errors.password?.message} />
                    </div>
                    <div>
                      <BauhausLabel htmlFor="t-pw2">Confirm *</BauhausLabel>
                      <BauhausInput
                        id="t-pw2"
                        type="password"
                        autoComplete="new-password"
                        placeholder="........"
                        hasError={!!errors.confirm_password}
                        {...register('confirm_password')}
                      />
                      <BauhausFieldError message={errors.confirm_password?.message} />
                    </div>
                  </div>

                  <div>
                    <BauhausLabel htmlFor="t-tz">Timezone *</BauhausLabel>
                    <BauhausSelect
                      id="t-tz"
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
                </>
              ))}

              {/* Step 2: Professional background */}
              {section(2, 'Your Background', (
                <>
                  <div>
                    <label className={labelClass} htmlFor="t-exp">
                      Teaching experience *
                    </label>
                    <select id="t-exp" {...register('experience_years')} className={inputClass}>
                      <option value="">Select experience level…</option>
                      {EXPERIENCE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    {errors.experience_years && (
                      <p className="mt-1 text-xs text-[#D02020]">{errors.experience_years.message}</p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="t-edu">
                      Highest qualification *
                    </label>
                    <BauhausInput
                      id="t-edu"
                      type="text"
                      placeholder="e.g. BSc Mathematics, University of Karachi"
                      hasError={!!errors.education}
                      {...register('education')}
                    />
                    <BauhausFieldError message={errors.education?.message} />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="t-bio">
                      About you * <span className="text-[#121212]/40 font-normal normal-case">(30–600 characters)</span>
                    </label>
                    <textarea
                      id="t-bio"
                      rows={4}
                      placeholder="Describe your teaching background, the students you've worked with, and what makes you an effective tutor…"
                      className={inputClass}
                      {...register('bio')}
                    />
                    <div className="mt-1 flex justify-between">
                      {errors.bio ? (
                        <p className="text-xs text-[#D02020]">{errors.bio.message}</p>
                      ) : (
                        <span />
                      )}
                      <span className={`text-[10px] ${bio.length > 600 ? 'text-[#D02020]' : 'text-[#121212]/40'}`}>
                        {bio.length}/600
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="t-approach">
                      Teaching approach <span className="text-[#121212]/40 font-normal normal-case">(optional)</span>
                    </label>
                    <textarea
                      id="t-approach"
                      rows={3}
                      placeholder="e.g. I focus on building conceptual understanding before tackling exam technique…"
                      className={inputClass}
                      {...register('teaching_approach')}
                    />
                  </div>
                </>
              ))}

              {/* What happens next */}
              <div className="border-2 border-[#E0E0E0] bg-white p-5">
                <p className="text-xs font-black uppercase tracking-widest text-[#121212]/40 mb-3">
                  After you apply
                </p>
                <ul className="space-y-2">
                  {[
                    'Verify your email address',
                    'Complete your tutor profile (subjects, availability)',
                    'Admin reviews your application within 24–48 hours',
                    'Once approved, you start receiving student matches',
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#121212]/60">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border-2 border-[#1040C0] text-[9px] font-black text-[#1040C0]">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              <BauhausButton type="submit" variant="blue" fullWidth disabled={isSubmitting}>
                {isSubmitting ? 'Submitting application…' : 'Submit Tutor Application'}
              </BauhausButton>
            </form>

            <p className="mt-4 text-center text-xs text-[#121212]/40">
              Not a tutor?{' '}
              <Link href="/auth/sign-up" className="font-bold text-[#1040C0] hover:text-[#D02020]">
                Student / Parent sign-up →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
