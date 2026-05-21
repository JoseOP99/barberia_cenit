-- ============================================================
-- Barbería Cénit — Actualización de Sorteos (Raffles)
-- Migración: 003_raffle_updates.sql
-- ============================================================

-- 1. Añadir configuración de cifras de tickets (por defecto 6 para compatibilidad)
ALTER TABLE public.raffles 
ADD COLUMN IF NOT EXISTS ticket_digits INTEGER DEFAULT 6;

-- 2. Asegurar la relación de clave foránea en winner_user_id (opcional pero recomendado)
-- Solo se aplica si aún no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'raffles_winner_user_id_fkey'
    ) THEN
        ALTER TABLE public.raffles
        ADD CONSTRAINT raffles_winner_user_id_fkey
        FOREIGN KEY (winner_user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
END $$;
