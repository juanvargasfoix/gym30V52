-- GYM 3.0 V5.2 - Supabase Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. COMPANIES TABLE
create table companies (
    id uuid primary key default uuid_generate_v4(),
    nombre text unique not null,
    areas_activas text[] default '{comunicacion,liderazgo}',
    area_flex text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. PROFILES TABLE (Linked to Auth.Users)
create table profiles (
    id uuid primary key references auth.users on delete cascade,
    username text unique not null,
    email text unique not null,
    role text check (role in ('participante', 'coordinador', 'admin')) default 'participante',
    empresa_id uuid references companies(id),
    perfil jsonb,
    xp integer default 0,
    nivel text default 'Aprendiz',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. SKILLS TABLE
create table skills (
    id uuid primary key default uuid_generate_v4(),
    nombre text not null,
    tipo text check (tipo in ('quiz', 'chat', 'roleplay', 'reflexion')),
    nivel integer check (nivel between 1 and 3),
    area text not null,
    descripcion text,
    prerequisitos uuid[] default '{}',
    is_custom boolean default false,
    empresa_id uuid references companies(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. USER_PROGRESS TABLE
create table user_progress (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references profiles(id) on delete cascade not null,
    skill_id uuid references skills(id) on delete cascade not null,
    status text check (status in ('available', 'in_progress', 'conquered')) default 'available',
    completed_at timestamp with time zone,
    ejercicios_completados integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, skill_id)
);

-- 5. KUDOS TABLE
create table kudos (
    id uuid primary key default uuid_generate_v4(),
    from_user_id uuid references profiles(id) on delete set null,
    to_user_id uuid references profiles(id) on delete cascade,
    message text not null,
    xp_awarded integer default 10,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES

-- Enable RLS
alter table companies enable row level security;
alter table profiles enable row level security;
alter table skills enable row level security;
alter table user_progress enable row level security;
alter table kudos enable row level security;

-- PROFILES Policies
create policy "Users can view profiles in their own company"
on profiles for select
using (
    auth.uid() in (
        select id from profiles where empresa_id = profiles.empresa_id
    ) or (select role from profiles where id = auth.uid()) = 'admin'
);

create policy "Users can update their own profile"
on profiles for update
using (auth.uid() = id);

-- COMPANIES Policies
create policy "Users can view their own company"
on companies for select
using (
    id in (select empresa_id from profiles where id = auth.uid())
    or (select role from profiles where id = auth.uid()) = 'admin'
);

create policy "Admins can manage companies"
on companies for all
using ((select role from profiles where id = auth.uid()) = 'admin');

-- SKILLS Policies
create policy "Users can view predefined and their company skills"
on skills for select
using (
    is_custom = false 
    or empresa_id in (select empresa_id from profiles where id = auth.uid())
    or (select role from profiles where id = auth.uid()) = 'admin'
);

create policy "Admins can manage skills"
on skills for all
using ((select role from profiles where id = auth.uid()) = 'admin');

-- USER_PROGRESS Policies
create policy "Users can manage their own progress"
on user_progress for all
using (user_id = auth.uid());

create policy "Coordinators can view their company's progress"
on user_progress for select
using (
    (select role from profiles where id = auth.uid()) in ('coordinador', 'admin')
    and user_id in (
        select id from profiles where empresa_id = (select empresa_id from profiles where id = auth.uid())
    )
);

-- KUDOS Policies
create policy "Users can view kudos they received or sent"
on kudos for select
using (to_user_id = auth.uid() or from_user_id = auth.uid());

create policy "Privileged roles can send kudos"
on kudos for insert
with check ((select role from profiles where id = auth.uid()) in ('coordinador', 'admin'));

-- INDICES
create index idx_profiles_empresa_id on profiles(empresa_id);
create index idx_profiles_username on profiles(username);
create index idx_user_progress_user_skill on user_progress(user_id, skill_id);
create index idx_user_progress_status on user_progress(status);
create index idx_skills_area on skills(area);
create index idx_skills_custom_company on skills(is_custom, empresa_id);
create index idx_kudos_to_user on kudos(to_user_id);
create index idx_kudos_created_at on kudos(created_at);
