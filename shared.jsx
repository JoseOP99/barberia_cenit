/* global React, lucide */
const { useState, useEffect, useRef } = React;

// ============================================================
// Shared Icon helper (Lucide via global)
// ============================================================
const Icon = ({ name, size = 18, className = "", strokeWidth = 1.5, ...rest }) => {
  const LucideIcon = (window.lucide && window.lucide[name]) || null;
  if (!LucideIcon) return <span className={className} {...rest} />;
  return <LucideIcon size={size} strokeWidth={strokeWidth} className={className} {...rest} />;
};
window.Icon = Icon;

// ============================================================
// CenitMark — the brand emblem in SVG form (geometric crest)
// ============================================================
const CenitMark = ({ size = 56, className = "" }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true">
    <defs>
      <linearGradient id="gMark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F0D793" />
        <stop offset="55%" stopColor="#C9A86A" />
        <stop offset="100%" stopColor="#8B6F3F" />
      </linearGradient>
    </defs>
    {/* outer ring */}
    <circle cx="50" cy="50" r="46" fill="none" stroke="url(#gMark)" strokeWidth="1.2" />
    <circle cx="50" cy="50" r="42" fill="none" stroke="url(#gMark)" strokeWidth=".5" opacity=".5" />
    {/* small crown */}
    <path d="M38 16 L42 22 L46 14 L50 22 L54 14 L58 22 L62 16 L60 26 L40 26 Z"
          fill="url(#gMark)" />
    <circle cx="42" cy="14" r="1.2" fill="url(#gMark)" />
    <circle cx="50" cy="12" r="1.4" fill="url(#gMark)" />
    <circle cx="58" cy="14" r="1.2" fill="url(#gMark)" />
    {/* mountain */}
    <path d="M22 70 L42 38 L50 52 L62 32 L78 70 Z" fill="none" stroke="url(#gMark)" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M30 70 L42 50 L50 60 L62 44 L72 70" fill="none" stroke="url(#gMark)" strokeWidth=".7" opacity=".6" />
    {/* base */}
    <line x1="20" y1="74" x2="80" y2="74" stroke="url(#gMark)" strokeWidth=".7" />
    {/* C monogram below */}
    <text x="50" y="90" textAnchor="middle" fontFamily="Cormorant Garamond, serif"
          fontSize="11" fill="url(#gMark)" fontWeight="600" letterSpacing="2">CÉNIT</text>
  </svg>
);
window.CenitMark = CenitMark;

// ============================================================
// Logo lockup with text
// ============================================================
const Logo = ({ size = 36, showText = true, className = "" }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <CenitMark size={size} />
    {showText && (
      <div className="leading-none">
        <div className="font-display text-xl tracking-[0.18em]" style={{ color: '#E8C77E' }}>CÉNIT</div>
        <div className="text-[9px] tracking-[0.32em] mt-1" style={{ color: '#8A857A' }}>BARBERÍA · EST. MMXXIV</div>
      </div>
    )}
  </div>
);
window.Logo = Logo;

// ============================================================
// Eyebrow label (small Cénit-style flourish)
// ============================================================
const Eyebrow = ({ children, left = false }) => (
  <span className={`eyebrow ${left ? 'left' : ''}`}>{children}</span>
);
window.Eyebrow = Eyebrow;

// ============================================================
// Static data — services, barbers, products, appointments
// ============================================================
window.CENIT_DATA = {
  services: [
    { id: "s1", name: "Corte Cénit",   subtitle: "Corte de autor · 45 min", price: 80000, duration: 45,
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
    { id: "b1", name: "Mateo Alarcón",  role: "Master Barber",    years: 12, signature: "Cortes clásicos" },
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
    { id: "a1", time: "09:00", client: "Javier Montes",    service: "Corte Cénit",    barber: "Mateo A.",   status: "confirmed",  phone: "+57 300 444 8821" },
    { id: "a2", time: "09:45", client: "Andrés Castillo",  service: "Ritual Clásico", barber: "Iván R.",    status: "confirmed",  phone: "+57 311 220 4490" },
    { id: "a3", time: "10:30", client: "Sebastián López",  service: "Diseño Barba",   barber: "Daniel P.",  status: "in-chair",   phone: "+57 320 661 1188" },
    { id: "a4", time: "11:15", client: "Camilo Restrepo",  service: "Corte Cénit",    barber: "Tomás V.",   status: "confirmed",  phone: "+57 318 880 7702" },
    { id: "a5", time: "12:00", client: "Felipe Arias",     service: "Cumbre Pack",    barber: "Mateo A.",   status: "pending",    phone: "+57 312 119 5547" },
    { id: "a6", time: "13:30", client: "Nicolás Henao",    service: "Afeitado Real",  barber: "Iván R.",    status: "confirmed",  phone: "+57 313 880 0014" },
    { id: "a7", time: "14:15", client: "Daniel Quintero",  service: "Ritual Clásico", barber: "Daniel P.",  status: "confirmed",  phone: "+57 300 220 9912" },
    { id: "a8", time: "15:00", client: "Esteban Rojas",    service: "Color Discreto", barber: "Mateo A.",   status: "pending",    phone: "+57 315 561 7330" }
  ]
};

// ============================================================
// Format currency (Colombian peso)
// ============================================================
window.formatCOP = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
