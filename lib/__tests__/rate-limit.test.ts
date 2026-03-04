import { describe, it, expect, vi, afterEach } from 'vitest'
import { checkRateLimit } from '../rate-limit'

describe('checkRateLimit', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows requests within limit', () => {
    const key = `test-${Date.now()}-allow`
    const result1 = checkRateLimit(key, 3, 60000)
    expect(result1.success).toBe(true)
    expect(result1.remaining).toBe(2)

    const result2 = checkRateLimit(key, 3, 60000)
    expect(result2.success).toBe(true)
    expect(result2.remaining).toBe(1)

    const result3 = checkRateLimit(key, 3, 60000)
    expect(result3.success).toBe(true)
    expect(result3.remaining).toBe(0)
  })

  it('blocks requests exceeding limit', () => {
    const key = `test-${Date.now()}-block`
    checkRateLimit(key, 2, 60000)
    checkRateLimit(key, 2, 60000)

    const result = checkRateLimit(key, 2, 60000)
    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('resets after window expires', () => {
    vi.useFakeTimers()
    const key = 'test-reset-window'

    checkRateLimit(key, 1, 5000) // 5s window, limit 1
    const blocked = checkRateLimit(key, 1, 5000)
    expect(blocked.success).toBe(false)

    // Advance past the window
    vi.advanceTimersByTime(5001)

    const result = checkRateLimit(key, 1, 5000)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(0)
  })

  it('handles different keys independently', () => {
    const key1 = `test-${Date.now()}-a`
    const key2 = `test-${Date.now()}-b`

    checkRateLimit(key1, 1, 60000)
    const result1 = checkRateLimit(key1, 1, 60000)
    expect(result1.success).toBe(false)

    const result2 = checkRateLimit(key2, 1, 60000)
    expect(result2.success).toBe(true)
  })
})
