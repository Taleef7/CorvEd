// E6 T6.1 T6.3: Tutor profile form — subjects, levels, availability, bio, timezone
// E12 T12.2: Added code of conduct acknowledgement checkbox
// Closes #40 #42 #79

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { tutorProfileSchema, TutorProfileFormData } from '@/lib/validators/tutor'
import { saveTutorProfile } from './actions'

const TIMEZONES = [
  { value: 'Asia/Karachi', label: 'Asia/Karachi (PKT, UTC+5)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST, UTC+4)' },
  { value: 'Asia/Riyadh', label: 'Asia/Riyadh (AST, UTC+3)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST)' },
  { value: 'America/New_York', label: 'America/New_York (EST/EDT)' },
  { value: 'America/Chicago', label: 'America/Chicago (CST/CDT)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST/PDT)' },
  { value: 'America/Toronto', label: 'America/Toronto (EST/EDT)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT, UTC+8)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST, UTC+9)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEDT/AEST)' },
]

// Day names: index 0 = Sunday, consistent with JavaScript's Date.getDay()
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Time blocks: each block is a checkable availability window
const TIME_BLOCKS: { label: string; start: string; end: string }[] = [
  { label: 'Morning (6 AM–10 AM)', start: '06:00', end: '10:00' },
  { label: 'Midday (10 AM–2 PM)', start: '10:00', end: '14:00' },
  { label: 'Afternoon (2 PM–6 PM)', start: '14:00', end: '18:00' },
  { label: 'Evening (6 PM–10 PM)', start: '18:00', end: '22:00' },
]

type Subject = { id: number; name: string; code: string }

type AvailWindow = { day: number; start: string; end: string }

type TutorProfileFormProps = {
  subjects: Subject[]
  defaultValues?: {
    bio: string
    timezone: string
    subjectEntries: { subject_id: number; level: 'o_levels' | 'a_levels' }[]
    availWindows: AvailWindow[]
  }
  approved: boolean | null
}

