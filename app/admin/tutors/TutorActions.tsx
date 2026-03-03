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
        <p className="mb-1 text-xs text-red-600">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className=" inline-flex min-h-[36px] items-center border-2 border-[#121212] bg-[#121212] px-3 py-1 text-xs font-bold uppercase tracking-widest text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] transition hover:-translate-y-0.5"
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
        <p className="mb-1 text-xs text-red-600">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-[36px] items-center border-2 border-[#D02020] bg-[#D02020] px-3 py-1 text-xs font-bold uppercase tracking-widest text-white shadow-[3px_3px_0px_0px_#121212] transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {isPending ? 'Revoking…' : '❌ Revoke'}
      </button>
    </form>
  )
}
