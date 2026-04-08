/**
 * Validate a post-login redirect target.
 * Must be a relative path starting with `/` but not `//` (protocol-relative).
 * Falls back to `/dashboard` for any invalid value.
 */
export function safeNext(raw: string | null): string {
  if (!raw) return '/dashboard'
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/dashboard'
  return raw
}

export type AuthFlow = 'signup' | 'signin'
export type OAuthAccountType = 'student' | 'parent'

const FRESH_OAUTH_SIGNUP_WINDOW_MS = 10 * 60 * 1000

export function buildAuthCallbackUrl(
  origin: string,
  options?: {
    next?: string
    flow?: AuthFlow
    accountType?: OAuthAccountType
  },
): string {
  const url = new URL('/auth/callback', origin)
  const next = safeNext(options?.next ?? null)

  if (next !== '/dashboard') {
    url.searchParams.set('next', next)
  }
  if (options?.flow) {
    url.searchParams.set('flow', options.flow)
  }
  if (options?.flow === 'signup' && options.accountType) {
    url.searchParams.set('account_type', options.accountType)
  }

  return url.toString()
}

export function shouldPromoteOAuthParentSignup({
  flow,
  accountType,
  primaryRole,
  assignedRoles,
  whatsappNumber,
  profileCreatedAt,
  now = new Date(),
}: {
  flow: string | null
  accountType: string | null
  primaryRole: string | null
  assignedRoles: string[]
  whatsappNumber: string | null
  profileCreatedAt: string | null
  now?: Date
}): boolean {
  if (flow !== 'signup' || accountType !== 'parent') return false
  if (primaryRole !== 'student') return false
  if (whatsappNumber) return false
  if (assignedRoles.length !== 1 || assignedRoles[0] !== 'student') return false
  if (!profileCreatedAt) return false

  const createdAtMs = new Date(profileCreatedAt).getTime()
  if (Number.isNaN(createdAtMs)) return false

  return now.getTime() - createdAtMs <= FRESH_OAUTH_SIGNUP_WINDOW_MS
}
