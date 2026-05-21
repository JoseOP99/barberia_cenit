import React from 'react';
import { Icon } from '../components/Shared';
import { CENIT_DATA, CONTACT_INFO, OPERATING_HOURS, formatCOP } from '../data/cenitData';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function getTodayStatus() {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[new Date().getDay()];
  const hours = OPERATING_HOURS[today];
  if (!hours) return { open: false, label: 'Cerrado hoy (lunes)' };
  return { open: true, label: `Abierto hoy · ${hours.open} – ${hours.close.replace('18:00', '6:00 PM').replace('15:00', '3:00 PM')}` };
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 20 } }
};

export default function Home() {
  const navigate = useNavigate();
  const todayStatus = getTodayStatus();
  const service = CENIT_DATA.services[0];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="relative z-10"
    >
      <section className="relative min-h-[90dvh] flex items-center pt-20 pb-16">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/50 to-[#0A0A0A] pointer-events-none" />
        <div className="relative max-w-[1400px] mx-auto px-6 sm:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <motion.div variants={itemVariants} className="lg:col-span-7">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full mb-8 glass-panel animate-float" style={{ animationDuration: '8s' }}>
              <span className={`w-2.5 h-2.5 rounded-full ${todayStatus.open ? 'bg-[#7FA86A] shadow-[0_0_12px_#7FA86A] animate-pulse' : 'bg-[#6A655C]'}`} />
              <span className="text-[13px] tracking-wide text-[#E8C77E]">{todayStatus.label}</span>
            </div>

            <h1 className="text-6xl sm:text-7xl lg:text-[5.5rem] tracking-tighter leading-[0.95] text-[#F5F1E8]">
              Eleva tu estilo.<br />
              <span className="font-display italic text-gold-gradient font-light">Sin esperas.</span>
            </h1>

            <p className="mt-8 text-lg sm:text-xl text-[#9A9489] leading-relaxed max-w-lg">
              Cortes excepcionales, gestión de reservas en tiempo real y una experiencia diseñada para quienes valoran su tiempo.
            </p>

            <div className="mt-12 flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/reservar')}
                className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#E8C77E] to-[#C9A86A] text-[#1A1408] text-sm font-bold tracking-wider uppercase px-8 py-4 rounded-full hover:scale-105 transition-transform duration-300 shadow-[0_0_30px_rgba(201,168,106,0.3)]"
              >
                <Icon name="Calendar" size={18} />
                Agendar Cita
              </button>
              <a
                href={CONTACT_INFO.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 text-sm font-bold tracking-wider uppercase px-8 py-4 rounded-full glass-panel hover:bg-white/[0.05] transition-colors text-[#F5F1E8]"
              >
                <Icon name="MessageCircle" size={18} className="text-[#25D366]" />
                WhatsApp
              </a>
            </div>
          </motion.div>

          {/* Tarjeta flotante asimétrica (Hero Image / Data) */}
          <motion.div variants={itemVariants} className="lg:col-span-5 hidden lg:flex justify-end relative">
             <div className="absolute -inset-4 bg-gradient-to-r from-[#C9A86A]/20 to-transparent blur-3xl opacity-30 rounded-full"></div>
             <div className="glass-panel p-8 rounded-[2.5rem] w-full max-w-sm animate-float" style={{ animationDelay: '1s' }}>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E8C77E] to-[#8B6F3F] flex items-center justify-center mb-8 shadow-lg shadow-gold/20">
                  <Icon name="Scissors" size={24} className="text-[#1A1408]" />
                </div>
                <h3 className="text-2xl font-medium text-[#F5F1E8] mb-2">Servicio Premium</h3>
                <p className="text-[#9A9489] text-sm leading-relaxed mb-8">Disfruta del corte clásico, asesoría de imagen y un trato de primera línea.</p>
                
                <div className="flex items-center justify-between border-t border-white/10 pt-6">
                  <div>
                    <p className="text-[11px] text-[#6A655C] uppercase tracking-widest mb-1">Duración</p>
                    <p className="text-[#E8C77E] font-mono text-lg">45 Min</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#6A655C] uppercase tracking-widest mb-1">Precio</p>
                    <p className="text-[#E8C77E] font-mono text-lg">{formatCOP(service.price)}</p>
                  </div>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Bento Grid Layout para Información */}
      <section className="py-24 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12">
          
          <motion.div variants={itemVariants} className="mb-16">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#C9A86A]">La Experiencia</span>
            <h2 className="text-4xl sm:text-5xl mt-4 tracking-tight text-[#F5F1E8]">
              El estándar <span className="font-display italic text-gold-gradient">Cénit</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            <motion.div variants={itemVariants} className="md:col-span-8 glass-panel rounded-[2rem] p-10 flex flex-col justify-between group hover:border-[#C9A86A]/40 transition-colors">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8">
                   <Icon name="User" size={24} className="text-[#C9A86A]" />
                </div>
                <h3 className="text-3xl font-medium text-[#F5F1E8] mb-4">Fernando Mendoza</h3>
                <p className="text-[#9A9489] text-lg leading-relaxed max-w-2xl">
                  Fundador y Barbero Principal. Especialista en texturas, desvanecidos limpios y perfilado de barba de precisión. Más que un corte, es un diseño de imagen personalizado a tu fisonomía.
                </p>
              </div>
              <div className="mt-12 flex items-center gap-4">
                 <button onClick={() => navigate('/reservar')} className="text-sm font-semibold tracking-wider uppercase text-[#E8C77E] flex items-center gap-2 group-hover:gap-4 transition-all">
                   Ver disponibilidad <Icon name="ArrowRight" size={16} />
                 </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="md:col-span-4 glass-panel rounded-[2rem] p-10 animate-float" style={{ animationDelay: '0.5s' }}>
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8">
                 <Icon name="Clock" size={24} className="text-[#C9A86A]" />
              </div>
              <h3 className="text-2xl font-medium text-[#F5F1E8] mb-6">Horarios</h3>
              <div className="space-y-4">
                <ScheduleRow day="Lunes" hours="Cerrado" closed />
                <ScheduleRow day="Mar – Sáb" hours="8:30AM – 6:00PM" />
                <ScheduleRow day="Domingo" hours="8:30AM – 3:00PM" />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-32 relative z-10 border-t border-white/[0.04]">
        <motion.div variants={itemVariants} className="max-w-3xl mx-auto px-6 text-center">
          <div className="w-24 h-24 mx-auto bg-gradient-to-b from-[#C9A86A]/20 to-transparent rounded-full blur-2xl mb-8"></div>
          <h2 className="text-5xl sm:text-7xl tracking-tighter leading-[0.95] text-[#F5F1E8] mb-8">
            Asegura tu <span className="font-display italic text-gold-gradient">espacio</span>.
          </h2>
          <button
            onClick={() => navigate('/reservar')}
            className="inline-flex items-center justify-center gap-3 bg-[#F5F1E8] text-[#0A0A0A] text-sm font-bold tracking-wider uppercase px-10 py-5 rounded-full hover:scale-105 transition-transform duration-300 shadow-[0_20px_40px_-15px_rgba(255,255,255,0.2)]"
          >
            <Icon name="Calendar" size={18} />
            Agendar Ahora
          </button>
        </motion.div>
      </section>
    </motion.div>
  );
}

function ScheduleRow({ day, hours, closed }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
      <span className="text-[13px] tracking-wide text-[#B5AFA5]">{day}</span>
      <span className={`font-mono text-sm ${closed ? 'text-[#6A655C]' : 'text-[#E8C77E]'}`}>{hours}</span>
    </div>
  );
}
