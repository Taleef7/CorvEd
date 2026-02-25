// T11.3: Standalone "Open WhatsApp" link component
// Closes #76

import { buildWaLink } from '@/lib/whatsapp/buildLink'

interface WhatsAppLinkProps {
  number: string | null | undefined
  message?: string
  label?: string
}

export function WhatsAppLink({ number, message, label = 'Open WhatsApp' }: WhatsAppLinkProps) {
  if (!number) {
    return <span className="text-xs italic text-zinc-400">No WhatsApp number</span>
  }

  const href = buildWaLink(number, message)

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-[#1ebe57]"
    >
      💬 {label}
    </a>
  )
}
