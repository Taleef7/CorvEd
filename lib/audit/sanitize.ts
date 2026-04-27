import type { Json } from '@/lib/supabase/database.types'

const SENSITIVE_KEY_PATTERNS = [
  /admin.*notes?/i,
  /tutor.*notes?/i,
  /\bnotes?\b/i,
  /reason/i,
  /rejection.*note/i,
  /meet.*link/i,
  /whats.?app/i,
  /phone/i,
  /payment.*ref/i,
  /reference/i,
  /display.*name/i,
  /full.*name/i,
  /contact/i,
  /message/i,
]

const PHONE_LIKE_PATTERN = /\+?\d[\d\s().-]{7,}\d/
const MEET_LINK_PATTERN = /https:\/\/meet\.google\.com\/[a-z0-9-]+/i
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function shouldRedactKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key))
}

function shouldRedactValue(value: unknown): boolean {
  return (
    typeof value === 'string' &&
    !UUID_PATTERN.test(value) &&
    (PHONE_LIKE_PATTERN.test(value) || MEET_LINK_PATTERN.test(value))
  )
}

function sanitizeValue(value: unknown): Json | undefined {
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    if (shouldRedactValue(value)) return undefined
    return value
  }

  if (Array.isArray(value)) {
    const sanitized = value
      .map((entry) => sanitizeValue(entry))
      .filter((entry): entry is Json => entry !== undefined)
    return sanitized
  }

  if (isPlainObject(value)) {
    return sanitizeAuditDetails(value)
  }

  return undefined
}

export function sanitizeAuditDetails(details: Record<string, unknown>): Json {
  const sanitized: Record<string, Json> = {}

  for (const [key, value] of Object.entries(details)) {
    if (shouldRedactKey(key) || shouldRedactValue(value)) {
      sanitized[`${key}_redacted`] = true
      continue
    }

    const safeValue = sanitizeValue(value)
    if (safeValue !== undefined) {
      sanitized[key] = safeValue
    }
  }

  return sanitized
}
