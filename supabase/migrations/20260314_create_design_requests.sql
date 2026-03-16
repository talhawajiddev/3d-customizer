create extension if not exists "pgcrypto";

create table if not exists public.design_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  notes text,
  design_count integer not null default 0,
  design_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists design_requests_user_id_idx
  on public.design_requests (user_id);

create index if not exists design_requests_created_at_idx
  on public.design_requests (created_at desc);
