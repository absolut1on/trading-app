-- User profiles (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  username text,
  balance numeric(12,2) default 0,
  kyc_completed boolean default false,
  created_at timestamptz default now()
);

-- Stock holdings
create table if not exists public.holdings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  symbol text not null,
  quantity integer not null check (quantity > 0),
  avg_buy_price numeric(12,2) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_holdings_user on public.holdings(user_id);
create unique index if not exists idx_holdings_user_symbol on public.holdings(user_id, symbol);

-- Transactions log
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  symbol text not null,
  type text not null check (type in ('buy', 'sell')),
  quantity integer not null,
  price numeric(12,2) not null,
  total numeric(12,2) not null,
  created_at timestamptz default now()
);

create index if not exists idx_transactions_user on public.transactions(user_id);

-- KYC data
create table if not exists public.kyc (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade unique not null,
  full_name text not null,
  phone text not null,
  address text not null,
  submitted_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, balance)
  values (new.id, new.email, 0);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.holdings enable row level security;
alter table public.transactions enable row level security;
alter table public.kyc enable row level security;

-- RLS policies: users can only read/write their own data
create policy "Users read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users read own holdings" on public.holdings for select using (auth.uid() = user_id);
create policy "Users insert own holdings" on public.holdings for insert with check (auth.uid() = user_id);
create policy "Users update own holdings" on public.holdings for update using (auth.uid() = user_id);
create policy "Users delete own holdings" on public.holdings for delete using (auth.uid() = user_id);

create policy "Users read own transactions" on public.transactions for select using (auth.uid() = user_id);
create policy "Users insert own transactions" on public.transactions for insert with check (auth.uid() = user_id);

create policy "Users read own kyc" on public.kyc for select using (auth.uid() = user_id);
create policy "Users insert own kyc" on public.kyc for insert with check (auth.uid() = user_id);
