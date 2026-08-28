-- Price triggers (auto-sell when price hits target)
create table if not exists public.price_triggers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  symbol text not null,
  target_price numeric(12,2) not null,
  quantity integer not null check (quantity > 0),
  active boolean default true,
  created_at timestamptz default now()
);

create index if not exists idx_triggers_user on public.price_triggers(user_id);
create index if not exists idx_triggers_active on public.price_triggers(active) where active = true;

-- Notifications log
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  title text not null,
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_notifications_user on public.notifications(user_id);

-- RLS
alter table public.price_triggers enable row level security;
alter table public.notifications enable row level security;

create policy "Users read own triggers" on public.price_triggers for select using (auth.uid() = user_id);
create policy "Users insert own triggers" on public.price_triggers for insert with check (auth.uid() = user_id);
create policy "Users update own triggers" on public.price_triggers for update using (auth.uid() = user_id);
create policy "Users delete own triggers" on public.price_triggers for delete using (auth.uid() = user_id);

create policy "Users read own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users update own notifications" on public.notifications for update using (auth.uid() = user_id);
