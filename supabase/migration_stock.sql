-- Función RPC para descontar stock de un producto
create or replace function decrement_stock(p_product_id uuid, p_quantity integer)
returns void
language sql
as $$
  update products
  set stock = greatest(stock - p_quantity, 0)
  where id = p_product_id;
$$;
