// E8 T8.3 T8.4 S8.2: Client components for session status update and reschedule
// Closes #56 #57 #53

'use client'

import { useActionState, useState } from 'react'
import { updateSessionStatus, tutorUpdateSessionStatus, rescheduleSession } from '@/lib/services/sessions'
import { SESSION_STATUS_LABELS, SESSION_STATUS_COLOURS, type SessionStatus } from '@/lib/utils/session'
import { DateTime } from 'luxon'

// ── Status Update Form (Admin) ────────────────────────────────────────────────

type UpdateResult = { error?: string } | undefined

const TUTOR_STATUSES: SessionStatus[] = ['done', 'no_show_student', 'no_show_tutor']

async function adminUpdateStatusAction(
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

async function tutorUpdateStatusAction(
  _prev: UpdateResult,
  formData: FormData,
): Promise<UpdateResult> {
  const sessionId = formData.get('sessionId') as string
  const status = formData.get('status') as 'done' | 'no_show_student' | 'no_show_tutor'
  const tutorNotes = (formData.get('tutorNotes') as string) || undefined
  return tutorUpdateSessionStatus({ sessionId, status, tutorNotes })
}

export function SessionStatusForm({
  sessionId,
  matchId,
  requestId,
  currentStatus,
  mode = 'admin',
}: {
  sessionId: string
  matchId: string
  requestId: string
  currentStatus: SessionStatus
  /** 'admin' calls updateSessionStatus (admin client); 'tutor' calls tutorUpdateSessionStatus (RPC via RLS) */
  mode?: 'admin' | 'tutor'
}) {
  const [open, setOpen] = useState(false)
  const action = mode === 'tutor' ? tutorUpdateStatusAction : adminUpdateStatusAction
  const [state, formAction, isPending] = useActionState(action, undefined)

  if (state && !state.error) {
    return (
      <span className="text-xs font-bold text-[#121212]">&#10003; Updated</span>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="border-2 border-[#121212] px-2 py-1 text-xs font-medium text-[#121212]/70 transition hover:border-[#1040C0] hover:text-[#1040C0] "
      >
        Update Status
      </button>
    )
  }

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="sessionId" value={sessionId} />
      {mode === 'admin' && (
        <>
          <input type="hidden" name="matchId" value={matchId} />
          <input type="hidden" name="requestId" value={requestId} />
        </>
      )}

      <select
        name="status"
        defaultValue={currentStatus}
        className="w-full border-2 border-[#121212] px-2 py-1 text-xs focus:border-[#1040C0] focus:outline-none "
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
        className="w-full border-2 border-[#121212] px-2 py-1 text-xs focus:border-[#1040C0] focus:outline-none "
      />

      {state?.error && (
        <p className="text-xs text-red-600">{state.error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-[#1040C0] px-2 py-1 text-xs font-semibold text-white transition hover:bg-[#0830A0] disabled:opacity-60"
        >
          {isPending ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-[#121212]/60 hover:text-[#121212]/80"
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
  const durationMins = parseInt(formData.get('durationMins') as string, 10) || 60

  // Convert local date+time to UTC
  const newStartDt = DateTime.fromISO(`${newDate}T${newTime}`, { zone: timezone })
  const newStartUtc = newStartDt.toUTC().toISO()
  const newEndUtc = newStartDt.plus({ minutes: durationMins }).toUTC().toISO()

  if (!newStartUtc || !newEndUtc) {
    return { error: 'Invalid date/time or timezone.' }
  }

  return rescheduleSession({ sessionId, newStartUtc, newEndUtc, reason })
}

export function RescheduleForm({
  sessionId,
  scheduledStartUtc,
  adminTimezone,
  durationMins = 60,
}: {
  sessionId: string
  scheduledStartUtc: string
  adminTimezone: string
  /** Session duration in minutes — read from schedule_pattern.duration_mins */
  durationMins?: number
}) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(rescheduleAction, undefined)

  const hoursUntil = DateTime.fromISO(scheduledStartUtc).diff(DateTime.now(), 'hours').hours
  const isWithin24h = hoursUntil < 24 && hoursUntil > 0

  if (state && !state.error) {
    return (
      <span className="text-xs font-bold text-[#121212]">&#10003; Rescheduled</span>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="border-2 border-[#121212] px-2 py-1 text-xs font-medium text-[#121212]/70 transition hover:border-[#1040C0] hover:text-[#1040C0] "
      >
        Reschedule
      </button>
    )
  }

  // Compute today's date in the admin timezone as the min date for the date picker
  const todayLocal = DateTime.now().setZone(adminTimezone).toFormat('yyyy-MM-dd')

  return (
    <form action={formAction} className="mt-2 space-y-2  border border-l-4 border-[#F0C020] bg-[#F0C020]/10 p-3">
      <input type="hidden" name="sessionId" value={sessionId} />
      <input type="hidden" name="timezone" value={adminTimezone} />
      <input type="hidden" name="durationMins" value={durationMins} />

      {isWithin24h && (
        <p className="text-xs font-medium text-[#121212]">
          ⚠️ This session starts in &lt; 24 hours. Late reschedule policy applies.
        </p>
      )}

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs font-medium text-[#121212]/80">
            New Date
          </label>
          <input
            type="date"
            name="newDate"
            required
            min={todayLocal}
            className="mt-0.5 w-full border-2 border-[#121212] px-2 py-1 text-xs focus:border-[#1040C0] focus:outline-none "
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-[#121212]/80">
            New Time ({adminTimezone})
          </label>
          <input
            type="time"
            name="newTime"
            required
            className="mt-0.5 w-full border-2 border-[#121212] px-2 py-1 text-xs focus:border-[#1040C0] focus:outline-none "
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#121212]/80">
          Reason <span className="font-normal text-[#121212]/40">(optional)</span>
        </label>
        <input
          type="text"
          name="reason"
          placeholder="e.g. student requested alternative"
          className="mt-0.5 w-full border-2 border-[#121212] px-2 py-1 text-xs focus:border-[#1040C0] focus:outline-none "
        />
      </div>

      {state?.error && (
        <p className="text-xs text-red-600">{state.error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-[36px] items-center border-2 border-[#F0C020] bg-[#F0C020] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#121212] shadow-[3px_3px_0px_0px_#121212] transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {isPending ? 'Saving…' : 'Save Reschedule'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-[#121212]/60 hover:text-[#121212]/80"
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
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider border-2 ${SESSION_STATUS_COLOURS[status] ?? 'bg-[#E0E0E0] text-[#121212]/80'}`}
    >
      {SESSION_STATUS_LABELS[status] ?? status}
    </span>
  )
}

