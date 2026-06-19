-- Migración: Bucket de imágenes en Supabase Storage
-- Ejecutar manualmente en Supabase SQL Editor

INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Lectura pública
CREATE POLICY "Public read images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'images');

-- Admins pueden subir imágenes
CREATE POLICY "Admins can upload images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'images' AND is_admin());

-- Admins pueden actualizar imágenes
CREATE POLICY "Admins can update images"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'images' AND is_admin());

-- Admins pueden eliminar imágenes
CREATE POLICY "Admins can delete images"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'images' AND is_admin());
