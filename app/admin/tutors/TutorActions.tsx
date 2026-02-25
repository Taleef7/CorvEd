// E6 T6.2 T6.4: Client components for admin tutor approval/revoke buttons
// Closes #41 #43

'use client'

import { useActionState } from 'react'
import { approveTutor, revokeTutorApproval } from './actions'

type ActionResult = { error?: string } | undefined

async function approveAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const tutorUserId = formData.get('tutorUserId') as string
  return approveTutor(tutorUserId)
}

async function revokeAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const tutorUserId = formData.get('tutorUserId') as string
  return revokeTutorApproval(tutorUserId)
}

export function ApproveButton({ tutorUserId }: { tutorUserId: string }) {
  const [state, formAction, isPending] = useActionState(approveAction, undefined)
  return (
    <form action={formAction}>
      <input type="hidden" name="tutorUserId" value={tutorUserId} />
      {state?.error && (
        <p className="mb-1 text-xs text-red-600 dark:text-red-400">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {isPending ? 'Approving…' : '✅ Approve'}
      </button>
    </form>
  )
}

export function RevokeButton({ tutorUserId }: { tutorUserId: string }) {
  const [state, formAction, isPending] = useActionState(revokeAction, undefined)
  return (
    <form action={formAction}>
      <input type="hidden" name="tutorUserId" value={tutorUserId} />
      {state?.error && (
        <p className="mb-1 text-xs text-red-600 dark:text-red-400">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
      >
        {isPending ? 'Revoking…' : '❌ Revoke'}
      </button>
    </form>
  )
}
