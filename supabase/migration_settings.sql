-- Site settings (key-value)
create table if not exists public.site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.site_settings enable row level security;

-- Allow anyone to read settings (needed for public pages)
create policy "Anyone can read site settings"
  on public.site_settings for select
  using (true);

-- Only admins can insert/update
create policy "Admins can manage site settings"
  on public.site_settings for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Default site name
insert into public.site_settings (key, value)
values ('site_name', ' Repuestos')
on conflict (key) do nothing;
