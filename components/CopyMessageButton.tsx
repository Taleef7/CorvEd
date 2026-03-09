'use client'

// T11.2 / S11.2: "Copy message" and optional "Open WhatsApp" button component
// Closes #75 #73

import { useState } from 'react'
import { buildWaLink } from '@/lib/whatsapp/buildLink'

// ── Icons ────────────────────────────────────────────────────────────────────

function ClipboardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function WaIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

interface CopyMessageButtonProps {
  message: string
  whatsappNumber?: string
  label?: string
  /**
   * compact=true → icon-only square button with native title tooltip.
   * compact=false (default) → labelled button with text.
   */
  compact?: boolean
}

export function CopyMessageButton({
  message,
  whatsappNumber,
  label,
  compact = false,
}: CopyMessageButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(message)
      } else {
        const ta = document.createElement('textarea')
        ta.value = message
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.focus()
        ta.select()
        try { document.execCommand('copy') } finally { document.body.removeChild(ta) }
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy message to clipboard:', err)
    }
  }

  const waHref = whatsappNumber ? buildWaLink(whatsappNumber, message) : null

  // ── Compact (labelled pill) mode ─────────────────────────────────────────
  // Shows: [icon] [short label]  –  title attribute = full message for hover preview
  if (compact) {
    return (
      <button
        type="button"
        onClick={handleCopy}
        title={message}
        aria-label={label ?? 'Copy message'}
        className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-xs font-medium transition ${
          copied
            ? 'border-green-500 bg-green-50 text-green-700'
            : 'border-[#D0D0D0] bg-white text-[#121212]/60 hover:border-[#121212] hover:text-[#121212]'
        }`}
      >
        {copied ? <CheckIcon /> : <ClipboardIcon />}
        <span>{copied ? 'Copied' : (label ?? 'Copy')}</span>
      </button>
    )
  }

  // ── Default (labelled) mode ───────────────────────────────────────────────
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        aria-label={label ? `Copy: ${label}` : 'Copy message'}
        className="inline-flex items-center gap-1.5 border border-[#B0B0B0] bg-white px-3 py-1.5 text-xs font-medium text-[#121212]/80 transition hover:bg-[#F0F0F0]"
      >
        {copied ? <CheckIcon /> : <ClipboardIcon />}
        {copied ? 'Copied!' : (label ?? 'Copy message')}
      </button>

      {waHref && (
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open WhatsApp${label ? `: ${label}` : ''}`}
          className="inline-flex items-center gap-1.5 bg-[#25D366] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#1ebe57]"
        >
          <WaIcon />
          Open WhatsApp
        </a>
      )}
    </div>
  )
}
