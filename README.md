# CÉNITT BARBERÍA - Plataforma de Gestión

Una plataforma profesional para gestionar citas y ventas de productos en **Barbería Cénitt**, ubicada en Tuchín, Córdoba.

**Desarrollador:** Fernando Mendoza  
**Objetivo:** Crear una base sólida para gestionar citas y la venta de gorras de forma profesional y autónoma.

## 🏗️ Stack Tecnológico

- **Frontend:** React 19.2.6 + Vite 8.0
- **Backend:** Supabase (PostgreSQL + Auth + Real-time)
- **UI Framework:** Tailwind CSS 4.3
- **Router:** React Router 7.15
- **Icons:** Lucide React 1.16
- **SDK:** @supabase/supabase-js 2.106

## 📋 Características Principales

### 1. **Gestión de Citas**
- Registro de clientes (Nombre, Teléfono, Correo)
- Visualización de disponibilidad por barbero
- Selección de horario flexible
- Estados: pending, confirmed, in-chair, completed, cancelled
- Confirmación automática y notificaciones

### 2. **Tienda (Módulo de Gorras)**
- Catálogo de productos con colecciones
- Visualización de stock en tiempo real
- Filtrado por colección y categoría
- Sistema de imágenes y colores

### 3. **Sistema de Apartados (Reservas)**
- Reserva de gorras por 6 horas (configurable)
- Gestión automática de expiración
- Notificaciones de vencimiento
- Historial de apartados

### 4. **Panel Administrativo**
- Dashboard con KPIs principales
- Gestión CRUD de:
  - Citas (vista calendario y tabla)
  - Productos e inventario
  - Equipo de barberos
  - Configuración de servicios
- Row Level Security (RLS) implementado
- Acceso restringido solo para admins

## 🚀 Inicio Rápido

### Requisitos Previos
```bash
Node.js >= 16
npm o pnpm
```

### Instalación
```bash
# Clonar repositorio
git clone <repo-url>
cd cenit

# Instalar dependencias
npm install

# Configurar variables de entorno
# Ver archivo .env existente
```

### Ejecutar en Desarrollo
```bash
npm run dev
```

Acceder en: `http://localhost:5173`

### Build para Producción
```bash
npm run build
npm run preview
```

## 📂 Estructura del Proyecto

```
cenit/
├── src/
│   ├── components/       # Componentes reutilizables
│   ├── contexts/         # Contextos (Auth, etc)
│   ├── data/             # Datos estáticos y configuración
│   ├── hooks/            # Custom hooks
│   │   ├── useAppointments.js
│   │   ├── useReservations.js
│   │   ├── useProducts.js
│   │   └── useUser.js
│   ├── lib/              # Configuración y utilidades
│   ├── pages/            # Páginas (Home, Shop, Booking, Admin)
│   ├── services/         # Servicios de API
│   │   ├── appointmentsService.js
│   │   ├── authService.js
│   │   ├── barbersService.js
│   │   ├── productsService.js
│   │   ├── reservationsService.js
│   │   ├── servicesService.js
│   │   └── supabaseClient.js
│   ├── App.jsx
│   └── main.jsx
├── supabase/
│   ├── migrations/       # Migraciones de base de datos
│   └── schema.sql        # Schema completo
├── public/               # Archivos estáticos
├── .env                  # Variables de entorno (credenciales)
├── package.json
└── vite.config.js
```

## 🗄️ Base de Datos (Supabase)

### Tablas Principales
- `profiles` - Perfiles de usuarios
- `barbers` - Equipo de barberos
- `services` - Servicios disponibles
- `products` - Catálogo de gorras
- `appointments` - Gestión de citas
- `reservations` - Apartados de productos

### Row Level Security (RLS)
- ✅ Clientes ven solo sus datos
- ✅ Administradores (Fernando) acceso completo
- ✅ Productos y servicios visibles para todos
- ✅ Políticas automáticas por rol

## 🔐 Autenticación

**Sistema:** Supabase Auth (JWT)

```javascript
import { useAuth } from './contexts/AuthContext';

const { user, isAdmin, signIn, signOut } = useAuth();
```

## 📱 Características por Rol

### Cliente
- Ver catálogo de productos
- Reservar cita
- Apartar gorra
- Historial de sus transacciones

### Administrador (Fernando)
- Dashboard con estadísticas
- Gestión completa de citas
- Control de inventario
- Gestión de barberos
- Configuración de servicios

## 🎨 Paleta de Colores

```
Oro principal:     #C9A86A
Oro claro:         #E8C77E
Fondo oscuro:      #0A0A0A
Gris oscuro:       #1A1816
Texto principal:   #F5F1E8
Texto secundario:  #9A9489
Bordes:            #2A2724
Verde éxito:       #7FA86A
Rojo alerta:       #C56B5A
```

## ⚡ Performance & Optimizaciones

- Lazy loading de rutas
- Caching de datos con Supabase
- Índices en base de datos
- Real-time subscriptions
- Compresión de imágenes

## 📝 Notas de Desarrollo

### Actualización de Variables de Entorno
Las credenciales de Supabase están en `.env`. Mantener seguro en producción.

### Próximas Tareas
- [ ] Implementar Email automático (Supabase Edge Functions)
- [ ] Notificaciones en tiempo real (WebSockets)
- [ ] Tests unitarios
- [ ] Documentación API Swagger
- [ ] Sistema de comentarios admin
- [ ] Reportes y exportación CSV

## 🤝 Contribución

Este proyecto es propiedad de Barbería Cénitt. Para cambios, contactar a Fernando Mendoza.

---

**Última actualización:** Mayo 21, 2026  
**Versión:** 1.0.0  
**Estado:** En producción
