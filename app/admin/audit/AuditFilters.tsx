'use client'

import { useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

type Props = {
  currentQ: string
  currentAction: string
  currentEntity: string
  actionOptions: { value: string; label: string }[]
  entityOptions: string[]
}

export function AuditFilters({
  currentQ,
  currentAction,
  currentEntity,
  actionOptions,
  entityOptions,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)

  function buildHref(overrides: Record<string, string>) {
    const p = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(overrides)) {
      if (v) p.set(k, v)
      else p.delete(k)
    }
    return `${pathname}?${p.toString()}`
  }

  function navigate(overrides: Record<string, string>) {
    router.push(buildHref(overrides))
  }

  const hasFilters = currentQ || currentAction || currentEntity

  return (
    <div className="flex flex-wrap items-end gap-3 border-2 border-[#121212] bg-white px-4 py-3">
      {/* Text search */}
      <div className="flex-1 min-w-[200px]">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-[#121212]/50 mb-1">
          Search
        </label>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            defaultValue={currentQ}
            placeholder="Actor, action, or details…"
            className="flex-1 border-2 border-[#D0D0D0] px-3 py-1.5 text-sm focus:border-[#1040C0] focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                navigate({ q: inputRef.current?.value ?? '' })
              }
            }}
          />
          <button
            type="button"
            onClick={() => navigate({ q: inputRef.current?.value ?? '' })}
            className="border-2 border-[#121212] bg-[#121212] px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#333]"
          >
            Go
          </button>
        </div>
      </div>

      {/* Action filter */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-[#121212]/50 mb-1">
          Action
        </label>
        <select
          value={currentAction}
          onChange={(e) => navigate({ action: e.target.value })}
          className="border-2 border-[#D0D0D0] bg-white px-2 py-1.5 text-sm focus:border-[#1040C0] focus:outline-none"
        >
          <option value="">All actions</option>
          {actionOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Entity type filter */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-[#121212]/50 mb-1">
          Entity
        </label>
        <select
          value={currentEntity}
          onChange={(e) => navigate({ entity: e.target.value })}
          className="border-2 border-[#D0D0D0] bg-white px-2 py-1.5 text-sm focus:border-[#1040C0] focus:outline-none"
        >
          <option value="">All entities</option>
          {entityOptions.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>

      {/* Clear all */}
      {hasFilters && (
        <button
          type="button"
          onClick={() => router.push(pathname)}
          className="border-2 border-[#D02020] px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-[#D02020] hover:bg-[#D02020] hover:text-white transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  )
}
