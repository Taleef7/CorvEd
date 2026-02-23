## Parent epic

Epic E7: admin matching and assignment (P0) — #44

## Objective

Build the admin requests inbox at `/admin/requests` — a filterable list of all requests ordered by status and creation date — so the admin can monitor the pipeline and quickly act on pending items.

---

## Background

From `docs/MVP.md` section 10.3 (admin requirements):
> "Admin request inbox: list requests, filter by status (new, payment_pending, ready_to_match, matched, active), open request to view all details."

From `docs/OPS.md` daily admin checklist:
> "check new leads and send intake. Check payment pending verifications. Check upcoming sessions within 24 hours."

The requests inbox is the admin's primary working screen. It must be scannable and actionable at a glance.

---

## Page: `app/admin/requests/page.tsx`

### Filter controls

```
[ Status: All | new | payment_pending | ready_to_match | matched | active | paused | ended ]
[ Subject: All | Math | Physics | ... ]
[ Level: All | O Levels | A Levels ]
```

### Data query

```ts
const { data: requests } = await adminClient
  .from('requests')
  .select(`
    id, status, level, created_at,
    subjects(name),
    user_profiles!created_by_user_id(display_name, whatsapp_number),
    packages(tier_sessions, status)
  `)
  .order('created_at', { ascending: false })
  .eq('status', statusFilter) // if filter is applied
```

### Request list table

| Student | Level | Subject | Package | Status | Date | Actions |
|---------|-------|---------|---------|--------|------|---------|
| Ahmed Ali | A | Math | 12 sessions | 🔵 ready_to_match | Feb 23 | [Match →] |
| Sara | O | Chemistry | 8 sessions | 🟡 payment_pending | Feb 22 | [View] |

### Priority sorting

Show `ready_to_match` requests first — these are the most actionable. Within each status, order by `created_at` ascending (oldest first).

---

## Acceptance criteria

- [ ] `/admin/requests` page exists and is server-rendered
- [ ] Lists all requests with student name, level, subject, package tier, status, date
- [ ] Filter by status works (server-side query or client-side)
- [ ] Filter by subject works
- [ ] Filter by level works
- [ ] "Match →" link/button for `ready_to_match` requests navigates to the matching screen
- [ ] "View" link navigates to the request detail page
- [ ] Status badges use correct colours (from T4.3 STATUS_COLOURS)
- [ ] Page uses admin client (service role) for full data access

---

## Definition of done

- [ ] `/admin/requests/page.tsx` exists
- [ ] Filter controls work (status, subject, level)
- [ ] Request list renders with correct columns
- [ ] Links to request detail and matching screen are functional
- [ ] Mobile-responsive (table or card layout on small screens)

---

## References

- `docs/MVP.md` — section 10.3 (admin — request inbox requirements)
- `docs/ARCHITECTURE.md` — section 5.5 (requests table), section 3.3 (server actions)
- `docs/OPS.md` — daily admin checklist