export function TutorProfileForm({ subjects, defaultValues, approved }: TutorProfileFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)

  // Track selected subjects × levels as a set of "subjectId:level" strings
  const initialSubjectSet = new Set(
    (defaultValues?.subjectEntries ?? []).map((s) => `${s.subject_id}:${s.level}`)
  )
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(initialSubjectSet)

  // Track selected availability as a set of "day|start|end" strings
  // Use '|' delimiter because start/end contain colons (HH:MM)
  const initialAvailSet = new Set(
    (defaultValues?.availWindows ?? []).map((w) => `${w.day}|${w.start}|${w.end}`)
  )
  const [selectedAvail, setSelectedAvail] = useState<Set<string>>(initialAvailSet)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TutorProfileFormData>({
    resolver: zodResolver(tutorProfileSchema),
    defaultValues: {
      bio: defaultValues?.bio ?? '',
      timezone: defaultValues?.timezone ?? 'Asia/Karachi',
      subjects: defaultValues?.subjectEntries ?? [],
      availability: defaultValues?.availWindows ?? [],
      // Pre-check conduct if the tutor already has a profile (they agreed on first submit)
      conductAcknowledged: approved !== null,
    },
  })

  function toggleSubject(subjectId: number, level: 'o_levels' | 'a_levels') {
    const key = `${subjectId}:${level}`
    setSelectedSubjects((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      // Sync into RHF so zodResolver can validate the subjects array
      const entries = Array.from(next).map((k) => {
        const [sid, lvl] = k.split(':')
        return { subject_id: Number(sid), level: lvl as 'o_levels' | 'a_levels' }
      })
      setValue('subjects', entries, { shouldValidate: true })
      return next
    })
  }

  function toggleAvail(day: number, start: string, end: string) {
    const key = `${day}|${start}|${end}`
    setSelectedAvail((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      // Sync into RHF so zodResolver can validate the availability array
      const windows = Array.from(next).map((k) => {
        const [d, s, e] = k.split('|')
        return { day: Number(d), start: s, end: e }
      })
      setValue('availability', windows, { shouldValidate: true })
      return next
    })
  }

  async function onSubmit(data: TutorProfileFormData) {
    setServerError(null)

    // data.subjects and data.availability are already validated by zodResolver
    // and kept in sync with the checkbox/grid state via setValue in the toggle handlers.
    const result = await saveTutorProfile(data.bio, data.timezone, data.subjects, data.availability)

    if (result.error) {
      setServerError(result.error)
      toast.error('Failed to save profile', { description: result.error })
      return
    }
    toast.success('Profile saved!', {
      description: approved === false ? 'Your application is pending admin approval.' : 'Your changes have been saved.',
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      {/* Approval status badge */}
      <div>
        {approved === true && (
          <span className="inline-flex items-center border-2 border-[#121212] bg-[#121212] px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
            ✅ Approved — you can be matched with students
          </span>
        )}
        {approved === false && (
          <span className="inline-flex items-center border-2 border-[#F0C020] bg-[#F0C020] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#121212]">
            ⏳ Pending approval — the admin will review your application
          </span>
        )}
        {approved === null && (
          <span className="inline-flex items-center rounded-full bg-[#E0E0E0] px-3 py-1 text-sm font-medium text-[#121212]/70 ">
            Fill in your profile below and submit to apply
          </span>
        )}
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-semibold text-[#121212]/80">
          Bio <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <p className="mt-0.5 text-xs text-[#121212]/60">
          2–5 sentences: describe your teaching experience, style, and the subjects/levels you excel at.
        </p>
        <textarea
          id="bio"
          rows={5}
          aria-required="true"
          aria-invalid={errors.bio ? 'true' : 'false'}
          {...register('bio')}
          className="mt-2 block w-full  border border-[#B0B0B0] px-3 py-2 text-sm focus:border-[#1040C0] focus:outline-none focus:ring-1 focus:ring-[#1040C0] "
          placeholder="e.g. I have 5 years of experience teaching A Level Mathematics at Cambridge board, focusing on building conceptual foundations before exam technique..."
        />
        {errors.bio && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {errors.bio.message}
          </p>
        )}
      </div>

      {/* Timezone */}
      <div>
        <label htmlFor="timezone" className="block text-sm font-semibold text-[#121212]/80">
          Timezone <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <select
          id="timezone"
          aria-required="true"
          {...register('timezone')}
          className="mt-2 block w-full  border border-[#B0B0B0] px-3 py-2 text-sm focus:border-[#1040C0] focus:outline-none focus:ring-1 focus:ring-[#1040C0] "
        >
          {TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
        {errors.timezone && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {errors.timezone.message}
          </p>
        )}
      </div>

      {/* Subjects × Levels */}
      <div role="group" aria-labelledby="subjects-label" aria-describedby={errors.subjects ? 'subjects-error' : undefined}>
        <p id="subjects-label" className="block text-sm font-semibold text-[#121212]/80">
          Subjects &amp; Levels <span className="text-red-500" aria-hidden="true">*</span>
        </p>
        <p className="mt-0.5 text-xs text-[#121212]/60">
          Select every subject and level combination you are able to teach.
        </p>
        {errors.subjects && (
          <p id="subjects-error" role="alert" className="mt-1 text-xs text-red-600">{errors.subjects.message}</p>
        )}
        <div className="mt-3 overflow-x-auto  border border-[#D0D0D0] ">
          <table className="min-w-full text-sm">
            <thead className="bg-[#121212]">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-white">
                  Subject
                </th>
                <th className="px-4 py-2 text-center font-semibold text-white">
                  O Levels
                </th>
                <th className="px-4 py-2 text-center font-semibold text-white">
                  A Levels
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {subjects.map((subject) => (
                <tr key={subject.id} className="hover:bg-[#F0F0F0]/50">
                  <td className="px-4 py-2 font-medium text-[#121212]">
                    {subject.name}
                  </td>
                  {(['o_levels', 'a_levels'] as const).map((lvl) => (
                    <td key={lvl} className="px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        aria-label={`${subject.name} — ${lvl === 'o_levels' ? 'O Levels' : 'A Levels'}`}
                        checked={selectedSubjects.has(`${subject.id}:${lvl}`)}
                        onChange={() => toggleSubject(subject.id, lvl)}
                        className="h-4 w-4 rounded border-[#B0B0B0] text-[#1040C0] focus:ring-[#1040C0]"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Availability grid */}
      <div role="group" aria-labelledby="availability-label" aria-describedby={errors.availability ? 'availability-error' : undefined}>
        <p id="availability-label" className="block text-sm font-semibold text-[#121212]/80">
          Availability <span className="text-red-500" aria-hidden="true">*</span>
        </p>
        <p className="mt-0.5 text-xs text-[#121212]/60">
          Tick every day and time block when you are generally available to teach (all times in your chosen timezone).
        </p>
        {errors.availability && (
          <p id="availability-error" role="alert" className="mt-1 text-xs text-red-600">{errors.availability.message}</p>
        )}
        <div className="mt-3 overflow-x-auto  border border-[#D0D0D0] ">
          <table className="min-w-full text-sm">
            <thead className="bg-[#121212]">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-white">
                  Time block
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className="px-3 py-2 text-center font-semibold text-white"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {TIME_BLOCKS.map((block) => (
                <tr key={block.start} className="hover:bg-[#F0F0F0]/50">
                  <td className="whitespace-nowrap px-3 py-2 text-[#121212]/80">
                    {block.label}
                  </td>
                  {DAYS.map((_, dayIndex) => (
                    <td key={dayIndex} className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        aria-label={`${DAYS[dayIndex]} ${block.label}`}
                        checked={selectedAvail.has(`${dayIndex}|${block.start}|${block.end}`)}
                        onChange={() => toggleAvail(dayIndex, block.start, block.end)}
                        className="h-4 w-4 rounded border-[#B0B0B0] text-[#1040C0] focus:ring-[#1040C0]"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Server error */}
      {serverError && (
        <p role="alert" className="text-sm text-red-600">
          {serverError}
        </p>
      )}

      {/* E12 T12.2: Code of conduct acknowledgement (required) */}
      <div className=" border border-[#D0D0D0] bg-[#F0F0F0] p-4 /50">
        <div className="flex items-start gap-3">
          <input
            id="conductAcknowledged"
            type="checkbox"
            aria-required="true"
            aria-invalid={errors.conductAcknowledged ? 'true' : 'false'}
            {...register('conductAcknowledged')}
            className="mt-0.5 h-4 w-4 rounded border-[#B0B0B0] text-[#1040C0] focus:ring-[#1040C0]"
          />
          <div className="text-sm text-[#121212]/80">
            <label htmlFor="conductAcknowledged" className="cursor-pointer">
              I have read and agree to the CorvEd Tutor Code of Conduct
            </label>{' '}
            <Link
              href="/tutor/conduct"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#1040C0] hover:text-[#0830A0] underline underline-offset-2"
            >
              View Code of Conduct →
            </Link>{' '}
            <span className="text-red-500" aria-hidden="true">*</span>
          </div>
        </div>
        {errors.conductAcknowledged && (
          <p role="alert" className="mt-2 text-xs text-red-600">
            {errors.conductAcknowledged.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center gap-2  bg-[#1040C0] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0830A0] focus:outline-none focus:ring-2 focus:ring-[#1040C0] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Saving…' : 'Save profile'}
      </button>
    </form>
  )
}
