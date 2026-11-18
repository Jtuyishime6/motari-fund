-- Run once in Supabase: SQL Editor > New query > paste > Run
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, phone text, district text,
  role text check (role in ('investor','rider','admin')),
  created_at timestamptz default now()
);
create table if not exists rider_applications (
  id uuid primary key default gen_random_uuid(),
  rider_id uuid not null references profiles(id) on delete cascade,
  permit_number text not null, years_experience int not null,
  cooperative text, daily_income int not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reason text, created_at timestamptz default now()
);
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  model text not null, photo_url text,
  target int not null check (target > 0), lease_months int not null default 24,
  status text not null default 'open' check (status in ('open','funded')),
  created_at timestamptz default now()
);
create table if not exists pledges (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  investor_id uuid not null references profiles(id) on delete cascade,
  amount int not null check (amount >= 10000), momo_ref text not null,
  status text not null default 'pending' check (status in ('pending','confirmed','rejected')),
  confirmed_by uuid references profiles(id), confirmed_at timestamptz,
  created_at timestamptz default now()
);
create table if not exists leases (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid unique not null references campaigns(id),
  rider_id uuid not null references profiles(id),
  total_owed int not null, amount_paid int not null default 0,
  status text not null default 'active', created_at timestamptz default now()
);
create table if not exists repayments (
  id uuid primary key default gen_random_uuid(),
  lease_id uuid not null references leases(id) on delete cascade,
  amount int not null check (amount > 0), momo_ref text not null,
  status text not null default 'pending' check (status in ('pending','confirmed','rejected')),
  confirmed_by uuid references profiles(id), created_at timestamptz default now()
);
-- Row Level Security: the API uses the service role; direct client access is limited to own rows.
alter table profiles enable row level security;
alter table rider_applications enable row level security;
alter table campaigns enable row level security;
alter table pledges enable row level security;
alter table leases enable row level security;
alter table repayments enable row level security;
create policy "own profile" on profiles for select using (auth.uid() = id);
create policy "own applications" on rider_applications for select using (auth.uid() = rider_id);
create policy "public campaigns" on campaigns for select using (true);
create policy "own pledges" on pledges for select using (auth.uid() = investor_id);
create policy "own leases" on leases for select using (auth.uid() = rider_id);
-- Make yourself admin after your first sign in:
-- update profiles set role = 'admin' where id = (select id from auth.users where email = 'you@example.com');
