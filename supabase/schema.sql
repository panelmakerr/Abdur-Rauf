-- ============================================================
-- Hospital Recruitment Platform — Supabase Schema
-- Run this whole file in: Supabase Dashboard > SQL Editor > Run
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1. Profiles (extends auth.users) — admins
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null default '',
  role text check (role in ('admin', 'applicant')) default 'applicant',
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;

create policy "profiles: read own"        on public.profiles for select using (id = auth.uid());
create policy "profiles: read for admins" on public.profiles for select using (public.is_admin());
create policy "profiles: insert own"      on public.profiles for insert with check (id = auth.uid());
-- Note (MVP trade-off): users may self-set their own role so no service_role
-- key is needed to bootstrap the first admin. Lock this down later if desired.
create policy "profiles: update own"      on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- ------------------------------------------------------------
-- 2. Jobs
-- ------------------------------------------------------------
create table if not exists public.jobs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  department text not null,
  description text not null,
  status text check (status in ('draft', 'active', 'archived')) default 'active',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.jobs enable row level security;

create policy "jobs: read active public" on public.jobs for select using (status = 'active');
create policy "jobs: read admin"         on public.jobs for select using (public.is_admin());
create policy "jobs: write admin"        on public.jobs for insert to authenticated with check (public.is_admin());
create policy "jobs: update admin"       on public.jobs for update to authenticated using (public.is_admin());
create policy "jobs: delete admin"       on public.jobs for delete to authenticated using (public.is_admin());

-- ------------------------------------------------------------
-- 3. Applications (ATS)
-- ------------------------------------------------------------
create table if not exists public.applications (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references public.jobs(id) on delete cascade,
  applicant_name text not null,
  applicant_email text not null,
  applicant_phone text not null default '',
  cover_note text not null default '',
  resume_storage_path text not null,
  status text check (status in ('received', 'reviewing', 'shortlisted', 'rejected')) default 'received',
  applied_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.applications enable row level security;

create policy "applications: public can apply" on public.applications
  for insert to anon, authenticated with check (true);

create policy "applications: admin read" on public.applications
  for select to authenticated using (public.is_admin());

create policy "applications: admin update" on public.applications
  for update to authenticated using (public.is_admin());

create policy "applications: admin delete" on public.applications
  for delete to authenticated using (public.is_admin());

create index if not exists applications_job_idx on public.applications (job_id);
create index if not exists applications_status_idx on public.applications (status);
create index if not exists jobs_status_idx on public.jobs (status);

-- ------------------------------------------------------------
-- 4. Storage bucket for resumes (private)
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('resumes', 'resumes', false, 5242880)
on conflict (id) do nothing;

-- Anyone (anon applicant) may upload a resume.
create policy "resumes: anyone can insert"
  on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'resumes');

-- Only admins may read / download resumes.
create policy "resumes: admin read"
  on storage.objects for select to authenticated
  using (bucket_id = 'resumes' and public.is_admin());

create policy "resumes: admin delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'resumes' and public.is_admin());

-- ------------------------------------------------------------
-- 5. Mark a user as admin:  select public.set_admin('you@email.com');
-- ------------------------------------------------------------
create or replace function public.set_admin(target_email text)
returns void language plpgsql security definer as $$
begin
  update public.profiles p
     set role = 'admin'
    from auth.users u
   where p.id = u.id and u.email = target_email;
end;
$$;