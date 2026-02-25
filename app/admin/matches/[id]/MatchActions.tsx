// E7 T7.4 S7.2 E8 T8.1: Client components for match detail actions (reassign tutor, edit details, generate sessions)
// Closes #50 #46 #54

'use client'

import { useActionState, useState } from 'react'
import { reassignTutor, updateMatchDetails } from '../../requests/actions'
import { generateSessionsForMatch } from '@/lib/services/sessions'

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

// ── Reassign Tutor Form ────────────────────────────────────────────────────────

type ReassignResult = { error?: string } | undefined

async function reassignAction(
  _prev: ReassignResult,
  formData: FormData,
): Promise<ReassignResult> {
  const matchId = formData.get('matchId') as string
  const previousTutorUserId = formData.get('previousTutorUserId') as string
  const newTutorUserId = formData.get('newTutorUserId') as string
  const reason = (formData.get('reason') as string) || undefined
  return reassignTutor({ matchId, previousTutorUserId, newTutorUserId, reason })
}

export function ReassignTutorForm({
  matchId,
  currentTutorUserId,
  eligibleTutors,
}: {
  matchId: string
  currentTutorUserId: string
  eligibleTutors: EligibleTutor[]
}) {
  const [open, setOpen] = useState(false)
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(null)
  const [state, formAction, isPending] = useActionState(reassignAction, undefined)

  if (state && !state.error) {
    return (
      <div className="rounded-xl bg-emerald-50 px-5 py-4 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
        ✅ Tutor reassigned successfully. Refresh to see updated details.
      </div>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-600 dark:text-zinc-300"
      >
        ↔ Reassign Tutor
      </button>
    )
  }

  // Filter out current tutor from eligible list
  const otherTutors = eligibleTutors.filter((t) => t.tutor_user_id !== currentTutorUserId)

  return (
    <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-900/10">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Reassign Tutor</h3>
        <button
          onClick={() => setOpen(false)}
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          Cancel
        </button>
      </div>

      {otherTutors.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No other approved tutors match this subject and level.
        </p>
      ) : (
        <div className="space-y-2">
          {otherTutors.map((tutor) => {
            const isSelected = selectedTutorId === tutor.tutor_user_id
            return (
              <div
                key={tutor.tutor_user_id}
                onClick={() => setSelectedTutorId(tutor.tutor_user_id)}
                className={`cursor-pointer rounded-lg border p-3 transition ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900/20'
                    : 'border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {tutor.user_profiles?.display_name ?? '—'}
                    </p>
                    <p className="text-xs text-zinc-500">{tutor.timezone}</p>
                  </div>
                  <input
                    type="radio"
                    checked={isSelected}
                    onChange={() => setSelectedTutorId(tutor.tutor_user_id)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 accent-indigo-600"
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedTutorId && (
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="matchId" value={matchId} />
          <input type="hidden" name="previousTutorUserId" value={currentTutorUserId} />
          <input type="hidden" name="newTutorUserId" value={selectedTutorId} />

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Reason{' '}
              <span className="font-normal text-zinc-400">(optional)</span>
            </label>
            <input
              type="text"
              name="reason"
              placeholder="e.g. tutor unavailable"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
          >
            {isPending ? 'Reassigning…' : 'Confirm Reassignment'}
          </button>
        </form>
      )}
    </div>
  )
}

// ── Edit Match Details Form ───────────────────────────────────────────────────

type EditResult = { error?: string } | undefined

async function editMatchAction(
  _prev: EditResult,
  formData: FormData,
): Promise<EditResult> {
  const matchId = formData.get('matchId') as string
  const meetLink = (formData.get('meetLink') as string) || undefined
  const timezone = formData.get('timezone') as string
  const time = formData.get('time') as string
  const rawDays = formData.getAll('days').map(Number)

  // Only build a schedule pattern if all three fields are present; if any partial, error.
  const hasAnyScheduleField = !!timezone || !!time || rawDays.length > 0
  const hasAllScheduleFields = !!timezone && !!time && rawDays.length > 0
  if (hasAnyScheduleField && !hasAllScheduleFields) {
    return {
      error: 'Please provide timezone, start time, and at least one day — or leave all schedule fields empty.',
    }
  }

  // Pass schedulePattern only when all fields are present; omit (undefined) otherwise
  // so that the server action does not overwrite an existing schedule.
  const payload: {
    matchId: string
    meetLink?: string
    schedulePattern?: { timezone: string; days: number[]; time: string; duration_mins: number } | null
  } = { matchId }

  if (typeof meetLink !== 'undefined') payload.meetLink = meetLink
  if (hasAllScheduleFields) {
    payload.schedulePattern = { timezone, days: rawDays, time, duration_mins: 60 }
  }

  return updateMatchDetails(payload)
}

export function EditMatchForm({
  matchId,
  currentMeetLink,
  currentSchedule,
}: {
  matchId: string
  currentMeetLink: string | null
  currentSchedule: {
    timezone?: string
    days?: number[]
    time?: string
    duration_mins?: number
  } | null
}) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(editMatchAction, undefined)

  if (state && !state.error) {
    return (
      <div className="rounded-xl bg-emerald-50 px-5 py-4 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
        ✅ Match details updated. Refresh to see changes.
      </div>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-600 dark:text-zinc-300"
      >
        ✏️ Edit Meet Link &amp; Schedule
      </button>
    )
  }

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
          Edit Meet Link &amp; Schedule
        </h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          Cancel
        </button>
      </div>

      <input type="hidden" name="matchId" value={matchId} />

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Google Meet Link
        </label>
        <input
          type="url"
          name="meetLink"
          defaultValue={currentMeetLink ?? ''}
          placeholder="https://meet.google.com/xxx-xxxx-xxx"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Schedule Timezone
        </label>
        <input
          type="text"
          name="timezone"
          defaultValue={currentSchedule?.timezone ?? ''}
          placeholder="e.g. Asia/Karachi"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Days of Week
        </label>
        <div className="flex flex-wrap gap-3">
          {DAY_OPTIONS.map(({ label, value }) => (
            <label key={value} className="flex cursor-pointer items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                name="days"
                value={value}
                defaultChecked={currentSchedule?.days?.includes(value) ?? false}
                className="h-4 w-4 rounded accent-indigo-600"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Start Time
        </label>
        <input
          type="time"
          name="time"
          defaultValue={currentSchedule?.time ?? ''}
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
        {isPending ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  )
}

// ── Generate Sessions Form ────────────────────────────────────────────────────

type GenerateResult = { error?: string; count?: number } | undefined

async function generateAction(
  _prev: GenerateResult,
  formData: FormData,
): Promise<GenerateResult> {
  const matchId = formData.get('matchId') as string
  return generateSessionsForMatch(matchId)
}

export function GenerateSessionsForm({ matchId }: { matchId: string }) {
  const [state, formAction, isPending] = useActionState(generateAction, undefined)

  if (state && !state.error) {
    return (
      <div className="rounded-xl bg-emerald-50 px-5 py-4 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
        ✅ {state.count} session{state.count !== 1 ? 's' : ''} generated successfully. Match is now{' '}
        <strong>active</strong>.{' '}
        <a href="/admin/sessions" className="underline">
          View sessions →
        </a>
      </div>
    )
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="matchId" value={matchId} />
      <div className="rounded-xl border border-dashed border-zinc-300 p-4 dark:border-zinc-600">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">📅 Generate Sessions</p>
        <p className="mt-0.5 text-xs text-zinc-500">
          Creates all sessions for the active package based on the schedule pattern and Meet link.
          Advances match and request to <strong>active</strong>.
        </p>
        {state?.error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {isPending ? 'Generating…' : '⚡ Generate Sessions'}
        </button>
      </div>
    </form>
  )
}
