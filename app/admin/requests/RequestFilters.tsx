// E7 T7.1: Client component for request inbox filter selects (subject + level)
// Closes #47

'use client'

type Subject = { id: number; name: string }

type RequestFiltersProps = {
  subjects: Subject[]
  activeStatus: string
  activeSubject: string | undefined
  activeLevel: string | undefined
}

export function RequestFilters({
  subjects,
  activeStatus,
  activeSubject,
  activeLevel,
}: RequestFiltersProps) {
  function buildHref(params: Record<string, string | undefined>): string {
    const merged: Record<string, string | undefined> = {
      status: activeStatus !== 'all' ? activeStatus : undefined,
      subject: activeSubject,
      level: activeLevel,
      ...params,
    }
    const qs = Object.entries(merged)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&')
    return `/admin/requests${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="flex flex-wrap gap-3">
      {/* Subject filter */}
      <select
        value={activeSubject ?? ''}
        onChange={(e) => {
          window.location.href = buildHref({ subject: e.target.value || undefined })
        }}
        className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        aria-label="Filter by subject"
      >
        <option value="">All subjects</option>
        {subjects.map((s) => (
          <option key={s.id} value={String(s.id)}>
            {s.name}
          </option>
        ))}
      </select>

      {/* Level filter */}
      <select
        value={activeLevel ?? ''}
        onChange={(e) => {
          window.location.href = buildHref({ level: e.target.value || undefined })
        }}
        className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        aria-label="Filter by level"
      >
        <option value="">All levels</option>
        <option value="o_levels">O Levels</option>
        <option value="a_levels">A Levels</option>
      </select>
    </div>
  )
}
