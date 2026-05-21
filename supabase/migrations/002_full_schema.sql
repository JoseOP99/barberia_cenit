-- ============================================================
-- Barbería Cénit — Esquema Completo v2
-- Migración: 002_full_schema.sql
-- Fecha: 2026-05-21
-- ============================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. PROFILES (extendido para registro completo)
-- ============================================================
DROP TABLE IF EXISTS public.notifications_log CASCADE;
DROP TABLE IF EXISTS public.monthly_raffles CASCADE;
DROP TABLE IF EXISTS public.schedule_blocks CASCADE;
DROP TABLE IF EXISTS public.barber_schedules CASCADE;
DROP TABLE IF EXISTS public.product_images CASCADE;
DROP TABLE IF EXISTS public.reservations CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.product_categories CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.barbers CASCADE;
DROP TABLE IF EXISTS public.admin_settings CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  second_name TEXT,
  first_lastname TEXT NOT NULL,
  second_lastname TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  identification TEXT,
  identification_type TEXT DEFAULT 'CC' CHECK (identification_type IN ('CC', 'TI', 'CE', 'PP', 'NIT')),
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'barber')),
  avatar_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'suspended')),
  no_show_count INTEGER DEFAULT 0,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. BARBERS
-- ============================================================
CREATE TABLE public.barbers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Barbero',
  years_experience INTEGER,
  signature_style TEXT,
  phone TEXT,
  email TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on-leave')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. BARBER SCHEDULES (horarios configurables por día)
-- ============================================================
CREATE TABLE public.barber_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(barber_id, day_of_week)
);

-- ============================================================
-- 4. SCHEDULE BLOCKS (bloqueos de calendario)
-- ============================================================
CREATE TABLE public.schedule_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL DEFAULT 'custom' CHECK (block_type IN ('lunch', 'break', 'vacation', 'day_off', 'custom')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  recurrence TEXT DEFAULT 'none' CHECK (recurrence IN ('none', 'daily', 'weekly')),
  reason TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (end_date >= start_date)
);

-- ============================================================
-- 5. SERVICES
-- ============================================================
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  price NUMERIC NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 45,
  category TEXT DEFAULT 'corte' CHECK (category IN ('corte', 'afeitado', 'completo', 'diseño', 'otro')),
  available BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. PRODUCT CATEGORIES
-- ============================================================
CREATE TABLE public.product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. PRODUCTS
-- ============================================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  collection TEXT,
  price NUMERIC NOT NULL,
  stock INTEGER DEFAULT 0,
  category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
  color_hex TEXT,
  accent_hex TEXT,
  color_name TEXT,
  tag TEXT,
  material TEXT,
  sku TEXT UNIQUE,
  visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. PRODUCT IMAGES
-- ============================================================
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  alt_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. APPOINTMENTS
-- ============================================================
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT,
  barber_id UUID REFERENCES public.barbers(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  end_time TIME,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'in-chair', 'completed',
    'no-show', 'cancelled', 'late-cancelled'
  )),
  checked_in_at TIMESTAMPTZ,
  is_free_cut BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. RESERVATIONS (apartados de productos)
-- ============================================================
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  quantity INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 11. MONTHLY RAFFLES (sorteos mensuales)
-- ============================================================
CREATE TABLE public.monthly_raffles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  raffle_month DATE NOT NULL,
  winner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  prize_type TEXT DEFAULT 'free_cut',
  prize_appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  prize_expires_at TIMESTAMPTZ,
  prize_redeemed BOOLEAN DEFAULT FALSE,
  eligible_count INTEGER DEFAULT 0,
  drawn_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(raffle_month)
);

-- ============================================================
-- 12. NOTIFICATIONS LOG
-- ============================================================
CREATE TABLE public.notifications_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_type TEXT NOT NULL CHECK (notification_type IN ('email', 'whatsapp', 'sms')),
  recipient TEXT NOT NULL,
  subject TEXT,
  body_preview TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('sent', 'failed', 'pending')),
  related_appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  related_reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 13. ADMIN SETTINGS
