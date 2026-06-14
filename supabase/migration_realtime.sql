-- Habilitar Realtime para la tabla orders (notificaciones de nuevos pedidos)
alter publication supabase_realtime add table public.orders;

-- También para products (actualizaciones de stock en tiempo real)
alter publication supabase_realtime add table public.products;
