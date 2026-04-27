export type AuthThrottleAction = 'sign_in' | 'sign_up' | 'password_reset' | 'oauth'

type AuthThrottleStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

type AuthThrottleResult =
  | { allowed: true; remaining: number }
  | { allowed: false; remaining: 0; retryAfterSeconds: number }

const AUTH_THROTTLE_RULES: Record<AuthThrottleAction, { limit: number; windowMs: number }> = {
  sign_in: { limit: 5, windowMs: 60 * 1000 },
  sign_up: { limit: 3, windowMs: 60 * 1000 },
  password_reset: { limit: 1, windowMs: 60 * 1000 },
  oauth: { limit: 1, windowMs: 60 * 1000 },
}

const STORAGE_PREFIX = 'corved:auth-throttle:'

export const AUTH_THROTTLE_MESSAGE =
  'Too many auth attempts. Please wait a minute and try again.'

export function checkClientAuthThrottle(
  action: AuthThrottleAction,
  storage: AuthThrottleStorage,
  now = Date.now(),
): AuthThrottleResult {
  const rule = AUTH_THROTTLE_RULES[action]
  const key = `${STORAGE_PREFIX}${action}`

  try {
    const raw = storage.getItem(key)
    const record = raw ? JSON.parse(raw) as { count?: unknown; resetAt?: unknown } : null
    const count = typeof record?.count === 'number' ? record.count : 0
    const resetAt = typeof record?.resetAt === 'number' ? record.resetAt : 0

    if (!record || now >= resetAt) {
      storage.setItem(key, JSON.stringify({ count: 1, resetAt: now + rule.windowMs }))
      return { allowed: true, remaining: rule.limit - 1 }
    }

    if (count >= rule.limit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)),
      }
    }

    const nextCount = count + 1
    storage.setItem(key, JSON.stringify({ count: nextCount, resetAt }))
    return { allowed: true, remaining: Math.max(0, rule.limit - nextCount) }
  } catch {
    return { allowed: true, remaining: rule.limit - 1 }
  }
}

export function clearClientAuthThrottle(
  action: AuthThrottleAction,
  storage: AuthThrottleStorage,
): void {
  try {
    storage.removeItem(`${STORAGE_PREFIX}${action}`)
  } catch {
    // Browser storage can be blocked. Supabase Auth still enforces provider limits.
  }
}

export function getFriendlyAuthErrorMessage(message: string, fallback: string): string {
  const lower = message.toLowerCase()
  if (
    lower.includes('rate limit') ||
    lower.includes('too many') ||
    lower.includes('security purposes')
  ) {
    return AUTH_THROTTLE_MESSAGE
  }

  return fallback
}
