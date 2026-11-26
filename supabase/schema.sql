-- Run in Supabase: SQL Editor
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null,
  created_at timestamptz default now()
);
create table sessions (
  id uuid primary key,                       -- generated on the client so offline sync is idempotent
  user_id uuid not null default auth.uid() references profiles(id) on delete cascade,
  started_at timestamptz not null,
  duration_sec int not null check (duration_sec > 0),
  created_at timestamptz default now()
);
create index on sessions (user_id, started_at desc);

alter table profiles enable row level security;
alter table sessions enable row level security;
create policy "own profile" on profiles for select using (auth.uid() = id);
create policy "own sessions" on sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- Weekly leaderboard (security definer so names/totals of others are readable, nothing else)
create function top_users(lim int default 10)
returns table (user_id uuid, name text, total_sec bigint) language sql security definer set search_path = public as $$
  select p.id, p.name, sum(s.duration_sec)::bigint
  from sessions s join profiles p on p.id = s.user_id
  where s.started_at >= date_trunc('week', now())
  group by p.id, p.name order by 3 desc limit lim
$$;
