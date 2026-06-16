-- Categories
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  image_url text
);

-- Products
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null default '',
  price numeric(10,2) not null,
  image_url text,
  category_id uuid references public.categories(id) on delete set null,
  brand text not null default '',
  car_model text not null default '',
  stock integer not null default 0,
  created_at timestamptz default now()
);

-- Orders
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending','confirmed','completed','cancelled')),
  total numeric(10,2) not null default 0,
  payment_method text not null default 'cash' check (payment_method in ('cash', 'transfer')),
  created_at timestamptz default now()
);

-- Order items
create table if not exists public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null,
  unit_price numeric(10,2) not null
);

-- RLS
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Public read for categories and products
drop policy if exists "Public read categories" on public.categories;
create policy "Public read categories" on public.categories for select using (true);

drop policy if exists "Public read products" on public.products;
create policy "Public read products" on public.products for select using (true);

-- Orders: users can only see/create their own
drop policy if exists "Users read own orders" on public.orders;
create policy "Users read own orders" on public.orders for select using (auth.uid() = user_id);

drop policy if exists "Users insert own orders" on public.orders;
create policy "Users insert own orders" on public.orders for insert with check (auth.uid() = user_id);

-- Order items: users can see/create items for their own orders
drop policy if exists "Users read own order items" on public.order_items;
create policy "Users read own order items" on public.order_items
  for select using (
    exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
  );

drop policy if exists "Users insert own order items" on public.order_items;
create policy "Users insert own order items" on public.order_items
  for insert with check (
    exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
  );

-- Indexes
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_brand on public.products(brand);
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_order_items_order on public.order_items(order_id);
