-- schema.sql
-- Extensiones requeridas
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. Tablas y Estructura Base
-- ==========================================

-- Tabla de Perfiles (vinculada a auth.users si se implementa auth)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role text default 'customer' check (role in ('customer', 'admin', 'barber')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de Barberos (Personal)
create table public.barbers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  role text not null,
  years_experience integer,
  signature_style text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de Servicios
create table public.services (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  subtitle text,
  description text,
  price numeric not null,
  duration_minutes integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de Productos (Gorras)
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  collection text,
  price numeric not null,
  stock integer default 0,
  color_hex text,
  accent_hex text,
  tag text,
  material text,
  color_name text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de Citas
create table public.appointments (
  id uuid primary key default uuid_generate_v4(),
  client_name text not null,
  client_phone text not null,
  client_email text,
  barber_id uuid references public.barbers(id),
  service_id uuid references public.services(id),
  appointment_date date not null,
  appointment_time time not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'in-chair', 'completed', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de Reservas de Gorras (Apartados)
create table public.reservations (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) on delete cascade,
  client_name text not null,
  client_email text not null,
  client_phone text,
  status text default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
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

-- Políticas de lectura públicas (cualquiera puede ver productos, barberos y servicios)
create policy "Public can view barbers" on public.barbers for select using (true);
create policy "Public can view services" on public.services for select using (true);
create policy "Public can view products" on public.products for select using (true);

-- Para propósitos del demo, permitiremos inserción pública de citas y apartados.
-- En producción, esto dependería de la autenticación del usuario.
create policy "Public can insert appointments" on public.appointments for insert with check (true);
create policy "Public can insert reservations" on public.reservations for insert with check (true);

-- Solo administradores pueden gestionar (asumiendo que Fernando será auth.uid())
-- Aquí usamos una política de ejemplo que permite todo si eres admin
-- create policy "Admins have full access to products" on public.products for all using (auth.uid() in (select id from public.profiles where role = 'admin'));

-- ==========================================
-- 4. Datos Semilla (Seed Data)
-- ==========================================

insert into public.barbers (id, name, role, years_experience, signature_style) values
  ('11111111-1111-1111-1111-111111111111', 'Mateo Alarcón', 'Master Barber', 12, 'Cortes clásicos'),
  ('22222222-2222-2222-2222-222222222222', 'Daniel Pérez', 'Senior Stylist', 8, 'Fades & texturizado'),
  ('33333333-3333-3333-3333-333333333333', 'Iván Restrepo', 'Shave Specialist', 10, 'Navaja tradicional'),
  ('44444444-4444-4444-4444-444444444444', 'Fernando Mendoza', 'Dueño / Barbero', 15, 'Especialista Integral');

insert into public.services (id, name, subtitle, description, price, duration_minutes) values
  ('55555555-5555-5555-5555-555555555551', 'Corte Cénit', 'Corte de autor', 'Diseño personalizado basado en tu estructura ósea.', 80000, 45),
  ('55555555-5555-5555-5555-555555555552', 'Ritual Clásico', 'Corte + afeitado', 'Corte sastrería, toalla caliente y afeitado.', 130000, 75);

insert into public.products (id, name, collection, price, stock, color_hex, accent_hex, tag, material, color_name) values
  ('66666666-6666-6666-6666-666666666661', 'Snapback Noir Gold', 'Crown Series', 165000, 24, '#0A0A0A', '#C9A86A', 'BESTSELLER', 'Algodón', 'Negro'),
  ('66666666-6666-6666-6666-666666666662', 'Six-Panel Cumbre', 'Summit Edition', 145000, 18, '#1A1816', '#E8C77E', null, 'Lana', 'Marrón Oscuro');

