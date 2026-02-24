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
        <p className="mb-1 text-xs text-red-600 dark:text-red-400">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
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
        <p className="mb-1 text-xs text-red-600 dark:text-red-400">{state.error}</p>
      )}
      <form action={formAction} className="flex items-center gap-2">
        <input type="hidden" name="paymentId" value={paymentId} />
        <input
          type="text"
          name="note"
          placeholder="Rejection note (optional)"
          className="rounded-lg border border-zinc-300 px-2 py-1 text-xs shadow-sm focus:border-red-400 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
        >
          {isPending ? 'Processing…' : '❌ Reject'}
        </button>
      </form>
    </div>
  )
}
