// Client-side filter components for the admin sessions page
'use client'

import { useRef } from 'react'
import { getAdminSessionStatusFilterOptions } from '@/lib/admin/sessions'

// ── Student-picker search bar ─────────────────────────────────────────────────

export function StudentSearchBar({ currentSearch }: { currentSearch: string }) {
  const ref = useRef<HTMLInputElement>(null)

  function navigate(val: string) {
    const qs = val.trim() ? `?search=${encodeURIComponent(val.trim())}` : ''
    window.location.href = `/admin/sessions${qs}`
  }

  return (
    <div className="flex gap-2">
      <input
        ref={ref}
        type="text"
        defaultValue={currentSearch}
        placeholder="Search student name…"
        className="w-64 border-2 border-[#121212] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1040C0]"
        onKeyDown={(e) => {
          if (e.key === 'Enter') navigate((e.target as HTMLInputElement).value)
        }}
      />
      <button
        type="button"
        onClick={() => navigate(ref.current?.value ?? '')}
        className="border-2 border-[#121212] bg-[#121212] px-4 py-2 text-sm font-bold text-white hover:bg-[#333]"
      >
        Search
      </button>
      {currentSearch && (
        <a
          href="/admin/sessions"
          className="border-2 border-[#D0D0D0] px-4 py-2 text-sm text-[#121212]/60 hover:border-[#121212] hover:text-[#121212]"
        >
          Clear
        </a>
      )}
    </div>
  )
}

// ── Session view toggle + status filter (when a student is selected) ──────────

export type SessionView = 'upcoming' | 'past'

export function SessionViewControls({
  studentId,
  childName,
  view,
  status,
  upcomingCount,
  pastCount,
}: {
  studentId: string
  childName?: string
  view: SessionView
  status: string
  upcomingCount: number
  pastCount: number
}) {
  function buildHref(params: {
    view?: SessionView
    status?: string
  }): string {
    const merged: Record<string, string> = {
      student: studentId,
      view: params.view ?? view,
    }
    if (childName !== undefined) merged.child = childName
    const statusVal = params.status !== undefined ? params.status : status
    if (statusVal) merged.status = statusVal
    const qs = new URLSearchParams(merged).toString()
    return `/admin/sessions?${qs}`
  }

  const tabs: { value: SessionView; label: string; count: number }[] = [
    { value: 'upcoming', label: 'Upcoming', count: upcomingCount },
    { value: 'past', label: 'Past', count: pastCount },
  ]

  const statuses = getAdminSessionStatusFilterOptions()

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Tabs */}
      <div className="flex border-b-2 border-[#121212]">
        {tabs.map((tab) => {
          const isActive = view === tab.value
          return (
            <a
              key={tab.value}
              href={buildHref({ view: tab.value, status: status || undefined })}
              className={`px-5 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
                isActive
                  ? 'bg-[#121212] text-white'
                  : 'bg-white text-[#121212]/50 hover:bg-[#F0F0F0] hover:text-[#121212]'
              }`}
            >
              {tab.label}
              <span
                className={`ml-2 text-[11px] font-semibold ${isActive ? 'text-white/70' : 'text-[#121212]/30'}`}
              >
                {tab.count}
              </span>
            </a>
          )
        })}
      </div>

      {/* Status filter */}
      <select
        value={status}
        onChange={(e) => {
          // Pass the raw value — empty string means "All statuses" (no param).
          // Using `|| undefined` would convert '' → undefined → buildHref falls
          // back to the current status instead of clearing it.
          window.location.href = buildHref({ status: e.target.value })
        }}
        className="border-2 border-[#121212] px-3 py-1.5 text-sm"
        aria-label="Filter by status"
      >
        {statuses.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  )
}
