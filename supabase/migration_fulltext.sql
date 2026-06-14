-- Búsqueda full-text con pg_trgm para ILIKE rápido
create extension if not exists pg_trgm;

create index if not exists idx_products_name_trgm
  on public.products using gin (name gin_trgm_ops);

-- Columna tsvector para búsqueda full-text nativa
alter table public.products
  add column if not exists search_vector tsvector
  generated always as (to_tsvector('spanish', coalesce(name, '') || ' ' || coalesce(description, ''))) stored;

create index if not exists idx_products_search
  on public.products using gin (search_vector);
