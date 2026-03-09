'use client'

// Client filter components for the student sessions page.
// Subject chips + view toggle + status filter — all URL-driven (no local state for values).

export type SessionView = 'upcoming' | 'past'

// ── Subject filter chips ──────────────────────────────────────────────────────

export function SubjectChips({
  subjects,
  activeSubject,
}: {
  subjects: string[]
  activeSubject: string
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <a
        href="/dashboard/sessions"
        className={`flex-shrink-0 whitespace-nowrap border-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
          !activeSubject
            ? 'border-[#121212] bg-[#121212] text-white'
            : 'border-[#D0D0D0] bg-white text-[#121212]/60 hover:border-[#121212] hover:text-[#121212]'
        }`}
      >
        All Subjects
      </a>
      {subjects.map((subj) => {
        const isActive = subj === activeSubject
        return (
          <a
            key={subj}
            href={`/dashboard/sessions?subject=${encodeURIComponent(subj)}`}
            className={`flex-shrink-0 whitespace-nowrap border-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
              isActive
                ? 'border-[#121212] bg-[#121212] text-white'
                : 'border-[#D0D0D0] bg-white text-[#121212]/60 hover:border-[#121212] hover:text-[#121212]'
            }`}
          >
            {subj}
          </a>
        )
      })}
    </div>
  )
}

// ── View toggle + status filter ───────────────────────────────────────────────

export function StudentViewControls({
  subject,
  view,
  status,
  upcomingCount,
  pastCount,
}: {
  subject?: string
  view: SessionView
  status: string
  upcomingCount: number
  pastCount: number
}) {
  function buildHref(params: { view?: SessionView; status?: string }): string {
    const q: Record<string, string> = {}
    if (subject) q.subject = subject
    q.view = params.view ?? view
    const newStatus = params.status !== undefined ? params.status : status
    if (newStatus) q.status = newStatus
    return `/dashboard/sessions?${new URLSearchParams(q)}`
  }

  const tabs: { value: SessionView; label: string; count: number }[] = [
    { value: 'upcoming', label: 'Upcoming', count: upcomingCount },
    { value: 'past', label: 'Past', count: pastCount },
  ]

  const statuses = [
    { value: '', label: 'All statuses' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'rescheduled', label: 'Rescheduled' },
    { value: 'done', label: 'Done' },
    { value: 'no_show_student', label: 'My no-show' },
    { value: 'no_show_tutor', label: 'Tutor no-show' },
  ]

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex border-b-2 border-[#121212]">
        {tabs.map((tab) => {
          const isActive = view === tab.value
          return (
            <a
              key={tab.value}
              href={buildHref({ view: tab.value })}
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
      <select
        value={status}
        onChange={(e) => {
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
