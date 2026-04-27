// E7 T7.1: Client component for request inbox filter selects (subject + level)
// Closes #47

'use client'

type Subject = { id: number; name: string }

type RequestFiltersProps = {
  subjects: Subject[]
  activeStatus: string
  activeSubject: string | undefined
  activeLevel: string | undefined
  activeSearch: string | undefined
}

export function RequestFilters({
  subjects,
  activeStatus,
  activeSubject,
  activeLevel,
  activeSearch,
}: RequestFiltersProps) {
  function buildHref(params: Record<string, string | undefined>): string {
    const merged: Record<string, string | undefined> = {
      status: activeStatus !== 'all' ? activeStatus : undefined,
      subject: activeSubject,
      level: activeLevel,
      q: activeSearch,
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
      <form action="/admin/requests" className="flex flex-wrap gap-2">
        {activeStatus !== 'all' && <input type="hidden" name="status" value={activeStatus} />}
        {activeSubject && <input type="hidden" name="subject" value={activeSubject} />}
        {activeLevel && <input type="hidden" name="level" value={activeLevel} />}
        <input
          type="search"
          name="q"
          defaultValue={activeSearch ?? ''}
          placeholder="Search student, requester, or subject"
          className="min-h-[38px] min-w-[260px] border-2 border-[#121212] px-3 py-1.5 text-sm"
          aria-label="Search requests"
        />
        <button
          type="submit"
          className="border-2 border-[#121212] bg-[#121212] px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-white"
        >
          Search
        </button>
        {activeSearch && (
          <a
            href={buildHref({ q: undefined })}
            className="inline-flex min-h-[38px] items-center border-2 border-[#B0B0B0] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-[#121212]/70 hover:border-[#1040C0] hover:text-[#1040C0]"
          >
            Clear
          </a>
        )}
      </form>

      {/* Subject filter */}
      <select
        value={activeSubject ?? ''}
        onChange={(e) => {
          window.location.href = buildHref({ subject: e.target.value || undefined })
        }}
        className=" border-2 border-[#121212] px-2 py-1.5 text-sm "
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
        className=" border-2 border-[#121212] px-2 py-1.5 text-sm "
        aria-label="Filter by level"
      >
        <option value="">All levels</option>
        <option value="o_levels">O Levels</option>
        <option value="a_levels">A Levels</option>
      </select>
    </div>
  )
}
