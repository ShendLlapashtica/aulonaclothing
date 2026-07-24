-- Aulonaclothing — Supabase schema
-- Run once in the Supabase SQL Editor (Dashboard → SQL Editor → New query → paste → Run).
-- Safe to re-run: every statement is idempotent (if not exists / on conflict do nothing).

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────────────────────────

create table if not exists public.categories (
  name text primary key,
  sort_order bigint not null default 0
);

create table if not exists public.site_texts (
  key text primary key,
  value text not null
);

create table if not exists public.shipping_rates (
  country text primary key,
  label text not null,
  flag text not null,
  price numeric not null default 0
);

create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null,
  price numeric not null,
  original_price numeric,
  sizes text[] not null default '{}',
  images text[] not null default '{}',
  stock integer not null default 0,
  is_new boolean not null default false,
  on_sale boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  customer text not null,
  country text not null,
  items integer not null,
  subtotal numeric not null,
  shipping numeric not null,
  total numeric not null,
  status text not null default 'Në përgatitje',
  date date not null default current_date,
  phone text,
  address text,
  city text,
  notes text,
  payment_method text,
  created_at timestamptz not null default now()
);

create table if not exists public.order_line_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders (id) on delete cascade,
  name text not null,
  size text not null,
  qty integer not null,
  price numeric not null
);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
--
-- This is intentionally simple for a single-owner shop, not a multi-tenant
-- SaaS: any authenticated Supabase user (there will only ever be the one
-- admin account created by hand in the dashboard) can write catalog/shipping
-- data and read/manage orders. Anonymous visitors can read the public
-- catalog and place an order, but can never read anyone's orders.
-- ─────────────────────────────────────────────────────────────

alter table public.categories enable row level security;
alter table public.site_texts enable row level security;
alter table public.shipping_rates enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_line_items enable row level security;

drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories
  for select to anon, authenticated using (true);
drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write" on public.categories
  for all to authenticated using (true) with check (true);

drop policy if exists "site_texts_public_read" on public.site_texts;
create policy "site_texts_public_read" on public.site_texts
  for select to anon, authenticated using (true);
drop policy if exists "site_texts_admin_write" on public.site_texts;
create policy "site_texts_admin_write" on public.site_texts
  for all to authenticated using (true) with check (true);

drop policy if exists "shipping_rates_public_read" on public.shipping_rates;
create policy "shipping_rates_public_read" on public.shipping_rates
  for select to anon, authenticated using (true);
drop policy if exists "shipping_rates_admin_write" on public.shipping_rates;
create policy "shipping_rates_admin_write" on public.shipping_rates
  for all to authenticated using (true) with check (true);

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select to anon, authenticated using (true);
drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products
  for all to authenticated using (true) with check (true);

drop policy if exists "orders_anyone_can_place" on public.orders;
create policy "orders_anyone_can_place" on public.orders
  for insert to anon, authenticated with check (true);
drop policy if exists "orders_admin_manage" on public.orders;
create policy "orders_admin_manage" on public.orders
  for select to authenticated using (true);
drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update" on public.orders
  for update to authenticated using (true) with check (true);
drop policy if exists "orders_admin_delete" on public.orders;
create policy "orders_admin_delete" on public.orders
  for delete to authenticated using (true);

drop policy if exists "order_line_items_anyone_can_place" on public.order_line_items;
create policy "order_line_items_anyone_can_place" on public.order_line_items
  for insert to anon, authenticated with check (true);
drop policy if exists "order_line_items_admin_read" on public.order_line_items;
create policy "order_line_items_admin_read" on public.order_line_items
  for select to authenticated using (true);
drop policy if exists "order_line_items_admin_delete" on public.order_line_items;
create policy "order_line_items_admin_delete" on public.order_line_items
  for delete to authenticated using (true);

-- ─────────────────────────────────────────────────────────────
-- Storage — product image uploads from the admin panel
-- ─────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'product-images');

drop policy if exists "product_images_admin_write" on storage.objects;
create policy "product_images_admin_write" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images');

drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images');

