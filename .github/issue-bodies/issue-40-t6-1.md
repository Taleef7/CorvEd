## Parent epic

Epic E6: tutor onboarding and tutor directory (P0) — #37

## Objective

Create Supabase migrations for `tutor_profiles`, `tutor_subjects`, and `tutor_availability` tables with correct RLS policies. Then build the tutor profile/application form at `app/tutor/profile/page.tsx`.

---

## Part 1: Migrations

### Migration: `<ts>_create_tutor_tables.sql`

From `docs/ARCHITECTURE.md` section 5.4:

```sql
create table public.tutor_profiles (
  tutor_user_id uuid primary key references public.user_profiles(user_id) on delete cascade,
  approved boolean not null default false,
  bio text,
  timezone text not null default 'Asia/Karachi',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tutor_subjects (
  tutor_user_id uuid references public.tutor_profiles(tutor_user_id) on delete cascade,
  subject_id smallint references public.subjects(id),
  level public.level_enum not null,
  primary key (tutor_user_id, subject_id, level)
);

-- availability windows: [{ "day": 0..6, "start": "18:00", "end": "20:00" }]
create table public.tutor_availability (
  tutor_user_id uuid primary key references public.tutor_profiles(tutor_user_id) on delete cascade,
  windows jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.tutor_profiles enable row level security;
alter table public.tutor_subjects enable row level security;
alter table public.tutor_availability enable row level security;

-- tutor_profiles: tutor reads/updates own, admin reads/updates all
create policy "tutor_profiles_select"
  on public.tutor_profiles for select to authenticated
  using (tutor_user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "tutor_profiles_insert"
  on public.tutor_profiles for insert to authenticated
  with check (tutor_user_id = auth.uid());

create policy "tutor_profiles_update_own"
  on public.tutor_profiles for update to authenticated
  using (tutor_user_id = auth.uid())
  with check (tutor_user_id = auth.uid());

create policy "tutor_profiles_admin_update"
  on public.tutor_profiles for update to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- tutor_subjects: same pattern
create policy "tutor_subjects_select"
  on public.tutor_subjects for select to authenticated
  using (tutor_user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "tutor_subjects_write_own"
  on public.tutor_subjects for all to authenticated
  using (tutor_user_id = auth.uid())
  with check (tutor_user_id = auth.uid());

-- tutor_availability: same pattern
create policy "tutor_availability_select"
  on public.tutor_availability for select to authenticated
  using (tutor_user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "tutor_availability_write_own"
  on public.tutor_availability for all to authenticated
  using (tutor_user_id = auth.uid())
  with check (tutor_user_id = auth.uid());
```

---

## Part 2: Tutor application form

**File**: `app/tutor/profile/page.tsx`

### Form schema (`lib/validators/tutor.ts`):

```ts
import { z } from 'zod'

export const tutorProfileSchema = z.object({
  bio: z.string().min(50, 'Please write at least 50 characters about your experience'),
  timezone: z.string().min(1),
  // subjects: array of { subject_id, level } combinations
  subjects: z.array(z.object({
    subject_id: z.number(),
    level: z.enum(['o_levels', 'a_levels']),
  })).min(1, 'Please select at least one subject'),
  // availability: array of { day, start, end }
  availability: z.array(z.object({
    day: z.number().min(0).max(6),
    start: z.string().regex(/^\d{2}:\d{2}$/),
    end: z.string().regex(/^\d{2}:\d{2}$/),
  })).min(1, 'Please add at least one availability window'),
})
```

### Save flow:

```ts
// 1. Upsert tutor_profiles
await supabase.from('tutor_profiles').upsert({ tutor_user_id: user.id, bio, timezone })

// 2. Replace tutor_subjects (delete existing, re-insert)
await supabase.from('tutor_subjects').delete().eq('tutor_user_id', user.id)
await supabase.from('tutor_subjects').insert(subjects.map(s => ({ tutor_user_id: user.id, ...s })))

// 3. Upsert tutor_availability
await supabase.from('tutor_availability').upsert({ tutor_user_id: user.id, windows: availability })
```

---

## Availability UI

Day × time grid where tutor marks availability:

| | Mon | Tue | Wed | Thu | Fri | Sat | Sun |
|---|---|---|---|---|---|---|---|
| 6 AM – 10 AM | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 10 AM – 2 PM | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2 PM – 6 PM | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| 6 PM – 10 PM | ☑ | ☐ | ☑ | ☐ | ☑ | ☐ | ☐ |

For MVP, a simplified checkbox grid by time block is acceptable.

---

## Definition of done

- [ ] `supabase/migrations/<ts>_create_tutor_tables.sql` exists with tables + RLS
- [ ] `lib/validators/tutor.ts` Zod schema exists
- [ ] `app/tutor/profile/page.tsx` renders subjects, levels, bio, timezone, availability form
- [ ] Save creates/updates `tutor_profiles`, `tutor_subjects`, `tutor_availability`
- [ ] New tutor profile has `approved = false` by default
- [ ] `supabase db reset` applies migration without errors

---

## References

- `docs/ARCHITECTURE.md` — section 5.4 (tutor tables), section 6.4 (RLS for tutor tables)
- `docs/MVP.md` — section 10.2 (tutor requirements)
