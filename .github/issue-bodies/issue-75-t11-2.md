## Parent epic

Epic E11: WhatsApp-first operations (P0) — #71

## Objective

Add "Copy message" and "Open WhatsApp" buttons to admin pages — match detail, payment verification, and session pages — using the `CopyMessageButton` component and the `templates` functions from T11.1.

---

## Background

From `docs/ARCHITECTURE.md` section 10.2:
> "Admin UI should provide: 'copy message' button, 'open WhatsApp' button (wa.me) where possible"

---

## Placements

### 1. Match detail page (`/admin/requests/[id]` or `/admin/matches/[id]`)

**Buttons to add**:
- "Copy matched message for student" (template: `templates.matched(...)`)
- "Copy 1-hour reminder for student" (template: `templates.rem1h(...)`)
- "Copy 1-hour reminder for tutor" (same template, tutor WhatsApp number)
- "Copy tutor availability check" (template: `templates.tutorAvailCheck(...)`)

### 2. Payment verification page (`/admin/payments/[id]`)

**Buttons to add**:
- "Copy payment confirmed message" (template: `templates.paid(...)`)
- "Copy payment instructions" (template: `templates.paybank(...)`)

### 3. Session detail / admin sessions page (`/admin/sessions`)

**Buttons per session**:
- "Copy 1-hour reminder" (1 hour before sessions — admin runs this manually)
- "Copy late join follow-up" (template: `templates.lateJoin(...)`)
- "Copy student no-show notice" (template: `templates.studentNoShow(...)`)
- "Copy tutor no-show apology" (template: `templates.tutorNoShow(...)`)
- "Copy reschedule confirmed" (template: `templates.reschedConfirmed(...)`)

### 4. Package renewal section

- "Copy renewal reminder" (template: `templates.renewalReminder(...)`) — shown on packages approaching end date

---

## `CopyMessageButton` component

Built in S11.2 (#73). Import and use:

```tsx
import { CopyMessageButton } from '@/components/CopyMessageButton'
import { templates } from '@/lib/whatsapp/templates'

// In admin match page:
<CopyMessageButton
  label="Copy matched message"
  message={templates.matched({
    tutorName: match.tutor.display_name,
    days: formatDays(match.schedule_pattern.days),
    time: match.schedule_pattern.time,
    tz: studentTimezone,
    meetLink: match.meet_link,
  })}
  whatsappNumber={student.whatsapp_number}
/>
```

---

## Acceptance criteria

- [ ] Match detail page has all 4 copy/WhatsApp buttons listed above
- [ ] Payment verification page has 2 copy buttons
- [ ] Sessions admin page has 5 copy buttons per relevant session
- [ ] All buttons use `CopyMessageButton` component (T11.2 — S11.2)
- [ ] All template functions imported from `lib/whatsapp/templates.ts`
- [ ] WhatsApp number stripped to digits only before use in `wa.me` URL
- [ ] "Copied!" toast appears after clicking copy

---

## Definition of done

- [ ] All copy buttons embedded in admin pages
- [ ] Template functions provide correct variable values
- [ ] Manual test: copy a matched message and verify it matches OPS.md template exactly

---

## References

- `docs/ARCHITECTURE.md` — section 10.2 (copy-to-WhatsApp helpers), section 10.3 (wa.me link builder)
- `docs/OPS.md` — section 4 (which template is used at each workflow step), section 6 (template content)
