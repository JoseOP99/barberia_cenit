import React from 'react';
import { Icon, Crest, Sunburst, Corners, romanDate, ROMAN, toRoman } from '../components/Shared';
import { CENIT_DATA, formatCOP } from '../data/cenitData';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const today = new Date(2026, 4, 20);
  const next = CENIT_DATA.appointments.find(a => a.status === 'pending') || CENIT_DATA.appointments[3];

  return (
    <div className="p-8 lg:p-12 fade-up min-h-full">
      {/* Header band */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="font-mono text-xs" style={{ color: '#8B6F3F' }}>{romanDate(today).toUpperCase()}</span>
            <span style={{ color: '#3A3340' }}>◆</span>
            <span className="font-mono text-xs" style={{ color: '#8B6F3F' }}>TUCHÍN · 32°C</span>
          </div>
          <h1 className="font-display text-5xl lg:text-7xl leading-[1.05]" style={{ color: '#F1ECDE', fontStyle: 'italic', fontWeight: 400 }}>
            Bienvenido al<br/>
            <span className="text-gold not-italic font-roman" style={{ fontSize: '0.65em', letterSpacing: '0.18em', fontWeight: 600 }}>CLUB CÉNITT</span>
          </h1>
          <p className="font-mono text-xs mt-4 max-w-md" style={{ color: '#948A78' }}>
            EST. MMXXIV · SECTOR SAN PEDRO · TUCHÍN · CÓRDOBA
          </p>
        </div>

        <Crest size={160} className="self-center lg:self-end"/>
      </div>

      <div className="diamond-divider mb-10"><span>◆</span></div>

      {/* Quick actions grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Big CTA card: Reservar */}
        <button onClick={() => navigate('/booking')}
          className="lg:col-span-7 corner-deco frame-double p-10 text-left group transition-all hover:bg-[#1A171C]"
          style={{ minHeight: 280 }}>
          <Corners/>
          <div className="flex items-start justify-between mb-6">
            <span className="font-roman text-[10px]" style={{ color: '#C9A86A', letterSpacing: '0.3em' }}>PRIMERA ACCIÓN</span>
            <span className="font-mono text-[10px]" style={{ color: '#5A5347' }}>{ROMAN[0]} · DE · {ROMAN[3]}</span>
          </div>
          <h2 className="font-display text-4xl lg:text-5xl leading-tight mb-4" style={{ color: '#F1ECDE', fontStyle: 'italic' }}>
            Reserva tu próximo<br/>
            <span className="text-gold">ritual de barbería.</span>
          </h2>
          <p className="text-sm max-w-md mt-6" style={{ color: '#948A78' }}>
            Cuatro pasos. Tu servicio, tu maestro, tu hora. Sin filas. Sin prisa. Solo tu cumbre.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <span className="btn-gold inline-flex items-center gap-2">
              <Icon name="Scissors" size={12}/> Reservar Cita
            </span>
            <span className="font-mono text-[10px]" style={{ color: '#5A5347' }}>← TAMBIÉN POR EL MENÚ LATERAL</span>
          </div>
        </button>

        {/* Today's appointment */}
        <div className="lg:col-span-5 space-y-6">
          <div className="ticket">
            <div className="flex items-center justify-between mb-4">
              <span className="font-roman text-[10px]" style={{ color: '#C9A86A', letterSpacing: '0.3em' }}>PRÓXIMO TURNO</span>
              <span className="pill pill-gold">EN ESPERA</span>
            </div>
            <div className="font-display text-5xl mb-1" style={{ color: '#F1ECDE' }}>{next.time}</div>
            <div className="font-mono text-xs mb-6" style={{ color: '#8B6F3F' }}>{romanDate(today).toUpperCase()}</div>
            <div className="diamond-divider mb-4 text-[10px]">◆</div>
            <div className="space-y-2 text-sm">
              <HomeRow label="Cliente"  value={next.client}/>
              <HomeRow label="Servicio" value={next.service}/>
              <HomeRow label="Barbero"  value={next.barber}/>
            </div>
            <button onClick={() => navigate('/booking')} className="mt-6 font-mono text-[11px] inline-flex items-center gap-2" style={{ color: '#E8C77E' }}>
              <Icon name="Calendar" size={12}/> AGENDAR NUEVA CITA
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => navigate('/shop')}
              className="corner-deco frame-thin p-5 text-left group transition-all hover:border-[#8B6F3F]">
              <Corners/>
              <Icon name="ShoppingBag" size={18} style={{ color: '#C9A86A' }} className="mb-3"/>
              <div className="font-roman text-[11px]" style={{ color: '#E8C77E', letterSpacing: '0.2em' }}>BOUTIQUE</div>
              <div className="text-xs mt-1" style={{ color: '#948A78' }}>Colección de gorras</div>
            </button>
            <button onClick={() => navigate('/admin')}
              className="corner-deco frame-thin p-5 text-left transition-all hover:border-[#8B6F3F]">
              <Corners/>
              <Icon name="User" size={18} style={{ color: '#C9A86A' }} className="mb-3"/>
              <div className="font-roman text-[11px]" style={{ color: '#E8C77E', letterSpacing: '0.2em' }}>MI CUENTA</div>
              <div className="text-xs mt-1" style={{ color: '#948A78' }}>Historial · Puntos</div>
            </button>
          </div>
        </div>

        {/* Servicios highlight */}
        <div className="lg:col-span-12 mt-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Sunburst size={28}/>
              <h3 className="font-roman text-sm" style={{ color: '#C9A86A', letterSpacing: '0.3em' }}>SERVICIOS DEL ESTABLECIMIENTO</h3>
            </div>
            <button onClick={() => navigate('/booking')} className="font-mono text-[11px] inline-flex items-center gap-2" style={{ color: '#948A78' }}>
              VER TODOS <Icon name="ArrowRight" size={12}/>
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {CENIT_DATA.services.slice(0, 6).map((s, i) => (
              <button key={s.id} onClick={() => navigate('/booking', { state: { preselectService: s.id } })}
                className="corner-deco frame-thin p-6 text-left hover:border-[#8B6F3F] transition-all group">
                <Corners/>
                <div className="flex items-baseline justify-between mb-3">
                  <span className="font-roman text-[10px]" style={{ color: '#8B6F3F', letterSpacing: '0.3em' }}>{ROMAN[i]}</span>
                  <span className="font-mono text-[10px]" style={{ color: '#5A5347' }}>{s.duration} MIN</span>
                </div>
                <h4 className="font-display text-2xl mb-1" style={{ color: '#F1ECDE', fontStyle: 'italic' }}>{s.name}</h4>
                <p className="text-xs mb-4" style={{ color: '#948A78' }}>{s.subtitle}</p>
                <div className="font-mono text-sm" style={{ color: '#E8C77E' }}>{formatCOP(s.price)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* House rules / about strip */}
        <div className="lg:col-span-12 mt-8 corner-deco frame-double p-8 lg:p-12 grid lg:grid-cols-3 gap-8">
          <Corners/>
          <Pillar n="I"   t="Reserva con tiempo"   d="Cada cita reserva su silla. No aceptamos walk-ins durante hora pico."/>
          <Pillar n="II"  t="Productos importados" d="Cremas, aceites y herramientas seleccionadas de Italia, Reino Unido y Japón."/>
          <Pillar n="III" t="Garantía Cénitt"      d="Si no estás satisfecho con el resultado, repetimos el servicio sin costo."/>
        </div>
      </div>
    </div>
  );
}

function HomeRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="font-roman text-[10px]" style={{ color: '#8B6F3F', letterSpacing: '0.2em' }}>{label.toUpperCase()}</span>
      <span className="text-sm text-right" style={{ color: '#F1ECDE' }}>{value}</span>
    </div>
  );
}

function Pillar({ n, t, d }) {
  return (
    <div>
      <div className="font-roman text-3xl text-gold mb-3" style={{ letterSpacing: '0.1em' }}>{n}</div>
      <h4 className="font-display text-xl mb-2" style={{ color: '#F1ECDE', fontStyle: 'italic' }}>{t}</h4>
      <p className="text-xs" style={{ color: '#948A78' }}>{d}</p>
    </div>
  );
}
