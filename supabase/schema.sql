-- CALISTHENICS PRO: esquema inicial de Supabase
-- Ejecutar en Supabase > SQL Editor. Las políticas RLS aíslan los datos por usuario.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  goal text not null default 'Dominar habilidades',
  experience text not null default 'Principiante',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_app_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.user_app_data enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert to authenticated with check (auth.uid() = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Users can read own app data" on public.user_app_data;
create policy "Users can read own app data" on public.user_app_data
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can insert own app data" on public.user_app_data;
create policy "Users can insert own app data" on public.user_app_data
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users can update own app data" on public.user_app_data;
create policy "Users can update own app data" on public.user_app_data
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.create_user_records()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;

  insert into public.user_app_data (user_id, data)
  values (new.id, '{}'::jsonb)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_calpro on auth.users;
create trigger on_auth_user_created_calpro
  after insert on auth.users
  for each row execute procedure public.create_user_records();
