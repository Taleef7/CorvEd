## Parent epic

Epic E8: scheduling, sessions, and Google Meet links (P0) — #51

## Objective

Document and implement the Meet link storage strategy: one recurring Google Meet link per match, stored on the `matches` table and referenced by all sessions for that match. Provide the admin UI to set/update the Meet link.

---

## Background

From `docs/MVP.md` section 4.3:
> "delivery format: 1:1 Google Meet sessions. One recurring Meet link per student-subject match (fixed for the month)."

From `docs/ARCHITECTURE.md` section 5.6:
> "`matches.meet_link` — recurring meet link (one per match)"

From `docs/OPS.md` section 4 Workflow D:
> "send confirmation with: start date/time, recurring days/time, Meet link, reschedule cutoff"

---

## Storage strategy

```
Match ──────────────────── meet_link (one per match)
  │
  ├── Session 1 ──────── uses match.meet_link
  ├── Session 2 ──────── uses match.meet_link
  └── Session N ──────── uses match.meet_link
```

Sessions do **not** store their own meet link. The meet link is read by joining `sessions → matches → meet_link`.

**Query pattern for displaying sessions with meet link**:
```ts
const { data: sessions } = await supabase
  .from('sessions')
  .select('*, matches(meet_link, tutor_user_id, user_profiles!tutor_user_id(display_name))')
  .eq('matches.request_id', requestId)
  .order('scheduled_start_utc', { ascending: true })
```

---

## Admin UI: set/update Meet link

After a match is created (T7.3), the admin needs to enter the Meet link before sessions are visible to students.

**On match detail page** (`/admin/requests/[id]` or `/admin/matches/[id]`):

```
Google Meet link: [https://meet.google.com/xxx-xxxx-xxx] [Save]
```

**Server Action**:
```ts
export async function updateMeetLink(matchId: string, meetLink: string, adminUserId: string) {
  const admin = createAdminClient()

  // Validate URL format
  if (!meetLink.startsWith('https://meet.google.com/')) {
    throw new Error('Invalid Meet link format')
  }

  await admin.from('matches').update({ meet_link: meetLink }).eq('id', matchId)

  await admin.from('audit_logs').insert([{
    actor_user_id: adminUserId,
    action: 'meet_link_updated',
    entity_type: 'match',
    entity_id: matchId,
    details: { meet_link: meetLink }
  }])

  revalidatePath(`/admin/requests`)
}
```

---

## Meet link display rules

| User | Where shown |
|------|-------------|
| Student | Next session card (E9 T9.1), sessions list |
| Tutor | Tutor session list (E10 T10.1) |
| Admin | Match detail page |

The Meet link should be a clickable anchor tag that opens in a new tab:
```tsx
<a href={match.meet_link} target="_blank" rel="noopener noreferrer">
  Join Meet →
</a>
```

---

## Acceptance criteria

- [ ] `matches.meet_link` is the single source of truth for the recurring Meet link
- [ ] Admin can set/update the Meet link on the match detail page
- [ ] Meet link validation: must start with `https://meet.google.com/`
- [ ] Meet link is shown on all session cards for students and tutors
- [ ] Meet link update writes an audit log entry
- [ ] Sessions query always joins to `matches.meet_link` (not stored redundantly)

---

## Definition of done

- [ ] `updateMeetLink` Server Action exists and validates the URL
- [ ] Admin match detail page has a meet link input + save button
- [ ] Session query pattern joins `matches.meet_link`
- [ ] Audit log written on update

---

## References

- `docs/MVP.md` — section 4.3 (one recurring Meet link per match — locked decision)
- `docs/ARCHITECTURE.md` — section 5.6 (matches.meet_link)
- `docs/OPS.md` — section 4 Workflow D (Meet link in confirmation), section 6.7 (/matched template)
