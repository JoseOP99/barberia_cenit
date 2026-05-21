import React, { useState, useEffect } from 'react';
import { Icon, Crest, Sunburst, Corners } from '../components/Shared';
import { CENIT_DATA, formatCOP, romanDate, ROMAN } from '../data/cenitData';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

export default function Home() {
  const navigate = useNavigate();
  const today = new Date();
  const [services, setServices] = useState(CENIT_DATA.services);

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from('services').select('*').eq('available', true).order('display_order');
        if (!error && data?.length) {
          setServices(data.map(s => ({
            id: s.id, name: s.name, subtitle: s.subtitle || '',
            desc: s.description, price: s.price, duration: s.duration_minutes
          })));
        }
      } catch { /* keep static */ }
    }
    load();
  }, []);

  return (
    <div className="p-8 lg:p-12 fade-up min-h-full">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="font-mono text-xs" style={{ color: '#8B6F3F' }}>{romanDate(today).toUpperCase()}</span>
            <span style={{ color: '#3A3340' }}>&#9670;</span>
            <span className="font-mono text-xs" style={{ color: '#8B6F3F' }}>TUCHIN</span>
          </div>
          <h1 className="font-display text-5xl lg:text-7xl leading-[1.05]" style={{ color: '#F1ECDE', fontStyle: 'italic', fontWeight: 400 }}>
            Bienvenido al<br/>
            <span className="text-gold not-italic font-roman" style={{ fontSize: '0.65em', letterSpacing: '0.18em', fontWeight: 600 }}>CLUB CENITT</span>
          </h1>
          <p className="font-mono text-xs mt-4 max-w-md" style={{ color: '#948A78' }}>
            EST. MMXXIV &middot; SECTOR SAN PEDRO &middot; TUCHIN &middot; CORDOBA
          </p>
        </div>
        <Crest size={160} className="self-center lg:self-end"/>
      </div>

      <div className="diamond-divider mb-10"><span>&#9670;</span></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <button onClick={() => navigate('/booking')}
          className="lg:col-span-7 corner-deco frame-double p-10 text-left group transition-all hover:bg-[#1A171C]"
          style={{ minHeight: 280 }}>
          <Corners/>
          <div className="flex items-start justify-between mb-6">
            <span className="font-roman text-[10px]" style={{ color: '#C9A86A', letterSpacing: '0.3em' }}>PRIMERA ACCION</span>
            <span className="font-mono text-[10px]" style={{ color: '#5A5347' }}>{ROMAN[0]} &middot; DE &middot; {ROMAN[3]}</span>
          </div>
          <h2 className="font-display text-4xl lg:text-5xl leading-tight mb-4" style={{ color: '#F1ECDE', fontStyle: 'italic' }}>
            Reserva tu proximo<br/>
            <span className="text-gold">ritual de barberia.</span>
          </h2>
          <p className="text-sm max-w-md mt-6" style={{ color: '#948A78' }}>
            Cuatro pasos. Tu servicio, tu maestro, tu hora. Sin filas. Sin prisa. Solo tu cumbre.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <span className="btn-gold inline-flex items-center gap-2">
              <Icon name="Scissors" size={12}/> Reservar Cita
            </span>
          </div>
        </button>

        <div className="lg:col-span-5 space-y-6">
          <div className="ticket">
            <div className="flex items-center justify-between mb-4">
              <span className="font-roman text-[10px]" style={{ color: '#C9A86A', letterSpacing: '0.3em' }}>NUESTRO HORARIO</span>
              <span className="pill pill-gold">ABIERTO</span>
            </div>
            <div className="font-display text-4xl mb-1" style={{ color: '#F1ECDE' }}>09:00 — 18:00</div>
            <div className="font-mono text-xs mb-6" style={{ color: '#8B6F3F' }}>LUNES A SABADO &middot; DOMINGOS CERRADO</div>
            <div className="diamond-divider mb-4 text-[10px]">&#9670;</div>
            <div className="space-y-2 text-sm">
              <HomeRow label="Ubicacion" value="Sector San Pedro, Tuchin"/>
              <HomeRow label="Viernes" value="Horario extendido hasta 20:00"/>
              <HomeRow label="Contacto" value="+57 300 XXX XXXX"/>
            </div>
            <button onClick={() => navigate('/booking')} className="mt-6 font-mono text-[11px] inline-flex items-center gap-2" style={{ color: '#E8C77E' }}>
              <Icon name="Calendar" size={12}/> AGENDAR CITA
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => navigate('/shop')}
              className="corner-deco frame-thin p-5 text-left group transition-all hover:border-[#8B6F3F]">
              <Corners/>
              <Icon name="ShoppingBag" size={18} style={{ color: '#C9A86A' }} className="mb-3"/>
              <div className="font-roman text-[11px]" style={{ color: '#E8C77E', letterSpacing: '0.2em' }}>BOUTIQUE</div>
              <div className="text-xs mt-1" style={{ color: '#948A78' }}>Coleccion de gorras</div>
            </button>
            <button onClick={() => navigate('/booking')}
              className="corner-deco frame-thin p-5 text-left transition-all hover:border-[#8B6F3F]">
              <Corners/>
              <Icon name="Clock" size={18} style={{ color: '#C9A86A' }} className="mb-3"/>
              <div className="font-roman text-[11px]" style={{ color: '#E8C77E', letterSpacing: '0.2em' }}>RESERVAR</div>
              <div className="text-xs mt-1" style={{ color: '#948A78' }}>Agenda tu cita</div>
            </button>
          </div>
        </div>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.slice(0, 6).map((s, i) => (
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

        <div className="lg:col-span-12 mt-8 corner-deco frame-double p-8 lg:p-12 grid lg:grid-cols-3 gap-8">
          <Corners/>
          <Pillar n="I"   t="Reserva con tiempo"   d="Cada cita reserva su silla. No aceptamos walk-ins durante hora pico."/>
          <Pillar n="II"  t="Productos importados"  d="Cremas, aceites y herramientas seleccionadas de Italia, Reino Unido y Japon."/>
          <Pillar n="III" t="Garantia Cenitt"       d="Si no estas satisfecho con el resultado, repetimos el servicio sin costo."/>
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
