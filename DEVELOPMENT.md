# Guía de Desarrollo - CÉNITT BARBERÍA

## Cómo Usar los Servicios y Hooks

### 1. Autenticación

#### Obtener usuario actual
```javascript
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, profile, isAdmin, loading } = useAuth();
  
  return (
    <div>
      {loading ? 'Cargando...' : (
        <>
          <p>Usuario: {user?.email}</p>
          <p>Es admin: {isAdmin}</p>
        </>
      )}
    </div>
  );
}
```

#### Login / Logout
```javascript
import { useAuth } from './contexts/AuthContext';

function LoginForm() {
  const { signIn, signOut, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await signIn(email, password);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
      />
      <button type="submit">Ingresar</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
```

### 2. Gestión de Citas

#### Crear una cita
```javascript
import { useAppointments } from './hooks/useAppointments';

function BookingForm() {
  const { createAppointment, loading, error } = useAppointments();

  const handleBooking = async () => {
    try {
      const newAppointment = await createAppointment({
        client_name: 'Juan Pérez',
        client_phone: '+573001234567',
        client_email: 'juan@example.com',
        barber_id: 'barberId-uuid',
        service_id: 'serviceId-uuid',
        appointment_date: '2026-05-25',
        appointment_time: '10:30'
      });
      console.log('Cita creada:', newAppointment);
    } catch (err) {
      console.error('Error:', error);
    }
  };

  return (
    <button onClick={handleBooking} disabled={loading}>
      {loading ? 'Creando...' : 'Reservar Cita'}
    </button>
  );
}
```

#### Obtener disponibilidad
```javascript
import appointmentsService from './services/appointmentsService';

async function getSlots(date, barberId) {
  try {
    const availability = await appointmentsService.getAvailableSlots(date, barberId);
    console.log('Horarios disponibles:', availability);
  } catch (err) {
    console.error('Error:', err);
  }
}
```

#### Listar citas del usuario
```javascript
import { useAppointments } from './hooks/useAppointments';
import { useAuth } from './contexts/AuthContext';

function MyAppointments() {
  const { user } = useAuth();
  const { appointments, loading } = useAppointments(user?.id);

  return (
    <div>
      {loading ? 'Cargando...' : (
        <ul>
          {appointments.map(apt => (
            <li key={apt.id}>
              {apt.appointment_date} - {apt.appointment_time}
              <span>({apt.status})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 3. Productos y Tienda

#### Obtener productos
```javascript
import { useProducts } from './hooks/useProducts';

