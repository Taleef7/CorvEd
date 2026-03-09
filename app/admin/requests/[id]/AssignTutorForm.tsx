// E7 T7.2 T7.3: Client component for the tutor assignment form on the matching screen
// Closes #48 #49

'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { assignTutor } from '../actions'

const DAY_OPTIONS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
]

const DAY_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

type AvailWindow = { day: number; start: string; end: string }

export type EligibleTutor = {
  tutor_user_id: string
  bio: string | null
  timezone: string
  user_profiles: { display_name: string; whatsapp_number: string | null } | null
  tutor_availability: { windows: AvailWindow[] } | null
}

type ActionResult = { error?: string; matchId?: string } | undefined

async function assignAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const requestId = formData.get('requestId') as string
  const tutorUserId = formData.get('tutorUserId') as string
  const meetLink = (formData.get('meetLink') as string) || undefined
  const timezone = formData.get('timezone') as string
  const time = formData.get('time') as string
  const rawDays = formData.getAll('days').map(Number)

  const schedulePattern =
    timezone && time && rawDays.length > 0
      ? { timezone, days: rawDays, time, duration_mins: 60 }
      : undefined

  const hasAnyScheduleField = !!timezone || !!time || rawDays.length > 0
  const hasAllScheduleFields = !!timezone && !!time && rawDays.length > 0
  if (hasAnyScheduleField && !hasAllScheduleFields) {
    return {
      error: 'Please provide timezone, start time, and at least one day — or leave all schedule fields empty to save the schedule later.',
    }
  }

  return assignTutor({ requestId, tutorUserId, meetLink, schedulePattern })
}

