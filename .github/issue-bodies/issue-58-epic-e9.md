## Goal

Build the student/parent dashboard — the primary post-login view for students and parents — showing the next upcoming session, tutor name, Meet link, full sessions list, package summary with sessions remaining, and a WhatsApp reschedule button.

---

## Why this matters

From `docs/PRODUCT.md` section 7.1 (UX requirements):
> "dashboard always shows: next session time, Meet link, remaining sessions, tutor name"

The student dashboard is what makes CorvEd feel like a real service rather than a manual arrangement. It gives students confidence and reduces WhatsApp enquiries ("when is my next class?", "what's the link?").

---

## Child issues and status

| Issue | Type | Title | Status |
|-------|------|--------|--------|
| S9.1 (#59) | Story | As a student/parent, I can view my tutor, schedule, and Meet link | **open** |
| S9.2 (#60) | Story | As a student/parent, I can see sessions remaining in my package | **open** |
| T9.1 (#61) | Task | Dashboard with next session card (time + Meet link) | **open** |
| T9.2 (#62) | Task | Sessions list (upcoming + past) | **open** |
| T9.3 (#63) | Task | Package summary (remaining sessions) | **open** |
| T9.4 (#64) | Task | "Reschedule" button opens WhatsApp chat with prefilled message | **open** |

---

## Dashboard layout

The student dashboard at `app/dashboard/page.tsx`:

```
[Next Session Card]                    [Package Summary Card]
  Subject: Mathematics (A Levels)       Package: 12 sessions
  Tutor: Ali Hassan                     Used: 3 of 12
  Time: Mon Feb 24 at 7:00 PM PKT      Remaining: 9
  [Join Meet →]                         Month: Feb 1 – Feb 28
  [Reschedule via WhatsApp]

[Upcoming Sessions]         [Past Sessions]
  Mon Feb 24 — 7PM PKT      Wed Feb 19 — 7PM PKT
  [Join Meet →]             Status: Done | Note: "..."
  [Reschedule]
```

---

## Exit criteria (E9 is done when)

- [ ] Student can see their next upcoming session with time (in their TZ), tutor name, Meet link
- [ ] Full upcoming + past session list is visible
- [ ] Package summary shows tier, sessions used, sessions remaining, month window
- [ ] "Reschedule" button opens WhatsApp with prefilled message
- [ ] Dashboard handles the state where no sessions exist yet ("Your sessions will appear here once scheduled")
- [ ] All session times displayed in student's timezone (`user_profiles.timezone`)

---

## Data dependency on earlier epics

| Data needed | Provided by |
|-------------|-------------|
| Sessions list | E8 T8.1 (session generator) |
| Meet link | E8 T8.2 (meet link storage) |
| Package summary | E5 T5.4 |
| Tutor name | E7 T7.3 (match record) |
| Reschedule WhatsApp button | T9.4 |

---

## References

- `docs/PRODUCT.md` — section 5.1 (student journey, step 7: view dashboard), section 7.1 (UX — always show next session + Meet link + remaining)
- `docs/MVP.md` — section 10.1 (student dashboard requirements)
- `docs/OPS.md` — section 6.7 (/matched template), section 6.8 (/rem1h reminder — shows what info is expected)
- `docs/ROADMAP.md` — Sprint 3 (student dashboard)
