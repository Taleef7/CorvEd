// T11.3: wa.me deep link builder utility
// Closes #76

/**
 * Builds a wa.me WhatsApp deep link for the given number and optional pre-filled message.
 * Strips all non-digit characters (including leading '+') from the number.
 * If message is provided, appends it as a URL-encoded ?text= parameter.
 */
export function buildWaLink(whatsappNumber: string, message?: string): string {
  const digits = whatsappNumber.replace(/[^\d+]/g, '').replace(/^\+/, '')
  const base = `https://wa.me/${digits}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}
