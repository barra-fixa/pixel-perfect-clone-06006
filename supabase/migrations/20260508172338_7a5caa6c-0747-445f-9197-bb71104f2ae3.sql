create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_push_subscriptions_user on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;

create policy "users select own subscriptions"
  on public.push_subscriptions for select
  using (auth.uid() = user_id);

create policy "users insert own subscriptions"
  on public.push_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "users update own subscriptions"
  on public.push_subscriptions for update
  using (auth.uid() = user_id);

create policy "users delete own subscriptions"
  on public.push_subscriptions for delete
  using (auth.uid() = user_id);

create trigger trg_push_subscriptions_updated_at
  before update on public.push_subscriptions
  for each row execute function public.set_updated_at();