export type AvailabilityWindow = {
  day: number
  start: string
  end: string
}

export type AvailabilityOverlapStatus =
  | 'overlap'
  | 'none'
  | 'missing_request'
  | 'missing_tutor'

export type AvailabilityOverlapSummary = {
  status: AvailabilityOverlapStatus
  overlaps: AvailabilityWindow[]
}

function timeToMinutes(time: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time)
  if (!match) return null

  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null

  return hours * 60 + minutes
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

export function getOverlappingAvailabilityWindows(
  requestWindows: AvailabilityWindow[],
  tutorWindows: AvailabilityWindow[],
): AvailabilityWindow[] {
  const overlaps: AvailabilityWindow[] = []

  for (const requestWindow of requestWindows) {
    const requestStart = timeToMinutes(requestWindow.start)
    const requestEnd = timeToMinutes(requestWindow.end)
    if (requestStart === null || requestEnd === null || requestEnd <= requestStart) continue

    for (const tutorWindow of tutorWindows) {
      if (requestWindow.day !== tutorWindow.day) continue

      const tutorStart = timeToMinutes(tutorWindow.start)
      const tutorEnd = timeToMinutes(tutorWindow.end)
      if (tutorStart === null || tutorEnd === null || tutorEnd <= tutorStart) continue

      const start = Math.max(requestStart, tutorStart)
      const end = Math.min(requestEnd, tutorEnd)

      if (end > start) {
        overlaps.push({
          day: requestWindow.day,
          start: minutesToTime(start),
          end: minutesToTime(end),
        })
      }
    }
  }

  return overlaps.sort((a, b) => a.day - b.day || a.start.localeCompare(b.start))
}

export function getAvailabilityOverlapSummary(
  requestWindows: AvailabilityWindow[],
  tutorWindows: AvailabilityWindow[],
): AvailabilityOverlapSummary {
  if (requestWindows.length === 0) {
    return { status: 'missing_request', overlaps: [] }
  }

  if (tutorWindows.length === 0) {
    return { status: 'missing_tutor', overlaps: [] }
  }

  const overlaps = getOverlappingAvailabilityWindows(requestWindows, tutorWindows)

  return {
    status: overlaps.length > 0 ? 'overlap' : 'none',
    overlaps,
  }
}
