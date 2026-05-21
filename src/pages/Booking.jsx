import React, { useState, useMemo } from 'react';
import { Icon, Sunburst, Corners } from '../components/Shared';
import { CENIT_DATA, formatCOP, ROMAN } from '../data/cenitData';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Booking() {
  const location = useLocation();
  const preselectService = location.state?.preselectService;
  const STEPS = ["Servicio", "Maestro", "Día y Hora", "Confirmación"];
  const [step, setStep] = useState(0);
  const [service, setService] = useState(preselectService ? CENIT_DATA.services.find(s => s.id === preselectService) : null);
  const [barber, setBarber] = useState(null);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [contact, setContact] = useState({ name: "", phone: "", email: "" });
  const [submitted, setSubmitted] = useState(false);

  const canNext = [service, barber, (date && time), (contact.name && contact.phone && contact.email)][step];

  return (
    <div className="p-8 lg:p-12 fade-up">
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Sunburst size={22}/>
            <span className="font-roman text-[11px]" style={{ color: '#C9A86A', letterSpacing: '0.3em' }}>RESERVA · REGISTRO</span>
          </div>
          <h1 className="font-display text-5xl lg:text-6xl" style={{ color: '#F1ECDE', fontStyle: 'italic' }}>
            Agenda tu <span className="text-gold">cumbre</span>.
          </h1>
        </div>
        <div className="hidden lg:block text-right">
          <div className="font-roman text-[10px]" style={{ color: '#8B6F3F', letterSpacing: '0.3em' }}>PASO ACTUAL</div>
          <div className="font-roman text-4xl text-gold">{ROMAN[step]}</div>
          <div className="font-mono text-[10px]" style={{ color: '#5A5347' }}>DE {ROMAN[STEPS.length - 1]}</div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-12 gap-2 max-w-3xl">
        {STEPS.map((s, i) => (
          <React.Fragment key={i}>
            <button onClick={() => i < step && setStep(i)} disabled={i > step}
              className="flex flex-col items-center gap-2 group">
              <span className={`pip ${i === step ? 'active' : i < step ? 'done' : ''}`}>
                {i < step ? <Icon name="Check" size={14}/> : ROMAN[i]}
              </span>
              <span className={`font-roman text-[9px] tracking-[0.2em] uppercase transition-colors
                ${i === step ? 'text-[#E8C77E]' : i < step ? 'text-[#C9A86A]' : 'text-[#5A5347]'}`}>{s}</span>
            </button>
            {i < STEPS.length - 1 && (
              <span className="flex-1 h-px" style={{ background: i < step ? '#C9A86A' : '#2A2530' }}/>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="corner-deco frame-double p-6 lg:p-10 relative min-h-[520px]">
        <Corners/>
        {submitted ? (
          <ReservaSuccess service={service} barber={barber} date={date} time={time} contact={contact}
            onReset={() => { setStep(0); setSubmitted(false); setService(null); setBarber(null); setDate(null); setTime(null); setContact({name:'',phone:'',email:''}); }}/>
        ) : (
          <>
            {step === 0 && <StepService selected={service} onSelect={setService}/>}
            {step === 1 && <StepBarber selected={barber} onSelect={setBarber}/>}
            {step === 2 && <StepDateTime date={date} time={time} onDate={setDate} onTime={setTime}/>}
            {step === 3 && <StepContact contact={contact} onChange={setContact} summary={{ service, barber, date, time }}/>}

            <div className="mt-10 pt-6 flex items-center justify-between border-t" style={{ borderColor: '#2A2530' }}>
              <button className="btn-line inline-flex items-center gap-2"
                disabled={step === 0}
                onClick={() => setStep(Math.max(0, step - 1))}>
                <Icon name="ArrowLeft" size={12}/> Anterior
              </button>
              {step < 3 ? (
                <button className="btn-gold inline-flex items-center gap-2"
                  disabled={!canNext}
                  onClick={() => canNext && setStep(step + 1)}>
                  Continuar · {ROMAN[step + 1]} <Icon name="ArrowRight" size={12}/>
                </button>
              ) : (
                <button className="btn-gold inline-flex items-center gap-2"
                  disabled={!canNext}
                  onClick={() => canNext && setSubmitted(true)}>
                  Confirmar Reserva <Icon name="Check" size={12}/>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StepService({ selected, onSelect }) {
  return (
    <div className="fade-up">
      <StepHead n="I" title="Elige tu ritual" sub="Cada servicio reserva su tiempo exacto en la silla."/>
      <div className="grid md:grid-cols-2 gap-4">
        {CENIT_DATA.services.map((s, i) => {
          const active = selected?.id === s.id;
          return (
            <button key={s.id} onClick={() => onSelect(s)}
              className={`corner-deco text-left p-6 border transition-all relative
                ${active ? 'bg-[#1A171C]' : 'hover:bg-[#131115]'}`}
              style={{ borderColor: active ? '#C9A86A' : '#2A2530' }}>
              <Corners/>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-roman text-[10px]" style={{ color: '#8B6F3F', letterSpacing: '0.3em' }}>№ {String(i+1).padStart(2,'0')}</span>
                  <h4 className="font-display text-2xl mt-1" style={{ color: '#F1ECDE', fontStyle: 'italic' }}>{s.name}</h4>
                  <div className="font-roman text-[10px] mt-1" style={{ color: '#C9A86A', letterSpacing: '0.18em' }}>{s.subtitle.toUpperCase()}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-base" style={{ color: '#E8C77E' }}>{formatCOP(s.price)}</div>
                  <div className="font-mono text-[10px] mt-1" style={{ color: '#5A5347' }}>{s.duration} MIN</div>
                </div>
              </div>
              <p className="text-xs mt-4" style={{ color: '#948A78' }}>{s.desc}</p>
              {active && (
                <div className="mt-4 inline-flex items-center gap-2 font-roman text-[10px]" style={{ color: '#E8C77E', letterSpacing: '0.2em' }}>
                  <Icon name="Check" size={12}/> SELECCIONADO
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepBarber({ selected, onSelect }) {
  return (
    <div className="fade-up">
      <StepHead n="II" title="Elige tu maestro" sub="Cada barbero tiene su firma. Elige el que conecta con tu estilo."/>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CENIT_DATA.barbers.map((b, idx) => {
          const active = selected?.id === b.id;
          return (
            <button key={b.id} onClick={() => onSelect(b)}
              className={`corner-deco text-left border overflow-hidden transition-all relative
                ${active ? '' : 'hover:bg-[#131115]'}`}
              style={{ borderColor: active ? '#C9A86A' : '#2A2530', background: active ? '#1A171C' : 'transparent' }}>
              <Corners/>
              <div className="aspect-[3/4] relative" style={{
                background: `linear-gradient(165deg, ${['#1F1B16','#231911','#1A1612','#241D14'][idx]} 0%, #07060A 100%)`
              }}>
                <div className="absolute inset-0 flex items-center justify-center"
                     style={{ background: 'radial-gradient(ellipse at center, rgba(201,168,106,.06), transparent 60%)' }}>
                  <div className="font-display italic text-[140px] leading-none" style={{ color: 'rgba(201,168,106,.12)' }}>
                    {b.name.split(' ').map(w => w[0]).join('')}
                  </div>
                </div>
                <div className="absolute top-3 left-3 font-roman text-[10px]" style={{ color: '#C9A86A', letterSpacing: '0.3em' }}>
                  {ROMAN[idx]}
                </div>
                {active && (
                  <div className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center bg-gold">
                    <Icon name="Check" size={14} className="text-black"/>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="font-roman text-[10px]" style={{ color: '#C9A86A', letterSpacing: '0.2em' }}>{b.role.toUpperCase()}</div>
                <h4 className="font-display text-lg mt-1" style={{ color: '#F1ECDE', fontStyle: 'italic' }}>{b.name}</h4>
                <div className="font-mono text-[10px] mt-2" style={{ color: '#5A5347' }}>{String(b.years).padStart(2,'0')} AÑOS · {b.signature.toUpperCase()}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepDateTime({ date, time, onDate, onTime }) {
  const [month, setMonth] = useState(() => new Date(2026, 4, 1));
  const today = new Date(2026, 4, 20);

  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const startDay = (first.getDay() + 6) % 7;
    const out = [];
    for (let i = 0; i < startDay; i++) out.push(null);
    for (let d = 1; d <= last.getDate(); d++) {
      const dt = new Date(month.getFullYear(), month.getMonth(), d);
      const isPast = dt < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isSunday = dt.getDay() === 0;
      out.push({ d, dt, disabled: isPast || isSunday, today: dt.toDateString() === today.toDateString() });
    }
    return out;
  }, [month]);

  const slots = ["09:00","09:30","10:00","10:30","11:00","11:30",
                 "12:00","12:30","14:00","14:30","15:00","15:30",
                 "16:00","16:30","17:00","17:30","18:00","18:30"];
  const unavailable = ["10:00","12:30","15:30","17:00"];

  return (
    <div className="fade-up">
      <StepHead n="III" title="Día y hora" sub="Domingos cerrados. Selecciona primero el día."/>
      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <div className="frame-thin p-6">
            <div className="flex items-center justify-between mb-5">
              <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                className="w-8 h-8 border flex items-center justify-center hover:border-[#C9A86A] transition-colors"
                style={{ borderColor: '#3A3340' }}>
                <Icon name="ChevronLeft" size={14}/>
              </button>
              <div className="text-center">
                <div className="font-display text-xl capitalize" style={{ color: '#E8C77E', fontStyle: 'italic' }}>
                  {month.toLocaleDateString('es-CO', { month: 'long' })}
                </div>
                <div className="font-mono text-[10px]" style={{ color: '#8B6F3F' }}>MMXXVI</div>
              </div>
              <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                className="w-8 h-8 border flex items-center justify-center hover:border-[#C9A86A]"
                style={{ borderColor: '#3A3340' }}>
                <Icon name="ChevronRight" size={14}/>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {["L","M","X","J","V","S","D"].map(d => (
                <div key={d} className="font-roman text-[10px] text-center py-2" style={{ color: '#5A5347', letterSpacing: '0.2em' }}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, i) => {
                if (!day) return <div key={i}/>;
                const active = date && day.dt.toDateString() === date.toDateString();
                return (
                  <button key={i}
                    onClick={() => !day.disabled && onDate(day.dt)}
                    disabled={day.disabled}
                    className={`cal-day ${day.disabled ? 'disabled' : ''} ${active ? 'active' : ''} ${day.today ? 'today' : ''}`}>
                    {String(day.d).padStart(2,'0')}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="font-roman text-[10px] mb-3" style={{ color: '#C9A86A', letterSpacing: '0.3em' }}>HORARIOS DISPONIBLES</div>
          <div className="font-mono text-xs mb-5" style={{ color: '#948A78' }}>
            {date ? date.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase() : '— SELECCIONA UNA FECHA —'}
          </div>
          <div className="grid grid-cols-3 gap-2" style={{ opacity: date ? 1 : .35, pointerEvents: date ? 'auto' : 'none' }}>
            {slots.map(s => {
              const isUn = unavailable.includes(s);
              return (
                <button key={s}
                  className={`slot ${time === s ? 'active' : ''} ${isUn ? 'disabled' : ''}`}
                  onClick={() => !isUn && onTime(s)}>{s}</button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepContact({ contact, onChange, summary }) {
  const total = summary.service?.price || 0;
  return (
    <div className="fade-up">
      <StepHead n="IV" title="Datos de confirmación" sub="Te enviamos detalles al instante."/>
      <div className="grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 space-y-8">
          <Field label="Nombre completo" value={contact.name}
                 onChange={v => onChange({ ...contact, name: v })} placeholder="Javier Montes Restrepo"/>
          <Field label="Teléfono" value={contact.phone}
                 onChange={v => onChange({ ...contact, phone: v })} placeholder="+57 300 000 0000"/>
          <Field label="Correo electrónico" value={contact.email} type="email"
                 onChange={v => onChange({ ...contact, email: v })} placeholder="javier@ejemplo.com"/>
          <div className="flex items-start gap-3 pt-2">
            <span className="w-4 h-4 inline-flex items-center justify-center mt-1 bg-gold">
              <Icon name="Check" size={10} className="text-black"/>
            </span>
            <p className="text-xs" style={{ color: '#948A78' }}>
              Acepto la política de cancelación: hasta 2 horas antes sin costo.
            </p>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="ticket">
            <div className="font-roman text-[10px] mb-4" style={{ color: '#C9A86A', letterSpacing: '0.3em' }}>BOLETO DE RESERVA</div>
            <SumRow label="Servicio" value={summary.service?.name || '—'}/>
            <SumRow label="Maestro"  value={summary.barber?.name || '—'}/>
            <SumRow label="Fecha"    value={summary.date ? summary.date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) : '—'}/>
            <SumRow label="Hora"     value={summary.time || '—'}/>
            <SumRow label="Duración" value={summary.service ? `${summary.service.duration} min` : '—'}/>
            <div className="diamond-divider my-5">◆</div>
            <div className="flex items-baseline justify-between">
              <span className="font-roman text-[10px]" style={{ color: '#C9A86A', letterSpacing: '0.3em' }}>TOTAL</span>
              <span className="font-display text-3xl text-gold">{formatCOP(total)}</span>
            </div>
            <div className="font-mono text-[10px] mt-2 text-right" style={{ color: '#5A5347' }}>PAGO EN SITIO</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepHead({ n, title, sub }) {
  return (
    <div className="mb-8">
      <div className="font-roman text-3xl text-gold mb-2" style={{ letterSpacing: '0.2em' }}>{n}</div>
      <h3 className="font-display text-3xl lg:text-4xl mb-2" style={{ color: '#F1ECDE', fontStyle: 'italic' }}>{title}</h3>
      <p className="font-mono text-xs" style={{ color: '#948A78' }}>{sub}</p>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="font-roman text-[10px]" style={{ color: '#C9A86A', letterSpacing: '0.3em' }}>{label.toUpperCase()}</label>
      <input className="input-line mt-1 w-full text-white bg-transparent border-b border-[#3A3340] pb-2 outline-none focus:border-[#C9A86A] transition-colors" type={type} placeholder={placeholder}
             value={value} onChange={e => onChange(e.target.value)}/>
    </div>
  );
}

function SumRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5 border-b" style={{ borderColor: '#2A2530' }}>
      <span className="font-roman text-[10px]" style={{ color: '#8B6F3F', letterSpacing: '0.25em' }}>{label.toUpperCase()}</span>
      <span className="text-sm" style={{ color: '#F1ECDE' }}>{value}</span>
    </div>
  );
}

function ReservaSuccess({ service, barber, date, time, contact, onReset }) {
  return (
    <div className="text-center py-10 fade-up">
      <div className="flex justify-center mb-6">
        <Sunburst size={56}/>
      </div>
      <span className="font-roman text-[11px] text-gold" style={{ letterSpacing: '0.3em' }}>RESERVA CONFIRMADA</span>
      <h3 className="font-display text-4xl lg:text-5xl mt-4 mb-4" style={{ color: '#F1ECDE', fontStyle: 'italic' }}>
        Tu cumbre te espera,<br/><span className="text-gold">{contact.name.split(' ')[0] || 'Caballero'}.</span>
      </h3>
      <p className="font-mono text-xs max-w-md mx-auto" style={{ color: '#948A78' }}>
        DETALLES ENVIADOS A {contact.email.toUpperCase()}<br/>
        {date?.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()} · {time}
      </p>
      <div className="mt-10 ticket inline-flex flex-wrap items-center gap-8 px-8 text-left">
        <SuccCol label="Servicio" value={service?.name}/>
        <span style={{ color: '#3A3340' }}>◆</span>
        <SuccCol label="Maestro" value={barber?.name}/>
        <span style={{ color: '#3A3340' }}>◆</span>
        <SuccCol label="Hora" value={time}/>
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <button className="btn-line inline-flex items-center gap-2" onClick={onReset}>
          <Icon name="Plus" size={12}/> Nueva cita
        </button>
        <button className="btn-gold inline-flex items-center gap-2">
          <Icon name="Calendar" size={12}/> Añadir al calendario
        </button>
      </div>
    </div>
  );
}

function SuccCol({ label, value }) {
  return (
    <div>
      <div className="font-roman text-[10px]" style={{ color: '#8B6F3F', letterSpacing: '0.25em' }}>{label.toUpperCase()}</div>
      <div className="font-display text-xl" style={{ color: '#E8C77E', fontStyle: 'italic' }}>{value}</div>
    </div>
  );
}
