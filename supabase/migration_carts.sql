-- Carrito persistente: guarda items del carrito por usuario
create table if not exists public.carts (
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  quantity integer not null check (quantity > 0),
  created_at timestamptz default now(),
  primary key (user_id, product_id)
);

alter table public.carts enable row level security;

-- Cada usuario solo puede ver y modificar su propio carrito
create policy "Users manage own cart"
  on public.carts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Admin puede ver todos los carritos (útil para debugging)
create policy "Admin read all carts"
  on public.carts for select
  using (is_admin());
