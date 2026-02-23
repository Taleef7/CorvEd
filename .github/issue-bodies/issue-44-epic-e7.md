## Goal

Build the admin manual matching workflow — where the admin views a `ready_to_match` request, selects an eligible approved tutor, creates a Match record (with a recurring Google Meet link and schedule pattern), and advances the request to `matched` status.

---

## Why this matters

CorvEd's matching is intentionally manual in MVP. From `docs/MVP.md` section 2.2:
> "automated tutor matching: not required for MVP. Matching is manual in MVP."

From `docs/OPS.md` section 4 Workflow C:
> "pick tutor based on subject, level, availability, timezone compatibility. Message tutor privately to confirm. Create match in platform, add recurring Meet link, set schedule pattern."

The match creation is the central event that connects a paid request to a tutor — unlocking scheduling (E8), session tracking (E10), and student dashboard data (E9).

---

## Child issues and status

| Issue | Type | Title | Status |
|-------|------|--------|--------|
| S7.1 (#45) | Story | As an admin, I can match a request to a tutor and start the student | **open** |
| S7.2 (#46) | Story | As an admin, I can reassign the tutor if needed | **open** |
| T7.1 (#47) | Task | Admin requests inbox (filters by status) | **open** |
| T7.2 (#48) | Task | Matching screen (request details + eligible tutors) | **open** |
| T7.3 (#49) | Task | Assign tutor to request (creates Match record) | **open** |
| T7.4 (#50) | Task | Reassign tutor (history kept) | **open** |

---

## Match data model (from `docs/ARCHITECTURE.md` section 5.6)

```
matches:
  id
  request_id (unique — one match per request)
  tutor_user_id
  status (matched | active | paused | ended)
  meet_link (recurring Google Meet link)
  schedule_pattern (jsonb: { timezone, days[], time, duration_mins })
  assigned_by_user_id, assigned_at
```

---

## Workflow (from `docs/OPS.md` section 4 Workflow C and D)

1. Admin opens `ready_to_match` request
2. Admin reviews request details (level, subject, availability, goals)
3. Admin filters eligible tutors (approved, matching subject + level + availability)
4. Admin confirms tutor availability via WhatsApp (outside platform)
5. Admin assigns tutor → creates `matches` row → request status → `matched`
6. Admin adds Meet link + schedule pattern
7. Admin generates sessions → request status → `active`

---

## Exit criteria (E7 is done when)

- [ ] Admin requests inbox (`/admin/requests`) shows all requests filterable by status
- [ ] Admin can open a request and see all details
- [ ] Admin sees eligible approved tutors filtered by subject/level
- [ ] Admin can assign a tutor → creates Match record
- [ ] Match record stores `meet_link` and `schedule_pattern`
- [ ] Request transitions to `matched` after assignment
- [ ] Admin can reassign a tutor (replaces `tutor_user_id`, logs history in audit)
- [ ] All actions use admin service role client and write audit logs

---

## Migration requirements

Create migration for `public.matches` table with correct schema and RLS:
- Admin-only insert/update
- Select accessible by admin, assigned tutor, and request creator

---

## References

- `docs/ARCHITECTURE.md` — section 5.6 (matches table), section 6.4 (matches RLS), section 8.3 (manual matching workflow), section 8.4 (schedule generation)
- `docs/MVP.md` — section 10.3 (admin — matching requirements), section 12.3 (match status lifecycle)
- `docs/OPS.md` — section 4 Workflows C and D (matching + schedule finalization)
- `docs/PRODUCT.md` — section 5.3 (admin journey steps 3–4)
