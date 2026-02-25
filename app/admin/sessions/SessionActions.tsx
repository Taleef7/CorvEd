// E8 T8.3 T8.4 S8.2: Client components for session status update and reschedule
// Closes #56 #57 #53

'use client'

import { useActionState, useState } from 'react'
import { updateSessionStatus, rescheduleSession } from '@/lib/services/sessions'
import { SESSION_STATUS_LABELS, SESSION_STATUS_COLOURS, type SessionStatus } from '@/lib/utils/session'
import { DateTime } from 'luxon'

// ── Status Update Form ────────────────────────────────────────────────────────

type UpdateResult = { error?: string } | undefined

const TUTOR_STATUSES: SessionStatus[] = ['done', 'no_show_student', 'no_show_tutor']

async function updateStatusAction(
  _prev: UpdateResult,
  formData: FormData,
): Promise<UpdateResult> {
  const sessionId = formData.get('sessionId') as string
  const matchId = formData.get('matchId') as string
  const requestId = formData.get('requestId') as string
  const status = formData.get('status') as 'done' | 'no_show_student' | 'no_show_tutor' | 'rescheduled'
  const tutorNotes = (formData.get('tutorNotes') as string) || undefined
  return updateSessionStatus({ sessionId, matchId, requestId, status, tutorNotes })
}

export function SessionStatusForm({
  sessionId,
  matchId,
  requestId,
  currentStatus,
}: {
  sessionId: string
  matchId: string
  requestId: string
  currentStatus: SessionStatus
}) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(updateStatusAction, undefined)

  if (state && !state.error) {
    return (
      <span className="text-xs text-emerald-600 dark:text-emerald-400">✅ Updated</span>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-600 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-600 dark:text-zinc-400"
      >
        Update Status
      </button>
    )
  }

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="sessionId" value={sessionId} />
      <input type="hidden" name="matchId" value={matchId} />
      <input type="hidden" name="requestId" value={requestId} />

      <select
        name="status"
        defaultValue={currentStatus}
        className="w-full rounded border border-zinc-300 px-2 py-1 text-xs focus:border-indigo-400 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
      >
        {TUTOR_STATUSES.map((s) => (
          <option key={s} value={s}>
            {SESSION_STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      <input
        type="text"
        name="tutorNotes"
        placeholder="Notes (optional)"
        className="w-full rounded border border-zinc-300 px-2 py-1 text-xs focus:border-indigo-400 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
      />

      {state?.error && (
        <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {isPending ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

// ── Reschedule Form ───────────────────────────────────────────────────────────

type RescheduleResult = { error?: string } | undefined

async function rescheduleAction(
  _prev: RescheduleResult,
  formData: FormData,
): Promise<RescheduleResult> {
  const sessionId = formData.get('sessionId') as string
  const newDate = formData.get('newDate') as string
  const newTime = formData.get('newTime') as string
  const timezone = formData.get('timezone') as string
  const reason = (formData.get('reason') as string) || undefined

  // Convert local date+time to UTC
  const newStartUtc = DateTime.fromISO(`${newDate}T${newTime}`, { zone: timezone })
    .toUTC()
    .toISO()
  const newEndUtc = DateTime.fromISO(`${newDate}T${newTime}`, { zone: timezone })
    .plus({ minutes: 60 })
    .toUTC()
    .toISO()

  if (!newStartUtc || !newEndUtc) {
    return { error: 'Invalid date/time or timezone.' }
  }

  return rescheduleSession({ sessionId, newStartUtc, newEndUtc, reason })
}

export function RescheduleForm({
  sessionId,
  scheduledStartUtc,
  adminTimezone,
}: {
  sessionId: string
  scheduledStartUtc: string
  adminTimezone: string
}) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(rescheduleAction, undefined)

  const hoursUntil = DateTime.fromISO(scheduledStartUtc).diff(DateTime.now(), 'hours').hours
  const isWithin24h = hoursUntil < 24 && hoursUntil > 0

  if (state && !state.error) {
    return (
      <span className="text-xs text-emerald-600 dark:text-emerald-400">✅ Rescheduled</span>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-600 transition hover:border-amber-400 hover:text-amber-600 dark:border-zinc-600 dark:text-zinc-400"
      >
        Reschedule
      </button>
    )
  }

  return (
    <form action={formAction} className="mt-2 space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/10">
      <input type="hidden" name="sessionId" value={sessionId} />
      <input type="hidden" name="timezone" value={adminTimezone} />

      {isWithin24h && (
        <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
          ⚠️ This session starts in &lt; 24 hours. Late reschedule policy applies.
        </p>
      )}

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            New Date
          </label>
          <input
            type="date"
            name="newDate"
            required
            className="mt-0.5 w-full rounded border border-zinc-300 px-2 py-1 text-xs focus:border-indigo-400 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            New Time ({adminTimezone})
          </label>
          <input
            type="time"
            name="newTime"
            required
            className="mt-0.5 w-full rounded border border-zinc-300 px-2 py-1 text-xs focus:border-indigo-400 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Reason <span className="font-normal text-zinc-400">(optional)</span>
        </label>
        <input
          type="text"
          name="reason"
          placeholder="e.g. student requested alternative"
          className="mt-0.5 w-full rounded border border-zinc-300 px-2 py-1 text-xs focus:border-indigo-400 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>

      {state?.error && (
        <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-amber-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
        >
          {isPending ? 'Saving…' : 'Save Reschedule'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

// ── Status Badge ──────────────────────────────────────────────────────────────

export function SessionStatusBadge({ status }: { status: SessionStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${SESSION_STATUS_COLOURS[status] ?? 'bg-zinc-100 text-zinc-700'}`}
    >
      {SESSION_STATUS_LABELS[status] ?? status}
    </span>
  )
}
