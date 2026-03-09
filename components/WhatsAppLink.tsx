// T11.3: Standalone "Open WhatsApp" link component
// Closes #76

import { buildWaLink } from '@/lib/whatsapp/buildLink'
import { WaIcon } from '@/components/CopyMessageButton'

interface WhatsAppLinkProps {
  number: string | null | undefined
  message?: string
  label?: string
  /**
   * compact=true → icon-only square button with native title tooltip.
   * compact=false (default) → labelled button with text.
   */
  compact?: boolean
}

export function WhatsAppLink({
  number,
  message,
  label = 'Open WhatsApp',
  compact = false,
}: WhatsAppLinkProps) {
  if (!number) {
    return compact ? null : (
      <span className="text-xs italic text-[#121212]/40">No WhatsApp number</span>
    )
  }

  const href = buildWaLink(number, message)

  if (compact) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={label}
        aria-label={label}
        className="inline-flex h-8 w-8 items-center justify-center bg-[#25D366] text-white transition hover:bg-[#1ebe57]"
      >
        <WaIcon />
      </a>
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex items-center gap-1.5 bg-[#25D366] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#1ebe57]"
    >
      <WaIcon />
      {label}
    </a>
  )
}
