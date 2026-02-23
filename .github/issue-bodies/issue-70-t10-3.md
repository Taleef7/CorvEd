## Parent epic

Epic E10: tutor dashboard and session notes (P0) — #65

## Objective

Ensure that when a tutor marks a session as `done` or `no_show_student`, the `packages.sessions_used` counter is atomically incremented — keeping the student's "sessions remaining" count accurate.

---

## Background

From `docs/ARCHITECTURE.md` section 5.7 (derived constraints):
> "sessions_used = count of sessions with status in (done, no_show_student) within package window"
> "MVP approach: store sessions_used and update it transactionally when session completes (recommended via RPC)"

From section 6.6 (tutor_update_session RPC):
> "increments sessions_used on the active package if status consumes a session"

From `docs/OPS.md` section 5.2–5.3 (no-show policy):
- `no_show_student` → session is deducted
- `no_show_tutor` → session is NOT deducted

---

## The increment mechanism

The `sessions_used` increment must be atomic to prevent race conditions (two tutors completing sessions simultaneously for different subjects). Supabase handles this via `update ... set sessions_used = sessions_used + 1`.

### Atomic increment RPC

```sql
create or replace function public.increment_sessions_used(p_package_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.packages
  set sessions_used = sessions_used + 1,
      updated_at = now()
  where id = p_package_id
    and status = 'active'
    and sessions_used < sessions_total;
end;
$$;
```

The guard `sessions_used < sessions_total` prevents over-decrementing (safety net).

---

## Integration in `tutor_update_session`

The `tutor_update_session` RPC (defined in E8 T8.3) already includes the increment logic. This task verifies and tests that it works correctly end-to-end.

---

## Verification: "sessions remaining" after marking

After a tutor marks a session as `done`:
1. `sessions.status` → `done`
2. `packages.sessions_used` → incremented by 1
3. Student dashboard re-fetches → sessions remaining decreases by 1

This flow must be verified manually or via a test:
1. Create a package with `tier_sessions = 12, sessions_used = 0`
2. Tutor marks a session as `done`
3. Verify `packages.sessions_used = 1`
4. Verify student dashboard shows 11 remaining

---

## Acceptance criteria

- [ ] `increment_sessions_used` RPC exists and increments atomically
- [ ] Guard prevents `sessions_used > sessions_total`
- [ ] `done` status → `sessions_used + 1`
- [ ] `no_show_student` status → `sessions_used + 1`
- [ ] `no_show_tutor` status → NO increment
- [ ] `rescheduled` status → NO increment
- [ ] Student's sessions remaining decreases on next page load after tutor marks done

---

## Definition of done

- [ ] `increment_sessions_used` SQL function exists in migration
- [ ] Integration with `tutor_update_session` verified
- [ ] Manual test confirms correct decrement behaviour

---

## References

- `docs/ARCHITECTURE.md` — section 5.7 (sessions_used derived constraint), section 6.6 (tutor_update_session RPC)
- `docs/MVP.md` — section 12.4 (session status lifecycle), section 10.2 (tutor marking)
- `docs/OPS.md` — section 5.2–5.3 (no-show deduction policy)
