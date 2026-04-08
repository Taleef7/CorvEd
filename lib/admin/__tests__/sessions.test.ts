import { describe, expect, test } from 'vitest'

import { getAdminSessionStatusFilterOptions, resolveAdminSessionStatusFilter } from '@/lib/admin/sessions'

describe('resolveAdminSessionStatusFilter', () => {
  test('expands grouped no-show filters into both no-show statuses', () => {
    expect(resolveAdminSessionStatusFilter('no_show')).toEqual(['no_show_student', 'no_show_tutor'])
  })

  test('passes through concrete session statuses', () => {
    expect(resolveAdminSessionStatusFilter('scheduled')).toEqual(['scheduled'])
    expect(resolveAdminSessionStatusFilter('done')).toEqual(['done'])
  })

  test('drops invalid status filters', () => {
    expect(resolveAdminSessionStatusFilter('bogus')).toEqual([])
    expect(resolveAdminSessionStatusFilter('')).toEqual([])
  })
})

describe('getAdminSessionStatusFilterOptions', () => {
  test('includes a grouped no-show filter option for analytics deep links', () => {
    expect(getAdminSessionStatusFilterOptions()).toContainEqual({
      value: 'no_show',
      label: 'No-show (all)',
    })
  })
})
