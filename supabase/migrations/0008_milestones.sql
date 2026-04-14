-- Migration: 0008_milestones — Phase 5 Milestones & Tips

-- baby_milestones: records when baby achieved a milestone
create table if not exists public.baby_milestones (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  baby_id               uuid not null references public.babies(id) on delete cascade,
  milestone_id          text not null,       -- matches id from local milestones.ts seed
  achieved_at           date not null,
  photo_url             text,
  notes                 text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (baby_id, milestone_id)             -- one achievement per milestone per baby
);

create index if not exists baby_milestones_baby_idx
  on public.baby_milestones(baby_id, achieved_at);

alter table public.baby_milestones enable row level security;

create trigger baby_milestones_updated_at before update on public.baby_milestones
  for each row execute function public.set_updated_at();

create policy "Users manage their milestones" on public.baby_milestones
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- saved_tips: user's bookmarked tips (tip_id matches id from local tips.ts seed)
create table if not exists public.saved_tips (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  baby_id    uuid not null references public.babies(id) on delete cascade,
  tip_id     text not null,
  saved_at   timestamptz not null default now(),
  unique (user_id, baby_id, tip_id)
);

alter table public.saved_tips enable row level security;

create policy "Users manage their saved tips" on public.saved_tips
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Storage bucket for milestone photos
-- Run manually in SQL Editor if the bucket doesn't exist:
/*
insert into storage.buckets (id, name, public)
values ('milestone-photos', 'milestone-photos', true)
on conflict (id) do nothing;

create policy "Users upload their milestone photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'milestone-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

create policy "Milestone photos are public" on storage.objects
  for select using (bucket_id = 'milestone-photos');

create policy "Users delete their milestone photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'milestone-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
*/
