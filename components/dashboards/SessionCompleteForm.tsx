// E10 T10.2: Session completion form — tutor marks a session done/no-show with optional note
// Closes #69

'use client'

import { useActionState, useState, useEffect } from 'react'
import { tutorUpdateSessionStatus } from '@/lib/services/sessions'
import { toast } from 'sonner'

type UpdateResult = { error?: string } | undefined

type TutorStatus = 'done' | 'no_show_student' | 'no_show_tutor'
const ALLOWED_STATUSES = ['done', 'no_show_student', 'no_show_tutor'] as const

const STATUS_OPTIONS: { value: TutorStatus; label: string; icon: string }[] = [
  { value: 'done', label: 'Done', icon: '✅' },
  { value: 'no_show_student', label: 'Student No-show', icon: '❌' },
  { value: 'no_show_tutor', label: 'My No-show', icon: '🤒' },
]

async function tutorUpdateStatusAction(
  _prev: UpdateResult,
  formData: FormData,
): Promise<UpdateResult> {
  const rawSessionId = formData.get('sessionId')
  const rawStatus = formData.get('status')
  const tutorNotesValue = formData.get('tutorNotes')

  if (typeof rawSessionId !== 'string' || !rawSessionId.trim()) {
    return { error: 'Missing session ID. Please refresh the page and try again.' }
  }

  if (typeof rawStatus !== 'string' || !ALLOWED_STATUSES.includes(rawStatus as TutorStatus)) {
    return { error: 'Invalid status selected. Please choose an option and resubmit.' }
  }

  const tutorNotes =
    typeof tutorNotesValue === 'string' && tutorNotesValue.trim().length > 0
      ? tutorNotesValue
      : undefined

  return tutorUpdateSessionStatus({
    sessionId: rawSessionId,
    status: rawStatus as TutorStatus,
    tutorNotes,
  })
}

interface Props {
  sessionId: string
  disabledReason?: string
}

export function SessionCompleteForm({ sessionId, disabledReason }: Props) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(tutorUpdateStatusAction, undefined)

  // Show toast on success or error
  useEffect(() => {
    if (state && !state.error) {
      toast.success('Session updated successfully')
    } else if (state?.error) {
      toast.error(state.error)
    }
  }, [state])

  if (state && !state.error) {
    return (
      <span className="text-xs font-bold text-[#121212]">&#10003; Session updated</span>
    )
  }

  if (disabledReason) {
    return (
      <span className="text-xs font-semibold text-[#121212]/50">{disabledReason}</span>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="border-2 border-[#121212] px-2 py-1 text-xs font-medium text-[#121212]/70 transition hover:border-[#1040C0] hover:text-[#1040C0] "
      >
        Mark Session
      </button>
    )
  }

  return (
    <form action={formAction} className="mt-2 space-y-2 border border-[#D0D0D0] bg-[#F0F0F0] p-3">
      <input type="hidden" name="sessionId" value={sessionId} />

      <p className="text-xs font-semibold text-[#121212]/80">Mark Session Complete</p>

      <div className="flex flex-wrap gap-3">
        {STATUS_OPTIONS.map((opt) => (
          <label key={opt.value} className="flex cursor-pointer items-center gap-1.5 text-xs text-[#121212]/80">
            <input
              type="radio"
              name="status"
              value={opt.value}
              defaultChecked={opt.value === 'done'}
              className="accent-[#1040C0]"
            />
            {opt.icon} {opt.label}
          </label>
        ))}
      </div>

      <label htmlFor={`notes-${sessionId}`} className="text-xs font-medium text-[#121212]/80">
        Session notes <span className="font-normal text-[#121212]/40">(optional)</span>
      </label>
      <textarea
        id={`notes-${sessionId}`}
        name="tutorNotes"
        placeholder="e.g. topics covered, homework set"
        rows={2}
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
          {isPending ? 'Saving…' : 'Submit'}
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
