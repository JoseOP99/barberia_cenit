-- Añadir columna max_capacity a la tabla services con un valor por defecto de 1
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS max_capacity INTEGER NOT NULL DEFAULT 1;

-- Opcional: Actualizar los servicios existentes a capacidad 1
UPDATE public.services SET max_capacity = 1 WHERE max_capacity IS NULL;
