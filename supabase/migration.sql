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