-- ============================================================
CREATE TABLE public.admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_profiles_status ON public.profiles(status);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);

CREATE INDEX idx_barber_schedules_barber ON public.barber_schedules(barber_id);
CREATE INDEX idx_schedule_blocks_barber ON public.schedule_blocks(barber_id);
CREATE INDEX idx_schedule_blocks_dates ON public.schedule_blocks(start_date, end_date);

CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_visible ON public.products(visible);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_product_images_product ON public.product_images(product_id);

CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_barber ON public.appointments(barber_id);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_appointments_user ON public.appointments(user_id);
CREATE INDEX idx_appointments_date_time ON public.appointments(appointment_date, appointment_time);

CREATE INDEX idx_reservations_product ON public.reservations(product_id);
CREATE INDEX idx_reservations_user ON public.reservations(user_id);
CREATE INDEX idx_reservations_status ON public.reservations(status);
CREATE INDEX idx_reservations_expires ON public.reservations(expires_at);

CREATE INDEX idx_notifications_type ON public.notifications_log(notification_type);
CREATE INDEX idx_notifications_status ON public.notifications_log(status);

CREATE INDEX idx_monthly_raffles_month ON public.monthly_raffles(raffle_month);

-- ============================================================
-- VIEWS
-- ============================================================

-- Vista de stock disponible real (descuenta reservas activas)
CREATE OR REPLACE VIEW public.available_products AS
SELECT
  p.*,
  pc.name AS category_name,
  pc.slug AS category_slug,
  (p.stock - COALESCE(r.active_reservations, 0)) AS available_stock
FROM public.products p
LEFT JOIN public.product_categories pc ON p.category_id = pc.id
LEFT JOIN (
  SELECT product_id, SUM(quantity) AS active_reservations
  FROM public.reservations
  WHERE status = 'pending' AND expires_at > NOW()
  GROUP BY product_id
) r ON p.id = r.product_id
WHERE p.visible = TRUE;

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Función: auto-calcular end_time al insertar appointment
CREATE OR REPLACE FUNCTION public.calculate_appointment_end_time()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  service_duration INTEGER;
BEGIN
  SELECT duration_minutes INTO service_duration
  FROM public.services WHERE id = NEW.service_id;

  IF service_duration IS NOT NULL THEN
    NEW.end_time := NEW.appointment_time + (service_duration || ' minutes')::INTERVAL;
  ELSE
    NEW.end_time := NEW.appointment_time + INTERVAL '45 minutes';
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_calc_end_time
  BEFORE INSERT OR UPDATE OF appointment_time, service_id
  ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_appointment_end_time();

-- Función: incrementar no-show y verificar bloqueo
CREATE OR REPLACE FUNCTION public.handle_no_show()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.status = 'no-show' AND OLD.status != 'no-show' AND NEW.user_id IS NOT NULL THEN
    UPDATE public.profiles
    SET
      no_show_count = no_show_count + 1,
      status = CASE
        WHEN no_show_count + 1 >= 3 THEN 'blocked'
        ELSE status
      END,
      updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_handle_no_show
  AFTER UPDATE OF status
  ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_no_show();

-- Función: crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, first_name, first_lastname, email, phone,
    identification, identification_type, role
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'first_lastname', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    COALESCE(NEW.raw_user_meta_data->>'identification', NULL),
    COALESCE(NEW.raw_user_meta_data->>'identification_type', 'CC'),
    'customer'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Función: cancelar reservas expiradas
CREATE OR REPLACE FUNCTION public.cancel_expired_reservations()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.reservations
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending' AND expires_at <= NOW();
END;
$$;

-- Función: obtener usuarios elegibles para sorteo mensual
CREATE OR REPLACE FUNCTION public.get_raffle_eligible_users(target_month DATE)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  completed_appointments BIGINT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.user_id,
    (p.first_name || ' ' || p.first_lastname)::TEXT AS full_name,
    COUNT(*)::BIGINT AS completed_appointments
  FROM public.appointments a
  JOIN public.profiles p ON a.user_id = p.id
  WHERE
    a.status = 'completed'
    AND a.is_free_cut = FALSE
    AND a.user_id IS NOT NULL
    AND EXTRACT(MONTH FROM a.appointment_date) = EXTRACT(MONTH FROM target_month)
    AND EXTRACT(YEAR FROM a.appointment_date) = EXTRACT(YEAR FROM target_month)
    AND p.status = 'active'
  GROUP BY a.user_id, p.first_name, p.first_lastname
  HAVING COUNT(*) > 1;
