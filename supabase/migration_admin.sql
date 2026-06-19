-- Profiles table synced with auth.users
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  last_sign_in_at timestamptz,
  created_at timestamptz default now()
);

-- Access log for tracking user sign-ins
create table if not exists public.access_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  signed_in_at timestamptz default now(),
  ip_address text
);

-- RLS for profiles
alter table public.profiles enable row level security;
alter table public.access_logs enable row level security;

-- Admins can read all profiles
create policy "Admins read all profiles" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Users can read their own profile
create policy "Users read own profile" on public.profiles
  for select using (auth.uid() = id);

-- Admins can update any profile (assign roles)
create policy "Admins update profiles" on public.profiles
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Admins can read all access logs
create policy "Admins read access logs" on public.access_logs
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Users can insert their own access logs
create policy "Users insert own access logs" on public.access_logs
  for insert with check (auth.uid() = user_id);

-- Admin policies for products (CRUD)
create policy "Admins insert products" on public.products
  for insert with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Admins update products" on public.products
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Admins delete products" on public.products
  for delete using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Admin policies for categories (CRUD)
create policy "Admins insert categories" on public.categories
  for insert with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Admins update categories" on public.categories
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Admins delete categories" on public.categories
  for delete using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Admin can read all orders
create policy "Admins read all orders" on public.orders
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Admin can update orders (change status)
create policy "Admins update orders" on public.orders
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Admin can read all order items
create policy "Admins read all order items" on public.order_items
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Trigger: auto-create profile on new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, created_at)
  values (new.id, new.email, now());
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger: log access on sign in
create or replace function public.handle_user_sign_in()
returns trigger as $$
begin
  if new.last_sign_in_at is distinct from old.last_sign_in_at then
    update public.profiles set last_sign_in_at = new.last_sign_in_at where id = new.id;
    insert into public.access_logs (user_id, signed_in_at)
    values (new.id, new.last_sign_in_at);
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_sign_in on auth.users;
create trigger on_auth_user_sign_in
  after update on auth.users
  for each row execute procedure public.handle_user_sign_in();

-- Indexes
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_access_logs_user on public.access_logs(user_id);
create index if not exists idx_access_logs_signed_in on public.access_logs(signed_in_at desc);
