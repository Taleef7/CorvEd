import { describe, expect, test } from 'vitest'

import { formatPkr } from '@/lib/utils/currency'

describe('formatPkr', () => {
  test('formats whole PKR amounts with a stable launch-friendly prefix', () => {
    expect(formatPkr(8000)).toBe('PKR 8,000')
    expect(formatPkr(16000)).toBe('PKR 16,000')
  })

  test('keeps zero placeholder values readable', () => {
    expect(formatPkr(0)).toBe('PKR 0')
  })
})
