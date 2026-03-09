// Client component — filter bar for the admin User Management page
'use client'

import { useRef } from 'react'

type Subject = { id: number; name: string }

export type UserFiltersProps = {
  subjects: Subject[]
  activeRole: string
  activeSearch: string
  activeLevel: string
  activeSubject: string
  activePayment: string
}

const ROLE_TABS = [
  { value: '', label: 'All Users' },
  { value: 'student', label: 'Students' },
  { value: 'parent', label: 'Parents' },
  { value: 'tutor', label: 'Tutors' },
  { value: 'admin', label: 'Admins' },
] as const

export function UserFilters({
  subjects,
  activeRole,
  activeSearch,
  activeLevel,
  activeSubject,
  activePayment,
}: UserFiltersProps) {
  const searchRef = useRef<HTMLInputElement>(null)

  function buildHref(params: Record<string, string | undefined>): string {
    const merged: Record<string, string | undefined> = {
      role: activeRole || undefined,
      search: activeSearch || undefined,
      level: activeLevel || undefined,
      subject: activeSubject || undefined,
      payment: activePayment || undefined,
      page: undefined, // always reset to page 1 on filter change
      ...params,
    }
    const qs = Object.entries(merged)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&')
    return `/admin/users${qs ? `?${qs}` : ''}`
  }

  const hasFilters = !!(activeSearch || activeLevel || activeSubject || activePayment)

  return (
    <div className="mb-6 space-y-4">
      {/* Role tabs */}
      <div className="flex flex-wrap gap-0 border-b-2 border-[#121212]">
        {ROLE_TABS.map((tab) => {
          const isActive = activeRole === tab.value
          return (
            <a
              key={tab.value}
              href={buildHref({ role: tab.value || undefined })}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
                isActive
                  ? 'bg-[#121212] text-white'
                  : 'bg-white text-[#121212]/60 hover:bg-[#F0F0F0] hover:text-[#121212]'
              }`}
            >
              {tab.label}
            </a>
          )
        })}
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-end gap-3 rounded-none border-2 border-[#D0D0D0] bg-[#F8F8F8] p-4">
        {/* Name search */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#121212]/50">
            Search name
          </label>
          <div className="flex gap-1">
            <input
              ref={searchRef}
              type="text"
              defaultValue={activeSearch}
              placeholder="Type a name…"
              className="w-44 border-2 border-[#121212] px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#1040C0]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value.trim()
                  window.location.href = buildHref({ search: val || undefined })
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                const val = searchRef.current?.value.trim() ?? ''
                window.location.href = buildHref({ search: val || undefined })
              }}
              className="border-2 border-[#121212] bg-[#121212] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#333]"
            >
              Go
            </button>
          </div>
        </div>

        {/* Level */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#121212]/50">
            Level
          </label>
          <select
            value={activeLevel}
            onChange={(e) =>
              (window.location.href = buildHref({ level: e.target.value || undefined }))
            }
            className="border-2 border-[#121212] px-2 py-1.5 text-sm"
            aria-label="Filter by level"
          >
            <option value="">All levels</option>
            <option value="o_levels">O Levels</option>
            <option value="a_levels">A Levels</option>
          </select>
        </div>

        {/* Subject */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#121212]/50">
            Subject
          </label>
          <select
            value={activeSubject}
            onChange={(e) =>
              (window.location.href = buildHref({ subject: e.target.value || undefined }))
            }
            className="border-2 border-[#121212] px-2 py-1.5 text-sm"
            aria-label="Filter by subject"
          >
            <option value="">All subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Payment status */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#121212]/50">
            Payment
          </label>
          <select
            value={activePayment}
            onChange={(e) =>
              (window.location.href = buildHref({ payment: e.target.value || undefined }))
            }
            className="border-2 border-[#121212] px-2 py-1.5 text-sm"
            aria-label="Filter by payment"
          >
            <option value="">Any payment</option>
            <option value="yes">Has paid</option>
            <option value="no">Never paid</option>
          </select>
        </div>

        {/* Clear filters */}
        {hasFilters && (
          <a
            href={buildHref({
              search: undefined,
              level: undefined,
              subject: undefined,
              payment: undefined,
            })}
            className="border-2 border-[#D02020] px-3 py-1.5 text-sm font-medium text-[#D02020] hover:bg-[#D02020]/5"
          >
            Clear filters
          </a>
        )}
      </div>
    </div>
  )
}
