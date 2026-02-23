## Parent epic

Epic E9: student dashboard (P0) — #58

## Objective

Build the main student dashboard at `app/dashboard/page.tsx` with a prominent "next session" card showing the upcoming session time, tutor name, and a clickable Meet link.

---

## Background

From `docs/PRODUCT.md` section 7.1:
> "dashboard always shows: next session time, Meet link, remaining sessions, tutor name"

This is the first thing a student sees after logging in. It must be immediately actionable — they should be able to join their class without any navigation.

---

## "Next Session" card design

```
┌────────────────────────────────────────────────────────┐
│  🎓 Your Next Session                                  │
│                                                        │
│  Mathematics — A Levels                                │
│  With: Ali Hassan                                      │
│  📅 Monday, Feb 24, 2026 at 7:00 PM (PKT)            │
│  ⏳ In 2 hours 15 minutes                              │
│                                                        │
│  [🔗 Join Google Meet]  [📲 Reschedule via WhatsApp]  │
└────────────────────────────────────────────────────────┘
```

Features:
- Session time shown in **student's timezone** (`user_profiles.timezone`)
- "In X hours/minutes" countdown (client-side, using browser's current time)
- "Join Google Meet" — clickable link opening in new tab
- "Reschedule via WhatsApp" — links to wa.me deep link (T9.4)

---

## Data query

```ts
// Get the next upcoming session for this user
const { data: nextSession } = await supabase
  .from('sessions')
  .select(`
    id, scheduled_start_utc, scheduled_end_utc, status,
    matches!match_id(
      meet_link,
      tutor:tutor_user_id(display_name),
      request:request_id(level, subjects!subject_id(name))
    )
  `)
  .gt('scheduled_start_utc', new Date().toISOString())
  .eq('status', 'scheduled')
  .order('scheduled_start_utc', { ascending: true })
  .limit(1)
  .single()
```

---

## Empty states

| Scenario | Message shown |
|----------|--------------|
| No active match yet | "We're finding your teacher — we'll notify you on WhatsApp once matched." |
| No sessions generated yet | "Your sessions will appear here once your schedule is confirmed." |
| Package pending payment | "Waiting for payment confirmation. Sessions will be scheduled shortly." |

---

## Acceptance criteria

- [ ] `app/dashboard/page.tsx` shows the next upcoming session card prominently
- [ ] Card shows: subject, level, tutor name, date/time in student's TZ, countdown hint
- [ ] "Join Meet" link opens the correct URL in a new tab
- [ ] "Reschedule" button links to WhatsApp (T9.4)
- [ ] Empty states are handled gracefully (no 500 errors, friendly messages)
- [ ] Server-rendered (uses `createClient` from `lib/supabase/server.ts`)
- [ ] If no upcoming sessions, shows motivational empty state

---

## Definition of done

- [ ] `app/dashboard/page.tsx` renders the next session card
- [ ] Session time displayed in student's timezone
- [ ] Empty states handled
- [ ] "Join Meet" and "Reschedule" actions work

---

## References

- `docs/PRODUCT.md` — section 7.1 (UX — next session card requirements)
- `docs/MVP.md` — section 10.1 (student dashboard)
- `docs/ARCHITECTURE.md` — section 5.6 (sessions table), section 9.2 (timezone display)
