create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  subtitle text,
  collection text not null,
  price integer not null check (price >= 0),
  notes_top text,
  notes_heart text,
  notes_base text,
  description text,
  image_url text,
  in_stock boolean default true,
  is_bestseller boolean default false,
  slug text unique not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.orders (
  id uuid default gen_random_uuid() primary key,
  order_number serial,
  customer_name text,
  customer_phone text,
  customer_address text,
  items jsonb not null,
  total integer not null check (total >= 0),
  status text default 'nouveau' check (status in ('nouveau', 'confirme', 'prepare', 'livre', 'annule')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.products enable row level security;
alter table public.orders enable row level security;

create policy "Public can view products"
on public.products
for select
using (true);

create policy "Admins can manage products"
on public.products
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage orders"
on public.orders
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Users can view their own roles"
on public.user_roles
for select
to authenticated
using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage user roles"
on public.user_roles
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

create trigger update_products_updated_at
before update on public.products
for each row
execute function public.update_updated_at_column();

create trigger update_orders_updated_at
before update on public.orders
for each row
execute function public.update_updated_at_column();

create index idx_products_collection on public.products(collection);
create index idx_products_slug on public.products(slug);
create index idx_orders_status on public.orders(status);
create index idx_user_roles_user_id on public.user_roles(user_id);