export const CENIT_DATA = {
  services: [
    {
      id: 's1',
      name: 'Corte',
      price: 10000,
      duration: '40–60',
      desc: 'Corte personalizado con dedicación y atención al detalle.',
    },
  ],
  barbers: [
    { id: 'b1', name: 'Fernando Mendoza', role: 'Barbero' },
  ],
  appointments: [
    { id: 'a1', time: '09:00', client: 'Javier Montes', status: 'confirmed', phone: '+57 300 444 8821' },
    { id: 'a2', time: '10:00', client: 'Andrés Castillo', status: 'confirmed', phone: '+57 311 220 4490' },
    { id: 'a3', time: '11:00', client: 'Sebastián López', status: 'in-chair', phone: '+57 320 661 1188' },
    { id: 'a4', time: '12:00', client: 'Camilo Restrepo', status: 'confirmed', phone: '+57 318 880 7702' },
    { id: 'a5', time: '14:00', client: 'Felipe Arias', status: 'pending', phone: '+57 312 119 5547' },
  ],
};

export const OPERATING_HOURS = {
  monday: null,
  tuesday: { open: '08:30', close: '18:00' },
  wednesday: { open: '08:30', close: '18:00' },
  thursday: { open: '08:30', close: '18:00' },
  friday: { open: '08:30', close: '18:00' },
  saturday: { open: '08:30', close: '18:00' },
  sunday: { open: '08:30', close: '15:00' },
};

export const CONTACT_INFO = {
  name: 'Barbería Cénit',
  barber: 'Fernando Mendoza',
  location: 'Tuchín, Córdoba · Sector San Pedro',
  phone: '+57 304 2740607',
  whatsapp: 'https://wa.link/s2od2z',
  mapUrl: 'https://maps.app.goo.gl/bzBvSZ8ZaXBfxqGh8?g_st=aw',
};

export const formatCOP = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
