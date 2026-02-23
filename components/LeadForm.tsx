'use client'

import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { leadSchema, LeadFormData } from '@/lib/validators/lead'
import { WHATSAPP_NUMBER } from '@/lib/config'

const SUBJECTS = [
  { value: 'math', label: 'Mathematics' },
  { value: 'physics', label: 'Physics' },
  { value: 'chemistry', label: 'Chemistry' },
  { value: 'biology', label: 'Biology' },
  { value: 'english', label: 'English' },
  { value: 'cs', label: 'Computer Science' },
  { value: 'pak_studies', label: 'Pakistan Studies' },
  { value: 'islamiyat', label: 'Islamiyat' },
  { value: 'urdu', label: 'Urdu' },
] as const

export function LeadForm() {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
  })

  const role = useWatch({ control, name: 'role' })

  async function onSubmit(data: LeadFormData) {
    setSubmitError(null)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setSubmitError(
          (json as { error?: string }).error ??
            'Unable to submit your request. Please try again or contact us on WhatsApp.'
        )
        throw new Error('lead_submit_failed')
      }
    } catch (err) {
      if ((err as Error).message !== 'lead_submit_failed') {
        setSubmitError(
          'Something went wrong. Please try again or contact us on WhatsApp.'
        )
      }
      throw err
    }
  }

  if (isSubmitSuccessful) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <div className="mb-3 text-4xl">✅</div>
        <h3 className="text-xl font-bold text-zinc-900">Request received!</h3>
        <p className="mt-2 text-zinc-600">
          We&apos;ll contact you on WhatsApp within a few hours to confirm your details and begin
          the matching process.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, () => setSubmitError(null))}
      noValidate
      className="space-y-5"
    >
      {/* Full name */}
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-zinc-700">
          Full name <span className="text-red-500">*</span>
        </label>
        <input
          id="full_name"
          type="text"
          autoComplete="name"
          {...register('full_name')}
          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Your full name"
        />
        {errors.full_name && (
          <p className="mt-1 text-xs text-red-600">{errors.full_name.message}</p>
        )}
      </div>

      {/* WhatsApp number */}
      <div>
        <label htmlFor="whatsapp_number" className="block text-sm font-medium text-zinc-700">
          WhatsApp number <span className="text-red-500">*</span>
        </label>
        <input
          id="whatsapp_number"
          type="tel"
          autoComplete="tel"
          {...register('whatsapp_number')}
          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="+923001234567 or 03001234567"
        />
        {errors.whatsapp_number && (
          <p className="mt-1 text-xs text-red-600">{errors.whatsapp_number.message}</p>
        )}
      </div>

      {/* Role */}
      <fieldset>
        <legend className="text-sm font-medium text-zinc-700">
          I am a <span className="text-red-500">*</span>
        </legend>
        <div className="mt-2 flex gap-6">
          {(['student', 'parent'] as const).map((r) => (
            <label key={r} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                value={r}
                {...register('role')}
                className="h-4 w-4 border-zinc-300 text-indigo-600 focus:ring-indigo-500"
              />
              {r === 'student' ? 'Student' : 'Parent'}
            </label>
          ))}
        </div>
        {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>}
      </fieldset>

      {/* Child name (parent only) */}
      {role === 'parent' && (
        <div>
          <label htmlFor="child_name" className="block text-sm font-medium text-zinc-700">
            Child&apos;s name
          </label>
          <input
            id="child_name"
            type="text"
            {...register('child_name')}
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Your child's name (optional)"
          />
        </div>
      )}

      {/* Level */}
      <div>
        <label htmlFor="level" className="block text-sm font-medium text-zinc-700">
          Level <span className="text-red-500">*</span>
        </label>
        <select
          id="level"
          {...register('level')}
          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Select level</option>
          <option value="o_levels">O Levels</option>
          <option value="a_levels">A Levels</option>
        </select>
        {errors.level && <p className="mt-1 text-xs text-red-600">{errors.level.message}</p>}
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-zinc-700">
          Subject <span className="text-red-500">*</span>
        </label>
        <select
          id="subject"
          {...register('subject')}
          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Select subject</option>
          {SUBJECTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>}
      </div>

      {/* Exam board (optional) */}
      <div>
        <label htmlFor="exam_board" className="block text-sm font-medium text-zinc-700">
          Exam board <span className="text-zinc-400">(optional)</span>
        </label>
        <select
          id="exam_board"
          {...register('exam_board')}
          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Not sure / skip</option>
          <option value="cambridge">Cambridge</option>
          <option value="edexcel">Edexcel</option>
          <option value="other">Other</option>
          <option value="not_sure">Not sure</option>
        </select>
      </div>

      {/* Availability */}
      <div>
        <label htmlFor="availability" className="block text-sm font-medium text-zinc-700">
          Availability <span className="text-red-500">*</span>
        </label>
        <textarea
          id="availability"
          rows={3}
          {...register('availability')}
          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="e.g. Mon/Wed 6–8 PM PKT, or weekday evenings after 5 PM EST"
        />
        {errors.availability && (
          <p className="mt-1 text-xs text-red-600">{errors.availability.message}</p>
        )}
      </div>

      {/* City / Timezone */}
      <div>
        <label htmlFor="city_timezone" className="block text-sm font-medium text-zinc-700">
          City / Timezone <span className="text-red-500">*</span>
        </label>
        <input
          id="city_timezone"
          type="text"
          {...register('city_timezone')}
          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="e.g. Lahore (PKT) or Toronto (EST)"
        />
        {errors.city_timezone && (
          <p className="mt-1 text-xs text-red-600">{errors.city_timezone.message}</p>
        )}
      </div>

      {/* Goals (optional) */}
      <div>
        <label htmlFor="goals" className="block text-sm font-medium text-zinc-700">
          Goals <span className="text-zinc-400">(optional)</span>
        </label>
        <textarea
          id="goals"
          rows={3}
          {...register('goals')}
          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="e.g. Aiming for A* in Physics, exam in May 2026, struggling with mechanics"
        />
      </div>

      {/* Preferred package (optional) */}
      <fieldset>
        <legend className="text-sm font-medium text-zinc-700">
          Preferred package <span className="text-zinc-400">(optional)</span>
        </legend>
        <div className="mt-2 flex flex-wrap gap-4">
          {([
            { value: '8', label: '8 sessions/month (2×/week)' },
            { value: '12', label: '12 sessions/month (3×/week)' },
            { value: '20', label: '20 sessions/month (5×/week)' },
          ] as const).map((pkg) => (
            <label key={pkg.value} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                value={pkg.value}
                {...register('preferred_package')}
                className="h-4 w-4 border-zinc-300 text-indigo-600 focus:ring-indigo-500"
              />
              {pkg.label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Submit error */}
      {submitError && (
        <p className="text-sm text-red-600">
          {submitError} Please try again or{' '}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            message us on WhatsApp
          </a>
          .
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <svg
              className="h-5 w-5 animate-spin text-indigo-100"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span>Submitting…</span>
          </>
        ) : (
          'Submit Request'
        )}
      </button>
    </form>
  )
}
