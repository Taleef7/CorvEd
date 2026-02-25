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

  // Validate time format "HH:mm"
  const timeMatch = /^(\d{1,2}):(\d{2})$/.exec(time)
  if (!timeMatch) throw new Error(`Invalid time format: "${time}". Expected "HH:mm".`)
  const hour = parseInt(timeMatch[1], 10)
  const minute = parseInt(timeMatch[2], 10)
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error(`Time "${time}" is out of range. Hour must be 0–23, minute 0–59.`)
  }

  const sessions: { start_utc: string; end_utc: string }[] = []

  let current = DateTime.fromISO(startDate, { zone: timezone }).startOf('day')
  const end = DateTime.fromISO(endDate, { zone: timezone }).startOf('day')

  // Validate timezone — luxon sets isValid=false for unknown zones
  if (!current.isValid) {
    throw new Error(`Invalid timezone or start date: timezone="${timezone}", startDate="${startDate}".`)
  }
  if (!end.isValid) {
    throw new Error(`Invalid timezone or end date: timezone="${timezone}", endDate="${endDate}".`)
  }

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
