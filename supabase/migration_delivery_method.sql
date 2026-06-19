-- Migración: Agregar delivery_method a la tabla orders
-- Ejecutar manualmente en Supabase SQL Editor

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_method TEXT NOT NULL DEFAULT 'shipping'
  CHECK (delivery_method IN ('shipping', 'pickup'));

-- Actualizar la función create_order para aceptar delivery_method
CREATE OR REPLACE FUNCTION create_order(
  p_user_id uuid,
  p_items jsonb,
  p_payment_method text DEFAULT 'cash',
  p_delivery_method text DEFAULT 'shipping'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id uuid;
  v_total numeric := 0;
  v_item jsonb;
  v_stock integer;
  v_product_id uuid;
  v_quantity int;
  v_unit_price numeric;
BEGIN
  -- Validar delivery_method
  IF p_delivery_method NOT IN ('shipping', 'pickup') THEN
    RAISE EXCEPTION 'Método de entrega inválido: %', p_delivery_method;
  END IF;

  -- Validar y descontar stock con lock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::int;
    v_unit_price := (v_item->>'unit_price')::numeric;

    SELECT stock INTO v_stock
    FROM products
    WHERE id = v_product_id
    FOR UPDATE;

    IF v_stock < v_quantity THEN
      RAISE EXCEPTION 'Stock insuficiente para el producto %', v_product_id;
    END IF;

    UPDATE products
    SET stock = stock - v_quantity
    WHERE id = v_product_id;

    v_total := v_total + (v_quantity * v_unit_price);
  END LOOP;

  -- Crear orden
  INSERT INTO orders (user_id, total, status, payment_method, delivery_method)
  VALUES (p_user_id, v_total, 'pending', p_payment_method, p_delivery_method)
  RETURNING id INTO v_order_id;

  -- Insertar items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (order_id, product_id, quantity, unit_price)
    VALUES (
      v_order_id,
      (v_item->>'product_id')::uuid,
      (v_item->>'quantity')::int,
      (v_item->>'unit_price')::numeric
    );
  END LOOP;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'total', v_total
  );
END;
$$;
