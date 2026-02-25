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

  return assignTutor({ requestId, tutorUserId, meetLink, schedulePattern })
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
      <div className="rounded-xl bg-emerald-50 px-6 py-5 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
        <p className="font-semibold">✅ Tutor assigned successfully!</p>
        <p className="mt-1 text-sm">
          The request has been moved to &ldquo;Matched&rdquo; status.{' '}
          <a
            href={`/admin/matches/${state.matchId}`}
            className="underline hover:no-underline"
          >
            View match →
          </a>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Eligible Tutors</h2>

      {eligibleTutors.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white px-6 py-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-zinc-500">
            No approved tutors currently match this subject and level.
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            Approve a tutor at{' '}
            <Link href="/admin/tutors" className="text-indigo-600 hover:underline dark:text-indigo-400">
              /admin/tutors
            </Link>{' '}
            and ensure they have this subject × level added.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {eligibleTutors.map((tutor) => {
            const isSelected = selectedTutorId === tutor.tutor_user_id
            const windows = tutor.tutor_availability?.windows ?? []
            const availSummary = windows
              .sort((a, b) => a.day - b.day)
              .map((w) => `${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][w.day]} ${w.start}–${w.end}`)
              .join(', ')

            return (
              <div
                key={tutor.tutor_user_id}
                onClick={() => setSelectedTutorId(tutor.tutor_user_id)}
                className={`cursor-pointer rounded-xl border p-4 transition ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900/20'
                    : 'border-zinc-200 bg-white hover:border-indigo-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-indigo-600'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {tutor.user_profiles?.display_name ?? '—'}
                    </p>
                    <p className="text-sm text-zinc-500">Timezone: {tutor.timezone}</p>
                    {availSummary && (
                      <p className="mt-1 text-xs text-zinc-400">
                        Available: {availSummary}
                      </p>
                    )}
                    {tutor.bio && (
                      <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                        {tutor.bio}
                      </p>
                    )}
                  </div>
                  <input
                    type="radio"
                    name="tutor_select_display"
                    checked={isSelected}
                    onChange={() => setSelectedTutorId(tutor.tutor_user_id)}
                    className="mt-1 h-4 w-4 accent-indigo-600"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Assignment form — shown after tutor is selected */}
      {selectedTutorId && (
        <form
          action={formAction}
          className="mt-2 space-y-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-800 dark:bg-indigo-900/10"
        >
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Assignment Details</h3>

          <input type="hidden" name="requestId" value={requestId} />
          <input type="hidden" name="tutorUserId" value={selectedTutorId} />

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Google Meet Link{' '}
              <span className="font-normal text-zinc-400">(optional — can be added later)</span>
            </label>
            <input
              type="url"
              name="meetLink"
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Schedule Timezone{' '}
              <span className="font-normal text-zinc-400">(optional — defaults to student&apos;s)</span>
            </label>
            <input
              type="text"
              name="timezone"
              defaultValue={requestTimezone}
              placeholder="e.g. Asia/Karachi"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Days of Week{' '}
              <span className="font-normal text-zinc-400">(optional)</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {DAY_OPTIONS.map(({ label, value }) => (
                <label key={value} className="flex cursor-pointer items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    name="days"
                    value={value}
                    className="h-4 w-4 rounded accent-indigo-600"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Start Time{' '}
              <span className="font-normal text-zinc-400">(optional — 24 h format)</span>
            </label>
            <input
              type="time"
              name="time"
              className="mt-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {isPending ? 'Assigning…' : 'Assign Tutor'}
          </button>
        </form>
      )}
    </div>
  )
}
