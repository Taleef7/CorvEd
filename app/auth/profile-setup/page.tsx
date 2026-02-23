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
      .update({
        display_name: data.display_name,
        whatsapp_number: normalizeWhatsApp(data.whatsapp_number),
        timezone: data.timezone,
      })
      .eq('user_id', user.id)

    if (error) {
      setServerError('Failed to save profile. Please try again.')
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10 dark:bg-zinc-950">
      <div className="w-full max-w-md rounded-2xl bg-white px-8 py-10 shadow-md dark:bg-zinc-900">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Complete your profile
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            We need a few details before you can access your dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {serverError && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {serverError}
            </p>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Full name
            </label>
            <input
              type="text"
              autoComplete="name"
              {...register('display_name')}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="Ahmed Khan"
            />
            {errors.display_name && (
              <p className="mt-1 text-xs text-red-600">{errors.display_name.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              WhatsApp number
            </label>
            <input
              type="tel"
              autoComplete="tel"
              {...register('whatsapp_number')}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="+92 300 1234567 or 0300 1234567"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Used by our team to send schedule updates. Local Pakistani numbers (03xx…) are converted automatically.
            </p>
            {errors.whatsapp_number && (
              <p className="mt-1 text-xs text-red-600">{errors.whatsapp_number.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Timezone
            </label>
            <select
              {...register('timezone')}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
            {errors.timezone && (
              <p className="mt-1 text-xs text-red-600">{errors.timezone.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Saving…' : 'Save and continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
