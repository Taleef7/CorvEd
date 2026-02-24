// E4 T4.1: New tutoring request form
// Closes #27, #25, #26

'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { requestSchema, RequestFormData } from '@/lib/validators/request'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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

type Subject = { id: number; name: string; code: string }

export default function NewRequestPage() {
  const router = useRouter()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [serverError, setServerError] = useState<string | null>(null)
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      requester_role: 'student',
      exam_board: 'unspecified',
      timezone: 'Asia/Karachi',
    },
  })

  const requesterRole = watch('requester_role')
  const selectedLevel = watch('level')
  const selectedSubjectId = watch('subject_id')
  const selectedSubject = subjects.find((s) => s.id === Number(selectedSubjectId))

  // Load subjects and pre-fill timezone from profile
  useEffect(() => {
    async function init() {
      const supabase = createClient()

      // Fetch subjects
      const { data: subjectRows } = await supabase
        .from('subjects')
        .select('id, name, code')
        .eq('active', true)
        .order('sort_order')
      if (subjectRows) setSubjects(subjectRows)

      // Pre-fill timezone from user profile
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('timezone')
          .eq('user_id', user.id)
          .single()
        if (profile?.timezone) {
          setValue('timezone', profile.timezone)
        }
      }
    }
    init()
  }, [setValue])

  async function onSubmit(data: RequestFormData) {
    setServerError(null)
    setDuplicateWarning(null)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/sign-in')
      return
    }

    // Check for duplicate active requests
    const { data: existing } = await supabase
      .from('requests')
      .select('id, status')
      .eq('created_by_user_id', user.id)
      .eq('level', data.level)
      .eq('subject_id', data.subject_id)
      .in('status', ['new', 'payment_pending'])
      .limit(1)

    if (existing && existing.length > 0) {
      const warningMessage =
        'You already have an active request for this level and subject. Are you sure you want to create another?'
      setDuplicateWarning(warningMessage)

      const proceed = window.confirm(warningMessage)
      if (!proceed) {
        // User chose not to create a duplicate request
        return
      }
    }

    const { data: req, error } = await supabase
      .from('requests')
      .insert([
        {
          created_by_user_id: user.id,
          requester_role: data.requester_role,
          for_student_name: data.for_student_name || null,
          level: data.level,
          subject_id: data.subject_id,
          exam_board: data.exam_board ?? 'unspecified',
          goals: data.goals || null,
          timezone: data.timezone,
          availability_windows: data.availability_windows,
          preferred_start_date: data.preferred_start_date || null,
          status: 'new',
        },
      ])
      .select()
      .single()

    if (error) {
      setServerError('Failed to submit your request. Please try again.')
      return
    }

    router.push(`/dashboard/requests/${req.id}`)
  }

  const inputClass =
    'w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100'
  const labelClass = 'mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300'

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-lg rounded-2xl bg-white px-8 py-10 shadow-md dark:bg-zinc-900">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            New tutoring request
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Tell us what you need help with. We&apos;ll match you with the right tutor.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {serverError && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {serverError}
            </p>
          )}
          {duplicateWarning && (
            <p className="rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
              ⚠️ {duplicateWarning}
            </p>
          )}

          {/* I am a */}
          <div>
            <p className={labelClass}>I am a</p>
            <div className="flex gap-4">
              {(['student', 'parent'] as const).map((role) => (
                <label key={role} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    value={role}
                    {...register('requester_role')}
                    className="accent-indigo-600"
                  />
                  <span className="capitalize text-zinc-700 dark:text-zinc-300">{role}</span>
                </label>
              ))}
            </div>
            {errors.requester_role && (
              <p className="mt-1 text-xs text-red-600">{errors.requester_role.message}</p>
            )}
          </div>

          {/* Child's name (only for parent) */}
          {requesterRole === 'parent' && (
            <div>
              <label className={labelClass}>Child&apos;s name (optional)</label>
              <input
                type="text"
                {...register('for_student_name')}
                className={inputClass}
                placeholder="e.g. Ali Hassan"
              />
              {errors.for_student_name && (
                <p className="mt-1 text-xs text-red-600">{errors.for_student_name.message}</p>
              )}
            </div>
          )}

          {/* Level */}
          <div>
            <label className={labelClass}>Level *</label>
            <select {...register('level')} className={inputClass}>
              <option value="">Select level…</option>
              <option value="o_levels">O Levels</option>
              <option value="a_levels">A Levels</option>
            </select>
            {errors.level && (
              <p className="mt-1 text-xs text-red-600">{errors.level.message}</p>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className={labelClass}>Subject *</label>
            <select {...register('subject_id', { valueAsNumber: true })} className={inputClass}>
              <option value="">Select subject…</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.subject_id && (
              <p className="mt-1 text-xs text-red-600">{errors.subject_id.message}</p>
            )}
          </div>

          {/* Summary badge */}
          {selectedLevel && selectedSubject && (
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
              {selectedLevel === 'o_levels' ? 'O Levels' : 'A Levels'} — {selectedSubject.name}
            </div>
          )}

          {/* Exam board */}
          <div>
            <label className={labelClass}>Exam board (optional)</label>
            <select {...register('exam_board')} className={inputClass}>
              <option value="unspecified">Not sure / doesn&apos;t matter</option>
              <option value="cambridge">Cambridge</option>
              <option value="edexcel">Edexcel</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Availability */}
          <div>
            <label className={labelClass}>Availability *</label>
            <textarea
              {...register('availability_windows')}
              rows={3}
              className={inputClass}
              placeholder="e.g. Monday and Wednesday 6–8 PM, Saturday 10 AM–12 PM (PKT)"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Describe the days and times you&apos;re free for tutoring sessions.
            </p>
            {errors.availability_windows && (
              <p className="mt-1 text-xs text-red-600">{errors.availability_windows.message}</p>
            )}
          </div>

          {/* Timezone */}
          <div>
            <label className={labelClass}>Timezone *</label>
            <select {...register('timezone')} className={inputClass}>
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

          {/* Goals */}
          <div>
            <label className={labelClass}>Goals (optional)</label>
            <textarea
              {...register('goals')}
              rows={3}
              className={inputClass}
              placeholder="e.g. Targeting A* in May 2025 exams; weak on organic chemistry and integration"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Target grade, upcoming exam date, or weak topics — the more detail, the better the match.
            </p>
          </div>

          {/* Preferred start date */}
          <div>
            <label className={labelClass}>Preferred start date (optional)</label>
            <input
              type="date"
              {...register('preferred_start_date')}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Submitting…' : 'Submit request'}
          </button>
        </form>
      </div>
    </div>
  )
}
