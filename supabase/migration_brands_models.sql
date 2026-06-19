-- Brands
create table if not exists public.brands (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  image_url text
);

-- Car models (linked to a brand)
create table if not exists public.car_models (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  brand_id uuid references public.brands(id) on delete cascade not null,
  unique(name, brand_id)
);

-- Product <-> Brand (many-to-many)
create table if not exists public.product_brands (
  product_id uuid references public.products(id) on delete cascade not null,
  brand_id uuid references public.brands(id) on delete cascade not null,
  primary key (product_id, brand_id)
);

-- Product <-> Car Model (many-to-many)
create table if not exists public.product_car_models (
  product_id uuid references public.products(id) on delete cascade not null,
  car_model_id uuid references public.car_models(id) on delete cascade not null,
  primary key (product_id, car_model_id)
);

-- RLS
alter table public.brands enable row level security;
alter table public.car_models enable row level security;
alter table public.product_brands enable row level security;
alter table public.product_car_models enable row level security;

-- Public read
create policy "Public read brands" on public.brands for select using (true);
create policy "Public read car_models" on public.car_models for select using (true);
create policy "Public read product_brands" on public.product_brands for select using (true);
create policy "Public read product_car_models" on public.product_car_models for select using (true);

-- Admin CRUD
create policy "Admin insert brands" on public.brands for insert with check (is_admin());
create policy "Admin update brands" on public.brands for update using (is_admin());
create policy "Admin delete brands" on public.brands for delete using (is_admin());

create policy "Admin insert car_models" on public.car_models for insert with check (is_admin());
create policy "Admin update car_models" on public.car_models for update using (is_admin());
create policy "Admin delete car_models" on public.car_models for delete using (is_admin());

create policy "Admin insert product_brands" on public.product_brands for insert with check (is_admin());
create policy "Admin update product_brands" on public.product_brands for update using (is_admin());
create policy "Admin delete product_brands" on public.product_brands for delete using (is_admin());

create policy "Admin insert product_car_models" on public.product_car_models for insert with check (is_admin());
create policy "Admin update product_car_models" on public.product_car_models for update using (is_admin());
create policy "Admin delete product_car_models" on public.product_car_models for delete using (is_admin());

-- Indexes
create index if not exists idx_car_models_brand on public.car_models(brand_id);
create index if not exists idx_product_brands_product on public.product_brands(product_id);
create index if not exists idx_product_brands_brand on public.product_brands(brand_id);
create index if not exists idx_product_car_models_product on public.product_car_models(product_id);
create index if not exists idx_product_car_models_car_model on public.product_car_models(car_model_id);
