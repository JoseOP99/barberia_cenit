/* global React, Icon, Eyebrow, CenitMark, Logo */
const { useState: useStateHero, useEffect: useEffectHero } = React;

// ============================================================
// HERO — Inicio. Cinematic with vignette grain and crest layers.
// ============================================================
function Hero({ onBook, onShop }) {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden grain vignette"
      style={{
        background: "radial-gradient(ellipse at 20% 10%, rgba(201,168,106,.08), transparent 60%), radial-gradient(ellipse at 80% 90%, rgba(139,111,63,.08), transparent 55%), #0A0A0A"
      }}>

      {/* Decorative grid */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(#C9A86A 1px, transparent 1px), linear-gradient(90deg, #C9A86A 1px, transparent 1px)", backgroundSize: "80px 80px" }} />

      {/* Faux skyline / mountain silhouettes */}
      <svg viewBox="0 0 1600 400" className="absolute bottom-0 left-0 right-0 w-full opacity-25 pointer-events-none"
        preserveAspectRatio="none" style={{ zIndex: 1 }}>
        <path d="M0,400 L0,260 L120,180 L260,250 L380,140 L520,230 L660,90 L820,210 L960,130 L1120,240 L1280,150 L1440,220 L1600,170 L1600,400 Z"
              fill="url(#mtGrad)" opacity=".6"/>
        <defs>
          <linearGradient id="mtGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3A3530" />
            <stop offset="100%" stopColor="#0A0A0A" />
          </linearGradient>
        </defs>
      </svg>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-32 w-full" style={{ zIndex: 2 }}>
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left: Type lockup */}
          <div className="lg:col-span-7 fade-up">
            <Eyebrow left>Barbería de Autor · Bogotá</Eyebrow>

            <h1 className="font-display mt-8 leading-[0.95] text-[clamp(48px,9vw,128px)] font-light"
                style={{ color: '#F5F1E8' }}>
              Eleva tu estilo<br/>
              a <span className="italic text-gold-gradient" style={{ fontWeight: 500 }}>lo más alto</span>.
            </h1>

            <p className="mt-10 text-base md:text-lg max-w-xl leading-relaxed"
               style={{ color: '#9A9489' }}>
              Una barbería pensada como un rito. Cortes esculpidos, afeitados clásicos y
              experiencias diseñadas para el caballero que entiende que el detalle es el cumbre del estilo.
            </p>

            <div className="mt-12 flex flex-wrap gap-4 items-center">
              <button className="btn-gold inline-flex items-center gap-3" onClick={onBook}>
                <Icon name="Scissors" size={14} strokeWidth={1.8}/>
                Reservar Cita
              </button>
              <button className="btn-ghost inline-flex items-center gap-3" onClick={onShop}>
                Ver Colección
                <Icon name="ArrowUpRight" size={14}/>
              </button>
            </div>

            {/* Stats strip */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg">
              {[
                { n: "08", l: "Años de oficio" },
                { n: "12k", l: "Cortes esculpidos" },
                { n: "4.9", l: "Valoración Google" }
              ].map((s, i) => (
                <div key={i} className="border-l hairline pl-4" style={{ borderColor: '#2A2724' }}>
                  <div className="font-display text-3xl" style={{ color: '#E8C77E' }}>{s.n}</div>
                  <div className="text-[10px] tracking-[0.2em] uppercase mt-1" style={{ color: '#6A655C' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Emblem + meta card */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end fade-up" style={{ animationDelay: '.2s' }}>
            <div className="relative glow-pulse">
              <CenitMark size={300} />
              {/* Concentric rings */}
              <div className="absolute inset-0 rounded-full" style={{
                border: '1px solid rgba(201,168,106,.15)', margin: '-30px'
              }} />
              <div className="absolute inset-0 rounded-full" style={{
                border: '1px solid rgba(201,168,106,.08)', margin: '-60px'
              }} />
            </div>

            {/* Meta card */}
            <div className="surface crest mt-10 p-6 w-full max-w-sm relative">
              <span className="crest-bl"></span><span className="crest-br"></span>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] tracking-[0.25em] uppercase" style={{ color: '#C9A86A' }}>Hoy · Cita Disponible</span>
                <span className="pill pill-gold">Abierto</span>
              </div>
              <div className="font-display text-2xl" style={{ color: '#F5F1E8' }}>15:30 · Mateo A.</div>
              <div className="text-xs mt-1" style={{ color: '#9A9489' }}>Ritual Clásico · 75 min</div>
              <button className="mt-4 text-[11px] tracking-[0.18em] uppercase inline-flex items-center gap-2 hover:gap-3 transition-all"
                style={{ color: '#E8C77E' }} onClick={onBook}>
                Reservar este horario <Icon name="ArrowRight" size={12}/>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* bottom marquee */}
      <div className="absolute bottom-0 left-0 right-0 border-t hairline py-3 flex items-center justify-between px-6 lg:px-12 text-[10px] tracking-[0.25em] uppercase"
           style={{ color: '#6A655C', borderColor: '#2A2724', zIndex: 3, background: 'rgba(10,10,10,.7)', backdropFilter: 'blur(8px)' }}>
        <span>Cra. 11 #94-32 · Chicó</span>
        <span className="hidden md:inline">Lunes a Sábado · 09:00 – 20:00</span>
        <span>+57 601 880 4400</span>
      </div>
    </section>
  );
}
window.Hero = Hero;

// ============================================================
// PILLARS — three ritual pillars below the hero
// ============================================================
function Pillars() {
  const items = [
    { i: "Scissors",    t: "Corte de Autor",  d: "Diseño basado en estructura ósea, estilo de vida y personalidad. Sin formulas." },
    { i: "Sparkles",    t: "Ritual Cumbre",   d: "Afeitado con toalla caliente, aceites cálidos y navaja tradicional." },
    { i: "Crown",       t: "Detalle Real",    d: "Productos importados, atención personalizada y café de origen mientras esperas." }
  ];
  return (
    <section className="py-32 px-6 lg:px-12 relative" style={{ background: '#0A0A0A' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <Eyebrow>El Ritual Cénit</Eyebrow>
          <h2 className="font-display text-5xl md:text-6xl mt-6" style={{ color: '#F5F1E8' }}>
            Tres pilares. Una <em className="text-gold-gradient" style={{ fontStyle: 'italic' }}>cumbre</em>.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {items.map((it, idx) => (
            <div key={idx} className="crest p-10 surface group transition-all hover:bg-[#1A1816]">
              <span className="crest-bl"></span><span className="crest-br"></span>
              <div className="text-5xl font-display mb-8" style={{ color: '#3A3530' }}>0{idx + 1}</div>
              <Icon name={it.i} size={32} strokeWidth={1.2} className="mb-6" style={{ color: '#C9A86A' }}/>
              <h3 className="font-display text-3xl mb-3" style={{ color: '#F5F1E8' }}>{it.t}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#9A9489' }}>{it.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
window.Pillars = Pillars;
