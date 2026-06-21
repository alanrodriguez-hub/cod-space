-- Seed categories
insert into public.categories (name, slug, image_url) values
  ('Motor', 'motor', 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400'),
  ('Frenos', 'frenos', 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400'),
  ('Suspensión', 'suspension', 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400'),
  ('Eléctrico', 'electrico', 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=400'),
  ('Filtros', 'filtros', 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400'),
  ('Transmisión', 'transmision', 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400');

-- Seed products
insert into public.products (name, description, price, image_url, category_id, brand, car_model, stock) values
  ('Filtro de Aceite', 'Filtro de aceite de alta calidad para motores modernos', 12990, 'https://images.unsplash.com/photo-1635784063879-4f864635838a?w=400', (select id from public.categories where slug = 'filtros'), 'Bosch', 'Universal', 50),
  ('Pastillas de Freno Delanteras', 'Juego de pastillas de freno cerámicas', 34990, 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400', (select id from public.categories where slug = 'frenos'), 'Brembo', 'BYD Dolphin Mini', 30),
  ('Amortiguador Delantero', 'Amortiguador de gas de alta performance', 59990, 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400', (select id from public.categories where slug = 'suspension'), 'Monroe', 'Chery Tiggo 2 Pro Max', 20),
  ('Bujías de Encendido x4', 'Set de 4 bujías de iridio', 24990, 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=400', (select id from public.categories where slug = 'electrico'), 'NGK', 'Universal', 100),
  ('Correa de Distribución', 'Correa de distribución reforzada', 18990, 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400', (select id from public.categories where slug = 'motor'), 'Gates', 'Changan Alsvin', 25),
  ('Filtro de Aire', 'Filtro de aire de alto flujo', 15990, 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400', (select id from public.categories where slug = 'filtros'), 'K&N', 'Universal', 60),
  ('Disco de Freno Ventilado', 'Disco de freno ventilado perforado', 42990, 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400', (select id from public.categories where slug = 'frenos'), 'Brembo', 'MG ZS', 15),
  ('Kit de Embrague', 'Kit completo de embrague con disco, prensa y rodamiento', 89990, 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400', (select id from public.categories where slug = 'transmision'), 'Valeo', 'JAC JS2', 10),
  ('Bomba de Agua', 'Bomba de agua con carcasa de aluminio', 32990, 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400', (select id from public.categories where slug = 'motor'), 'GMB', 'Geely GX3 Pro', 18),
  ('Alternador Remanufacturado', 'Alternador 90A remanufacturado con garantía', 79990, 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=400', (select id from public.categories where slug = 'electrico'), 'Bosch', 'BYD Dolphin', 8),
  ('Espiral de Suspensión', 'Espiral de suspensión delantera reforzada', 29990, 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400', (select id from public.categories where slug = 'suspension'), 'Sachs', 'Changan CS35 Plus', 22),
  ('Aceite Motor 5W-30 4L', 'Aceite sintético de alta performance 4 litros', 27990, 'https://images.unsplash.com/photo-1635784063879-4f864635838a?w=400', (select id from public.categories where slug = 'motor'), 'Mobil', 'Universal', 40);
