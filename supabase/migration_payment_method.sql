-- Add payment_method column to public.orders table if it doesn't exist
alter table public.orders 
add column if not exists payment_method text not null default 'cash' check (payment_method in ('cash', 'transfer'));

-- Overwrite create_order to accept p_payment_method
create or replace function create_order(
  p_user_id uuid,
  p_items jsonb,
  p_payment_method text default 'cash'
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
  -- Validar y descontar stock con lock
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

  -- Crear orden con el método de pago recibido
  insert into orders (user_id, total, status, payment_method)
  values (p_user_id, v_total, 'pending', p_payment_method)
  returning id into v_order_id;

  -- Insertar items
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
