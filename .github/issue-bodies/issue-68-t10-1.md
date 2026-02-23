## Parent epic

Epic E10: tutor dashboard and session notes (P0) — #65

## Objective

Build the tutor sessions list at `/tutor/sessions` — a server-rendered page showing all sessions for the logged-in tutor, split into upcoming and past, with student name, subject, time (in tutor's TZ), Meet link, and status.

---

## Page: `app/tutor/sessions/page.tsx`

```ts
export const dynamic = 'force-dynamic'

export default async function TutorSessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  const { data: sessions } = await supabase
    .from('sessions')
    .select(`
      id, scheduled_start_utc, scheduled_end_utc, status, tutor_notes,
      matches!match_id(
        meet_link,
        requests!request_id(
          level, subjects!subject_id(name),
          user_profiles!created_by_user_id(display_name)
        )
      )
    `)
    .order('scheduled_start_utc', { ascending: true })

  const now = new Date().toISOString()
  const upcoming = sessions?.filter(s => s.scheduled_start_utc > now && s.status === 'scheduled')
  const past = sessions?.filter(s => s.scheduled_start_utc <= now || s.status !== 'scheduled')

  // ... render
}
```

---

## Session card (upcoming)

```
📅 Mon Feb 24, 2026 at 7:00 PM PKT
Student: Ahmed Ali | Mathematics — A Levels
[Join Meet →]
[✅ Mark Done]  [❌ Mark No-show]
```

## Session card (past)

```
✅ Wed Feb 19, 2026 at 7:00 PM PKT (Done)
Student: Ahmed Ali | Mathematics — A Levels
Note: "Covered integration by parts. Assigned worksheet 6."
```

---

## Acceptance criteria

- [ ] `/tutor/sessions` page exists
- [ ] Upcoming sessions show: date/time in tutor TZ, student name, subject, Meet link, action buttons
- [ ] Past sessions show: date/time, status badge, tutor notes (read-only)
- [ ] Sessions accessible only by the assigned tutor (enforced by RLS)
- [ ] Empty state handled ("No upcoming sessions")

---

## Definition of done

- [ ] Page exists and renders from server
- [ ] Upcoming/past split works correctly
- [ ] Tutor's timezone used for display
- [ ] "Mark Done" and "Mark No-show" buttons present (form in T10.2)

---

## References

- `docs/MVP.md` — section 10.2 (tutor session list)
- `docs/ARCHITECTURE.md` — section 5.6 (sessions table), section 9.2 (timezone display)
