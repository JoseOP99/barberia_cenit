-- Crear tabla profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  phone TEXT,
  email TEXT,
  role TEXT DEFAULT 'client',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price BIGINT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla barbers
CREATE TABLE barbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT DEFAULT 'barber',
  years_experience INTEGER,
  signature_style TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  barber_id UUID REFERENCES barbers(id),
  service_id UUID REFERENCES services(id),
  date DATE NOT NULL,
  time TIME NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla products (gorras)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  collection TEXT,
  price BIGINT NOT NULL,
  stock INTEGER DEFAULT 0,
  color TEXT,
  accent_color TEXT,
  tag TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla reservations (apartados)
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending',
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla admin_settings
CREATE TABLE admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices para mejor performance
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_barber_id ON appointments(barber_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_product_id ON reservations(product_id);
CREATE INDEX idx_reservations_expires_at ON reservations(expires_at);

-- Row Level Security (RLS) Policies

-- Profiles: Users can only see their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all profiles"
  ON profiles FOR SELECT
  USING ((SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin');

-- Services: Public can read, admin can manage
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Services are public"
  ON services FOR SELECT
  USING (active = true);

CREATE POLICY "Admin can manage services"
  ON services FOR ALL
  USING ((SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin');

-- Barbers: Public can read, admin can manage
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Barbers are public"
  ON barbers FOR SELECT
  USING (active = true);

CREATE POLICY "Admin can manage barbers"
  ON barbers FOR ALL
  USING ((SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin');

-- Appointments: Users see their own, admin sees all
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own appointments"
  ON appointments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all appointments"
  ON appointments FOR SELECT
  USING ((SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin');

CREATE POLICY "Users can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can manage appointments"
  ON appointments FOR ALL
  USING ((SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin');

-- Products: Public can read, admin can manage
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are public"
  ON products FOR SELECT
  USING (active = true);

CREATE POLICY "Admin can manage products"
  ON products FOR ALL
  USING ((SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin');

-- Reservations: Users see their own, admin sees all
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reservations"
  ON reservations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create reservations"
  ON reservations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all reservations"
  ON reservations FOR SELECT
  USING ((SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin');

CREATE POLICY "Admin can manage reservations"
  ON reservations FOR ALL
  USING ((SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin');

-- Admin Settings: Only admin can access
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage settings"
  ON admin_settings FOR ALL
  USING ((SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin');
