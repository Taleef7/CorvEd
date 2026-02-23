## Parent epic

Epic E2: landing page and lead capture (P0) — #10

## Objective

Add a "Chat on WhatsApp" call-to-action button to the landing page that opens a WhatsApp conversation with CorvEd — pre-filled with a standard intake message — so that visitors who prefer WhatsApp over a web form can begin the enquiry process immediately.

---

## Background

CorvEd is explicitly **WhatsApp-first** for operations. From `docs/MVP.md` section 8.1:

> "Primary comms: WhatsApp (WhatsApp Business recommended). Students do not directly message tutors by default in MVP — admin mediates."

From `docs/OPS.md` section 2.5:

> "device policy: use WhatsApp Web on desktop for speed; keep chat naming consistent"

And from `docs/OPS.md` section 6.1 (greeting message template):

> "Hello! Welcome to CorvEd 👋 We provide 1:1 online tutoring for O Levels and A Levels with verified teachers. To get started, please share: 1) Student or Parent? 2) Level (O / A) 3) Subject 4) City + Timezone 5) Availability (days + times) 6) Your goal (exam date or weak areas)"

The WhatsApp CTA button uses a `wa.me` deep link that pre-fills this message, reducing the friction from "click" to "conversation" to zero.

---

## Implementation

### `wa.me` deep link format

```
https://wa.me/<number>?text=<url-encoded-message>
```

**CorvEd WhatsApp number**: Store in an environment variable or a constants file (do **not** hard-code into component JSX).

```ts
// lib/config.ts (create if it doesn't exist)
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''
```

Add to `.env.example`:
```
NEXT_PUBLIC_WHATSAPP_NUMBER=923001234567
```

> **Format**: Use international format without `+` for `wa.me` links. Example: `923001234567` for Pakistan (+92 300 1234567).

### Prefilled message

Based on `docs/OPS.md` section 6.2 (/intake quick reply):

```
Hello CorvEd 👋 I'd like to enquire about tutoring.

1) I am a: [Student / Parent]
2) Level: [O Levels / A Levels]
3) Subject: 
4) Exam board (optional): 
5) Availability (days + times + timezone): 
6) My goal: 
```

This pre-fills the WhatsApp message so the visitor only needs to fill in their details.

### Component

Create `components/WhatsAppCTA.tsx`:

```tsx
import Link from 'next/link'

const PREFILLED_MESSAGE = encodeURIComponent(
  `Hello CorvEd 👋 I'd like to enquire about tutoring.\n\n` +
  `1) I am a: [Student / Parent]\n` +
  `2) Level: [O Levels / A Levels]\n` +
  `3) Subject: \n` +
  `4) Exam board (optional): \n` +
  `5) Availability (days + times + timezone): \n` +
  `6) My goal: `
)

export function WhatsAppCTA() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
  if (!number) return null

  const href = `https://wa.me/${number}?text=${PREFILLED_MESSAGE}`

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-6 py-3 text-white font-semibold hover:bg-green-600 transition-colors"
    >
      {/* WhatsApp icon SVG or emoji */}
      💬 Chat on WhatsApp
    </Link>
  )
}
```

---

## Placement on page

The WhatsApp CTA button should appear in **two locations** on the landing page:

1. **Hero section** — as a secondary CTA alongside the "Get Started" button (intake form scroll)
2. **Below the intake form** — as an alternative for users who prefer WhatsApp over form submission

Text for secondary placement: "Prefer WhatsApp? Chat with us directly →"

---

## Acceptance criteria

- [ ] `NEXT_PUBLIC_WHATSAPP_NUMBER` environment variable is added to `.env.example` (no real value)
- [ ] `lib/config.ts` (or equivalent) exports the WhatsApp number constant from env
- [ ] `components/WhatsAppCTA.tsx` exists and renders a valid `wa.me` link
- [ ] Clicking the button on mobile opens WhatsApp with the prefilled message
- [ ] Clicking the button on desktop opens WhatsApp Web or the desktop app
- [ ] Button does not render if `NEXT_PUBLIC_WHATSAPP_NUMBER` is not set (graceful fallback: return null)
- [ ] Button appears in the hero section and below the intake form
- [ ] Button styling is green (matches WhatsApp brand colour) and accessible (ARIA label included)
- [ ] `rel="noopener noreferrer"` is set on the link (security requirement for `target="_blank"`)

---

## Accessibility

Add an ARIA label to the link:

```tsx
aria-label="Chat with CorvEd on WhatsApp"
```

This ensures screen readers describe the button correctly.

---

## Proposed steps

1. Add `NEXT_PUBLIC_WHATSAPP_NUMBER` to `.env.example`
2. Create `lib/config.ts` with the exported constant
3. Create `components/WhatsAppCTA.tsx` with the implementation above
4. Embed `<WhatsAppCTA />` in the Hero section of `app/page.tsx`
5. Embed `<WhatsAppCTA />` below `<LeadForm />` in `app/page.tsx`
6. Manually test on mobile: tap button → WhatsApp opens → pre-filled message visible
7. Manually test on desktop: click button → WhatsApp Web opens

---

## Definition of done

- [ ] `NEXT_PUBLIC_WHATSAPP_NUMBER` added to `.env.example`
- [ ] `components/WhatsAppCTA.tsx` is created and renders the correct `wa.me` link
- [ ] Prefilled message matches the template from `docs/OPS.md` section 6.2
- [ ] Button appears in both Hero and below the intake form
- [ ] Link has `rel="noopener noreferrer"` and `aria-label`
- [ ] Tested on mobile: WhatsApp opens with prefilled message
- [ ] Button does not error when `NEXT_PUBLIC_WHATSAPP_NUMBER` is missing

---

## Dependencies

- **T2.1 (#13)** — landing page (`app/page.tsx`) must exist before button can be embedded
- **E1 T1.1 (#6)** — `.env.example` must be committed (it exists from T1.1)

---

## Risks / edge cases

- **`wa.me` link format**: The number must be in international format without `+`. If the number stored includes `+` or spaces, strip them before constructing the URL
- **Message encoding**: Use `encodeURIComponent()` — do not manually encode characters. Newlines should be `\n` before encoding
- **WhatsApp Web on desktop**: The `wa.me` link opens WhatsApp Web automatically on desktop browsers; no special handling needed
- **Missing env var in production**: If `NEXT_PUBLIC_WHATSAPP_NUMBER` is not set in Vercel environment variables, the button returns null. Document this in the Vercel deployment checklist

---

## References

- `docs/MVP.md` — section 8.1 (WhatsApp-first comms, wa.me deep links)
- `docs/OPS.md` — section 6.1 (greeting message template), section 6.2 (/intake quick reply)
- `docs/PRODUCT.md` — section 7.1 (UX requirements — reschedule button opens WhatsApp chat)
- `docs/ARCHITECTURE.md` — section 2.3 (env vars and secrets — NEXT_PUBLIC prefix rules)
