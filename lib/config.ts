// lib/config.ts
// Application-level constants derived from environment variables.
// Values prefixed with NEXT_PUBLIC_ are safe to expose to the browser.

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''
