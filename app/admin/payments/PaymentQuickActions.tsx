'use client'

import { useState } from 'react'
import { buildWaLink } from '@/lib/whatsapp/buildLink'

interface PaymentQuickActionsProps {
  whatsappNumber: string | null
  confirmedMessage: string
  instructionsMessage: string
}

export function PaymentQuickActions({
  whatsappNumber,
  confirmedMessage,
  instructionsMessage,
}: PaymentQuickActionsProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  async function copyToClipboard(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 1500)
    } catch {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 1500)
    }
  }

  const waHref = whatsappNumber ? buildWaLink(whatsappNumber) : null

  return (
    <div className="flex items-center gap-1.5">
      {/* WhatsApp: single button */}
      {waHref ? (
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          title="Open WhatsApp chat"
          className="inline-flex h-8 items-center gap-1.5 bg-[#25D366] px-2.5 text-xs font-bold text-white transition hover:bg-[#1ebe57]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
          Chat
        </a>
      ) : (
        <span className="text-xs italic text-[#121212]/40" title="No WhatsApp number">
          No WA
        </span>
      )}

      {/* Divider */}
      <div className="h-5 w-px bg-[#E0E0E0]" />

      {/* Copy "payment confirmed" message */}
      <button
        type="button"
        onClick={() => copyToClipboard(confirmedMessage, 'confirmed')}
        title="Copy 'payment confirmed' message"
        className={`inline-flex h-8 items-center gap-1 border px-2.5 text-xs font-medium transition ${
          copiedKey === 'confirmed'
            ? 'border-green-500 bg-green-50 text-green-700'
            : 'border-[#D0D0D0] bg-white text-[#121212]/70 hover:bg-[#F0F0F0]'
        }`}
      >
        {copiedKey === 'confirmed' ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        )}
        {copiedKey === 'confirmed' ? 'Copied' : 'Confirmed'}
      </button>

      {/* Copy "payment instructions" message */}
      <button
        type="button"
        onClick={() => copyToClipboard(instructionsMessage, 'instructions')}
        title="Copy payment instructions message"
        className={`inline-flex h-8 items-center gap-1 border px-2.5 text-xs font-medium transition ${
          copiedKey === 'instructions'
            ? 'border-green-500 bg-green-50 text-green-700'
            : 'border-[#D0D0D0] bg-white text-[#121212]/70 hover:bg-[#F0F0F0]'
        }`}
      >
        {copiedKey === 'instructions' ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        )}
        {copiedKey === 'instructions' ? 'Copied' : 'Instructions'}
      </button>
    </div>
  )
}
