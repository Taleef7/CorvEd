## Parent epic

Epic E5: packages and payments (P0) — #30

## Objective

Add a package summary section to the student dashboard that always shows:
- Active package tier (8/12/20 sessions)
- Sessions remaining in the current month
- Package month window (start date → end date)
- Package status (pending / active / expired)

---

## Background

From `docs/MVP.md` section 10.1 (student dashboard):
> "view: assigned tutor name, upcoming sessions list, next session time, recurring Meet link, sessions remaining this month"

From `docs/PRODUCT.md` section 7.1 (UX requirements):
> "dashboard always shows: next session time, Meet link, remaining sessions, tutor name"

"Sessions remaining" is one of the most important pieces of information for students. They need to know how many sessions are left to decide when to renew.

---

## Data query

The package summary is read from the active package for the current request:

```ts
const { data: package_ } = await supabase
  .from('packages')
  .select('tier_sessions, sessions_used, start_date, end_date, status')
  .eq('request_id', request.id)
  .eq('status', 'active')
  .single()

const sessionsRemaining = (package_?.tier_sessions ?? 0) - (package_?.sessions_used ?? 0)
```

---

## Package summary card UI

```
┌──────────────────────────────────────────────┐
│  📦 Package Summary                           │
│  Package: 12 sessions/month                  │
│  Month: Mar 1, 2026 → Mar 31, 2026           │
│  ✅ Sessions remaining: 9 of 12              │
│  ████████░░░░ (progress bar: 3/12 used)      │
└──────────────────────────────────────────────┘
```

If status = `pending`:
```
⏳ Payment pending verification. Sessions will appear once payment is confirmed.
```

If status = `expired`:
```
📦 Package expired. [Renew →]
```

---

## Sessions remaining calculation

From `docs/ARCHITECTURE.md` section 5.7:
> "sessions_used = count of sessions with status in (done, no_show_student) within package window"

For MVP, `sessions_used` is a stored counter on the `packages` table, incremented when a session is marked `done` or `no_show_student` (implemented in E8/E10).

Display formula:
```
sessions_remaining = packages.tier_sessions - packages.sessions_used
```

---

## Progress bar

Show sessions used vs total as a visual progress bar:

```tsx
const pct = Math.round((pkg.sessions_used / pkg.tier_sessions) * 100)

<div className="w-full bg-gray-200 rounded-full h-2">
  <div
    className="bg-green-500 h-2 rounded-full"
    style={{ width: `${pct}%` }}
  />
</div>
<p>{pkg.sessions_used} of {pkg.tier_sessions} sessions used</p>
```

---

## Acceptance criteria

- [ ] Student dashboard includes a package summary card
- [ ] Card shows: package tier, month window (start → end), sessions remaining, status
- [ ] Progress bar visually represents sessions used vs total
- [ ] When `status = 'pending'`, shows payment pending message
- [ ] When `status = 'expired'`, shows renewal prompt
- [ ] `sessions_remaining` is computed from `tier_sessions - sessions_used`
- [ ] Package dates are displayed in the student's timezone (or local browser timezone)

---

## Definition of done

- [ ] Package summary card component exists (e.g., `components/dashboards/PackageSummary.tsx`)
- [ ] Card is embedded in the student dashboard
- [ ] Handles all three package statuses (pending, active, expired)
- [ ] Progress bar renders correctly
- [ ] Date formatting uses `Intl.DateTimeFormat` or similar

---

## Dependencies

- **T5.1 (#33)** — `packages` table must exist
- **E9 T9.1 (#61)** — student dashboard page where this card is embedded

---

## References

- `docs/MVP.md` — section 10.1 (student dashboard — sessions remaining), section 6 (packages model)
- `docs/PRODUCT.md` — section 7.1 (UX requirements — always show remaining sessions)
- `docs/ARCHITECTURE.md` — section 5.5 (packages table), section 5.7 (sessions_used derived constraint)
