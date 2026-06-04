import React, { useState, useEffect, useMemo } from 'react';
import { Icon } from '../components/Shared';
import { OPERATING_HOURS, CONTACT_INFO, formatCOP } from '../data/cenitData';
import { useAuth } from '../contexts/AuthContext';
import servicesService from '../services/servicesService';
import barbersService from '../services/barbersService';
import appointmentsService from '../services/appointmentsService';

const STEPS = ['Fecha y Hora', 'Tus Datos'];

export default function Booking() {
  const { user, profile } = useAuth();
  const [services, setServices] = useState([]);
  const [barber, setBarber] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState(null);

  const [step, setStep] = useState(0);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [contact, setContact] = useState({ name: '', phone: '', guestName: '', isForGuest: false });
  const [submitted, setSubmitted] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errorSubmit, setErrorSubmit] = useState('');

  useEffect(() => {
    if (profile) {
      setContact({ 
        name: `${profile.first_name} ${profile.first_lastname}`.trim(), 
        phone: profile.phone || '',
        guestName: '',
        isForGuest: false
      });
    }
  }, [profile]);

  useEffect(() => {
    async function loadData() {
      try {
        const [s, b] = await Promise.all([
          servicesService.getAllServices(),
          barbersService.getAllBarbers(false)
        ]);
        setServices(s || []);
        if (s && s.length > 0) {
          const defaultService = s.find(srv => srv.name.toLowerCase().includes('corte')) || s[0];
          setSelectedServiceId(defaultService.id);
        }
        if (b && b.length > 0) setBarber(b[0]);
      } catch (err) {
        console.error("Error cargando datos en Booking:", err);
      }
    }
    loadData();
  }, []);

  const service = services.find(s => s.id === selectedServiceId) || services[0];

  const canNext = [
    (date && time), 
    (contact.name && contact.phone && (!contact.isForGuest || contact.guestName.trim()))
  ][step];

  const goNext = async () => {
    if (step === 0 && canNext) setStep(1);
    if (step === 1 && canNext) {
      setLoadingSubmit(true);
      setErrorSubmit('');
      try {
        // Usar fecha local para guardar
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset*60*1000));
        const appointment_date = localDate.toISOString().split('T')[0];
        // Asumiendo que `time` viene en formato HH:MM (ej. "14:00")
        const appointment_time = time + ":00";
        
        // Calcular end_time
        const [h, m] = time.split(':').map(Number);
        const duration = service.duration_minutes || 45;
        const totalMins = m + duration;
        const endH = h + Math.floor(totalMins / 60);
        const endM = totalMins % 60;
        const end_time = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;

        await appointmentsService.createAppointment({
          user_id: user?.id,
          barber_id: barber?.id,
          service_id: service?.id,
          client_name: contact.isForGuest ? `${contact.guestName} (Reserva de: ${contact.name})` : contact.name,
          client_phone: contact.phone,
          appointment_date,
          appointment_time,
          end_time,
          status: 'pending'
        });
        setSubmitted(true);
      } catch (err) {
        setErrorSubmit(err.message || 'Error al procesar reserva');
      } finally {
        setLoadingSubmit(false);
      }
    }
  };

  const reset = () => {
    setStep(0);
    setSubmitted(false);
    setDate(null);
    setTime(null);
    setContact({ name: '', phone: '', guestName: '', isForGuest: false });
  };

  return (
    <div className="animate-in">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-16">
        <div className="mb-8">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#C9A86A]">Reservar cita</span>
          <h1 className="font-display text-4xl sm:text-5xl text-[#F5F1E8] mt-2">
            Agenda tu <span className="italic text-gold-gradient">corte</span>
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4">
            <span className="text-sm text-[#9A9489]">Con {barber?.name || 'Fernando Mendoza'}</span>
            <span className="hidden sm:inline text-[#3A3340]">•</span>
            {services.length > 0 && (
              <select 
                value={selectedServiceId} 
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="bg-[#1A1A1A] border border-white/[0.08] text-sm text-[#E8C77E] rounded-lg px-3 py-1.5 outline-none focus:border-[#C9A86A] transition-colors"
              >
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name} — {formatCOP(s.price)}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {!submitted && (
          <div className="flex items-center gap-1 mb-8">
            {STEPS.map((s, i) => (
              <React.Fragment key={i}>
                <button
                  onClick={() => i < step && setStep(i)}
                  disabled={i > step}
                  className="flex items-center gap-2 shrink-0"
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                    i === step
                      ? 'bg-[#C9A86A] text-[#1A1408]'
                      : i < step
                        ? 'bg-[#C9A86A]/20 text-[#C9A86A]'
                        : 'bg-white/[0.05] text-[#6A655C]'
                  }`}>
                    {i < step ? <Icon name="Check" size={14} /> : i + 1}
                  </span>
                  <span className={`text-sm hidden sm:inline transition-colors ${
                    i === step ? 'text-[#F5F1E8] font-medium' : i < step ? 'text-[#9A9489]' : 'text-[#6A655C]'
                  }`}>{s}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px min-w-[32px] mx-3 ${i < step ? 'bg-[#C9A86A]/40' : 'bg-white/[0.06]'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="rounded-2xl p-5 sm:p-8" style={{
          background: 'rgba(12, 11, 10, 0.96)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          {submitted ? (
            <SuccessView service={service} date={date} time={time} contact={contact} onReset={reset} />
          ) : (
            <>
              {step === 0 && <DateTimeStep date={date} time={time} onDate={setDate} onTime={setTime} barberId={barber?.id} service={service} />}
              {step === 1 && <ContactStep contact={contact} onChange={setContact} summary={{ service, date, time }} error={errorSubmit} />}

              <div className="mt-8 pt-6 flex items-center justify-between border-t border-white/[0.06]">
                <button
                  onClick={() => step > 0 && setStep(step - 1)}
                  disabled={step === 0}
                  className="inline-flex items-center gap-2 text-sm text-[#9A9489] hover:text-[#F5F1E8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Icon name="ArrowLeft" size={14} /> Anterior
                </button>
                <button
                  onClick={goNext}
                  disabled={!canNext || loadingSubmit}
                  className="inline-flex items-center gap-2 bg-[#C9A86A] text-[#1A1408] text-sm font-semibold tracking-wider uppercase px-6 py-3 rounded-full hover:bg-[#E8C77E] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {loadingSubmit ? 'Procesando...' : step === 1 ? 'Confirmar Reserva' : 'Continuar'}
                  {!loadingSubmit && <Icon name={step === 1 ? 'Check' : 'ArrowRight'} size={14} />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DateTimeStep({ date, time, onDate, onTime, barberId, service }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [bookedSlots, setBookedSlots] = useState([]);
  const [partialBlocks, setPartialBlocks] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isDayBlocked, setIsDayBlocked] = useState(false);

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const startDay = (first.getDay() + 6) % 7;
    const out = [];
    for (let i = 0; i < startDay; i++) out.push(null);
    for (let d = 1; d <= last.getDate(); d++) {
      const dt = new Date(month.getFullYear(), month.getMonth(), d);
      const isPast = dt < today;
      const dayName = dayNames[dt.getDay()];
      const isClosed = !OPERATING_HOURS[dayName];
      out.push({ d, dt, disabled: isPast || isClosed, today: dt.toDateString() === today.toDateString() });
    }
    return out;
  }, [month, dayNames, today]);

  useEffect(() => {
    if (!date || !barberId) return;
    async function fetchSlots() {
      setLoadingSlots(true);
      // Usar fecha local YYYY-MM-DD para evitar desfase de zona horaria
      const offset = date.getTimezoneOffset();
      const localDate = new Date(date.getTime() - (offset*60*1000));
      const dateStr = localDate.toISOString().split('T')[0];
      
      const res = await appointmentsService.getAvailableSlots(dateStr, barberId);
      
      setIsDayBlocked(!!res?.isBlocked);
      
      // Guardamos los objetos completos de citas y bloqueos parciales
      setBookedSlots(res?.booked || []);
      setPartialBlocks(res?.partialBlocks || []);
      setLoadingSlots(false);
    }
    fetchSlots();
  }, [date, barberId]);

  const getSlots = () => {
    if (!date) return [];
    if (isDayBlocked) return [];
    
    const dayName = dayNames[date.getDay()];
    const hours = OPERATING_HOURS[dayName];
    if (!hours) return [];

    const [openH, openM] = hours.open.split(':').map(Number);
    const [closeH, closeM] = hours.close.split(':').map(Number);
    const slots = [];
    const isToday = date.toDateString() === (new Date()).toDateString();
    const now = new Date();

    const duration = service?.duration_minutes || 45;
    const capacity = service?.max_capacity || 1;
    // Saltamos cada 30 minutos por defecto, o la duración del servicio si es menor
    const stepMinutes = 30;
    const shopCloseMins = closeH * 60 + closeM;

    let h = openH, m = openM;
    while (h < closeH || (h === closeH && m <= closeM)) {
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      
      let isPastSlot = false;
      if (isToday) {
        const nowMins = now.getHours() * 60 + now.getMinutes();
        const slotStartMins = h * 60 + m;
        // Permite agendar el bloque actual (hasta que termina el bloque, ej. 30 mins)
        if (slotStartMins + stepMinutes <= nowMins) {
          isPastSlot = true;
        }
      }

      if (!isPastSlot) {
        const slotStartMins = h * 60 + m;
        const slotEndMins = slotStartMins + duration;

        // Permitir que el turno empiece hasta la hora de cierre (sin importar si termina después)
        if (slotStartMins <= shopCloseMins) {
          // Calcular si hay solapamiento con citas existentes
          let overlappingCount = 0;
          let overlappingClients = [];
          for (const appt of bookedSlots) {
            if (!appt.appointment_time || !appt.end_time) continue;
            
            const [startH, startM] = appt.appointment_time.split(':').map(Number);
            const [endH, endM] = appt.end_time.split(':').map(Number);
            const apptStartMins = startH * 60 + startM;
            const apptEndMins = endH * 60 + endM;

            // Verifica solapamiento (tiempo superpuesto)
            if (Math.max(slotStartMins, apptStartMins) < Math.min(slotEndMins, apptEndMins)) {
              overlappingCount++;
              if (appt.client_name) {
                overlappingClients.push(appt.client_name.split(' ')[0]);
              }
            }
          }

          // Calcular si choca con algún bloqueo parcial (ej. hora de almuerzo)
          let hitsBlock = false;
          for (const block of partialBlocks) {
            if (!block.start_time || !block.end_time) continue;
            const [startH, startM] = block.start_time.split(':').map(Number);
            const [endH, endM] = block.end_time.split(':').map(Number);
            const blockStartMins = startH * 60 + startM;
            const blockEndMins = endH * 60 + endM;

            if (Math.max(slotStartMins, blockStartMins) < Math.min(slotEndMins, blockEndMins)) {
              hitsBlock = true;
              break;
            }
          }

          if (overlappingCount < capacity && !hitsBlock) {
            slots.push({ time: timeStr, clients: overlappingClients });
          }
        }
      }
      m += stepMinutes;
      if (m >= 60) { h += Math.floor(m / 60); m = m % 60; }
    }
    return slots;
  };

  const slots = getSlots();

  return (
    <div className="animate-in">
      <div className="mb-6">
        <h3 className="text-xl sm:text-2xl font-medium text-[#F5F1E8]">Elige fecha y hora</h3>
        <p className="text-sm text-[#9A9489] mt-1">Lunes cerrado. Domingos hasta las 3:00 PM.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <div className="rounded-xl p-4 sm:p-5" style={{ background: 'rgba(15, 14, 12, 0.98)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[#9A9489] hover:text-[#E8C77E] transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <Icon name="ChevronLeft" size={16} />
              </button>
              <span className="font-display text-xl text-[#F5F1E8] capitalize">
                {month.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[#9A9489] hover:text-[#E8C77E] transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <Icon name="ChevronRight" size={16} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['L','M','X','J','V','S','D'].map(d => (
                <div key={d} className="text-center py-2 text-[11px] font-medium text-[#6A655C]">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, i) => {
                if (!day) return <div key={i} />;
                const active = date && day.dt.toDateString() === date.toDateString();
                return (
                  <button
                    key={i}
                    onClick={() => !day.disabled && onDate(day.dt)}
                    disabled={day.disabled}
                    className={`cal-day ${day.disabled ? 'disabled' : ''} ${active ? 'active' : ''} ${day.today ? 'today' : ''}`}
                  >
                    {day.d}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h4 className="text-xs font-semibold tracking-widest uppercase text-[#C9A86A] mb-2">Horarios</h4>
          {date ? (
            <>
              <p className="text-sm text-[#9A9489] mb-4">
                {date.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              {loadingSlots ? (
                <div className="flex justify-center p-4">
                  <div className="w-5 h-5 border-2 border-[#C9A86A] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : isDayBlocked ? (
                <p className="text-sm text-red-400 p-3 bg-red-400/10 rounded-lg">El calendario está cerrado por vacaciones/permiso en esta fecha.</p>
              ) : slots.length === 0 ? (
                <p className="text-sm text-amber-500/80 p-3 bg-amber-500/10 rounded-lg">No hay horarios disponibles en esta fecha.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {slots.map(s => (
                    <button
                      key={s.time}
                      onClick={() => onTime(s.time)}
                      className={`slot rounded-lg font-mono flex flex-col items-center justify-center p-2 min-h-[48px] ${time === s.time ? 'active' : ''}`}
                    >
                      <span>{s.time}</span>
                      {s.clients && s.clients.length > 0 && (
                        <span className="text-[10px] text-[#C9A86A] mt-1 leading-none text-center truncate w-full px-1">
                          {s.clients.join(', ')}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-[#6A655C]">Selecciona una fecha</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ContactStep({ contact, onChange, summary, error }) {
  return (
    <div className="animate-in">
      <div className="mb-6">
        <h3 className="text-xl sm:text-2xl font-medium text-[#F5F1E8]">Tus datos</h3>
        <p className="text-sm text-[#9A9489] mt-1">Verifica tus datos para confirmar tu reserva.</p>
      </div>

      <div className="space-y-5 mb-8">
        <div>
          <label className="flex items-center gap-3 cursor-pointer group w-fit">
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
              contact.isForGuest ? 'bg-[#C9A86A] border-[#C9A86A]' : 'bg-transparent border-white/20 group-hover:border-white/40'
            }`}>
              {contact.isForGuest && <Icon name="Check" size={12} className="text-[#1A1408]" />}
            </div>
            <input 
              type="checkbox" 
              checked={contact.isForGuest}
              onChange={e => onChange({ ...contact, isForGuest: e.target.checked })}
              className="hidden"
            />
            <span className="text-sm text-[#F5F1E8]">¿Es para otra persona?</span>
          </label>
        </div>

        {contact.isForGuest && (
          <div className="animate-in slide-in-from-top-2">
            <label className="block text-[10px] tracking-widest uppercase text-[#C9A86A] mb-2">Nombre de la persona que asiste *</label>
            <input
              type="text"
              value={contact.guestName}
              onChange={e => onChange({ ...contact, guestName: e.target.value })}
              placeholder="Ej. Mario Mendoza"
              className="w-full bg-transparent rounded-xl px-4 py-3.5 text-sm text-[#F5F1E8] placeholder-[#6A655C] outline-none focus:border-[#C9A86A] transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>
        )}

        <div>
          <label className="block text-[10px] tracking-widest uppercase text-[#6A655C] mb-2">Tu Nombre (Quien Reserva)</label>
          <input
            type="text"
            value={contact.name}
            onChange={e => onChange({ ...contact, name: e.target.value })}
            placeholder="Tu nombre"
            className="w-full bg-transparent rounded-xl px-4 py-3.5 text-sm text-[#F5F1E8] placeholder-[#6A655C] outline-none focus:border-[#C9A86A] transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>
        <div>
          <label className="block text-[10px] tracking-widest uppercase text-[#6A655C] mb-2">Teléfono / WhatsApp</label>
          <input
            type="tel"
            value={contact.phone}
            onChange={e => onChange({ ...contact, phone: e.target.value })}
            placeholder="+57 300 000 0000"
            className="w-full bg-transparent rounded-xl px-4 py-3.5 text-sm text-[#F5F1E8] placeholder-[#6A655C] outline-none focus:border-[#C9A86A] transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <Icon name="AlertCircle" size={16} className="text-red-400 shrink-0 mt-0.5" />
          <span className="text-sm text-red-300">{error}</span>
        </div>
      )}

      <div className="rounded-xl p-5" style={{ background: 'rgba(15, 14, 12, 0.98)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h4 className="text-xs font-semibold tracking-widest uppercase text-[#C9A86A] mb-4">Resumen</h4>
        <div className="space-y-3">
          <SummaryRow label="Servicio" value={summary.service?.name} />
          <SummaryRow label="Barbero" value="Fernando Mendoza" />
          <SummaryRow label="Fecha" value={summary.date?.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })} />
          <SummaryRow label="Hora" value={summary.time} />
          <SummaryRow label="Duración" value={`${summary.service?.duration_minutes || 45} min`} />
          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-sm text-[#9A9489]">Total</span>
            <span className="font-mono text-lg text-[#E8C77E]">{formatCOP(summary.service?.price || 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[#6A655C]">{label}</span>
      <span className="text-sm text-[#F5F1E8] font-medium">{value}</span>
    </div>
  );
}

function SuccessView({ service, date, time, contact, onReset }) {
  return (
    <div className="animate-in text-center py-6">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{
        background: 'rgba(127, 168, 106, 0.1)',
        border: '1px solid rgba(127, 168, 106, 0.3)',
      }}>
        <Icon name="Check" size={28} className="text-[#7FA86A]" />
      </div>

      <span className="text-xs font-semibold tracking-widest uppercase text-[#C9A86A]">Reserva confirmada</span>
      <h2 className="font-display text-3xl sm:text-4xl text-[#F5F1E8] mt-2">
        Te esperamos, <span className="italic text-gold-gradient">{contact.name.split(' ')[0]}</span>
      </h2>

      <div className="mt-8 inline-flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="px-5 py-4 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="text-[10px] tracking-widest uppercase text-[#6A655C] mb-1">Servicio</div>
          <div className="text-sm font-medium text-[#F5F1E8]">{service?.name}</div>
        </div>
        <div className="px-5 py-4 text-center" style={{ background: 'rgba(255,255,255,0.02)', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-[10px] tracking-widest uppercase text-[#6A655C] mb-1">Fecha</div>
          <div className="text-sm font-medium text-[#F5F1E8]">{date?.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</div>
        </div>
        <div className="px-5 py-4 text-center" style={{ background: 'rgba(255,255,255,0.02)', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-[10px] tracking-widest uppercase text-[#6A655C] mb-1">Hora</div>
          <div className="text-sm font-medium text-[#F5F1E8]">{time}</div>
        </div>
      </div>

      <p className="mt-8 text-sm text-[#9A9489]">
        Fernando te espera en la barbería. Si necesitas cambiar la hora, escríbele:
      </p>

      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <a
          href={CONTACT_INFO.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
          style={{ background: 'rgba(37, 211, 102, 0.1)', border: '1px solid rgba(37, 211, 102, 0.25)', color: '#25D366' }}
        >
          <Icon name="MessageCircle" size={16} /> WhatsApp
        </a>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 text-sm text-[#9A9489] hover:text-[#F5F1E8] px-5 py-2.5 rounded-full transition-colors"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Icon name="Plus" size={14} /> Nueva cita
        </button>
      </div>
    </div>
  );
}
