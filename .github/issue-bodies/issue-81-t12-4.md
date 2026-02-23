## Parent epic

Epic E12: policies, safety, and reliability (P0) — #77

## Objective

Build a minimal admin analytics dashboard at `/admin/analytics` showing key operational metrics: active students, upcoming sessions in the next 7 days, missed sessions in the last 7 days, and active tutors — providing the admin with a daily health check view.

---

## Background

From `docs/MVP.md` section 11.3 (analytics — locked scope):
> "minimal analytics: number of active students, upcoming sessions this week, sessions missed last 7 days. No complex dashboards needed for MVP."

From `docs/OPS.md` section 11 (admin checklists — daily):
> "check: new leads, payment pending verifications, upcoming sessions within 24 hours, sessions not marked as done"

The analytics page supports the admin's daily workflow by surfacing what needs attention at a glance.

---

## Metrics to display

| Metric | Query |
|--------|-------|
| Active students | `count(requests where status = 'active')` |
| Active tutors | `count(tutor_profiles where approved = true)` |
| Upcoming sessions (next 7 days) | `count(sessions where status = 'scheduled' and start_utc between now and now + 7 days)` |
| Missed sessions (last 7 days) | `count(sessions where status in ('no_show_student', 'no_show_tutor') and start_utc between now - 7 days and now)` |
| Sessions not marked yet | `count(sessions where status = 'scheduled' and start_utc < now)` — these need follow-up |
| Payment pending verification | `count(payments where status = 'pending')` |
| Pending tutor approvals | `count(tutor_profiles where approved = false)` |

---

## Page: `app/admin/analytics/page.tsx`

```ts
export default async function AdminAnalyticsPage() {
  const admin = createAdminClient()
  const now = new Date()
  const plus7 = new Date(now.getTime() + 7 * 86400000).toISOString()
  const minus7 = new Date(now.getTime() - 7 * 86400000).toISOString()

  const [activeStudents, activeTutors, upcomingSessions, missedSessions, unmarkedSessions, pendingPayments, pendingTutors] = await Promise.all([
    admin.from('requests').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    admin.from('tutor_profiles').select('tutor_user_id', { count: 'exact', head: true }).eq('approved', true),
    admin.from('sessions').select('id', { count: 'exact', head: true })
      .eq('status', 'scheduled').gte('scheduled_start_utc', now.toISOString()).lte('scheduled_start_utc', plus7),
    admin.from('sessions').select('id', { count: 'exact', head: true })
      .in('status', ['no_show_student', 'no_show_tutor'])
      .gte('scheduled_start_utc', minus7).lte('scheduled_start_utc', now.toISOString()),
    admin.from('sessions').select('id', { count: 'exact', head: true })
      .eq('status', 'scheduled').lt('scheduled_start_utc', now.toISOString()),
    admin.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('tutor_profiles').select('tutor_user_id', { count: 'exact', head: true }).eq('approved', false),
  ])

  // ... render metric cards
}
```

---

## Metric card UI

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Active Students  │  │ Active Tutors    │  │ Upcoming (7d)    │
│      12          │  │       5          │  │      24 sessions │
└──────────────────┘  └──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Missed (7d)      │  │ ⚠️ Not Marked    │  │ ⚠️ Pending Pay  │  │ ⏳ Pending Tutors │
│    3 sessions    │  │  2 sessions      │  │    4 payments    │  │  1 application   │
└──────────────────┘  └──────────────────┘  └──────────────────┘  └──────────────────┘
```

Attention items (orange/red background): "Not Marked", "Pending Payments", "Pending Tutor Approvals"

Clicking an attention card navigates to the relevant admin page (sessions, payments, tutors).

---

## Acceptance criteria

- [ ] `/admin/analytics` page exists and is admin-only
- [ ] Shows all 7 metrics listed above
- [ ] Attention metrics (not marked sessions, pending payments, pending tutors) shown with warning colour
- [ ] Clicking attention card navigates to the relevant admin page
- [ ] All queries use the admin client (service role)
- [ ] Page refreshes data on each load (no stale cache)

---

## Definition of done

- [ ] `/admin/analytics/page.tsx` exists with all 7 metric cards
- [ ] Queries are correct (verified against test data)
- [ ] Attention metrics link to correct admin pages
- [ ] Admin-only access enforced

---

## References

- `docs/MVP.md` — section 11.3 (analytics — locked scope)
- `docs/OPS.md` — section 11 (admin daily checklist — items that map to these metrics)
- `docs/ARCHITECTURE.md` — section 5.5–5.6 (tables queried for metrics)
