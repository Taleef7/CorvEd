// E3 T3.3: profile setup page (display name, WhatsApp number, timezone)
// Shown after first sign-in if whatsapp_number is not yet set.
// Closes #22

'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  BauhausLabel,
  BauhausInput,
  BauhausSelect,
  BauhausFieldError,
  BauhausServerError,
  BauhausButton,
  BauhausLogo,
  BauhausGeometricPanel,
} from '@/components/ui/bauhaus'

function normalizeWhatsApp(input: string): string {
  const stripped = input.replace(/[\s\-()]/g, '')
  if (stripped.startsWith('0')) return '+92' + stripped.slice(1)
  if (stripped.startsWith('92') && !stripped.startsWith('+')) return '+' + stripped
  return stripped
}

const profileSchema = z.object({
  display_name: z.string().min(2, 'Name must be at least 2 characters'),
  whatsapp_number: z
    .string()
    .min(9, 'Enter a valid WhatsApp number')
    .regex(/^[+\d][\d\s\-()]{7,}$/, 'Enter a valid phone number'),
  timezone: z.string().min(1, 'Please select a timezone'),
})

type ProfileFormData = z.infer<typeof profileSchema>

// Curated timezone list — Pakistan-first, then common international
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

export default function ProfileSetupPage() {
  const [serverError, setServerError] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { timezone: 'Asia/Karachi' },
  })

  // Auto-detect browser timezone and pre-fill
  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
    const match = TIMEZONES.find((tz) => tz.value === detected)
    if (match) setValue('timezone', match.value)
  }, [setValue])

  async function onSubmit(data: ProfileFormData) {
    setServerError(null)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/sign-in')
      return
    }

    const { error } = await supabase
      .from('user_profiles')
      .upsert(
        {
          user_id: user.id,
          display_name: data.display_name,
          whatsapp_number: normalizeWhatsApp(data.whatsapp_number),
          timezone: data.timezone,
        },
        { onConflict: 'user_id' }
      )

    if (error) {
      setServerError('Failed to save profile. Please try again.')
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — form */}
      <div className="flex flex-col items-center justify-center bg-[#F0F0F0] px-6 py-12">
        <div className="w-full max-w-sm">
          <BauhausLogo size="lg" />
          <h1 className="mt-4 text-3xl font-black uppercase tracking-tighter text-[#121212] leading-tight">
            Complete Profile
          </h1>
          <p className="mt-1 text-sm text-[#121212]/60">
            We need a few details before you can access your dashboard.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-4">
            {serverError && (
              <BauhausServerError message={serverError} />
            )}

            <div>
              <BauhausLabel htmlFor="ps-name">Full name</BauhausLabel>
              <BauhausInput
                id="ps-name"
                type="text"
                autoComplete="name"
                placeholder="Ahmed Khan"
                hasError={!!errors.display_name}
                {...register('display_name')}
              />
              <BauhausFieldError message={errors.display_name?.message} />
            </div>

            <div>
              <BauhausLabel htmlFor="ps-wa">WhatsApp number</BauhausLabel>
              <BauhausInput
                id="ps-wa"
                type="tel"
                autoComplete="tel"
                placeholder="+92 300 1234567 or 0300 1234567"
                hasError={!!errors.whatsapp_number}
                {...register('whatsapp_number')}
              />
              <p className="mt-1 text-xs text-[#121212]/50">
                Used by our team to send schedule updates. Local 03xx numbers are converted automatically.
              </p>
              <BauhausFieldError message={errors.whatsapp_number?.message} />
            </div>

            <div>
              <BauhausLabel htmlFor="ps-tz">Timezone</BauhausLabel>
              <BauhausSelect
                id="ps-tz"
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

            <BauhausButton type="submit" variant="red" fullWidth disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save and Continue'}
            </BauhausButton>
          </form>
        </div>
      </div>

      {/* Right — geometric panel */}
      <BauhausGeometricPanel bg="#D02020" />
    </div>
  )
}
