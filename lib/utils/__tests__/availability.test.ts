import { describe, expect, test } from 'vitest'

import {
  getAvailabilityOverlapSummary,
  getOverlappingAvailabilityWindows,
} from '@/lib/utils/availability'

describe('getOverlappingAvailabilityWindows', () => {
  test('returns same-day time intersections for structured availability windows', () => {
    expect(
      getOverlappingAvailabilityWindows(
        [{ day: 1, start: '17:00', end: '19:00' }],
        [{ day: 1, start: '18:00', end: '20:00' }],
      ),
    ).toEqual([{ day: 1, start: '18:00', end: '19:00' }])
  })

  test('ignores non-overlap and different-day windows', () => {
    expect(
      getOverlappingAvailabilityWindows(
        [{ day: 1, start: '17:00', end: '18:00' }],
        [
          { day: 1, start: '18:00', end: '19:00' },
          { day: 2, start: '17:30', end: '18:30' },
        ],
      ),
    ).toEqual([])
  })
})

describe('getAvailabilityOverlapSummary', () => {
  test('distinguishes missing request and tutor availability from no overlap', () => {
    expect(getAvailabilityOverlapSummary([], [{ day: 1, start: '17:00', end: '18:00' }])).toEqual({
      status: 'missing_request',
      overlaps: [],
    })

    expect(getAvailabilityOverlapSummary([{ day: 1, start: '17:00', end: '18:00' }], [])).toEqual({
      status: 'missing_tutor',
      overlaps: [],
    })

    expect(
      getAvailabilityOverlapSummary(
        [{ day: 1, start: '17:00', end: '18:00' }],
        [{ day: 1, start: '19:00', end: '20:00' }],
      ),
    ).toEqual({
      status: 'none',
      overlaps: [],
    })
  })
})
