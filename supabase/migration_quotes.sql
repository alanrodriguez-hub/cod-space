CREATE TABLE IF NOT EXISTS public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Migrate from old schema (product_id, product_name, quantity) to new items JSONB
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS items jsonb NOT NULL DEFAULT '[]'::jsonb;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'quotes' AND column_name = 'product_name'
  ) THEN
    UPDATE public.quotes
    SET items = jsonb_build_array(
      jsonb_build_object(
        'type', CASE WHEN product_id IS NOT NULL THEN 'product' ELSE 'custom' END,
        'product_id', product_id,
        'product_name', COALESCE(product_name, ''),
        'quantity', quantity
      )
    )
    WHERE items = '[]'::jsonb AND (product_name IS NOT NULL OR product_id IS NOT NULL);
  END IF;
END $$;

ALTER TABLE public.quotes DROP COLUMN IF EXISTS product_id;
ALTER TABLE public.quotes DROP COLUMN IF EXISTS product_name;
ALTER TABLE public.quotes DROP COLUMN IF EXISTS quantity;

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert quotes" ON public.quotes;
CREATE POLICY "Anyone can insert quotes"
  ON public.quotes FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read all quotes" ON public.quotes;
CREATE POLICY "Admins can read all quotes"
  ON public.quotes FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can update quotes" ON public.quotes;
CREATE POLICY "Admins can update quotes"
  ON public.quotes FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "Users can read their own quotes" ON public.quotes;
CREATE POLICY "Users can read their own quotes"
  ON public.quotes FOR SELECT
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.quote_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage quote items" ON public.quote_items;
CREATE POLICY "Admins manage quote items"
  ON public.quote_items FOR ALL
  USING (is_admin());
