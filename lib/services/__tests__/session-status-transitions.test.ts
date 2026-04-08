import { describe, expect, test } from 'vitest'

import {
  getSessionUsageAdjustment,
  isSessionCompletionAllowed,
} from '@/lib/services/session-status-transitions'

describe('getSessionUsageAdjustment', () => {
  test('increments when moving from scheduled to a consuming status', () => {
    expect(getSessionUsageAdjustment('scheduled', 'done')).toBe(1)
    expect(getSessionUsageAdjustment('rescheduled', 'no_show_student')).toBe(1)
  })

  test('does not change counts when moving between consuming statuses', () => {
    expect(getSessionUsageAdjustment('done', 'no_show_student')).toBe(0)
    expect(getSessionUsageAdjustment('no_show_student', 'done')).toBe(0)
  })

  test('decrements when moving from a consuming status to a non-consuming status', () => {
    expect(getSessionUsageAdjustment('done', 'no_show_tutor')).toBe(-1)
    expect(getSessionUsageAdjustment('no_show_student', 'rescheduled')).toBe(-1)
  })
})

describe('isSessionCompletionAllowed', () => {
  test('blocks completion/no-show before the scheduled start', () => {
    const now = new Date('2026-04-08T12:00:00.000Z')

    expect(
      isSessionCompletionAllowed({
        scheduledStartUtc: '2026-04-08T12:01:00.000Z',
        now,
      }),
    ).toBe(false)
  })

  test('allows completion/no-show at or after the scheduled start', () => {
    const now = new Date('2026-04-08T12:00:00.000Z')

    expect(
      isSessionCompletionAllowed({
        scheduledStartUtc: '2026-04-08T12:00:00.000Z',
        now,
      }),
    ).toBe(true)
  })
})
