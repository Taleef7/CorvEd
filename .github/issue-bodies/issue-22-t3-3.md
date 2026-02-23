## Parent epic

Epic E3: authentication and roles (P0) — #17

## Objective

Create the user profile form where a newly registered user can complete their profile with display name, WhatsApp number, and timezone — and persist this to the `public.user_profiles` table in Supabase.

---

## Background

From `docs/ARCHITECTURE.md` section 8.1 (signup workflow):
> "user completes profile fields in UI: display_name, whatsapp_number, timezone (auto-detected, editable)"

From `docs/MVP.md` section 10.1 (student/parent requirements):
> "profile includes: display name, WhatsApp number, timezone (required because overseas supported), relationship: student or parent, if parent: child name field (optional but recommended)"

The `handle_new_user()` trigger (created in T3.1) inserts a minimal profile row (`display_name = 'New User'`, `timezone = 'Asia/Karachi'`). This task adds a UI to let users fill in the real values.

---

## Profile fields

| Field | DB Column | Type | Required | Notes |
|-------|-----------|------|----------|-------|
| Display name | `display_name` | text | ✅ | User's name shown in platform |
| WhatsApp number | `whatsapp_number` | text | ✅ | Used for admin comms; store in international format |
| Timezone | `timezone` | text | ✅ | IANA format (e.g., `Asia/Karachi`); auto-detect on sign-up |
| Primary role context | `primary_role` | enum | admin-set | Not editable by user; set during sign-up as context only |

---

## Where profile is completed

**Option A** (recommended for MVP): Show a profile completion step after first login, before redirecting to the dashboard.

- After `auth/callback`, check if `whatsapp_number` is null
- If null → redirect to `/auth/profile-setup` page
- After saving → redirect to `/dashboard`

**Option B**: Allow profile editing from within the dashboard at any time (settings page).

For MVP, implement **Option A** first (required for onboarding), add Option B later.

---

## Component structure

**File**: `app/auth/profile-setup/page.tsx`

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const profileSchema = z.object({
  display_name: z.string().min(2, 'Name must be at least 2 characters'),
  whatsapp_number: z
    .string()
    .min(9, 'Enter a valid WhatsApp number')
    .regex(/^[+\d][\d\s\-()]{7,}$/, 'Enter a valid phone number'),
  timezone: z.string().min(1, 'Please select a timezone'),
})

type ProfileFormData = z.infer<typeof profileSchema>
```

Auto-detect timezone from browser:
```ts
const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
```

---

## Timezone selector

Provide a select dropdown with common timezones. Prioritize Pakistan-relevant timezones at the top:

- Asia/Karachi (PKT, UTC+5)
- America/New_York (EST/EDT)
- America/Chicago (CST/CDT)
- America/Denver (MST/MDT)
- America/Los_Angeles (PST/PDT)
- Europe/London (GMT/BST)
- Europe/Paris (CET/CEST)
- Asia/Dubai (GST, UTC+4)
- Asia/Riyadh (AST, UTC+3)
- ... (full IANA list or curated list of ~20 common ones)

For MVP, a curated list of 15–20 commonly used timezones is sufficient. Avoid shipping 600 IANA entries.

---

## WhatsApp number normalization

On save, normalize the WhatsApp number to international format:
- Strip spaces, dashes, parentheses
- If starts with `0`, replace with `+92` (Pakistan local → international)
- If starts with `92`, prepend `+`
- Otherwise keep as-is (assume user entered international format)

```ts
function normalizeWhatsApp(input: string): string {
  const stripped = input.replace(/[\s\-()]/g, '')
  if (stripped.startsWith('0')) return '+92' + stripped.slice(1)
  if (stripped.startsWith('92') && !stripped.startsWith('+')) return '+' + stripped
  return stripped
}
```

---

## Acceptance criteria

- [ ] Profile setup page exists at `/auth/profile-setup`
- [ ] After callback, users without a `whatsapp_number` are redirected to `/auth/profile-setup`
- [ ] Form has display name, WhatsApp number, and timezone fields
- [ ] Timezone is auto-detected from browser (`Intl.DateTimeFormat()`) and pre-filled
- [ ] WhatsApp number is normalized to international format on save
- [ ] Profile is saved to `public.user_profiles` via Supabase browser client
- [ ] After saving, user is redirected to `/dashboard`
- [ ] Validation errors are shown inline

---

## Definition of done

- [ ] `app/auth/profile-setup/page.tsx` exists with the form above
- [ ] Form saves `display_name`, `whatsapp_number`, `timezone` to `user_profiles`
- [ ] WhatsApp number normalization function is applied before save
- [ ] Timezone auto-detected and pre-filled
- [ ] Redirect logic: incomplete profile → `/auth/profile-setup`, complete → `/dashboard`
- [ ] Mobile-responsive

---

## References

- `docs/ARCHITECTURE.md` — section 5.3 (user_profiles table schema), section 8.1 (signup workflow), section 10.3 (wa.me number format)
- `docs/MVP.md` — section 3.2 (geography and timezones), section 10.1 (student/parent profile requirements)
- `docs/OPS.md` — section 10 (overseas students timezone playbook)
