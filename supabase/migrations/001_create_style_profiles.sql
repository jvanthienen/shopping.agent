-- Create style_profiles table
create table if not exists public.style_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  profile jsonb not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.style_profiles enable row level security;

-- Users can only read/write their own profile
create policy "Users can view own profile"
  on public.style_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.style_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.style_profiles for update
  using (auth.uid() = user_id);

-- Index for fast lookups
create index if not exists style_profiles_user_id_idx
  on public.style_profiles(user_id);
