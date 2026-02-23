## Parent epic

Epic E11: WhatsApp-first operations (P0) — #71

## User story

**As an admin**, I can click a "Copy message" or "Open WhatsApp" button on any admin page (match detail, payment, sessions) and instantly get a pre-filled WhatsApp message ready to send — so I can communicate consistently without typing from scratch.

---

## Background

From `docs/ARCHITECTURE.md` section 10.2:
> "Admin UI should provide: 'copy message' button, 'open WhatsApp' button (wa.me) where possible"

From `docs/OPS.md` section 7 (WhatsApp quick replies):
> "save each template as a /quick_reply in WhatsApp Business App for offline access"

The admin should never need to type a standard message from memory. Buttons in the platform pre-fill everything.

---

## Acceptance criteria

- [ ] Match detail page: "Copy matched message" button (fills tutor name, schedule, Meet link)
- [ ] Payment verified page: "Copy payment confirmed message" (fills student name, package tier, next steps)
- [ ] Session reminder button: "Copy 1-hour reminder" (fills time, Meet link)
- [ ] Reschedule confirmation: "Copy reschedule message" (fills old/new time)
- [ ] Each button shows a "Copied!" toast after click
- [ ] "Open WhatsApp" variant opens `wa.me/<number>?text=<encoded_message>`
- [ ] Numbers come from `user_profiles.whatsapp_number` (already normalized to international format)

---

## Copy button component

```tsx
'use client'

import { useState } from 'react'

interface CopyMessageButtonProps {
  message: string
  whatsappNumber?: string  // If provided, show "Open WhatsApp" as well
  label?: string
}

export function CopyMessageButton({ message, whatsappNumber, label }: CopyMessageButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const waHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`
    : null

  return (
    <div className="flex gap-2">
      <button onClick={handleCopy}>
        {copied ? '✅ Copied!' : '📋 Copy message'}
      </button>
      {waHref && (
        <a href={waHref} target="_blank" rel="noopener noreferrer">
          💬 Open WhatsApp
        </a>
      )}
    </div>
  )
}
```

---

## Dependencies

- **T11.1 (#74)** — template functions must exist (called to generate `message` prop)

---

## References

- `docs/ARCHITECTURE.md` — section 10.2 (copy-to-WhatsApp helpers)
- `docs/OPS.md` — section 6 (templates), section 7 (quick replies)
