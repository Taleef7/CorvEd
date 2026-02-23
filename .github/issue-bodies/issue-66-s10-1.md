## Parent epic

Epic E10: tutor dashboard and session notes (P0) — #65

## User story

**As a tutor**, I can log into my dashboard and view all my upcoming teaching sessions — with the student's name, subject, level, session time (in my timezone), and the Google Meet link — so I can prepare and join on time.

---

## Acceptance criteria

- [ ] Tutor dashboard at `/tutor` shows a "next session" card (same layout as student, tutor perspective)
- [ ] Full sessions list at `/tutor/sessions` shows all upcoming sessions
- [ ] Each session shows: student name (from `user_profiles`), subject, level, date/time in tutor's TZ, Meet link
- [ ] Past sessions are shown in a history section with their status and tutor's own notes
- [ ] Sessions are sorted by `scheduled_start_utc` ascending
- [ ] If tutor has no sessions yet: "You have no sessions scheduled yet. Your first student will appear here once matched."

---

## Data query

```ts
// Tutor's sessions via RLS-protected query
const { data: sessions } = await supabase
  .from('sessions')
  .select(`
    id, scheduled_start_utc, status, tutor_notes,
    matches!match_id(
      meet_link,
      requests!request_id(
        level,
        subjects!subject_id(name),
        user_profiles!created_by_user_id(display_name, whatsapp_number)
      )
    )
  `)
  .order('scheduled_start_utc', { ascending: true })
```

---

## References

- `docs/MVP.md` — section 10.2 (tutor requirements — view upcoming sessions)
- `docs/PRODUCT.md` — section 5.2 (tutor journey step 4)
