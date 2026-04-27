import { describe, expect, test } from 'vitest'

import {
  checkClientAuthThrottle,
  getFriendlyAuthErrorMessage,
} from '@/lib/auth/throttle'

function createStorage() {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
  }
}

describe('checkClientAuthThrottle', () => {
  test('allows attempts up to the per-action limit and returns remaining count', () => {
    const storage = createStorage()

    const first = checkClientAuthThrottle('password_reset', storage, 1_000)
    expect(first).toEqual({ allowed: true, remaining: 0 })

    const second = checkClientAuthThrottle('password_reset', storage, 1_500)
    if (second.allowed) throw new Error('Expected password reset throttle to block')
    expect(second.retryAfterSeconds).toBe(60)
  })

  test('resets the counter after the action window expires', () => {
    const storage = createStorage()

    expect(checkClientAuthThrottle('oauth', storage, 1_000).allowed).toBe(true)
    expect(checkClientAuthThrottle('oauth', storage, 1_500).allowed).toBe(false)

    const afterWindow = checkClientAuthThrottle('oauth', storage, 62_000)
    expect(afterWindow).toEqual({ allowed: true, remaining: 0 })
  })

  test('fails open when browser storage is unavailable', () => {
    const storage = {
      getItem: () => {
        throw new Error('storage disabled')
      },
      setItem: () => {
        throw new Error('storage disabled')
      },
      removeItem: () => {
        throw new Error('storage disabled')
      },
    }

    expect(checkClientAuthThrottle('sign_in', storage, 1_000)).toEqual({
      allowed: true,
      remaining: 4,
    })
  })
})

describe('getFriendlyAuthErrorMessage', () => {
  test('maps provider rate-limit errors to a non-enumerating retry message', () => {
    expect(
      getFriendlyAuthErrorMessage(
        'Email rate limit exceeded',
        'Could not complete the request.',
      ),
    ).toBe('Too many auth attempts. Please wait a minute and try again.')
  })

  test('uses the supplied fallback for account-specific provider errors', () => {
    expect(
      getFriendlyAuthErrorMessage(
        'User already registered',
        'Could not create the account. Check the details and try again.',
      ),
    ).toBe('Could not create the account. Check the details and try again.')
  })
})
