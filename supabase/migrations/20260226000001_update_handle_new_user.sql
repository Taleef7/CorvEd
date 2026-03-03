-- Update handle_new_user trigger to support parent and tutor roles from signup metadata
-- Also creates tutor_profiles + tutor_availability rows when role = 'tutor'

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  v_role public.role_enum;
begin
  -- Read role from metadata; default to 'student'
  -- Only allow self-assignable roles; admin can only be set by existing admins
  v_role := case
    when new.raw_user_meta_data->>'role' in ('student', 'parent', 'tutor')
      then (new.raw_user_meta_data->>'role')::public.role_enum
    else 'student'
  end;

  insert into public.user_profiles (user_id, display_name, timezone, primary_role)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'full_name',
      'New User'
    ),
    coalesce(new.raw_user_meta_data->>'timezone', 'Asia/Karachi'),
    v_role
  )
  on conflict (user_id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, v_role)
  on conflict do nothing;

  -- For tutors, create a pending tutor_profiles + tutor_availability entry
  if v_role = 'tutor' then
    insert into public.tutor_profiles (
      tutor_user_id, approved, bio, timezone,
      experience_years, education, teaching_approach
    )
    values (
      new.id,
      false,
      coalesce(new.raw_user_meta_data->>'bio', ''),
      coalesce(new.raw_user_meta_data->>'timezone', 'Asia/Karachi'),
      case
        when (new.raw_user_meta_data->>'experience_years') ~ '^\d+$'
          then (new.raw_user_meta_data->>'experience_years')::smallint
        else null
      end,
      new.raw_user_meta_data->>'education',
      new.raw_user_meta_data->>'teaching_approach'
    )
    on conflict (tutor_user_id) do nothing;

    insert into public.tutor_availability (tutor_user_id, windows)
    values (new.id, '[]'::jsonb)
    on conflict (tutor_user_id) do nothing;
  end if;

  return new;
end;
$$;

-- Re-attach trigger (idempotent)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
