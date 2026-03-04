'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cancelRequest } from '../actions'

export function CancelRequestButton({ requestId }: { requestId: string }) {
  const router = useRouter()
  const [cancelling, setCancelling] = useState(false)

  async function handleCancel() {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this request? This cannot be undone.'
    )
    if (!confirmed) return

    setCancelling(true)
    const result = await cancelRequest(requestId)

    if (result.error) {
      alert(result.error)
      setCancelling(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleCancel}
      disabled={cancelling}
      className="inline-flex min-h-[40px] items-center border-2 border-[#D02020] bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#D02020] shadow-[3px_3px_0px_0px_#D02020] transition hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-60"
    >
      {cancelling ? 'Cancelling…' : 'Cancel Request'}
    </button>
  )
}
