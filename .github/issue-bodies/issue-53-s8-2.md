## Parent epic

Epic E8: scheduling, sessions, and Google Meet links (P0) — #51

## User story

**As a tutor or admin**, I can update a session's status — marking it as done (attended), missed (no-show by student), tutor no-show, or rescheduled — so that the student's session count is accurately tracked and the admin has a clear record of attendance.

---

## Background

From `docs/MVP.md` section 12.4 (session status lifecycle — locked):
> "scheduled → done | rescheduled | no_show_student | no_show_tutor"

From `docs/OPS.md` section 5.2–5.3 (no-show handling):
> "student no-show: mark session status = no_show_student. sessions remaining decremented."
> "tutor no-show: mark session status = no_show_tutor. do NOT decrement sessions remaining."

From `docs/ARCHITECTURE.md` section 6.6 (RPC function):
> "Tutor completion function: only the assigned tutor can call it. Allows setting status to done / no_show_student / no_show_tutor. Updates tutor_notes. Increments sessions_used on the active package if status consumes a session."

---

## Acceptance criteria

- [ ] Tutor can mark a session as `done` with a short note (E10 T10.2 implements the full UI)
- [ ] Tutor can mark a session as `no_show_student` with a note
- [ ] Tutor can mark a session as `no_show_tutor` (for self-declared absence)
- [ ] Admin can mark any session with any status (no restriction)
- [ ] When status → `done` or `no_show_student`: `packages.sessions_used` is incremented by 1
- [ ] When status → `no_show_tutor`: `packages.sessions_used` is NOT incremented
- [ ] All status updates write an audit log entry
- [ ] Status update is implemented via `tutor_update_session` RPC function (recommended) or a server action

---

## Status transition matrix

| Status | Who can set | sessions_used impact |
|--------|------------|----------------------|
| `done` | tutor, admin | +1 |
| `no_show_student` | tutor, admin | +1 |
| `no_show_tutor` | tutor, admin | 0 |
| `rescheduled` | admin only | 0 |

---

## RPC approach (recommended)

From `docs/ARCHITECTURE.md` section 6.6:

```sql
create or replace function public.tutor_update_session(
  p_session_id uuid,
  p_status public.session_status_enum,
  p_notes text
)
returns void
language plpgsql
security definer
as $$
declare
  v_match_id uuid;
  v_tutor_id uuid;
  v_package_id uuid;
begin
  -- Verify session exists and get match
  select match_id into v_match_id from public.sessions where id = p_session_id;
  if v_match_id is null then raise exception 'session not found'; end if;

  -- Verify caller is the assigned tutor or admin
  select tutor_user_id into v_tutor_id from public.matches where id = v_match_id;
  if v_tutor_id <> auth.uid() and not public.is_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  -- Tutor can only set: done, no_show_student, no_show_tutor
  if p_status not in ('done','no_show_student','no_show_tutor') and not public.is_admin(auth.uid()) then
    raise exception 'invalid status for tutor update';
  end if;

  -- Update session
  update public.sessions
  set status = p_status, tutor_notes = p_notes,
      updated_by_user_id = auth.uid(), updated_at = now()
  where id = p_session_id;

  -- Increment sessions_used if status consumes a session
  if p_status in ('done', 'no_show_student') then
    select p.id into v_package_id
    from public.packages p
    join public.requests r on r.id = p.request_id
    join public.matches m on m.request_id = r.id
    where m.id = v_match_id and p.status = 'active'
    limit 1;

    if v_package_id is not null then
      update public.packages
      set sessions_used = sessions_used + 1, updated_at = now()
      where id = v_package_id;
    end if;
  end if;

  -- Audit log
  insert into public.audit_logs(actor_user_id, action, entity_type, entity_id, details)
  values (auth.uid(), 'session_status_updated', 'session', p_session_id,
          jsonb_build_object('status', p_status));
end;
$$;
```

---

## Dependencies

- **T8.1 (#54)** — sessions must exist
- **T5.1 (#33)** — packages table must exist (for sessions_used increment)
- **E10 T10.2 (#69)** — tutor session completion form (calls this RPC)

---

## References

- `docs/ARCHITECTURE.md` — section 6.6 (tutor_update_session RPC), section 5.7 (derived constraints — sessions_used)
- `docs/MVP.md` — section 12.4 (session status lifecycle)
- `docs/OPS.md` — section 5.2–5.4 (no-show handling policies)