END;
$$;

-- Función: ejecutar sorteo mensual
CREATE OR REPLACE FUNCTION public.execute_monthly_raffle(target_month DATE)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  winner UUID;
  eligible_total INTEGER;
BEGIN
  -- Verificar que no exista ya un sorteo para este mes
  IF EXISTS (SELECT 1 FROM public.monthly_raffles WHERE raffle_month = target_month) THEN
    RAISE EXCEPTION 'Ya existe un sorteo para este mes';
  END IF;

  -- Contar elegibles
  SELECT COUNT(*) INTO eligible_total
  FROM public.get_raffle_eligible_users(target_month);

  IF eligible_total = 0 THEN
    RAISE EXCEPTION 'No hay usuarios elegibles para el sorteo';
  END IF;

  -- Seleccionar ganador aleatorio
  SELECT user_id INTO winner
  FROM public.get_raffle_eligible_users(target_month)
  ORDER BY RANDOM()
  LIMIT 1;

  -- Registrar sorteo
  INSERT INTO public.monthly_raffles (
    raffle_month, winner_id, prize_type,
    prize_expires_at, eligible_count, drawn_at
  ) VALUES (
    target_month, winner, 'free_cut',
    NOW() + INTERVAL '10 days', eligible_total, NOW()
  );

  RETURN winner;
END;
$$;

