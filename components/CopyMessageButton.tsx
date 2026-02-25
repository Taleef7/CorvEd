'use client'

// T11.2 / S11.2: "Copy message" and optional "Open WhatsApp" button component
// Closes #75 #73

import { useState } from 'react'
import { buildWaLink } from '@/lib/whatsapp/buildLink'

interface CopyMessageButtonProps {
  message: string
  whatsappNumber?: string
  label?: string
}

export function CopyMessageButton({ message, whatsappNumber, label }: CopyMessageButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const waHref = whatsappNumber ? buildWaLink(whatsappNumber, message) : null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        aria-label={label ? `Copy: ${label}` : 'Copy message'}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      >
        {copied ? '✅ Copied!' : `📋 ${label ?? 'Copy message'}`}
      </button>

      {waHref && (
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open WhatsApp${label ? `: ${label}` : ''}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-[#1ebe57]"
        >
          💬 Open WhatsApp
        </a>
      )}
    </div>
  )
}
