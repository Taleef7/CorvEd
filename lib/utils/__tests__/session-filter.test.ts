import { describe, expect, test } from 'vitest'

import {
  SESSION_STATUS_FILTER_OPTIONS,
  getSessionStatusesForFilter,
  isSessionStatusFilter,
} from '@/lib/utils/session-filter'

describe('session status filters', () => {
  test('maps grouped no-show filter to both no-show session statuses', () => {
    expect(getSessionStatusesForFilter('no_show')).toEqual([
      'no_show_student',
      'no_show_tutor',
    ])
  })

  test('keeps concrete status filters as a single status', () => {
    expect(getSessionStatusesForFilter('scheduled')).toEqual(['scheduled'])
  })

  test('rejects unknown status filters', () => {
    expect(isSessionStatusFilter('nope')).toBe(false)
    expect(getSessionStatusesForFilter('nope')).toEqual([])
  })

  test('exposes the grouped no-show option for filter controls', () => {
    expect(SESSION_STATUS_FILTER_OPTIONS).toContainEqual({
      value: 'no_show',
      label: 'No-shows',
    })
  })
})
