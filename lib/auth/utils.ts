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
