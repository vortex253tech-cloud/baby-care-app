-- Migration: 0005_trackers_schema — Phase 3 Core Trackers

-- FEEDINGS
create table if not exists public.feedings (
  id               uuid primary key default uuid_generate_v4(),
  baby_id          uuid not null references public.babies(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  type             text not null check (type in ('breast','bottle','solid')),
  side             text check (side in ('left','right','both')),
  duration_seconds int,
  volume_ml        int,
  milk_type        text check (milk_type in ('breast_milk','formula','mixed')),
  food_name        text,
  amount_g         int,
  notes            text,
  started_at       timestamptz not null default now(),
  ended_at         timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists feedings_baby_started_idx on public.feedings(baby_id, started_at desc);
alter table public.feedings enable row level security;
create trigger feedings_updated_at before update on public.feedings
  for each row execute function public.set_updated_at();
create policy "Users manage their feedings" on public.feedings
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- SLEEPS
create table if not exists public.sleeps (
  id         uuid primary key default uuid_generate_v4(),
  baby_id    uuid not null references public.babies(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null,
  ended_at   timestamptz,
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists sleeps_baby_started_idx on public.sleeps(baby_id, started_at desc);
alter table public.sleeps enable row level security;
create trigger sleeps_updated_at before update on public.sleeps
  for each row execute function public.set_updated_at();
create policy "Users manage their sleeps" on public.sleeps
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- DIAPERS
create table if not exists public.diapers (
  id         uuid primary key default uuid_generate_v4(),
  baby_id    uuid not null references public.babies(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  type       text not null check (type in ('wet','dirty','both')),
  notes      text,
  changed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists diapers_baby_changed_idx on public.diapers(baby_id, changed_at desc);
alter table public.diapers enable row level security;
create trigger diapers_updated_at before update on public.diapers
  for each row execute function public.set_updated_at();
create policy "Users manage their diapers" on public.diapers
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
