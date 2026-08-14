-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role text check (role in ('admin', 'applicant')) default 'applicant',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by admins"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Create jobs table
create table public.jobs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  department text not null,
  description text not null,
  status text check (status in ('draft', 'active', 'archived')) default 'draft',
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on jobs
alter table public.jobs enable row level security;

-- Jobs policies
create policy "Active jobs are viewable by everyone"
  on public.jobs for select
  using (status = 'active' or auth.role() = 'authenticated');

create policy "Admins can insert jobs"
  on public.jobs for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update jobs"
  on public.jobs for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create applications table
create table public.applications (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references public.jobs(id) on delete cascade,
  applicant_name text not null,
  applicant_email text not null,
  resume_storage_path text not null,
  status text check (status in ('received', 'reviewing', 'shortlisted', 'rejected')) default 'received',
  applied_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on applications
alter table public.applications enable row level security;

-- Applications policies
create policy "Anyone can insert applications"
  on public.applications for insert
  with check (true);

create policy "Admins can view all applications"
  on public.applications for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update applications"
  on public.applications for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create storage bucket for resumes
insert into storage.buckets (id, name, public) values ('resumes', 'resumes', false);

-- Storage policies for resumes bucket
create policy "Admins can view all resumes"
  on storage.objects for select
  using (
    bucket_id = 'resumes' and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Anyone can upload resumes"
  on storage.objects for insert
  with check (bucket_id = 'resumes');