-- Función: obtener slots disponibles para un barbero en una fecha
CREATE OR REPLACE FUNCTION public.get_available_slots(
  p_barber_id UUID,
  p_date DATE
)
RETURNS TABLE (
  slot_time TIME,
  is_available BOOLEAN
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_day_of_week INTEGER;
  v_open_time TIME;
  v_close_time TIME;
  v_slot TIME;
  v_slot_interval INTERVAL := INTERVAL '30 minutes';
BEGIN
  v_day_of_week := EXTRACT(DOW FROM p_date)::INTEGER;

  -- Obtener horario del barbero para ese día
  SELECT bs.open_time, bs.close_time INTO v_open_time, v_close_time
  FROM public.barber_schedules bs
  WHERE bs.barber_id = p_barber_id
    AND bs.day_of_week = v_day_of_week
    AND bs.is_active = TRUE;

  IF v_open_time IS NULL THEN
    RETURN;
  END IF;

  v_slot := v_open_time;

  WHILE v_slot < v_close_time LOOP
    RETURN QUERY
    SELECT
      v_slot,
      NOT EXISTS (
        -- Verificar citas existentes
        SELECT 1 FROM public.appointments a
        WHERE a.barber_id = p_barber_id
          AND a.appointment_date = p_date
          AND a.appointment_time <= v_slot
          AND a.end_time > v_slot
          AND a.status NOT IN ('cancelled', 'no-show', 'late-cancelled')
      )
      AND NOT EXISTS (
        -- Verificar bloqueos
        SELECT 1 FROM public.schedule_blocks sb
        WHERE sb.barber_id = p_barber_id
          AND sb.is_active = TRUE
          AND p_date BETWEEN sb.start_date AND sb.end_date
          AND (
            (sb.start_time IS NULL AND sb.end_time IS NULL)
            OR (v_slot >= sb.start_time AND v_slot < sb.end_time)
          )
      );

    v_slot := v_slot + v_slot_interval;
  END LOOP;
END;
$$;

-- Función: actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

-- Triggers de updated_at
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_barbers_updated_at BEFORE UPDATE ON public.barbers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_services_updated_at BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_schedule_blocks_updated_at BEFORE UPDATE ON public.schedule_blocks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_reservations_updated_at BEFORE UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_admin_settings_updated_at BEFORE UPDATE ON public.admin_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barber_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_raffles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Helper: verificar si el usuario actual es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- PROFILES
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (public.is_admin());
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (public.is_admin());
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- BARBERS
CREATE POLICY "barbers_public_read" ON public.barbers
  FOR SELECT USING (status = 'active');
CREATE POLICY "barbers_admin_all" ON public.barbers
  FOR ALL USING (public.is_admin());

-- BARBER SCHEDULES
CREATE POLICY "barber_schedules_public_read" ON public.barber_schedules
  FOR SELECT USING (TRUE);
CREATE POLICY "barber_schedules_admin_all" ON public.barber_schedules
  FOR ALL USING (public.is_admin());

-- SCHEDULE BLOCKS
CREATE POLICY "schedule_blocks_public_read" ON public.schedule_blocks
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "schedule_blocks_admin_all" ON public.schedule_blocks
  FOR ALL USING (public.is_admin());

-- SERVICES
CREATE POLICY "services_public_read" ON public.services
  FOR SELECT USING (available = TRUE);
CREATE POLICY "services_admin_all" ON public.services
  FOR ALL USING (public.is_admin());

-- PRODUCT CATEGORIES
CREATE POLICY "product_categories_public_read" ON public.product_categories
  FOR SELECT USING (active = TRUE);
CREATE POLICY "product_categories_admin_all" ON public.product_categories
  FOR ALL USING (public.is_admin());

-- PRODUCTS
CREATE POLICY "products_public_read" ON public.products
  FOR SELECT USING (visible = TRUE);
CREATE POLICY "products_admin_all" ON public.products
  FOR ALL USING (public.is_admin());

-- PRODUCT IMAGES
CREATE POLICY "product_images_public_read" ON public.product_images
  FOR SELECT USING (TRUE);
CREATE POLICY "product_images_admin_all" ON public.product_images
  FOR ALL USING (public.is_admin());

-- APPOINTMENTS
CREATE POLICY "appointments_insert_auth" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "appointments_select_own" ON public.appointments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "appointments_select_admin" ON public.appointments
  FOR SELECT USING (public.is_admin());
CREATE POLICY "appointments_admin_all" ON public.appointments
  FOR ALL USING (public.is_admin());

-- RESERVATIONS
CREATE POLICY "reservations_insert_auth" ON public.reservations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "reservations_select_own" ON public.reservations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reservations_select_admin" ON public.reservations
  FOR SELECT USING (public.is_admin());
CREATE POLICY "reservations_admin_all" ON public.reservations
  FOR ALL USING (public.is_admin());

-- MONTHLY RAFFLES
CREATE POLICY "raffles_public_read" ON public.monthly_raffles
  FOR SELECT USING (TRUE);
CREATE POLICY "raffles_admin_all" ON public.monthly_raffles
  FOR ALL USING (public.is_admin());

-- NOTIFICATIONS LOG
CREATE POLICY "notifications_admin_all" ON public.notifications_log
  FOR ALL USING (public.is_admin());

-- ADMIN SETTINGS
CREATE POLICY "admin_settings_admin_all" ON public.admin_settings
  FOR ALL USING (public.is_admin());

-- ============================================================
-- SEED DATA
-- ============================================================

-- Barbero principal
INSERT INTO public.barbers (id, name, role, years_experience, signature_style, phone, status)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'Fernando Mendoza',
  'Dueño / Barbero',
  15,
  'Especialista Integral',
  '+57 304 2740607',
  'active'
) ON CONFLICT (id) DO NOTHING;

-- Horarios de Fernando (Lunes=1 cerrado, Martes-Sábado=2-6, Domingo=0)
INSERT INTO public.barber_schedules (barber_id, day_of_week, open_time, close_time, is_active)
VALUES
  ('44444444-4444-4444-4444-444444444444', 0, '08:30', '15:00', TRUE),  -- Domingo
  ('44444444-4444-4444-4444-444444444444', 1, '08:30', '18:00', FALSE), -- Lunes CERRADO
  ('44444444-4444-4444-4444-444444444444', 2, '08:30', '18:00', TRUE),  -- Martes
  ('44444444-4444-4444-4444-444444444444', 3, '08:30', '18:00', TRUE),  -- Miércoles
  ('44444444-4444-4444-4444-444444444444', 4, '08:30', '18:00', TRUE),  -- Jueves
  ('44444444-4444-4444-4444-444444444444', 5, '08:30', '18:00', TRUE),  -- Viernes
  ('44444444-4444-4444-4444-444444444444', 6, '08:30', '18:00', TRUE)   -- Sábado
