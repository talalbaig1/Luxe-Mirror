-- Luxe Mirror — Supabase RLS Migration
-- Run this in the Supabase SQL Editor after creating tables via Prisma migrate

-- ================================================================
-- 1. Clerk JWT bridge function
-- ================================================================
create or replace function requesting_user_id()
returns text
language sql stable
as $$
  select coalesce(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  )
$$;

-- ================================================================
-- 2. Enable RLS on all tables
-- ================================================================
alter table profiles           enable row level security;
alter table analyses           enable row level security;
alter table wardrobe_analyses  enable row level security;
alter table chat_threads       enable row level security;
alter table chat_messages      enable row level security;
alter table regimes            enable row level security;
alter table organizations      enable row level security;
alter table clients            enable row level security;

-- ================================================================
-- 3. profiles
-- ================================================================
create policy "profiles: owner read"
  on profiles for select
  using (user_id = requesting_user_id());

create policy "profiles: owner insert"
  on profiles for insert
  with check (user_id = requesting_user_id());

create policy "profiles: owner update"
  on profiles for update
  using (user_id = requesting_user_id());

-- ================================================================
-- 4. analyses
-- ================================================================
create policy "analyses: owner read"
  on analyses for select
  using (user_id = requesting_user_id());

create policy "analyses: owner insert"
  on analyses for insert
  with check (user_id = requesting_user_id());

-- Analyses are immutable snapshots — no update/delete policies

-- ================================================================
-- 5. wardrobe_analyses
-- ================================================================
create policy "wardrobe: owner read"
  on wardrobe_analyses for select
  using (user_id = requesting_user_id());

create policy "wardrobe: owner insert"
  on wardrobe_analyses for insert
  with check (user_id = requesting_user_id());

-- ================================================================
-- 6. chat_threads
-- ================================================================
create policy "threads: owner read"
  on chat_threads for select
  using (user_id = requesting_user_id());

create policy "threads: owner insert"
  on chat_threads for insert
  with check (user_id = requesting_user_id());

create policy "threads: owner update"
  on chat_threads for update
  using (user_id = requesting_user_id());

create policy "threads: owner delete"
  on chat_threads for delete
  using (user_id = requesting_user_id());

-- ================================================================
-- 7. chat_messages (via parent thread ownership)
-- ================================================================
create policy "messages: owner read"
  on chat_messages for select
  using (
    exists (
      select 1 from chat_threads
      where chat_threads.id = chat_messages.thread_id
        and chat_threads.user_id = requesting_user_id()
    )
  );

create policy "messages: owner insert"
  on chat_messages for insert
  with check (
    exists (
      select 1 from chat_threads
      where chat_threads.id = chat_messages.thread_id
        and chat_threads.user_id = requesting_user_id()
    )
  );

-- ================================================================
-- 8. regimes (via parent analysis ownership)
-- ================================================================
create policy "regimes: owner read"
  on regimes for select
  using (
    exists (
      select 1 from analyses
      where analyses.id = regimes.analysis_id
        and analyses.user_id = requesting_user_id()
    )
  );

create policy "regimes: owner insert"
  on regimes for insert
  with check (
    exists (
      select 1 from analyses
      where analyses.id = regimes.analysis_id
        and analyses.user_id = requesting_user_id()
    )
  );

-- ================================================================
-- 9. organizations — server-side service role only
-- ================================================================
create policy "organizations: no direct access"
  on organizations for all
  using (false);

-- ================================================================
-- 10. clients — server-side service role only
-- ================================================================
create policy "clients: no direct access"
  on clients for all
  using (false);

-- ================================================================
-- 11. Storage bucket policies
-- ================================================================

-- face-photos bucket
create policy "face-photos: owner access"
  on storage.objects for all
  using (
    bucket_id = 'face-photos'
    and (storage.foldername(name))[1] = requesting_user_id()
  )
  with check (
    bucket_id = 'face-photos'
    and (storage.foldername(name))[1] = requesting_user_id()
  );

-- wardrobe-photos bucket
create policy "wardrobe-photos: owner access"
  on storage.objects for all
  using (
    bucket_id = 'wardrobe-photos'
    and (storage.foldername(name))[1] = requesting_user_id()
  )
  with check (
    bucket_id = 'wardrobe-photos'
    and (storage.foldername(name))[1] = requesting_user_id()
  );

-- avatars bucket — public read, authenticated write
create policy "avatars: public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars: owner write"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = requesting_user_id()
  );
