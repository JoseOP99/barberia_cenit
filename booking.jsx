/* global React, Icon, Eyebrow, CENIT_DATA, formatCOP */
const { useState: useStateBook, useMemo: useMemoBook, useEffect: useEffectBook } = React;

// ============================================================
// BOOKING STEPPER — 4 pasos. Cliente puede ir adelante / atrás.
// ============================================================
function Booking({ initialStep = 0, onComplete }) {
  const STEPS = ["Servicio", "Barbero", "Fecha y Hora", "Confirmación"];
  const [step, setStep] = useStateBook(initialStep);
  const [service, setService] = useStateBook(null);
  const [barber, setBarber] = useStateBook(null);
  const [date, setDate] = useStateBook(null);
  const [time, setTime] = useStateBook(null);
  const [contact, setContact] = useStateBook({ name: "", phone: "", email: "" });
  const [submitted, setSubmitted] = useStateBook(false);

  const canNext = [service, barber, (date && time), (contact.name && contact.phone && contact.email)][step];

  const handleSubmit = () => {
    setSubmitted(true);
    onComplete && onComplete({ service, barber, date, time, contact });
  };

  return (
    <section id="reservas" className="py-28 px-6 lg:px-12 relative" style={{ background: '#0E0D0C' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <Eyebrow>Reserva tu Experiencia</Eyebrow>
          <h2 className="font-display text-5xl md:text-6xl mt-6" style={{ color: '#F5F1E8' }}>
            Agenda tu visita <em className="text-gold-gradient italic">en cuatro pasos.</em>
          </h2>
          <p className="mt-4 text-sm max-w-lg" style={{ color: '#9A9489' }}>
            Cada cita está reservada con tiempo dedicado. Sin prisa. Sin filas. Solo tu ritual.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-16 gap-2 md:gap-4 flex-wrap">
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <button
                onClick={() => i < step && setStep(i)}
                className="flex items-center gap-3 group">
                <span className={`step-dot ${i === step ? 'active' : i < step ? 'done' : ''}`}>
                  {i < step ? <Icon name="Check" size={14}/> : i + 1}
                </span>
                <span className={`hidden md:inline text-[11px] tracking-[0.2em] uppercase transition-colors ${
                  i === step ? 'text-[#E8C77E]' : i < step ? 'text-[#C9A86A]' : 'text-[#6A655C]'
                }`}>{s}</span>
              </button>
              {i < STEPS.length - 1 && (
                <span className="w-6 md:w-12 h-px" style={{
                  background: i < step ? '#C9A86A' : '#2A2724'
                }}/>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Body card */}
        <div className="surface crest p-6 md:p-12 relative min-h-[480px]">
          <span className="crest-bl"></span><span className="crest-br"></span>

          {submitted ? (
            <BookingSuccess service={service} barber={barber} date={date} time={time} contact={contact}
              onReset={() => { setStep(0); setSubmitted(false); setService(null); setBarber(null); setDate(null); setTime(null); setContact({name:'',phone:'',email:''}); }}/>
          ) : (
            <>
              {step === 0 && <StepService selected={service} onSelect={setService} />}
              {step === 1 && <StepBarber selected={barber} onSelect={setBarber} service={service} />}
              {step === 2 && <StepDateTime date={date} time={time} onDate={setDate} onTime={setTime} />}
              {step === 3 && <StepContact contact={contact} onChange={setContact}
                                summary={{ service, barber, date, time }} />}

              {/* Nav */}
              <div className="mt-12 pt-8 flex items-center justify-between border-t hairline" style={{ borderColor: '#2A2724' }}>
                <button
                  className="btn-ghost inline-flex items-center gap-2"
                  disabled={step === 0}
                  style={{ opacity: step === 0 ? 0.3 : 1, cursor: step === 0 ? 'not-allowed' : 'pointer' }}
                  onClick={() => setStep(Math.max(0, step - 1))}>
                  <Icon name="ArrowLeft" size={14}/> Anterior
                </button>

                {step < 3 ? (
                  <button
                    className="btn-gold inline-flex items-center gap-2"
                    disabled={!canNext}
                    style={{ opacity: canNext ? 1 : 0.4, cursor: canNext ? 'pointer' : 'not-allowed' }}
                    onClick={() => canNext && setStep(step + 1)}>
                    Continuar <Icon name="ArrowRight" size={14}/>
                  </button>
                ) : (
                  <button
                    className="btn-gold inline-flex items-center gap-2"
                    disabled={!canNext}
                    style={{ opacity: canNext ? 1 : 0.4, cursor: canNext ? 'pointer' : 'not-allowed' }}
                    onClick={() => canNext && handleSubmit()}>
                    Confirmar Reserva <Icon name="Check" size={14}/>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
window.Booking = Booking;

// ----- Step 0: Service ----------------------------------
function StepService({ selected, onSelect }) {
  return (
    <div className="fade-up">
      <h3 className="font-display text-3xl mb-2" style={{ color: '#F5F1E8' }}>Elige tu ritual.</h3>
      <p className="text-sm mb-10" style={{ color: '#9A9489' }}>Cada servicio reserva su tiempo exacto en la silla.</p>

      <div className="grid md:grid-cols-2 gap-4">
        {CENIT_DATA.services.map(s => {
          const active = selected?.id === s.id;
          return (
            <button key={s.id}
              onClick={() => onSelect(s)}
              className={`text-left p-6 border transition-all crest relative
                ${active ? 'bg-[#1A1816]' : 'hover:bg-[#161412]'}`}
              style={{
                borderColor: active ? '#C9A86A' : '#2A2724'
              }}>
              <span className="crest-bl" style={{ opacity: active ? 1 : 0 }}></span>
              <span className="crest-br" style={{ opacity: active ? 1 : 0 }}></span>
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-display text-2xl" style={{ color: '#F5F1E8' }}>{s.name}</h4>
                <div className="text-right shrink-0 ml-4">
                  <div className="font-display text-xl" style={{ color: '#E8C77E' }}>{formatCOP(s.price)}</div>
                  <div className="text-[10px] tracking-[0.2em] uppercase" style={{ color: '#6A655C' }}>{s.duration} min</div>
                </div>
              </div>
              <div className="text-[10px] tracking-[0.2em] uppercase mb-3" style={{ color: '#C9A86A' }}>{s.subtitle}</div>
              <p className="text-sm leading-relaxed" style={{ color: '#9A9489' }}>{s.desc}</p>

              <div className={`mt-4 flex items-center text-[10px] tracking-[0.2em] uppercase transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`}
                   style={{ color: '#E8C77E' }}>
                <Icon name="Check" size={12} className="mr-2"/> Seleccionado
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ----- Step 1: Barber -----------------------------------
function StepBarber({ selected, onSelect }) {
  return (
    <div className="fade-up">
      <h3 className="font-display text-3xl mb-2" style={{ color: '#F5F1E8' }}>Elige tu barbero.</h3>
      <p className="text-sm mb-10" style={{ color: '#9A9489' }}>Cada uno tiene su firma. Elige el que conecta con tu estilo.</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {CENIT_DATA.barbers.map((b, idx) => {
          const active = selected?.id === b.id;
          // Faux portrait with initials and gold gradient
          return (
            <button key={b.id}
              onClick={() => onSelect(b)}
              className={`text-left border crest relative transition-all overflow-hidden
                ${active ? '' : 'hover:bg-[#161412]'}`}
              style={{ borderColor: active ? '#C9A86A' : '#2A2724', background: active ? '#1A1816' : 'transparent' }}>
              <span className="crest-bl" style={{ opacity: active ? 1 : 0 }}></span>
              <span className="crest-br" style={{ opacity: active ? 1 : 0 }}></span>
              <div className="aspect-[4/5] relative" style={{
                background: `linear-gradient(160deg, ${['#1F1B16','#221A12','#1A1612','#241D14'][idx]} 0%, #0A0A0A 100%)`
              }}>
                {/* Initials */}
                <div className="absolute inset-0 flex items-center justify-center font-display text-[120px]"
                     style={{ color: 'rgba(201,168,106,.15)' }}>
                  {b.name.split(' ').map(w => w[0]).join('')}
                </div>
                {/* striped placeholder hint */}
                <div className="absolute bottom-0 left-0 right-0 h-20" style={{
                  background: 'linear-gradient(180deg, transparent, rgba(0,0,0,.8))'
                }}/>
                {active && (
                  <div className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center bg-gold-gradient">
                    <Icon name="Check" size={14} className="text-black"/>
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="text-[10px] tracking-[0.2em] uppercase" style={{ color: '#C9A86A' }}>{b.role}</div>
                <h4 className="font-display text-xl mt-1" style={{ color: '#F5F1E8' }}>{b.name}</h4>
                <div className="text-xs mt-2" style={{ color: '#6A655C' }}>{b.years} años · {b.signature}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ----- Step 2: Date & Time -----------------------------
function StepDateTime({ date, time, onDate, onTime }) {
  const [month, setMonth] = useStateBook(() => new Date(2026, 4, 1)); // mayo 2026
  const today = new Date(2026, 4, 20);

  const days = useMemoBook(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const startDay = (first.getDay() + 6) % 7; // lunes=0
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

  const monthName = month.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });

  return (
    <div className="fade-up grid md:grid-cols-5 gap-12">
      {/* Calendar */}
      <div className="md:col-span-3">
        <h3 className="font-display text-3xl mb-2" style={{ color: '#F5F1E8' }}>Selecciona fecha.</h3>
        <p className="text-sm mb-8" style={{ color: '#9A9489' }}>Domingos cerrados. Hoy es {today.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}.</p>

        <div className="surface-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              className="w-8 h-8 hairline flex items-center justify-center hover:border-[#C9A86A] transition-colors">
              <Icon name="ChevronLeft" size={16}/>
            </button>
            <div className="font-display text-xl capitalize" style={{ color: '#E8C77E' }}>{monthName}</div>
            <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              className="w-8 h-8 hairline flex items-center justify-center hover:border-[#C9A86A] transition-colors">
              <Icon name="ChevronRight" size={16}/>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {["L","M","X","J","V","S","D"].map(d => (
              <div key={d} className="text-[10px] tracking-[0.2em] text-center py-2" style={{ color: '#6A655C' }}>{d}</div>
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
                  {day.d}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Time slots */}
      <div className="md:col-span-2">
        <h3 className="font-display text-3xl mb-2" style={{ color: '#F5F1E8' }}>Horarios.</h3>
        <p className="text-sm mb-8" style={{ color: '#9A9489' }}>
          {date ? date.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Selecciona una fecha primero'}
        </p>

        <div className="grid grid-cols-3 gap-2" style={{ opacity: date ? 1 : .35, pointerEvents: date ? 'auto' : 'none' }}>
          {slots.map(s => {
            const isUn = unavailable.includes(s);
            return (
              <button key={s}
                className={`slot ${time === s ? 'active' : ''} ${isUn ? 'disabled' : ''}`}
                onClick={() => !isUn && onTime(s)}>
                {s}
              </button>
            );
          })}
        </div>
        <div className="mt-4 text-[10px] tracking-[0.2em] uppercase" style={{ color: '#6A655C' }}>
          <span style={{ color: '#C9A86A' }}>—</span> Tachado = no disponible
        </div>
      </div>
    </div>
  );
}

// ----- Step 3: Contact + summary -----------------------
function StepContact({ contact, onChange, summary }) {
  const total = summary.service?.price || 0;
  return (
    <div className="fade-up grid md:grid-cols-5 gap-12">
      <div className="md:col-span-3">
        <h3 className="font-display text-3xl mb-2" style={{ color: '#F5F1E8' }}>Datos de confirmación.</h3>
        <p className="text-sm mb-10" style={{ color: '#9A9489' }}>Te enviaremos una confirmación inmediata.</p>

        <div className="space-y-8">
          <div>
            <label className="text-[10px] tracking-[0.25em] uppercase" style={{ color: '#C9A86A' }}>Nombre completo</label>
            <input className="input mt-1" placeholder="Ej. Javier Montes Restrepo"
                   value={contact.name}
                   onChange={e => onChange({ ...contact, name: e.target.value })}/>
          </div>
          <div>
            <label className="text-[10px] tracking-[0.25em] uppercase" style={{ color: '#C9A86A' }}>Teléfono de contacto</label>
            <input className="input mt-1" placeholder="+57 300 000 0000"
                   value={contact.phone}
                   onChange={e => onChange({ ...contact, phone: e.target.value })}/>
          </div>
          <div>
            <label className="text-[10px] tracking-[0.25em] uppercase" style={{ color: '#C9A86A' }}>Correo electrónico</label>
            <input className="input mt-1" placeholder="javier@ejemplo.com" type="email"
                   value={contact.email}
                   onChange={e => onChange({ ...contact, email: e.target.value })}/>
          </div>
          <div className="flex items-start gap-3 pt-4">
            <div className="w-4 h-4 hairline mt-1 flex items-center justify-center" style={{ background: '#C9A86A', borderColor: '#C9A86A' }}>
              <Icon name="Check" size={10} className="text-black"/>
            </div>
            <p className="text-xs" style={{ color: '#9A9489' }}>
              Acepto la política de cancelación: hasta 2 horas antes sin costo.
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="md:col-span-2">
        <div className="surface-2 p-8 crest relative">
          <span className="crest-bl"></span><span className="crest-br"></span>
          <div className="text-[10px] tracking-[0.25em] uppercase mb-6" style={{ color: '#C9A86A' }}>Resumen de tu cita</div>

          <Row label="Servicio" value={summary.service?.name || '—'}/>
          <Row label="Duración" value={summary.service ? `${summary.service.duration} min` : '—'}/>
          <Row label="Barbero" value={summary.barber?.name || '—'}/>
          <Row label="Fecha" value={summary.date ? summary.date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' }) : '—'}/>
          <Row label="Hora" value={summary.time || '—'}/>

          <div className="ornament my-8">✦</div>

          <div className="flex items-baseline justify-between">
            <span className="text-[10px] tracking-[0.25em] uppercase" style={{ color: '#C9A86A' }}>Total</span>
            <span className="font-display text-3xl text-gold-gradient">{formatCOP(total)}</span>
          </div>
          <div className="text-[10px] tracking-[0.2em] uppercase mt-2 text-right" style={{ color: '#6A655C' }}>Pago en sitio</div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between py-3 border-b hairline" style={{ borderColor: '#2A2724' }}>
      <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: '#6A655C' }}>{label}</span>
      <span className="text-sm text-right" style={{ color: '#F5F1E8' }}>{value}</span>
    </div>
  );
}

// ----- Success state ----------------------------------
function BookingSuccess({ service, barber, date, time, contact, onReset }) {
  return (
    <div className="text-center py-12 fade-up">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-8 glow-pulse"
           style={{ background: 'linear-gradient(135deg, #E8C77E 0%, #8B6F3F 100%)' }}>
        <Icon name="Check" size={36} strokeWidth={2} className="text-black"/>
      </div>
      <Eyebrow>Confirmado</Eyebrow>
      <h3 className="font-display text-4xl md:text-5xl mt-6 mb-4" style={{ color: '#F5F1E8' }}>
        Tu cumbre te espera, <em className="text-gold-gradient italic">{contact.name.split(' ')[0] || 'Caballero'}</em>.
      </h3>
      <p className="max-w-md mx-auto text-sm" style={{ color: '#9A9489' }}>
        Hemos enviado los detalles a <span style={{ color: '#E8C77E' }}>{contact.email}</span>.
        Te esperamos {date?.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })} a las {time}.
      </p>

      <div className="mt-10 inline-flex flex-wrap items-center gap-6 px-8 py-5 hairline" style={{ background: '#1A1816' }}>
        <Item label="Servicio" value={service?.name}/>
        <span style={{ color: '#3A3530' }}>·</span>
        <Item label="Barbero" value={barber?.name}/>
        <span style={{ color: '#3A3530' }}>·</span>
        <Item label="Hora" value={time}/>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <button className="btn-ghost inline-flex items-center gap-2" onClick={onReset}>
          <Icon name="Plus" size={14}/> Nueva cita
        </button>
        <button className="btn-gold inline-flex items-center gap-2">
          <Icon name="Calendar" size={14}/> Añadir al calendario
        </button>
      </div>
    </div>
  );
}

function Item({ label, value }) {
  return (
    <div className="text-left">
      <div className="text-[10px] tracking-[0.2em] uppercase" style={{ color: '#6A655C' }}>{label}</div>
      <div className="text-sm font-display text-xl" style={{ color: '#E8C77E' }}>{value}</div>
    </div>
  );
}
