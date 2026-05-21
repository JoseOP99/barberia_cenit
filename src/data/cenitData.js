// Colores Cénitt
export const CENIT_COLORS = {
  gold: '#E8C77E',
  darkGold: '#C9A86A',
  lightGold: '#F0D793',
  bronze: '#8B6F3F',
  darkBrown: '#0A0A0A',
  lightBrown: '#F5F1E8',
  mediumBrown: '#1A1816',
  textMuted: '#9A9489',
  textLight: '#6A655C'
};

export const CENIT_DATA = {
  services: [
    { id: "s1", name: "Corte Cénitt",   subtitle: "Corte de autor · 45 min", price: 80000, duration: 45,
      desc: "Diseño personalizado basado en tu estructura ósea y estilo personal." },
    { id: "s2", name: "Ritual Clásico", subtitle: "Corte + afeitado · 75 min", price: 130000, duration: 75,
      desc: "Corte sastrería, toalla caliente, espuma artesanal y afeitado de navaja." },
    { id: "s3", name: "Afeitado Real",  subtitle: "Navaja tradicional · 45 min", price: 70000, duration: 45,
      desc: "Ritual de 7 pasos con aceites cálidos y crema importada." },
    { id: "s4", name: "Diseño de Barba", subtitle: "Perfilado · 30 min", price: 50000, duration: 30,
      desc: "Línea precisa con tijera y trazo a navaja libre." },
    { id: "s5", name: "Color Discreto",  subtitle: "Tonificación · 60 min", price: 110000, duration: 60,
      desc: "Cobertura natural de canas conservando carácter." },
    { id: "s6", name: "Cumbre Pack",     subtitle: "Experiencia completa · 120 min", price: 220000, duration: 120,
      desc: "Corte + afeitado + facial + masaje capilar. La cima del ritual." }
  ],
  barbers: [
    { id: "b1", name: "Fernando Mendoza",  role: "Dueño / Master Barber",    years: 15, signature: "Especialista Integral" },
    { id: "b2", name: "Daniel Pérez",   role: "Senior Stylist",   years: 8,  signature: "Fades & texturizado" },
    { id: "b3", name: "Iván Restrepo",  role: "Shave Specialist", years: 10, signature: "Navaja tradicional" },
    { id: "b4", name: "Tomás Vélez",    role: "Junior Barber",    years: 4,  signature: "Diseño moderno" }
  ],
  products: [
    { id: "p1", name: "Snapback Noir Gold",   collection: "Crown Series",   price: 165000, stock: 24, color: "#0A0A0A",  accent: "#C9A86A", tag: "BESTSELLER" },
    { id: "p2", name: "Six-Panel Cumbre",     collection: "Summit Edition", price: 145000, stock: 18, color: "#1A1816",  accent: "#E8C77E", tag: null },
    { id: "p3", name: "Dad Cap Vintage Tan",  collection: "Heritage",       price: 125000, stock: 6,  color: "#8B7355",  accent: "#F0D793", tag: "ÚLTIMAS" },
    { id: "p4", name: "Trucker Mesh Onyx",    collection: "Workshop",       price: 135000, stock: 0,  color: "#222020",  accent: "#9A9489", tag: "AGOTADO" },
    { id: "p5", name: "Fitted Mountain",      collection: "Summit Edition", price: 175000, stock: 12, color: "#0F0E0D",  accent: "#C9A86A", tag: null },
    { id: "p6", name: "Cap Bordada Crown",    collection: "Crown Series",   price: 185000, stock: 9,  color: "#2A1A0F",  accent: "#E8C77E", tag: "NUEVO" },
    { id: "p7", name: "Five-Panel Camel",     collection: "Heritage",       price: 130000, stock: 15, color: "#7A5A3A",  accent: "#1A1408", tag: null },
    { id: "p8", name: "Strapback Estate",     collection: "Workshop",       price: 140000, stock: 21, color: "#1F1B16",  accent: "#C9A86A", tag: null }
  ],
  appointments: [
    { id: "a1", time: "09:00", client: "Javier Montes",    service: "Corte Cénitt",    barber: "Fernando M.",   status: "confirmed",  phone: "+57 300 444 8821" },
    { id: "a2", time: "09:45", client: "Andrés Castillo",  service: "Ritual Clásico", barber: "Iván R.",    status: "confirmed",  phone: "+57 311 220 4490" },
    { id: "a3", time: "10:30", client: "Sebastián López",  service: "Diseño Barba",   barber: "Daniel P.",  status: "in-chair",   phone: "+57 320 661 1188" },
    { id: "a4", time: "11:15", client: "Camilo Restrepo",  service: "Corte Cénitt",    barber: "Tomás V.",   status: "confirmed",  phone: "+57 318 880 7702" },
    { id: "a5", time: "12:00", client: "Felipe Arias",     service: "Cumbre Pack",    barber: "Fernando M.",   status: "pending",    phone: "+57 312 119 5547" },
    { id: "a6", time: "13:30", client: "Nicolás Henao",    service: "Afeitado Real",  barber: "Iván R.",    status: "confirmed",  phone: "+57 313 880 0014" },
    { id: "a7", time: "14:15", client: "Daniel Quintero",  service: "Ritual Clásico", barber: "Daniel P.",  status: "confirmed",  phone: "+57 300 220 9912" },
    { id: "a8", time: "15:00", client: "Esteban Rojas",    service: "Color Discreto", barber: "Fernando M.",   status: "pending",    phone: "+57 315 561 7330" }
  ]
};

export const OPERATING_HOURS = {
  monday: { open: "09:00", close: "18:00" },
  tuesday: { open: "09:00", close: "18:00" },
  wednesday: { open: "09:00", close: "18:00" },
  thursday: { open: "09:00", close: "18:00" },
  friday: { open: "09:00", close: "20:00" },
  saturday: { open: "09:00", close: "18:00" },
  sunday: { open: "closed", close: "closed" }
};

export const CONTACT_INFO = {
  name: "BARBERÍA CÉNITT",
  location: "Tuchín, Córdoba - Sector San Pedro",
  phone: "+57 300 XXX XXXX",
  email: "fernando@cenitbarberia.co"
};

export const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export const toRoman = (num) => {
  const romanMatrix = [
    { value: 1000, numeral: "M" },
    { value: 900, numeral: "CM" },
    { value: 500, numeral: "D" },
    { value: 400, numeral: "CD" },
    { value: 100, numeral: "C" },
    { value: 90, numeral: "XC" },
    { value: 50, numeral: "L" },
    { value: 40, numeral: "XL" },
    { value: 10, numeral: "X" },
    { value: 9, numeral: "IX" },
    { value: 5, numeral: "V" },
    { value: 4, numeral: "IV" },
    { value: 1, numeral: "I" }
  ];
  let roman = '';
  for (let i = 0; i < romanMatrix.length; i++) {
    while (num >= romanMatrix[i].value) {
      roman += romanMatrix[i].numeral;
      num -= romanMatrix[i].value;
    }
  }
  return roman;
};

export const romanDate = (date) => {
  const day = toRoman(date.getDate());
  const months = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
                  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
  const month = months[date.getMonth()];
  const year = toRoman(date.getFullYear());
  return `${day} DE ${month} ANNO ${year}`;
};

export const formatCOP = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
