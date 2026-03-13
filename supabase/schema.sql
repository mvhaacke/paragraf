-- ============================================================
-- Paragraf — database schema
-- Run this in Supabase > SQL Editor > New query
-- ============================================================

-- Enums
create type case_type as enum (
  'mahnbescheid',
  'consumer_debt',
  'rental_deposit',
  'wrongful_dismissal',
  'unknown'
);

create type case_status as enum (
  'triage',
  'pending_payment',
  'document_ready',
  'filed',
  'hearing_scheduled',
  'closed'
);

create type document_kind as enum (
  'upload',    -- file the user uploaded
  'generated'  -- court-ready document we produced
);


-- ============================================================
-- cases
-- ============================================================
create table cases (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  case_type       case_type not null,
  status          case_status not null default 'pending_payment',
  document_title  text not null,
  deadline        timestamptz,
  triage_result   jsonb not null,  -- full TriageResult snapshot
  stripe_session  text,            -- Stripe checkout session id
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- keep updated_at current automatically
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger cases_updated_at
  before update on cases
  for each row execute procedure set_updated_at();


-- ============================================================
-- documents
-- ============================================================
create table documents (
  id            uuid primary key default gen_random_uuid(),
  case_id       uuid not null references cases(id) on delete cascade,
  kind          document_kind not null,
  storage_path  text not null,   -- path inside the Supabase Storage bucket
  file_name     text not null,
  created_at    timestamptz not null default now()
);


-- ============================================================
-- Row Level Security
-- Users can only access their own data.
-- ============================================================
alter table cases    enable row level security;
alter table documents enable row level security;

-- cases: full access to own rows
create policy "own cases" on cases
  for all using (auth.uid() = user_id);

-- documents: access if the parent case belongs to the user
create policy "own documents" on documents
  for all using (
    exists (
      select 1 from cases
      where cases.id = documents.case_id
        and cases.user_id = auth.uid()
    )
  );


-- ============================================================
-- Storage buckets
-- ============================================================
-- Create both buckets in Supabase > Storage > New bucket with these settings:
--
--   Name: uploads
--   Public: NO
--   Allowed MIME types: application/pdf, image/jpeg, image/png
--   Max upload size: 20 MB
--
--   Name: documents
--   Public: NO
--   Allowed MIME types: application/pdf
--   Max upload size: 5 MB
--
-- File path convention (enforced by policies below):
--   uploads:   {user_id}/{case_id}/{filename}
--   documents: {user_id}/{case_id}/{filename}
-- ============================================================

-- Storage RLS
-- storage.objects rows have: bucket_id, name (the full path), owner (auth.uid at upload time)

-- uploads: authenticated users can upload only to their own folder
create policy "upload to own folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- uploads: users can read and delete only their own files
create policy "read own uploads" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "delete own uploads" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- documents: only the backend (service role) inserts generated docs
-- users can read only their own generated documents
create policy "read own documents" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- No public SELECT, no anonymous access on either bucket.
-- The service role key bypasses RLS and is used server-side only.
