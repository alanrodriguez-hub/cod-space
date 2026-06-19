-- Rate limiting: control de intentos de autenticación
create table if not exists public.rate_limits (
  id uuid default gen_random_uuid() primary key,
  identifier text not null,
  action text not null,
  attempts integer not null default 1,
  window_start timestamptz not null default now(),
  constraint unique_rate_limit_window unique (identifier, action, window_start)
);

create index if not exists idx_rate_limits_lookup
  on public.rate_limits(identifier, action, window_start);

-- Verifica y registra un intento. Retorna true si está permitido.
create or replace function check_rate_limit(
  p_identifier text,
  p_action text,
  p_max_attempts int default 5,
  p_window_minutes int default 15
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_count int;
  v_window_start timestamptz;
begin
  v_window_start := date_trunc('minute', now()) - ((p_window_minutes - 1) || ' minutes')::interval;

  delete from rate_limits
  where identifier = p_identifier
    and action = p_action
    and window_start < v_window_start;

  select coalesce(sum(attempts), 0) into v_count
  from rate_limits
  where identifier = p_identifier
    and action = p_action
    and window_start >= v_window_start;

  if v_count >= p_max_attempts then
    return false;
  end if;

  insert into rate_limits (identifier, action, attempts, window_start)
  values (p_identifier, p_action, 1, v_window_start)
  on conflict (identifier, action, window_start)
  do update set attempts = rate_limits.attempts + 1;

  return true;
end;
$$;

-- Limpia registros antiguos de rate limiting
create or replace function cleanup_rate_limits()
returns void
language sql
security definer
as $$
  delete from rate_limits
  where window_start < now() - interval '24 hours';
$$;
