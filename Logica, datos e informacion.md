# Prompt de Arquitectura Técnica Barbería Cénitt

Actúa como un Arquitecto de Software experto en el ecosistema Supabase + React (Next.jsVite). Necesito definir la lógica de negocio y la estructura de datos para una plataforma de gestión de barbería. 

## Contexto del Proyecto
 Nombre de la Barbería Barbería Cénitt (significa estar en lo más alto).
 DueñoBarbero Principal Fernando Mendoza.
 Ubicación Tuchín, Córdoba, Sector San Pedro.
 Objetivo Crear una base sólida para gestionar citas y la venta de gorras de forma profesional y autónoma.

## 1. Alcance Funcional
 Gestión de Citas Registro de cliente (Nombre, Teléfono, Correo), visualización de disponibilidad, selección de horario y confirmación.
 Tienda (Módulo de Gorras) Visualización de productos. Debe ser una sección o módulo independiente accesible desde el menú.
 Lógica de Apartado (Productos) Sistema de reserva para gorras. No es una pasarela de pago, es un Apartar producto.
   El producto queda reservado por un límite de tiempo configurable (default 6 horas).
   Incluir una columna `expires_at` en la tabla de apartados para gestionar la liberación automática del stock si no se concreta la venta.
 Gestión Administrativa CRUD para productos, categorías, trabajadores (incluyendo a Fernando) y configuración de horarios de atención (rangos de disponibilidad y días libres).
 Restricción Estricta No incluir código para librerías de gráficos, ni componentes de Dashboards analíticos. La interfaz administrativa debe basarse exclusivamente en tablas de datos CRUD y formularios de configuración.

## 2. Requerimientos de Base de Datos (Supabase  PostgreSQL)
Genera el esquema SQL para Supabase que incluya
 `profiles` (Relación con `auth.users`).
 `products` Con campos de stock, categoría y estado.
 `appointments` Con campos de cliente, barbero, fecha, hora y estado.
 `reservations` (Para las gorras). Debe incluir `product_id`, `user_id`, `status` ('pending', 'completed', 'cancelled') y `expires_at` (timestamp con el límite de horas).
 Rutas de acceso Define las políticas RLS (Row Level Security) necesarias para que los clientes solo vean su información y los administradores (Fernando) gestionen todo.

## 3. Lógica de Negocio y Backend
 Automatización de Correos Explica cómo disparar correos automáticos al agendar una cita utilizando un trigger de base de datos o Edge Functions.
 Lógica de 'Apartado' Explica cómo implementar la lógica de expiración de las 6 horas (sugiere cómo manejar la consulta de disponibilidad validando el `expires_at` o mediante un cron job).
 React Implementation Estructura recomendada para el proyecto.
   Organización de carpetas `components`, `hooks`, `libsupabaseClient.js`, `services`.
   Sugiere qué librerías usar para el manejo de estados y formularios.

## 4. Entregables
1. Código SQL completo para las tablas y relaciones.
2. Scripts SQL para insertar datos semilla (seed data) básicos, como la configuración inicial para Fernando Mendoza.
3. Definición de las políticas RLS básicas.
4. Propuesta de arquitectura para la lógica de apartado con expiración.
5. Pseudocódigo para la función de reserva que verifique si el tiempo ha expirado antes de mostrar un producto como disponible.
6. Guía rápida de cómo estructurar los servicios en React para conectar con Supabase.

El objetivo es tener una base técnica robusta, limpia y escalable. Céntrate exclusivamente en el backend, la lógica y la estructura; del diseño UI me encargo yo.