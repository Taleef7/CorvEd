## Parent epic

Epic E9: student dashboard (P0) — #58

## Objective

Add the package summary card to the student dashboard showing the active package tier, sessions remaining, and the month window — reusing the `PackageSummary` component from E5 T5.4.

---

## Background

This is the integration task that places the `PackageSummary` component (built in E5 T5.4) into the student dashboard layout alongside the next session card (T9.1) and sessions list (T9.2).

---

## Component: `components/dashboards/PackageSummary.tsx`

Built in E5 T5.4 (#36). This task ensures it is correctly embedded in the student dashboard.

---

## Data query

```ts
// Get the active package for the student's active request
const { data: package_ } = await supabase
  .from('packages')
  .select('tier_sessions, sessions_used, start_date, end_date, status')
  .eq('status', 'active')
  .in('request_id', activeRequestIds)
  .single()
```

---

## Renewal alert logic

```ts
const sessionsRemaining = package_.tier_sessions - package_.sessions_used

const daysUntilEnd = DateTime.fromISO(package_.end_date)
  .diff(DateTime.now(), 'days').days

const showRenewalAlert = sessionsRemaining <= 3 || daysUntilEnd <= 5
```

If renewal alert is triggered, show:
```
⚠️ Only {sessionsRemaining} sessions left and {daysUntilEnd} days until package ends.
Contact us on WhatsApp to renew. [Chat to Renew →]
```

The "Chat to Renew" button links to WhatsApp with a prefilled renewal message (uses `wa.me` from lib/config.ts).

---

## Acceptance criteria

- [ ] `PackageSummary` component is embedded in `app/dashboard/page.tsx`
- [ ] Shows tier, sessions remaining, month window
- [ ] Renewal alert shown when ≤ 3 sessions remaining or ≤ 5 days until package end
- [ ] "Chat to Renew" WhatsApp link uses `NEXT_PUBLIC_WHATSAPP_NUMBER`

---

## Definition of done

- [ ] PackageSummary rendered on student dashboard
- [ ] Renewal alert logic works
- [ ] WhatsApp renewal link functional

---

## References

- `docs/E5 T5.4 (#36)` — PackageSummary component built there
- `docs/OPS.md` — section 4 Workflow H (renewal reminders), section 6.14 (renewal template)
