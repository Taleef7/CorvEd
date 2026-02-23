## Parent epic

Epic E11: WhatsApp-first operations (P0) — #71

## Objective

Build a `wa.me` deep link builder utility and embed "Open WhatsApp" buttons across all admin pages, so the admin can open a direct WhatsApp chat with any student or tutor — with or without a pre-filled message — in a single click.

---

## Background

From `docs/ARCHITECTURE.md` section 10.3:
> "format: https://wa.me/<E164_NUMBER>?text=<urlencoded_message>"
> "ensure numbers are stored with country code for consistent deep links"
> "if users enter local format, normalize on save (application layer)"

---

## Utility: `lib/whatsapp/buildLink.ts`

```ts
export function buildWaLink(whatsappNumber: string, message?: string): string {
  // Strip everything except digits and leading +
  const digits = whatsappNumber.replace(/[^\d+]/g, '').replace(/^\+/, '')
  const base = `https://wa.me/${digits}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}
```

Usage:
```ts
import { buildWaLink } from '@/lib/whatsapp/buildLink'
import { templates } from '@/lib/whatsapp/templates'

// With prefilled message
const href = buildWaLink(student.whatsapp_number, templates.matched({ ... }))

// Without prefilled message (just open chat)
const href = buildWaLink(student.whatsapp_number)
```

---

## "Open WhatsApp" button placements

Beyond the copy buttons (T11.2 #75), standalone "Open chat" links should appear:

| Page | Contact | Message |
|------|---------|---------|
| `/admin/users/[id]` | Any user | None (just open chat) |
| `/admin/requests/[id]` | Student | None (quick access) |
| `/admin/tutors/[id]` | Tutor | None |
| `/admin/payments` | Student | Payment instructions (pre-filled) |

---

## WhatsApp chat link component

```tsx
// components/WhatsAppLink.tsx
import { buildWaLink } from '@/lib/whatsapp/buildLink'

interface Props {
  number: string
  message?: string
  label?: string
}

export function WhatsAppLink({ number, message, label = 'Open WhatsApp' }: Props) {
  if (!number) return <span className="text-gray-400 text-sm">No WhatsApp number</span>

  const href = buildWaLink(number, message)

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 text-sm"
      aria-label={`Open WhatsApp chat with this contact`}
    >
      💬 {label}
    </a>
  )
}
```

---

## Acceptance criteria

- [ ] `lib/whatsapp/buildLink.ts` exists with `buildWaLink` function
- [ ] Function strips non-digit characters and constructs correct `wa.me` URL
- [ ] Function handles missing message (no `?text=` appended)
- [ ] `WhatsAppLink` component exists and renders correctly
- [ ] Component returns a graceful fallback if `number` is empty/null
- [ ] Link has `rel="noopener noreferrer"` and `aria-label`
- [ ] "Open WhatsApp" buttons are present on user, request, tutor, and payment admin pages

---

## Definition of done

- [ ] `buildWaLink` utility exists and handles edge cases
- [ ] `WhatsAppLink` component exists
- [ ] Embedded in all 4 admin page locations listed above
- [ ] Manual test: click link → WhatsApp opens with correct number (and message if provided)

---

## References

- `docs/ARCHITECTURE.md` — section 10.3 (wa.me link builder — exact format required)
- `docs/OPS.md` — section 2.4 (one number policy), section 2.5 (chat naming)
