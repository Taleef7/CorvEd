// E5 S5.2: Client component for admin payment action buttons with error feedback
// Addresses review comment: server action forms should display errors to admin

'use client'

import { useActionState } from 'react'
import { markPaymentPaid, markPaymentRejected } from './actions'

type ActionResult = { error?: string } | undefined

async function markPaidAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const paymentId = formData.get('paymentId') as string
    const packageId = formData.get('packageId') as string
    const requestId = formData.get('requestId') as string
    await markPaymentPaid(paymentId, packageId, requestId)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}

async function markRejectedAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const paymentId = formData.get('paymentId') as string
    const note = formData.get('note') as string
    await markPaymentRejected(paymentId, note)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}

export function MarkPaidForm({
  paymentId,
  packageId,
  requestId,
}: {
  paymentId: string
  packageId: string
  requestId: string
}) {
  const [state, formAction, isPending] = useActionState(markPaidAction, undefined)

  return (
    <form action={formAction}>
      <input type="hidden" name="paymentId" value={paymentId} />
      <input type="hidden" name="packageId" value={packageId} />
      <input type="hidden" name="requestId" value={requestId} />
      {state?.error && (
        <p className="mb-1 text-xs text-red-600">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-[36px] items-center border-2 border-[#121212] bg-[#121212] px-3 py-1 text-xs font-bold uppercase tracking-widest text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {isPending ? 'Processing…' : '✅ Mark Paid'}
      </button>
    </form>
  )
}

export function RejectForm({ paymentId }: { paymentId: string }) {
  const [state, formAction, isPending] = useActionState(markRejectedAction, undefined)

  return (
    <div>
      {state?.error && (
        <p className="mb-1 text-xs text-red-600">{state.error}</p>
      )}
      <form action={formAction} className="flex items-center gap-2">
        <input type="hidden" name="paymentId" value={paymentId} />
        <input
          type="text"
          name="note"
          placeholder="Rejection note (optional)"
          className=" border-2 border-[#121212] px-2 py-1 text-xs focus:border-red-400 focus:outline-none "
        />
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-[36px] items-center border-2 border-[#D02020] bg-[#D02020] px-3 py-1 text-xs font-bold uppercase tracking-widest text-white shadow-[3px_3px_0px_0px_#121212] transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {isPending ? 'Processing…' : '❌ Reject'}
        </button>
      </form>
    </div>
  )
}
