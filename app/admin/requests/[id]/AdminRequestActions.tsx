'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminCancelRequest, adminUpdateRequestStatus } from '../actions'

const ALL_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'payment_pending', label: 'Payment Pending' },
  { value: 'ready_to_match', label: 'Ready to Match' },
  { value: 'matched', label: 'Matched' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'ended', label: 'Ended' },
]

export function AdminRequestActions({
  requestId,
  currentStatus,
}: {
  requestId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newStatus, setNewStatus] = useState(currentStatus)

  async function handleCancel() {
    const reason = window.prompt('Reason for cancellation (optional):')
    if (reason === null) return // user pressed cancel on prompt

    setLoading(true)
    setError(null)
    const result = await adminCancelRequest(requestId, reason || undefined)
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    router.refresh()
    setLoading(false)
  }

  async function handleStatusChange() {
    if (newStatus === currentStatus) return
    const confirmed = window.confirm(
      `Change request status from "${currentStatus}" to "${newStatus}"?`
    )
    if (!confirmed) return

    setLoading(true)
    setError(null)
    const result = await adminUpdateRequestStatus(requestId, newStatus)
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="border-4 border-[#121212] bg-white px-6 py-5 space-y-4">
      <h2 className="text-sm font-bold uppercase tracking-wide text-[#121212]/60">
        Admin Actions
      </h2>

      {error && (
        <p className="border-l-4 border-[#D02020] bg-[#D02020]/5 px-3 py-2 text-sm text-[#D02020]">
          {error}
        </p>
      )}

      {/* Status change */}
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label
            htmlFor="admin-status"
            className="mb-1 block text-xs font-semibold text-[#121212]/60"
          >
            Change Status
          </label>
          <select
            id="admin-status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full border-2 border-[#B0B0B0] px-3 py-2 text-sm focus:border-[#1040C0] focus:outline-none"
          >
            {ALL_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={handleStatusChange}
          disabled={loading || newStatus === currentStatus}
          className="inline-flex min-h-[40px] items-center border-2 border-[#121212] bg-[#1040C0] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white shadow-[3px_3px_0px_0px_#121212] transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          Update
        </button>
      </div>

      {/* Cancel button */}
      {currentStatus !== 'ended' && (
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="inline-flex min-h-[40px] items-center border-2 border-[#D02020] bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#D02020] shadow-[3px_3px_0px_0px_#D02020] transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {loading ? 'Processing…' : 'Cancel Request'}
        </button>
      )}
    </div>
  )
}