/** Visual availability calendar: 7 columns (days), time-block rows colour-coded */
function AvailabilityCalendar({ windows }: { windows: AvailWindow[] }) {
  if (windows.length === 0) {
    return <p className="text-xs text-[#121212]/40 italic">No availability set</p>
  }

  // Group windows by day
  const byDay: Record<number, AvailWindow[]> = {}
  for (const w of windows) {
    if (!byDay[w.day]) byDay[w.day] = []
    byDay[w.day].push(w)
  }

  return (
    <div className="grid grid-cols-7 gap-px border border-[#D0D0D0] bg-[#D0D0D0] text-[10px] font-bold">
      {DAY_SHORT.map((day, idx) => {
        const slots = byDay[idx] ?? []
        return (
          <div key={idx} className="bg-white">
            <div className={`px-1 py-0.5 text-center uppercase tracking-wide ${slots.length > 0 ? 'bg-[#1040C0] text-white' : 'text-[#121212]/30'}`}>
              {day}
            </div>
            <div className="space-y-px p-0.5">
              {slots.length === 0 ? (
                <div className="rounded-sm bg-[#F0F0F0] py-1 text-center text-[#121212]/20">—</div>
              ) : (
                slots.map((s, si) => (
                  <div key={si} className="rounded-sm bg-[#1040C0]/10 px-0.5 py-1 text-center text-[#1040C0] leading-tight">
                    {s.start}
                    <br />
                    {s.end}
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Single collapsible tutor card */
function TutorCard({
  tutor,
  isSelected,
  onSelect,
}: {
  tutor: EligibleTutor
  isSelected: boolean
  onSelect: () => void
}) {
  const [expanded, setExpanded] = useState(isSelected)
  const windows = tutor.tutor_availability?.windows ?? []
  const name = tutor.user_profiles?.display_name ?? '—'

  return (
    <div
      className={`border-2 transition ${
        isSelected ? 'border-[#1040C0]' : 'border-[#D0D0D0]'
      } bg-white`}
    >
      {/* Header row — always visible */}
      <div
        className="flex cursor-pointer items-center gap-3 px-4 py-3 select-none"
        onClick={() => {
          onSelect()
          setExpanded(true)
        }}
      >
        <input
          type="radio"
          name="tutor_select_display"
          checked={isSelected}
          onChange={onSelect}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4 flex-shrink-0 accent-[#1040C0]"
        />
        <span className="flex-1 font-semibold text-[#121212]">{name}</span>
        <span className="text-xs text-[#121212]/40">{tutor.timezone}</span>
        <button
          type="button"
          aria-label={expanded ? 'Collapse' : 'Expand'}
          onClick={(e) => {
            e.stopPropagation()
            setExpanded((v) => !v)
          }}
          className="ml-1 flex h-6 w-6 flex-shrink-0 items-center justify-center border border-[#D0D0D0] text-xs text-[#121212]/60 hover:border-[#1040C0] hover:text-[#1040C0]"
        >
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-[#E0E0E0] px-4 py-3 space-y-3">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#121212]/40">
              Availability
            </p>
            <AvailabilityCalendar windows={windows} />
          </div>
          {tutor.bio && (
            <div>
              <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-[#121212]/40">
                Bio
              </p>
              <p className="text-xs text-[#121212]/60 leading-relaxed">{tutor.bio}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function AssignTutorForm({
  requestId,
  requestTimezone,
  eligibleTutors,
}: {
  requestId: string
  requestTimezone: string
  eligibleTutors: EligibleTutor[]
}) {
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(null)
  const [state, formAction, isPending] = useActionState(assignAction, undefined)

  if (state?.matchId) {
    return (
      <div className="border-2 border-[#121212] bg-white px-6 py-5 text-[#121212]">
        <p className="font-semibold">✅ Tutor assigned successfully!</p>
        <p className="mt-1 text-sm">
          The request has been moved to &ldquo;Matched&rdquo; status.{' '}
          <a href={`/admin/matches/${state.matchId}`} className="underline hover:no-underline">
            View match →
          </a>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-[#121212]">Eligible Tutors</h2>

      {eligibleTutors.length === 0 ? (
        <div className="border-2 border-[#D0D0D0] bg-white px-6 py-8 text-center">
          <p className="text-[#121212]/60">
            No approved tutors currently match this subject and level.
          </p>
          <p className="mt-1 text-sm text-[#121212]/40">
            Approve a tutor at{' '}
            <Link href="/admin/tutors" className="font-bold text-[#1040C0] underline-offset-4 hover:underline">
              /admin/tutors
            </Link>{' '}
            and ensure they have this subject × level added.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {eligibleTutors.map((tutor) => (
            <TutorCard
              key={tutor.tutor_user_id}
              tutor={tutor}
              isSelected={selectedTutorId === tutor.tutor_user_id}
              onSelect={() => setSelectedTutorId(tutor.tutor_user_id)}
            />
          ))}
        </div>
      )}

      {/* Assignment form — shown after tutor is selected */}
      {selectedTutorId && (
        <form
          action={formAction}
          className="space-y-4 border-2 border-[#1040C0] bg-[#1040C0]/5 p-5"
        >
          <h3 className="font-semibold text-[#121212]">Assignment Details</h3>

          <input type="hidden" name="requestId" value={requestId} />
          <input type="hidden" name="tutorUserId" value={selectedTutorId} />

          <div>
            <label className="block text-sm font-medium text-[#121212]/80">
              Google Meet Link{' '}
              <span className="font-normal text-[#121212]/40">(optional — can be added later)</span>
            </label>
            <input
              type="url"
              name="meetLink"
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              className="mt-1 w-full border border-[#B0B0B0] px-3 py-2 text-sm focus:border-[#1040C0] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#121212]/80">
              Schedule Timezone{' '}
              <span className="font-normal text-[#121212]/40">(optional — defaults to student&apos;s)</span>
            </label>
            <input
              type="text"
              name="timezone"
              defaultValue={requestTimezone}
              placeholder="e.g. Asia/Karachi"
              className="mt-1 w-full border border-[#B0B0B0] px-3 py-2 text-sm focus:border-[#1040C0] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#121212]/80">
              Days of Week{' '}
              <span className="font-normal text-[#121212]/40">(optional)</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {DAY_OPTIONS.map(({ label, value }) => (
                <label key={value} className="flex cursor-pointer items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    name="days"
                    value={value}
                    className="h-4 w-4 accent-[#1040C0]"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#121212]/80">
              Start Time{' '}
              <span className="font-normal text-[#121212]/40">(optional — 24 h format)</span>
            </label>
            <input
              type="time"
              name="time"
              className="mt-1 border border-[#B0B0B0] px-3 py-2 text-sm focus:border-[#1040C0] focus:outline-none"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="bg-[#1040C0] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0830A0] disabled:opacity-60"
          >
            {isPending ? 'Assigning…' : 'Assign Tutor'}
          </button>
        </form>
      )}
    </div>
  )
}
