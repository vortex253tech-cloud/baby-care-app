-- Migration: 0004_storage_policies
-- Creates baby-photos storage bucket and access policies

-- Public bucket: avatars are identified by opaque UUID paths and are safe to be public.
-- Using public=true allows getPublicUrl() to return a stable CDN URL without signed token refresh.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'baby-photos',
  'baby-photos',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Allow authenticated users to upload to their own folder
create policy "Users can upload baby photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'baby-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to read their own photos
create policy "Users can read their own baby photos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'baby-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update/replace their own photos
create policy "Users can update their own baby photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'baby-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own photos
create policy "Users can delete their own baby photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'baby-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
