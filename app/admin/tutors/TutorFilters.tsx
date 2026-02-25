// E6 T6.4: Client component for tutor directory filter selects
// Closes #43

'use client'

type Subject = { id: number; name: string }

type TutorFiltersProps = {
  subjects: Subject[]
  activeSubject: string | undefined
  activeLevel: string | undefined
  activeStatus: string
}

export function TutorFilters({
  subjects,
  activeSubject,
  activeLevel,
  activeStatus,
}: TutorFiltersProps) {
  function buildHref(params: Record<string, string | undefined>): string {
    const merged: Record<string, string | undefined> = {
      status: activeStatus,
      subject: activeSubject,
      level: activeLevel,
      ...params,
    }
    const qs = Object.entries(merged)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&')
    return `/admin/tutors${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="flex flex-wrap gap-3">
      {/* Subject filter */}
      <select
        value={activeSubject ?? ''}
        onChange={(e) => {
          const v = e.target.value
          window.location.href = buildHref({ subject: v || undefined })
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
          const v = e.target.value
          window.location.href = buildHref({ level: v || undefined })
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