function ShopCatalog() {
  const { products, loading, getProductAvailability } = useProducts();

  const checkAvailability = async (productId) => {
    const availability = await getProductAvailability(productId);
    console.log(`Disponibles: ${availability.available} de ${availability.total}`);
  };

  return (
    <div>
      {loading ? 'Cargando...' : (
        <div>
          {products.map(product => (
            <div key={product.id}>
              <h3>{product.name}</h3>
              <p>Precio: ${product.price}</p>
              <p>Stock: {product.stock}</p>
              <button onClick={() => checkAvailability(product.id)}>
                Ver disponibilidad
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

#### Crear/Actualizar producto (Admin)
```javascript
import { useProducts } from './hooks/useProducts';

function AdminProduct() {
  const { createProduct, updateProduct, deleteProduct } = useProducts({ 
    adminMode: true 
  });

  const handleCreateProduct = async () => {
    try {
      const product = await createProduct({
        name: 'Cap New Collection',
        price: 125000,
        stock: 15,
        collection: 'New Line',
        color_hex: '#2C2420',
        color_name: 'Chocolate'
      });
      console.log('Producto creado:', product);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return <button onClick={handleCreateProduct}>Crear Producto</button>;
}
```

### 4. Apartados (Reservas)

#### Apartar gorra
```javascript
import { useReservations } from './hooks/useReservations';
import { useAuth } from './contexts/AuthContext';

function ReservationForm() {
  const { user } = useAuth();
  const { createReservation, loading, error } = useReservations();

  const handleReserve = async (productId) => {
    try {
      const reservation = await createReservation(
        productId,
        {
          user_id: user?.id,
          client_name: 'Carlos López',
          client_email: 'carlos@example.com',
          client_phone: '+573001234567',
          quantity: 2
        },
        6 // Horas de expiración
      );
      console.log('Apartado creado:', reservation);
    } catch (err) {
      console.error('Error:', error);
    }
  };

  return <button onClick={() => handleReserve('productId')}>Apartar</button>;
}
```

#### Completar o cancelar apartado (Admin)
```javascript
import { useReservations } from './hooks/useReservations';

function AdminReservations() {
  const { 
    completeReservation, 
    cancelReservation, 
    reservations 
  } = useReservations(null, { adminMode: true });

  return (
    <div>
      {reservations.map(res => (
        <div key={res.id}>
          <p>{res.client_name} - {res.products.name}</p>
          <p>Estado: {res.status}</p>
          <button onClick={() => completeReservation(res.id)}>Completar</button>
          <button onClick={() => cancelReservation(res.id)}>Cancelar</button>
        </div>
      ))}
    </div>
  );
}
```

#### Limpiar apartados expirados
```javascript
import { useReservations } from './hooks/useReservations';

function AdminTools() {
  const { cleanExpired } = useReservations();

  const handleCleanup = async () => {
    try {
      const cleaned = await cleanExpired();
      console.log(`${cleaned.length} apartados expirados limpiados`);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return <button onClick={handleCleanup}>Limpiar Expirados</button>;
}
```

### 5. Barberos y Servicios

#### Obtener barberos
```javascript
import barbersService from './services/barbersService';

async function getBarbers() {
  try {
    const barbers = await barbersService.getAllBarbers();
    console.log('Barberos:', barbers);
  } catch (err) {
    console.error('Error:', err);
  }
}
```

#### Obtener servicios
```javascript
import servicesService from './services/servicesService';

async function getServices() {
  try {
    const services = await servicesService.getAllServices();
    console.log('Servicios:', services);
  } catch (err) {
    console.error('Error:', err);
  }
}
```

## Errores y Manejo

Todos los servicios lanzan errores detallados. Usar try-catch:

```javascript
try {
  const data = await appointmentsService.createAppointment(appointmentData);
} catch (err) {
  // err.message tiene detalles del error
  console.error('Error:', err.message);
}
```

Los hooks también manejan errores en el estado `error`:

```javascript
const { error, clearError } = useAppointments();

useEffect(() => {
  if (error) {
    // Mostrar error al usuario
    console.error('Error:', error);
    // Limpiar después de mostrar
    setTimeout(clearError, 5000);
  }
}, [error]);
```

## Convenciones

- **Servicios:** Manejan lógica de negocio y API calls
- **Hooks:** Manejan estado React y ciclo de vida
- **Contextos:** Compartir estado global (Auth)
- **Componentes:** UI y eventos de usuario

## RLS (Row Level Security)

Las políticas están implementadas en Supabase. El usuario verá solo lo permitido según su rol:

- `customer`: Ve solo sus datos
- `admin`: Acceso completo
- Público: Puede ver productos, servicios, barberos activos

## Variables de Entorno

```
VITE_SUPABASE_URL=https://oferbwqvmloyzcqsmprs.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

No incluir en commits. Usar `.env.local` para desarrollo.

## Testing de Servicios

Para probar servicios directamente en consola:

```javascript
// En el navegador, con servicio importado
import appointmentsService from './services/appointmentsService';

// Obtener todas las citas (requiere ser admin)
const citas = await appointmentsService.getAllAppointments();
console.log(citas);

// Obtener slots disponibles
const slots = await appointmentsService.getAvailableSlots('2026-05-25', 'barber-id');
console.log(slots);
```

## Tips y Mejores Prácticas

1. **Siempre usar el hook, no el servicio directo** en componentes
2. **Validar datos antes de enviar** al servicio
3. **Mostrar loading y error al usuario**
4. **Limpiar errores** después de mostrarlos
5. **Usar AuthProvider** en raíz de la app
6. **Proteger rutas admin** con isAdmin

---

**Última actualización:** Mayo 21, 2026
