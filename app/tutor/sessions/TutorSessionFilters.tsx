'use client'

// Client filter components for the tutor sessions page.
// Student chips + view toggle + status filter — all URL-driven (no local state for values).

export type SessionView = 'upcoming' | 'past'

export type StudentChipData = {
  userId: string
  forStudentName: string | null
  displayName: string
  upcomingCount: number
}

// ── Student filter chips ──────────────────────────────────────────────────────

export function StudentChips({
  students,
  activeStudentId,
  activeChildName,
}: {
  students: StudentChipData[]
  activeStudentId: string
  activeChildName?: string
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <a
        href="/tutor/sessions"
        className={`flex-shrink-0 whitespace-nowrap border-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
          !activeStudentId
            ? 'border-[#121212] bg-[#121212] text-white'
            : 'border-[#D0D0D0] bg-white text-[#121212]/60 hover:border-[#121212] hover:text-[#121212]'
        }`}
      >
        All Students
      </a>
      {students.map((s) => {
        const childParam = encodeURIComponent(s.forStudentName ?? '')
        const isActive =
          s.userId === activeStudentId &&
          (activeChildName !== undefined
            ? (s.forStudentName ?? '') === activeChildName
            : true)
        return (
          <a
            key={`${s.userId}:${s.forStudentName ?? ''}`}
            href={`/tutor/sessions?student=${s.userId}&child=${childParam}`}
            className={`flex-shrink-0 whitespace-nowrap border-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
              isActive
                ? 'border-[#121212] bg-[#121212] text-white'
                : 'border-[#D0D0D0] bg-white text-[#121212]/60 hover:border-[#121212] hover:text-[#121212]'
            }`}
          >
            {s.displayName}
            {s.upcomingCount > 0 && (
              <span
                className={`ml-1.5 text-[11px] ${isActive ? 'text-white/70' : 'text-[#121212]/40'}`}
              >
                {s.upcomingCount}
              </span>
            )}
          </a>
        )
      })}
    </div>
  )
}

// ── View toggle + status filter ───────────────────────────────────────────────

export function TutorViewControls({
  studentId,
  childName,
  view,
  status,
  upcomingCount,
  pastCount,
}: {
  studentId?: string
  childName?: string
  view: SessionView
  status: string
  upcomingCount: number
  pastCount: number
}) {
  function buildHref(params: { view?: SessionView; status?: string }): string {
    const q: Record<string, string> = {}
    if (studentId) q.student = studentId
    if (childName !== undefined) q.child = childName
    q.view = params.view ?? view
    const newStatus = params.status !== undefined ? params.status : status
    if (newStatus) q.status = newStatus
    return `/tutor/sessions?${new URLSearchParams(q)}`
  }

  const tabs: { value: SessionView; label: string; count: number }[] = [
    { value: 'upcoming', label: 'Upcoming', count: upcomingCount },
    { value: 'past', label: 'Past', count: pastCount },
  ]

  const statuses = [
    { value: '', label: 'All statuses' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'done', label: 'Done' },
    { value: 'rescheduled', label: 'Rescheduled' },
    { value: 'no_show_student', label: 'No-show (student)' },
    { value: 'no_show_tutor', label: 'No-show (tutor)' },
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
