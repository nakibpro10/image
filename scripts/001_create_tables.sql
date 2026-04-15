-- Create profiles table with imgbb_api_key
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  imgbb_api_key text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- Create images table
create table if not exists public.images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  filename text not null,
  url text not null,
  delete_url text,
  thumb_url text,
  size integer,
  uploaded_at timestamptz default now()
);

alter table public.images enable row level security;

create policy "images_select_own" on public.images for select using (auth.uid() = user_id);
create policy "images_insert_own" on public.images for insert with check (auth.uid() = user_id);
create policy "images_delete_own" on public.images for delete using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (
    new.id,
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
