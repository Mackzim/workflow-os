-- Workflow OS – Supabase schema for cross-device sync.
-- Run this once in your Supabase project: SQL Editor → paste → Run.
-- Security model: every row is owned by a user; Row-Level Security ensures a
-- device only ever sees/edits that user's own tasks (the public anon key is safe
-- in the frontend because RLS is enforced server-side).

create table if not exists public.tasks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  title        text not null,
  description  text not null default '',
  priority     smallint not null default 3 check (priority between 1 and 5),
  status       text not null default 'open' check (status in ('open','in_progress','paused','done')),
  due_date     date,
  category     text,
  project_id   uuid,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists tasks_user_id_idx on public.tasks (user_id);

-- Row-Level Security -----------------------------------------------------------
alter table public.tasks enable row level security;

drop policy if exists "Users manage own tasks" on public.tasks;
create policy "Users manage own tasks"
  on public.tasks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Keep updated_at fresh on every write ----------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- Realtime: push changes to all of the user's devices instantly ---------------
alter publication supabase_realtime add table public.tasks;


-- =============================================================================
-- Calendar events
-- =============================================================================
create table if not exists public.events (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users (id) on delete cascade,
  title                text not null,
  description          text,
  start_at             timestamptz not null,
  end_at               timestamptz not null,
  all_day              boolean not null default false,
  task_id              uuid,
  project_id           uuid,
  color                text not null default 'blue',
  source               text not null default 'native',
  external_id          text,
  external_calendar_id text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists events_user_id_idx on public.events (user_id);
create index if not exists events_start_idx on public.events (user_id, start_at);

alter table public.events enable row level security;

drop policy if exists "Users manage own events" on public.events;
create policy "Users manage own events"
  on public.events
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

alter publication supabase_realtime add table public.events;
