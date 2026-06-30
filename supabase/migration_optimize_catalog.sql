-- Migration: Optimizar catálogo - SKU, item_code, búsqueda de texto completo, índices
-- ============================================================================

-- 1. Extensiones necesarias
create extension if not exists pg_trgm;

-- 2. Nuevas columnas en products
alter table public.products add column if not exists sku integer;
alter table public.products add column if not exists item_code text;
alter table public.products add column if not exists search_vector tsvector;

-- 3. Unique constraint para SKU (nulls no compiten)
create unique index if not exists idx_products_sku_unique on public.products(sku) where sku is not null;

-- 4. Índices para búsqueda
-- GIN para tsvector (búsqueda de texto completo)
create index if not exists idx_products_search_vector on public.products using gin(search_vector);

-- Trigram indexes para ILIKE / LIKE en campos de texto
create index if not exists idx_products_name_trgm on public.products using gin (name gin_trgm_ops);
create index if not exists idx_products_description_trgm on public.products using gin (description gin_trgm_ops);
create index if not exists idx_products_brand_trgm on public.products using gin (brand gin_trgm_ops);
create index if not exists idx_products_car_model_trgm on public.products using gin (car_model gin_trgm_ops);

-- 5. Índices compuestos para consultas comunes
drop index if exists idx_products_category_brand;
create index idx_products_category_brand on public.products(category_id, brand);
drop index if exists idx_products_brand_model;
create index idx_products_brand_model on public.products(brand, car_model);

-- 6. Índices para lookups exactos
create index if not exists idx_products_item_code on public.products(item_code);
create index if not exists idx_products_item_code_unique on public.products(item_code) where item_code is not null;

-- 7. Función y trigger para auto-actualizar search_vector
create or replace function public.products_search_vector_update()
returns trigger
language plpgsql
as $$
begin
  new.search_vector := to_tsvector('spanish',
    coalesce(new.name, '') || ' ' ||
    coalesce(new.description, '') || ' ' ||
    coalesce(new.brand, '') || ' ' ||
    coalesce(new.car_model, '')
  );
  return new;
end;
$$;

drop trigger if exists trg_products_search_vector on public.products;
create trigger trg_products_search_vector
  before insert or update of name, description, brand, car_model
  on public.products
  for each row
  execute function public.products_search_vector_update();

-- 8. Poblar search_vector para filas existentes
update public.products
set search_vector = to_tsvector('spanish',
  coalesce(name, '') || ' ' ||
  coalesce(description, '') || ' ' ||
  coalesce(brand, '') || ' ' ||
  coalesce(car_model, '')
)
where search_vector is null;

-- 9. Generar SKU secuencial para productos existentes que no tengan
do $$
declare
  v_sku int;
  v_rec record;
begin
  v_sku := 10000000;
  for v_rec in select id from public.products where sku is null order by created_at, id loop
    update public.products set sku = v_sku where id = v_rec.id;
    v_sku := v_sku + 1;
  end loop;
end;
$$;

-- 10. Actualizar RPC create_order para usar SKU como respaldo en la búsqueda
create or replace function public.create_order(
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