-- ─────────────────────────────────────────────────────────────
-- Seed data — carried over from the old localStorage-only version
-- so the storefront isn't empty on first load.
-- Product photos are served from /products/*.jpg (public/products/ in
-- the app repo) — recovered from Lovable's asset host during migration.
-- ─────────────────────────────────────────────────────────────

insert into public.categories (name, sort_order) values
  ('Fustane', 0), ('Sete', 1), ('Denim', 2), ('Bluza', 3), ('Kombinezone', 4), ('Pantallona', 5)
on conflict (name) do nothing;

insert into public.site_texts (key, value) values
  ('hero_eyebrow', 'Koleksioni i Verës · 2026'),
  ('hero_line1', 'Plans for tonight?'),
  ('hero_accent', 'Find your perfect outfit'),
  ('hero_line3', 'with us.'),
  ('editorial_heading', 'Elegancë e artizanuar pa përpjekje.'),
  ('editorial_body', 'Çdo copë kalon nëpër duart tona përpara se të mbërrijë tek ju. Pëlhurat e zgjedhura, prerjet e menduara dhe detajet e vogla janë ato që bëjnë Aulonaclothing.'),
  ('footer_tagline', 'Modë editoriale për femrën moderne.')
on conflict (key) do nothing;

insert into public.shipping_rates (country, label, flag, price) values
  ('XK', 'Kosovë', '🇽🇰', 0),
  ('AL', 'Shqipëri', '🇦🇱', 5),
  ('MK', 'Maqedonia e Veriut', '🇲🇰', 5)
on conflict (country) do nothing;

insert into public.products (id, name, category, price, original_price, sizes, image, stock, is_new, on_sale) values
  ('aul-01', 'Fustan Draperi Taupe me Çarje', 'Fustane', 19.99, null, array['S','M','L'], '/products/p1.jpg', 12, true, false),
  ('aul-02', 'Xhins i Shkurtër i Grisur', 'Denim', 6.99, null, array['M'], '/products/p2.jpg', 24, false, false),
  ('aul-03', 'Fustan Midi Bezhë me Drapim', 'Fustane', 9.99, 14.99, array['XS','M','L'], '/products/p3.jpg', 8, false, true),
  ('aul-04', 'Set Bluzë e Bardhë & Capri', 'Sete', 14.99, null, array['S/M'], '/products/p4.jpg', 15, false, false),
  ('aul-05', 'Fustan Midi Rozë Ballerinë', 'Fustane', 18.0, null, array['M'], '/products/p5.jpg', 6, true, false),
  ('aul-06', 'Set i Bardhë Elegant', 'Sete', 19.99, null, array['S'], '/products/p6.png', 9, false, false),
  ('aul-07', 'Bluzë Pelerinë me Pantallona Taupe', 'Bluza', 14.99, null, array['46'], '/products/p7.jpg', 5, false, false),
  ('aul-08', 'Fustan Saten Burgundy', 'Fustane', 16.0, null, array['S'], '/products/p8.jpg', 11, false, false),
  ('aul-09', 'Fustan Midi Saten i Zi', 'Fustane', 12.99, null, array['44'], '/products/p9.jpg', 7, false, false),
  ('aul-10', 'Fustan Saten Karamel me Cowl', 'Fustane', 19.99, null, array['42'], '/products/p10.jpg', 4, true, false),
  ('aul-11', 'Fustan Kafe Draperi me Njërën Krah', 'Fustane', 11.99, null, array['42'], '/products/np2.png', 6, true, false),
  ('aul-12', 'Fustan Aquarelle Rozë Asimetrik', 'Fustane', 11.99, null, array['S'], '/products/np3.png', 8, true, false),
  ('aul-13', 'Pantallona Sateni Blu të Gjera', 'Pantallona', 11.99, null, array['M'], '/products/np4.png', 10, true, false),
  ('aul-14', 'Kombinezon Krem pa Krahë', 'Kombinezone', 11.99, null, array['XS'], '/products/np5.png', 7, true, false),
  ('aul-15', 'Fustan Rozë Fuchsia me Volan', 'Fustane', 11.99, null, array['L'], '/products/np6.png', 5, true, false),
  ('aul-16', 'Fustan Mini Blu me Volane', 'Fustane', 11.99, null, array['L'], '/products/np7.png', 6, true, false),
  ('aul-17', 'Kombinezon Dantelle (Blu & e Zezë)', 'Kombinezone', 11.99, null, array['XS'], '/products/np8.png', 9, true, false),
  ('aul-18', 'Kombinezon Sportiv Taupe me Zinxhir', 'Kombinezone', 11.99, null, array['XS'], '/products/np9.png', 8, true, false),
  ('aul-19', 'Fustan Maxi Kafe Njërën Krah', 'Fustane', 11.99, null, array['S'], '/products/np10.png', 7, true, false),
  ('aul-20', 'Fustan i Zi Transparent për Plazh', 'Fustane', 11.99, null, array['XS'], '/products/np11.png', 5, true, false)
on conflict (id) do nothing;