ON CONFLICT (barber_id, day_of_week) DO NOTHING;

-- Bloqueo de almuerzo recurrente (12:00 - 13:00 Martes a Sábado)
INSERT INTO public.schedule_blocks (barber_id, block_type, start_date, end_date, start_time, end_time, recurrence, reason)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'lunch',
  '2026-01-01',
  '2030-12-31',
  '12:00',
  '13:00',
  'daily',
  'Hora de almuerzo'
);

-- Servicios
INSERT INTO public.services (id, name, subtitle, description, price, duration_minutes, category, available, display_order)
VALUES
  ('55555555-5555-5555-5555-555555555551', 'Corte Cénit', 'Corte de autor', 'Diseño personalizado basado en tu estructura ósea y estilo personal.', 10000, 45, 'corte', TRUE, 1),
  ('55555555-5555-5555-5555-555555555552', 'Ritual Clásico', 'Corte + afeitado', 'Corte sastrería, toalla caliente, masaje y afeitado con navaja.', 18000, 75, 'completo', TRUE, 2),
  ('55555555-5555-5555-5555-555555555553', 'Afeitado Premium', 'Solo afeitado', 'Afeitado con navaja tradicional, toalla caliente y bálsamo.', 8000, 30, 'afeitado', TRUE, 3)
ON CONFLICT (id) DO NOTHING;

-- Categorías de productos
INSERT INTO public.product_categories (id, name, slug, description, display_order, active)
VALUES
  ('77777777-7777-7777-7777-777777777771', 'Gorras', 'gorras', 'Gorras exclusivas Cénit', 1, TRUE),
  ('77777777-7777-7777-7777-777777777772', 'Camisetas', 'camisetas', 'Camisetas de la marca', 2, TRUE),
  ('77777777-7777-7777-7777-777777777773', 'Accesorios', 'accesorios', 'Accesorios para el cuidado', 3, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Productos (gorras)
INSERT INTO public.products (id, name, collection, description, price, stock, category_id, color_hex, accent_hex, color_name, tag, material, sku, visible)
VALUES
  ('66666666-6666-6666-6666-666666666661', 'Snapback Noir Gold', 'Crown Series', 'Gorra snapback premium con bordado dorado Cénit.', 45000, 24, '77777777-7777-7777-7777-777777777771', '#0A0A0A', '#C9A86A', 'Negro', 'BESTSELLER', 'Algodón', 'SNAP-001', TRUE),
  ('66666666-6666-6666-6666-666666666662', 'Six-Panel Cumbre', 'Summit Edition', 'Gorra estructurada de 6 paneles con logo bordado.', 40000, 18, '77777777-7777-7777-7777-777777777771', '#1A1816', '#E8C77E', 'Marrón Oscuro', NULL, 'Lana', 'SIX-001', TRUE),
  ('66666666-6666-6666-6666-666666666663', 'Cap Heritage', 'Classic Line', 'Gorra clásica dad-cap con acabado vintage.', 35000, 15, '77777777-7777-7777-7777-777777777771', '#2C2420', '#B8965A', 'Chocolate', 'NEW', 'Algodón Puro', 'HER-001', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Admin settings iniciales
INSERT INTO public.admin_settings (key, value)
VALUES
  ('late_threshold_minutes', '5'::JSONB),
  ('max_no_shows_before_block', '3'::JSONB),
  ('raffle_prize_validity_days', '10'::JSONB),
  ('default_slot_interval_minutes', '30'::JSONB),
  ('whatsapp_notifications_enabled', 'true'::JSONB),
  ('email_notifications_enabled', 'true'::JSONB)
ON CONFLICT (key) DO NOTHING;
