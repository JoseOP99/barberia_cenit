import React from 'react';
import { Icon } from '../components/Shared';
import { CENIT_DATA, CONTACT_INFO, OPERATING_HOURS, formatCOP } from '../data/cenitData';
import { useNavigate } from 'react-router-dom';

function getTodayStatus() {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[new Date().getDay()];
  const hours = OPERATING_HOURS[today];
  if (!hours) return { open: false, label: 'Cerrado hoy (lunes)' };
  return { open: true, label: `Abierto hoy · ${hours.open} – ${hours.close.replace('18:00', '6:00 PM').replace('15:00', '3:00 PM')}` };
}

export default function Home() {
  const navigate = useNavigate();
  const todayStatus = getTodayStatus();
  const service = CENIT_DATA.services[0];

  return (
    <div className="animate-in">
      <section className="relative overflow-hidden min-h-[85vh] flex items-center">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #C9A86A 1px, transparent 0)',
          backgroundSize: '48px 48px',
        }} />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0A0A0A] to-transparent" />

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8" style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <span className={`w-2 h-2 rounded-full ${todayStatus.open ? 'bg-[#7FA86A] animate-pulse' : 'bg-[#6A655C]'}`} />
              <span className="text-xs text-[#B5AFA5]">{todayStatus.label}</span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.08] text-[#F5F1E8]">
              Tu barbería de<br />
              <span className="italic text-gold-gradient">confianza</span> en Tuchín
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-[#9A9489] leading-relaxed max-w-md">
              Cortes con dedicación por Fernando Mendoza. Sin filas, sin prisa — reserva tu hora.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/reservar')}
                className="inline-flex items-center gap-2.5 bg-[#C9A86A] text-[#1A1408] text-sm font-semibold tracking-wider uppercase px-7 py-4 rounded-full hover:bg-[#E8C77E] transition-all hover:shadow-lg hover:shadow-[#C9A86A]/20"
              >
                <Icon name="Calendar" size={16} />
                Reservar Cita
              </button>
              <a
                href={CONTACT_INFO.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-sm font-medium tracking-wider uppercase px-7 py-4 rounded-full transition-all hover:shadow-lg" style={{
                  background: 'rgba(37, 211, 102, 0.1)',
                  border: '1px solid rgba(37, 211, 102, 0.25)',
                  color: '#25D366',
                }}
              >
                <Icon name="MessageCircle" size={16} />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="mb-10">
            <span className="text-xs font-semibold tracking-widest uppercase text-[#C9A86A]">El servicio</span>
            <h2 className="font-display text-4xl sm:text-5xl text-[#F5F1E8] mt-2">
              Un corte, toda la <span className="italic text-gold-gradient">dedicación</span>
            </h2>
          </div>

          <button
            onClick={() => navigate('/reservar')}
            className="glass-panel w-full max-w-2xl text-left rounded-2xl p-8 sm:p-10 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                background: 'rgba(201, 168, 106, 0.1)',
                border: '1px solid rgba(201, 168, 106, 0.15)',
              }}>
                <Icon name="Scissors" size={20} className="text-[#C9A86A]" />
              </div>
              <span className="font-mono text-sm text-[#6A655C]">{service.duration} min</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-medium text-[#F5F1E8] group-hover:text-[#E8C77E] transition-colors">
              {service.name}
            </h3>
            <p className="text-sm text-[#9A9489] mt-2 leading-relaxed">{service.desc}</p>
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/[0.06]">
              <span className="font-mono text-2xl text-[#E8C77E]">{formatCOP(service.price)}</span>
              <span className="inline-flex items-center gap-2 text-sm text-[#C9A86A] group-hover:gap-3 transition-all">
                Reservar <Icon name="ArrowRight" size={16} />
              </span>
            </div>
          </button>
        </div>
      </section>

      <section className="py-16 sm:py-24 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel rounded-2xl p-8 sm:p-10">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E8C77E] to-[#8B6F3F] flex items-center justify-center mb-6">
                <span className="font-display italic text-2xl text-[#1A1408]">FM</span>
              </div>
              <h3 className="text-2xl font-medium text-[#F5F1E8]">Fernando Mendoza</h3>
              <p className="text-sm text-[#C9A86A] mt-1">Barbero</p>
              <p className="text-sm text-[#9A9489] mt-4 leading-relaxed">
                Cada corte con dedicación y atención al detalle. Pásate por la barbería o reserva tu cita para no esperar.
              </p>
              <a
                href={CONTACT_INFO.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-sm text-[#25D366] hover:text-[#2eec73] transition-colors"
              >
                <Icon name="MessageCircle" size={14} />
                Escríbeme por WhatsApp
              </a>
            </div>

            <div className="glass-panel rounded-2xl p-8 sm:p-10">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{
                background: 'rgba(201, 168, 106, 0.1)',
                border: '1px solid rgba(201, 168, 106, 0.15)',
              }}>
                <Icon name="Clock" size={20} className="text-[#C9A86A]" />
              </div>
              <h3 className="text-2xl font-medium text-[#F5F1E8]">Horario</h3>
              <div className="mt-4 space-y-3">
                <ScheduleRow day="Lunes" hours="Cerrado" closed />
                <ScheduleRow day="Martes – Sábado" hours="8:30 AM – 6:00 PM" />
                <ScheduleRow day="Domingo" hours="8:30 AM – 3:00 PM" />
              </div>
              <div className="mt-6 pt-6 border-t border-white/[0.06]">
                <div className="flex items-center gap-2 text-sm text-[#9A9489]">
                  <Icon name="MapPin" size={14} className="text-[#6A655C] shrink-0" />
                  Tuchín, Córdoba · Sector San Pedro
                </div>
                <div className="flex items-center gap-2 text-sm text-[#9A9489] mt-2">
                  <Icon name="Phone" size={14} className="text-[#6A655C] shrink-0" />
                  {CONTACT_INFO.phone}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 border-t border-white/[0.06]">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="font-display text-4xl sm:text-5xl text-[#F5F1E8]">
            Listo para tu <span className="italic text-gold-gradient">corte</span>?
          </h2>
          <p className="mt-4 text-[#9A9489] text-lg">
            Reserva tu cita y llega a tu hora. Sin espera.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate('/reservar')}
              className="inline-flex items-center gap-2.5 bg-[#C9A86A] text-[#1A1408] text-sm font-semibold tracking-wider uppercase px-8 py-4 rounded-full hover:bg-[#E8C77E] transition-all hover:shadow-lg hover:shadow-[#C9A86A]/20"
            >
              <Icon name="Calendar" size={16} />
              Reservar Ahora
            </button>
            <a
              href={`tel:${CONTACT_INFO.phone}`}
              className="inline-flex items-center gap-2.5 text-sm font-medium px-8 py-4 rounded-full transition-colors"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#B5AFA5',
              }}
            >
              <Icon name="Phone" size={16} />
              Llamar
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function ScheduleRow({ day, hours, closed }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-[#B5AFA5]">{day}</span>
      <span className={`text-sm ${closed ? 'text-[#6A655C]' : 'text-[#E8C77E]'}`}>{hours}</span>
    </div>
  );
}
