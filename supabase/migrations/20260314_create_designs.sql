create extension if not exists "pgcrypto";

create table if not exists public.designs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  product_type text not null,
  wood_type text not null,
  epoxy_color text not null,
  leg_style text not null,
  length numeric not null,
  width numeric not null,
  height numeric not null,
  preview_image text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists designs_user_id_idx on public.designs (user_id);
create index if not exists designs_created_at_idx on public.designs (created_at desc);

insert into storage.buckets (id, name, public)
values ('design-previews', 'design-previews', false)
on conflict (id) do nothing;
