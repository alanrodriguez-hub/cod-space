-- Migración: Tabla de banners para carrusel promocional
-- Ejecutar manualmente en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Lectura pública de banners activos
CREATE POLICY "Anyone can read active banners"
  ON banners
  FOR SELECT
  USING (active = true);

-- CRUD completo para admins
CREATE POLICY "Admins can insert banners"
  ON banners
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update banners"
  ON banners
  FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete banners"
  ON banners
  FOR DELETE
  USING (is_admin());
