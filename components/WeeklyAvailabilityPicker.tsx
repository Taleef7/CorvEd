'use client'

/**
 * WeeklyAvailabilityPicker
 * Interactive grid for selecting weekly availability in broad time bands.
 * Rows = time bands (Morning / Afternoon / Evening / Night)
 * Cols = days (Mon → Sun)
 * Each cell represents a 4-hour availability window for that day.
 * Value format matches tutor_availability.windows JSONB:
 *   [{day: 1, start: "08:00", end: "12:00"}, ...]  (day 0=Sun … 6=Sat)
 */

export interface AvailabilityWindow {
  day: number   // 0 = Sunday … 6 = Saturday
  start: string // "HH:MM" 24h
  end: string   // "HH:MM" 24h
}

interface Props {
  value: AvailabilityWindow[]
  onChange: (windows: AvailabilityWindow[]) => void
  timezone?: string
  error?: string
}

const DAYS = [
  { label: 'Mon', day: 1 },
  { label: 'Tue', day: 2 },
  { label: 'Wed', day: 3 },
  { label: 'Thu', day: 4 },
  { label: 'Fri', day: 5 },
  { label: 'Sat', day: 6 },
  { label: 'Sun', day: 0 },
]

const BANDS = [
  { label: 'Morning',   hint: '8 AM – 12 PM', start: '08:00', end: '12:00', color: '#F0C020' },
  { label: 'Afternoon', hint: '12 – 4 PM',    start: '12:00', end: '16:00', color: '#D02020' },
  { label: 'Evening',   hint: '4 – 8 PM',     start: '16:00', end: '20:00', color: '#1040C0' },
  { label: 'Night',     hint: '8 – 11 PM',    start: '20:00', end: '23:00', color: '#121212' },
]

function key(day: number, start: string) {
  return `${day}-${start}`
}

export function WeeklyAvailabilityPicker({ value, onChange, timezone, error }: Props) {
  const activeKeys = new Set(value.map((w) => key(w.day, w.start)))

  function toggle(day: number, band: (typeof BANDS)[number]) {
    const k = key(day, band.start)
    if (activeKeys.has(k)) {
      onChange(value.filter((w) => !(w.day === day && w.start === band.start)))
    } else {
      onChange([...value, { day, start: band.start, end: band.end }])
    }
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-none">
        <table className="w-full border-collapse min-w-[400px]">
          <thead>
            <tr>
              <th className="w-20 pb-2 text-left text-[10px] font-bold uppercase tracking-widest text-[#121212]/40">
                Time
              </th>
              {DAYS.map((d) => (
                <th
                  key={d.day}
                  className="pb-2 text-center text-[11px] font-black uppercase tracking-wide text-[#121212]"
                >
                  {d.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BANDS.map((band) => (
              <tr key={band.start}>
                <td className="pr-2 py-1 align-middle">
                  <p className="text-[11px] font-black uppercase tracking-wide text-[#121212] leading-none">
                    {band.label}
                  </p>
                  <p className="text-[9px] text-[#121212]/40 mt-0.5">{band.hint}</p>
                </td>
                {DAYS.map((d) => {
                  const active = activeKeys.has(key(d.day, band.start))
                  return (
                    <td key={d.day} className="p-0.5 text-center">
                      <button
                        type="button"
                        onClick={() => toggle(d.day, band)}
                        aria-pressed={active}
                        aria-label={`${d.label} ${band.label} (${band.hint})`}
                        className={[
                          'w-full h-9 border-2 transition-all text-xs font-black',
                          active
                            ? 'text-white border-[#1040C0] bg-[#1040C0] shadow-[2px_2px_0px_0px_#121212]'
                            : 'border-[#D0D0D0] bg-white hover:border-[#1040C0] hover:bg-[#1040C0]/10 text-transparent',
                        ].join(' ')}
                      >
                        ✓
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <p className="text-[10px] text-[#121212]/40">
          {timezone ? `Times in your timezone (${timezone})` : 'Click cells to mark when you\'re free'}
        </p>
        {value.length > 0 ? (
          <p className="text-[11px] font-bold text-[#1040C0]">
            {value.length} slot{value.length !== 1 ? 's' : ''} selected
          </p>
        ) : (
          <p className="text-[11px] text-[#D02020]">Select at least one slot</p>
        )}
      </div>

      {error && (
        <p className="mt-1 text-xs text-[#D02020]">{error}</p>
      )}
    </div>
  )
}
