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
  featured boolean not null default false,
  sku integer,
  item_code text,
  search_vector tsvector generated always as (
    to_tsvector('spanish',
      coalesce(name, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(brand, '') || ' ' ||
      coalesce(car_model, '')
    )
  ) stored,
  created_at timestamptz default now()
);

-- Orders
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending','confirmed','completed','cancelled')),
  total numeric(10,2) not null default 0,
  payment_method text not null default 'cash' check (payment_method in ('cash', 'transfer')),
  delivery_method text not null default 'shipping' check (delivery_method in ('shipping', 'pickup')),
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

-- Products: Full-text search indexes
create extension if not exists pg_trgm;
create unique index if not exists idx_products_sku_unique on public.products(sku) where sku is not null;
create index if not exists idx_products_search_vector on public.products using gin(search_vector);
create index if not exists idx_products_name_trgm on public.products using gin (name gin_trgm_ops);
create index if not exists idx_products_description_trgm on public.products using gin (description gin_trgm_ops);
create index if not exists idx_products_brand_trgm on public.products using gin (brand gin_trgm_ops);
create index if not exists idx_products_car_model_trgm on public.products using gin (car_model gin_trgm_ops);
create index if not exists idx_products_item_code on public.products(item_code);
create index if not exists idx_products_category_brand on public.products(category_id, brand);
create index if not exists idx_products_brand_model on public.products(brand, car_model);
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

-- Quotes
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  user_id uuid references auth.users(id) on delete set null,
  items jsonb not null default '[]'::jsonb,
  message text not null,
  status text not null default 'pending' check (status in ('pending', 'contacted', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Migrate from old schema (product_id, product_name, quantity) to new items JSONB
alter table public.quotes add column if not exists items jsonb not null default '[]'::jsonb;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'quotes' and column_name = 'product_name'
  ) then
    update public.quotes
    set items = jsonb_build_array(
      jsonb_build_object(
        'type', case when product_id is not null then 'product' else 'custom' end,
        'product_id', product_id,
        'product_name', coalesce(product_name, ''),
        'quantity', quantity
      )
    )
    where items = '[]'::jsonb and (product_name is not null or product_id is not null);
  end if;
end $$;

alter table public.quotes drop column if exists product_id;
alter table public.quotes drop column if exists product_name;
alter table public.quotes drop column if exists quantity;

alter table public.quotes enable row level security;

drop policy if exists "Anyone can insert quotes" on public.quotes;
create policy "Anyone can insert quotes" on public.quotes for insert with check (true);

drop policy if exists "Admins can read all quotes" on public.quotes;
create policy "Admins can read all quotes" on public.quotes for select using (is_admin());

drop policy if exists "Admins can update quotes" on public.quotes;
create policy "Admins can update quotes" on public.quotes for update using (is_admin());

drop policy if exists "Users can read their own quotes" on public.quotes;
create policy "Users can read their own quotes" on public.quotes for select using (auth.uid() = user_id);

-- Quote response items (admin add products with prices)
create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid references public.quotes(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null default 1,
  unit_price numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

alter table public.quote_items enable row level security;

drop policy if exists "Admins manage quote items" on public.quote_items;
create policy "Admins manage quote items" on public.quote_items
  for all using (is_admin());

-- RPC: Crear orden transaccional (stock, items, delivery_method)
create or replace function create_order(
  p_user_id uuid,
  p_items jsonb,
  p_payment_method text default 'cash',
  p_delivery_method text default 'shipping'
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_order_id uuid;
  v_total numeric := 0;
  v_item jsonb;
  v_stock integer;
  v_product_id uuid;
  v_quantity int;
  v_unit_price numeric;
begin
  if p_delivery_method not in ('shipping', 'pickup') then
    raise exception 'Método de entrega inválido: %', p_delivery_method;
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::int;
    v_unit_price := (v_item->>'unit_price')::numeric;

    select stock into v_stock
    from products
    where id = v_product_id
    for update;

    if v_stock < v_quantity then
      raise exception 'Stock insuficiente para el producto %', v_product_id;
    end if;

    update products
    set stock = stock - v_quantity
    where id = v_product_id;

    v_total := v_total + (v_quantity * v_unit_price);
  end loop;

  insert into orders (user_id, total, status, payment_method, delivery_method)
  values (p_user_id, v_total, 'pending', p_payment_method, p_delivery_method)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    insert into order_items (order_id, product_id, quantity, unit_price)
    values (
      v_order_id,
      (v_item->>'product_id')::uuid,
      (v_item->>'quantity')::int,
      (v_item->>'unit_price')::numeric
    );
  end loop;

  return jsonb_build_object(
    'order_id', v_order_id,
    'total', v_total
  );
end;
$$;
