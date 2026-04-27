import { describe, expect, test } from 'vitest'

import { filterAdminRequestsBySearch, normalizeAdminRequestSearch } from '@/lib/admin/request-search'

const requests = [
  {
    for_student_name: 'Amina Khan',
    subjects: { name: 'Mathematics' },
    user_profiles: { display_name: 'Sara Khan' },
  },
  {
    for_student_name: null,
    subjects: { name: 'Physics' },
    user_profiles: { display_name: 'Bilal Ahmed' },
  },
]

describe('normalizeAdminRequestSearch', () => {
  test('trims and collapses repeated whitespace', () => {
    expect(normalizeAdminRequestSearch('  amina   math  ')).toBe('amina math')
  })
})

describe('filterAdminRequestsBySearch', () => {
  test('matches student/requester names and subject text case-insensitively', () => {
    expect(filterAdminRequestsBySearch(requests, 'amina')).toEqual([requests[0]])
    expect(filterAdminRequestsBySearch(requests, 'sara')).toEqual([requests[0]])
    expect(filterAdminRequestsBySearch(requests, 'PHY')).toEqual([requests[1]])
  })

  test('requires every search token to match the request search text', () => {
    expect(filterAdminRequestsBySearch(requests, 'amina mathematics')).toEqual([requests[0]])
    expect(filterAdminRequestsBySearch(requests, 'amina physics')).toEqual([])
  })
})
