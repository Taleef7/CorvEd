// Client-side request form — receives subjects + initial timezone from server
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { requestSchema, RequestFormData } from '@/lib/validators/request'
import { WeeklyAvailabilityPicker, AvailabilityWindow } from '@/components/WeeklyAvailabilityPicker'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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

const PACKAGE_TIERS = [
  { value: 8,  label: '8 sessions / month', hint: '~2× per week — focused revision', highlight: false },
  { value: 12, label: '12 sessions / month', hint: '~3× per week — most popular', highlight: true },
  { value: 20, label: '20 sessions / month', hint: '~5× per week — intensive prep', highlight: false },
] as const

type Subject = { id: number; name: string; code: string }

interface RequestFormProps {
  subjects: Subject[]
  initialTimezone: string
}

export default function RequestForm({ subjects, initialTimezone }: RequestFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [, setDuplicateWarning] = useState<string | null>(null)

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
      timezone: initialTimezone,
      availability_windows: [],
    },
  })

  const requesterRole = watch('requester_role')
  const selectedLevel = watch('level')
  const selectedSubjectId = watch('subject_id')
  const availabilityWindows = (watch('availability_windows') as AvailabilityWindow[]) || []
  const selectedTier = watch('preferred_package_tier')
  const selectedTimezone = watch('timezone')
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId)

  async function onSubmit(data: RequestFormData) {
    setServerError(null)
    setDuplicateWarning(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

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
      const confirmed = window.confirm(
        'You already have an active request for this level and subject. Submit another one?'
      )
      if (!confirmed) return
      setDuplicateWarning('Duplicate request submitted.')
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
          preferred_package_tier: data.preferred_package_tier ?? null,
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

  const input =
    'w-full border-2 border-[#B0B0B0] px-3 py-2 text-sm placeholder:text-[#121212]/40 focus:border-[#1040C0] focus:outline-none focus:ring-1 focus:ring-[#1040C0] bg-white'
  const labelCls = 'mb-1 block text-sm font-bold uppercase tracking-wide text-[#121212]/70'
  const fieldError = (msg?: string) =>
    msg ? <p className="mt-1 text-xs text-[#D02020]">{msg}</p> : null

  return (
    <div className="min-h-screen bg-[#F0F0F0] px-4 py-10">
      <div className="mx-auto w-full max-w-2xl border-4 border-[#121212] bg-white px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[#121212]">
            New Tutoring Request
          </h1>
          <p className="mt-1 text-sm text-[#121212]/60">
            Tell us what you need help with. We&apos;ll match you with the right tutor.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          {serverError && (
            <p className="border-l-4 border-[#D02020] bg-[#D02020]/5 px-3 py-2 text-sm text-[#D02020]">
              {serverError}
            </p>
          )}

          {/* ── Who is this for? ─────────────────────────────────────── */}
          <section className="border-2 border-[#E0E0E0] p-5">
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-[#121212]/40">
              Step 1 — Who is this for?
            </p>
            <div className="flex gap-3">
              {(['student', 'parent'] as const).map((role) => (
                <label
                  key={role}
                  className={[
                    'flex flex-1 cursor-pointer items-center gap-3 border-2 px-4 py-3 transition',
                    requesterRole === role
                      ? 'border-[#1040C0] bg-[#1040C0]/5'
                      : 'border-[#D0D0D0] hover:border-[#1040C0]/50',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    value={role}
                    {...register('requester_role')}
                    className="accent-[#1040C0]"
                  />
                  <span className="text-sm font-black uppercase tracking-wide">
                    {role === 'student' ? "I'm a Student" : "I'm a Parent"}
                  </span>
                </label>
              ))}
            </div>

            {/* Parent: child's name */}
            {requesterRole === 'parent' && (
              <div className="mt-4">
                <label className={labelCls}>
                  Child&apos;s full name <span className="text-[#121212]/40 lowercase font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  {...register('for_student_name')}
                  className={input}
                  placeholder="e.g. Ali Hassan"
                />
                {fieldError(errors.for_student_name?.message)}
              </div>
            )}
          </section>

          {/* ── Subject & Level ──────────────────────────────────────── */}
          <section className="border-2 border-[#E0E0E0] p-5">
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-[#121212]/40">
              Step 2 — Subject &amp; Level
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Level *</label>
                <select {...register('level')} className={input}>
                  <option value="">Select level…</option>
                  <option value="o_levels">O Levels</option>
                  <option value="a_levels">A Levels</option>
                </select>
                {fieldError(errors.level?.message)}
              </div>

              <div>
                <label className={labelCls}>Subject *</label>
                <select
                  className={input}
                  value={selectedSubjectId ?? ''}
                  onChange={(e) => {
                    const v = e.target.value
                    setValue('subject_id', v === '' ? (0 as number) : Number(v), { shouldValidate: true })
                  }}
                >
                  <option value="">Select subject…</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {subjects.length === 0 && (
                  <p className="mt-1 text-[11px] text-[#D02020]">
                    No subjects available. Please contact admin.
                  </p>
                )}
                {fieldError(errors.subject_id?.message)}
              </div>
            </div>

            {selectedLevel && selectedSubject && (
              <div className="mt-3 inline-flex items-center gap-2 border-2 border-[#1040C0] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1040C0]">
                {selectedLevel === 'o_levels' ? 'O Levels' : 'A Levels'} — {selectedSubject.name}
              </div>
            )}

            <div className="mt-4">
              <label className={labelCls}>
                Exam board <span className="text-[#121212]/40 lowercase font-normal">(optional)</span>
              </label>
              <select {...register('exam_board')} className={input}>
                <option value="unspecified">Not sure / doesn&apos;t matter</option>
                <option value="cambridge">Cambridge</option>
                <option value="edexcel">Edexcel</option>
                <option value="other">Other</option>
              </select>
            </div>
          </section>

          {/* ── Package preference ───────────────────────────────────── */}
          <section className="border-2 border-[#E0E0E0] p-5">
            <p className="mb-1 text-xs font-black uppercase tracking-widest text-[#121212]/40">
              Step 3 — Preferred Package
            </p>
            <p className="mb-4 text-xs text-[#121212]/50">
              All sessions are 60 min via Google Meet. Pricing confirmed by admin after matching.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {PACKAGE_TIERS.map(({ value, hint, highlight }) => {
                const isSelected = selectedTier === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setValue(
                        'preferred_package_tier',
                        isSelected ? undefined : value,
                        { shouldValidate: true },
                      )
                    }
                    className={[
                      'relative flex cursor-pointer flex-col gap-1 border-2 p-4 text-left transition',
                      isSelected
                        ? 'border-[#1040C0] bg-[#1040C0]/5 ring-2 ring-[#1040C0]/30'
                        : 'border-[#D0D0D0] hover:border-[#1040C0]/50',
                    ].join(' ')}
                  >
                    {highlight && (
                      <span className="absolute -top-2.5 left-3 bg-[#1040C0] text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                        Most popular
                      </span>
                    )}
                    {isSelected && (
                      <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#1040C0] text-white text-xs">
                        ✓
                      </span>
                    )}
                    <span className="text-2xl font-black text-[#121212]">{value}</span>
                    <span className="text-[11px] font-bold uppercase tracking-wide text-[#121212]">
                      sessions/month
                    </span>
                    <span className="text-[10px] text-[#121212]/50 leading-relaxed">{hint}</span>
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-[10px] text-[#121212]/40">
              No preference? Leave unselected — admin will confirm the best fit.
            </p>
          </section>

          {/* ── Availability ─────────────────────────────────────────── */}
          <section className="border-2 border-[#E0E0E0] p-5">
            <p className="mb-1 text-xs font-black uppercase tracking-widest text-[#121212]/40">
              Step 4 — Your Availability *
            </p>
            <p className="mb-4 text-xs text-[#121212]/50">
              Tap/click the slots you&apos;re free for tutoring each week. We&apos;ll schedule within these windows.
            </p>

            <div className="mb-4">
              <label className={labelCls}>
                Timezone *
              </label>
              <select {...register('timezone')} className={input}>
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              {fieldError(errors.timezone?.message)}
            </div>

            <WeeklyAvailabilityPicker
              value={availabilityWindows}
              onChange={(windows) =>
                setValue('availability_windows', windows, { shouldValidate: true })
              }
              timezone={selectedTimezone}
              error={
                (errors.availability_windows as { message?: string } | undefined)?.message
              }
            />
          </section>

          {/* ── Goals & Start date ───────────────────────────────────── */}
          <section className="border-2 border-[#E0E0E0] p-5">
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-[#121212]/40">
              Step 5 — Goals &amp; Details
            </p>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>
                  Goals <span className="text-[#121212]/40 lowercase font-normal">(optional)</span>
                </label>
                <textarea
                  {...register('goals')}
                  rows={3}
                  className={input}
                  placeholder="e.g. Targeting A* in May 2026 exams; weak on organic chemistry and integration"
                />
                <p className="mt-1 text-[10px] text-[#121212]/40">
                  Target grade, upcoming exam date, or weak topics — the more detail, the better the match.
                </p>
              </div>

              <div>
                <label className={labelCls}>
                  Preferred start date <span className="text-[#121212]/40 lowercase font-normal">(optional)</span>
                </label>
                <input
                  type="date"
                  {...register('preferred_start_date')}
                  className={input}
                />
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex min-h-12 items-center justify-center border-2 border-[#121212] bg-[#1040C0] px-5 py-3 text-sm font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_0px_#121212] transition hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-60"
          >
            {isSubmitting ? 'Submitting…' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  )
}
