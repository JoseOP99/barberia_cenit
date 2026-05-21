-- Extensiones requeridas
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. Tablas y Estructura Base
-- ==========================================

-- Tabla de Perfiles (vinculada a auth.users si se implementa auth)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text unique,
  phone text,
  role text default 'customer' check (role in ('customer', 'admin', 'barber')),
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de Barberos (Personal)
create table if not exists public.barbers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  role text not null,
  years_experience integer,
  signature_style text,
  phone text,
  email text,
  status text default 'active' check (status in ('active', 'inactive', 'on-leave')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de Servicios
create table if not exists public.services (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  subtitle text,
  description text,
  price numeric not null,
  duration_minutes integer not null,
  category text default 'general' check (category in ('corte', 'afeitado', 'completo', 'diseño', 'otro')),
  available boolean default true,
  display_order integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de Productos (Gorras)
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  collection text,
  description text,
  price numeric not null,
  stock integer default 0,
  color_hex text,
  accent_hex text,
  color_name text,
  tag text,
  material text,
  image_url text,
  sku text unique,
  visible boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de Citas
create table if not exists public.appointments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  client_name text not null,
  client_phone text not null,
  client_email text,
  barber_id uuid references public.barbers(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  appointment_date date not null,
  appointment_time time not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'in-chair', 'completed', 'cancelled')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de Reservas de Gorras (Apartados)
create table if not exists public.reservations (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  client_name text not null,
  client_email text not null,
  client_phone text,
  quantity integer default 1,
  status text default 'pending' check (status in ('pending', 'completed', 'cancelled', 'expired')),
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ==========================================
-- 2. Lógica de Reservas (Apartados expirados)
-- ==========================================

-- Vista para obtener la disponibilidad real de un producto.
-- Resta del stock total las reservas que aún están 'pending' y no han expirado.
create or replace view public.available_products as
select 
  p.id,
  p.name,
  p.collection,
  p.price,
  p.color_hex,
  p.accent_hex,
  p.tag,
  p.material,
  p.color_name,
  p.description,
  (p.stock - coalesce(r.active_reservations, 0)) as available_stock
from public.products p
left join (
  select product_id, count(*) as active_reservations
  from public.reservations
  where status = 'pending' and expires_at > now()
  group by product_id
) r on p.id = r.product_id;

-- Función para limpiar reservas expiradas automáticamente
create or replace function public.cancel_expired_reservations()
returns void language plpgsql security definer as $$
begin
  update public.reservations
  set status = 'cancelled'
  where status = 'pending' and expires_at <= now();
end;
$$;


-- ==========================================
-- 3. Row Level Security (RLS)
-- ==========================================

alter table public.profiles enable row level security;
alter table public.barbers enable row level security;
alter table public.services enable row level security;
alter table public.products enable row level security;
alter table public.appointments enable row level security;
alter table public.reservations enable row level security;

-- PROFILES: usuarios solo ven su perfil, admins ven todos
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles
  for select using (auth.uid() in (select id from public.profiles where role = 'admin'));
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- BARBERS: lectura pública, solo admin puede escribir
drop policy if exists "Public can view barbers" on public.barbers;
drop policy if exists "Admins can manage barbers" on public.barbers;

create policy "Public can view active barbers" on public.barbers
  for select using (status = 'active');
create policy "Admins can manage barbers" on public.barbers
  for all using (auth.uid() in (select id from public.profiles where role = 'admin'));

-- SERVICES: lectura pública, solo admin puede escribir
drop policy if exists "Public can view services" on public.services;
drop policy if exists "Admins can manage services" on public.services;

create policy "Public can view available services" on public.services
  for select using (available = true);
create policy "Admins can manage services" on public.services
  for all using (auth.uid() in (select id from public.profiles where role = 'admin'));

-- PRODUCTS: lectura pública, solo admin puede escribir
drop policy if exists "Public can view products" on public.products;
drop policy if exists "Admins can manage products" on public.products;

create policy "Public can view visible products" on public.products
  for select using (visible = true);
create policy "Admins can manage products" on public.products
  for all using (auth.uid() in (select id from public.profiles where role = 'admin'));

-- APPOINTMENTS: usuarios ven sus citas, admins ven todas
drop policy if exists "Public can insert appointments" on public.appointments;
drop policy if exists "Users can view own appointments" on public.appointments;
drop policy if exists "Admins can manage appointments" on public.appointments;

create policy "Users can create appointments" on public.appointments
  for insert with check (true);
create policy "Users can view own appointments" on public.appointments
  for select using (auth.uid() = user_id or auth.uid() in (select id from public.profiles where role = 'admin'));
create policy "Admins can manage appointments" on public.appointments
  for all using (auth.uid() in (select id from public.profiles where role = 'admin'));

-- RESERVATIONS: usuarios ven sus apartados, admins ven todos
drop policy if exists "Public can insert reservations" on public.reservations;
drop policy if exists "Users can view own reservations" on public.reservations;
drop policy if exists "Admins can manage reservations" on public.reservations;

create policy "Users can create reservations" on public.reservations
  for insert with check (true);
create policy "Users can view own reservations" on public.reservations
  for select using (auth.uid() = user_id or auth.uid() in (select id from public.profiles where role = 'admin'));
create policy "Admins can manage reservations" on public.reservations
  for all using (auth.uid() in (select id from public.profiles where role = 'admin'));

-- ==========================================
-- 4. Índices para Performance
-- ==========================================

create index if not exists idx_appointments_date on public.appointments(appointment_date);
create index if not exists idx_appointments_barber on public.appointments(barber_id);
create index if not exists idx_appointments_status on public.appointments(status);
create index if not exists idx_appointments_user on public.appointments(user_id);
create index if not exists idx_reservations_product on public.reservations(product_id);
create index if not exists idx_reservations_expires on public.reservations(expires_at);
create index if not exists idx_reservations_status on public.reservations(status);
create index if not exists idx_reservations_user on public.reservations(user_id);
create index if not exists idx_products_visible on public.products(visible);
create index if not exists idx_products_sku on public.products(sku);

-- ==========================================
-- 5. Datos Semilla (Seed Data)
-- ==========================================

-- Insertar barberos con valores actualizados (solo si no existen)
insert into public.barbers (id, name, role, years_experience, signature_style, status) values
  ('11111111-1111-1111-1111-111111111111', 'Mateo Alarcón', 'Master Barber', 12, 'Cortes clásicos', 'active'),
  ('22222222-2222-2222-2222-222222222222', 'Daniel Pérez', 'Senior Stylist', 8, 'Fades & texturizado', 'active'),
  ('33333333-3333-3333-3333-333333333333', 'Iván Restrepo', 'Shave Specialist', 10, 'Navaja tradicional', 'active'),
  ('44444444-4444-4444-4444-444444444444', 'Fernando Mendoza', 'Dueño / Barbero', 15, 'Especialista Integral', 'active')
on conflict (id) do nothing;

-- Insertar servicios
insert into public.services (id, name, subtitle, description, price, duration_minutes, category, available, display_order) values
  ('55555555-5555-5555-5555-555555555551', 'Corte Cénit', 'Corte de autor', 'Diseño personalizado basado en tu estructura ósea.', 80000, 45, 'corte', true, 1),
  ('55555555-5555-5555-5555-555555555552', 'Ritual Clásico', 'Corte + afeitado', 'Corte sastrería, toalla caliente y afeitado.', 130000, 75, 'completo', true, 2),
  ('55555555-5555-5555-5555-555555555553', 'Afeitado Premium', 'Solo afeitado', 'Afeitado con navaja y barba de lujo.', 50000, 30, 'afeitado', true, 3)
on conflict (id) do nothing;

-- Insertar productos
insert into public.products (id, name, collection, price, stock, color_hex, accent_hex, tag, material, color_name, visible, sku) values
  ('66666666-6666-6666-6666-666666666661', 'Snapback Noir Gold', 'Crown Series', 165000, 24, '#0A0A0A', '#C9A86A', 'BESTSELLER', 'Algodón', 'Negro', true, 'SNAP-001'),
  ('66666666-6666-6666-6666-666666666662', 'Six-Panel Cumbre', 'Summit Edition', 145000, 18, '#1A1816', '#E8C77E', null, 'Lana', 'Marrón Oscuro', true, 'SIX-001'),
  ('66666666-6666-6666-6666-666666666663', 'Cap Heritage', 'Classic Line', 125000, 15, '#2C2420', '#B8965A', 'NEW', 'Algodón Puro', 'Chocolate', true, 'HER-001')
on conflict (id) do nothing;

-- Insertar perfil de administrador (usuario creado via Auth API)
insert into public.profiles (id, full_name, email, role) values
  ('f6bd12c7-885f-4ce9-ba3d-c3b97931e6e1', 'Admin Cénit', 'barbercenit@gmail.com', 'admin')
on conflict (id) do nothing;

