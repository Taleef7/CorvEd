// E8 T8.1: Session generation algorithm using luxon for timezone-aware date math
// Closes #54

import { DateTime } from 'luxon'

export interface SchedulePattern {
  timezone: string
  days: number[]       // 0=Sun, 1=Mon, ..., 6=Sat (JS Date.getDay() convention)
  time: string         // "HH:mm" in 24-hour format
  duration_mins: number
}

/**
 * Generate UTC session time slots given a recurring weekly schedule pattern.
 *
 * Iterates dates from startDate to endDate (inclusive) in the pattern's timezone.
 * For each date whose day-of-week matches pattern.days, produces a session.
 * Stops when tierSessions sessions have been generated.
 *
 * NOTE: luxon weekday is 1=Mon…7=Sun. We convert with `luxonWeekday % 7`
 * to get 0=Sun, 1=Mon…6=Sat matching the JS/schedule_pattern convention.
 */
export function generateSessions(
  schedulePattern: SchedulePattern,
  startDate: string,   // "YYYY-MM-DD"
  endDate: string,     // "YYYY-MM-DD"
  tierSessions: number,
): { start_utc: string; end_utc: string }[] {
  const { timezone, days, time, duration_mins } = schedulePattern
  const [hour, minute] = time.split(':').map(Number)
  const sessions: { start_utc: string; end_utc: string }[] = []

  let current = DateTime.fromISO(startDate, { zone: timezone }).startOf('day')
  const end = DateTime.fromISO(endDate, { zone: timezone }).startOf('day')

  while (current <= end && sessions.length < tierSessions) {
    // luxon weekday: 1=Mon…7=Sun → convert to 0=Sun,1=Mon…6=Sat
    const jsDay = current.weekday % 7

    if (days.includes(jsDay)) {
      const sessionStart = current.set({ hour, minute, second: 0, millisecond: 0 })
      const sessionEnd = sessionStart.plus({ minutes: duration_mins })
      sessions.push({
        start_utc: sessionStart.toUTC().toISO()!,
        end_utc: sessionEnd.toUTC().toISO()!,
      })
    }

    current = current.plus({ days: 1 })
  }

  return sessions
}
