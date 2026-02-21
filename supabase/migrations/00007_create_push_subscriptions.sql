-- ===========================================
-- PUSH SUBSCRIPTIONS TABLE
-- ===========================================
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index idx_push_subscriptions_user_id on public.push_subscriptions (user_id);

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================
alter table public.push_subscriptions enable row level security;

-- All operations go through supabaseAdmin (service role), which bypasses RLS.
