// E10 T10.2: Session completion form — tutor marks a session done/no-show with optional note
// Closes #69

'use client'

import { useActionState, useState } from 'react'
import { tutorUpdateSessionStatus } from '@/lib/services/sessions'
import { type SessionStatus } from '@/lib/utils/session'

type UpdateResult = { error?: string } | undefined

const STATUS_OPTIONS: { value: SessionStatus; label: string; icon: string }[] = [
  { value: 'done', label: 'Done', icon: '✅' },
  { value: 'no_show_student', label: 'Student No-show', icon: '❌' },
  { value: 'no_show_tutor', label: 'My No-show', icon: '🤒' },
]

async function tutorUpdateStatusAction(
  _prev: UpdateResult,
  formData: FormData,
): Promise<UpdateResult> {
  const sessionId = formData.get('sessionId') as string
  const status = formData.get('status') as 'done' | 'no_show_student' | 'no_show_tutor'
  const tutorNotes = (formData.get('tutorNotes') as string) || undefined
  return tutorUpdateSessionStatus({ sessionId, status, tutorNotes })
}

interface Props {
  sessionId: string
}

export function SessionCompleteForm({ sessionId }: Props) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(tutorUpdateStatusAction, undefined)

  if (state && !state.error) {
    return (
      <span className="text-xs text-emerald-600 dark:text-emerald-400">✅ Session updated</span>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-600 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-600 dark:text-zinc-400"
      >
        Mark Session
      </button>
    )
  }

  return (
    <form action={formAction} className="mt-2 space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
      <input type="hidden" name="sessionId" value={sessionId} />

      <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Mark Session Complete</p>

      <div className="flex flex-wrap gap-3">
        {STATUS_OPTIONS.map((opt) => (
          <label key={opt.value} className="flex cursor-pointer items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300">
            <input
              type="radio"
              name="status"
              value={opt.value}
              defaultChecked={opt.value === 'done'}
              className="accent-indigo-600"
            />
            {opt.icon} {opt.label}
          </label>
        ))}
      </div>

      <textarea
        name="tutorNotes"
        placeholder="Session notes (optional) — e.g. topics covered, homework set"
        rows={2}
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
          {isPending ? 'Saving…' : 'Submit'}
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
