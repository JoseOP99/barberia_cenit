import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import raffleService from '../services/raffleService';
import appointmentsService from '../services/appointmentsService';
import { Icon } from '../components/Shared';

export default function Sorteos() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [activeRaffles, setActiveRaffles] = useState([]);
  const [completedAppointments, setCompletedAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadSorteos() {
      if (user?.id) {
        if (isMounted) setLoading(true);
        try {
          const [tData, aRaffles, appts] = await Promise.all([
            raffleService.getUserTickets(user.id),
            raffleService.getActiveRaffles(),
            appointmentsService.getUserAppointments(user.id)
          ]);
          if (isMounted) {
            setTickets(tData || []);
            setActiveRaffles(aRaffles || []);
            setCompletedAppointments((appts || []).filter(a => a.status === 'completed'));
          }
        } catch (err) {
          console.error("Error loading sorteos:", err);
          if (isMounted) {
            setTickets([]);
            setActiveRaffles([]);
            setCompletedAppointments([]);
          }
        } finally {
          if (isMounted) setLoading(false);
        }
      }
    }
    loadSorteos();
    return () => { isMounted = false; };
  }, [user]);

  const pastTickets = (tickets || []).filter(t => t.raffles?.status === 'completed');
  
  const activeRafflesStatus = (activeRaffles || []).map(raffle => {
    const userTicket = (tickets || []).find(t => t.raffles?.id === raffle.id);
    if (userTicket) {
      return { ...raffle, hasTicket: true, ticketNumber: userTicket.ticket_number };
    }
    const validAppts = completedAppointments.filter(a => 
      a.appointment_date >= raffle.start_date && a.appointment_date <= raffle.end_date
    );
    return {
      ...raffle,
      hasTicket: false,
      appointmentsDone: validAppts.length,
      missing: Math.max(0, raffle.min_appointments - validAppts.length)
    };
  });

  return (
    <div className="animate-in max-w-4xl mx-auto px-5 sm:px-8 py-10 sm:py-16">
      
      <div className="mb-12">
        <h1 className="font-display text-4xl sm:text-5xl text-[#F5F1E8]">
          Mis <span className="italic text-gold-gradient">Sorteos</span>
        </h1>
        <p className="text-[#9A9489] mt-2">
          Gana premios exclusivos acumulando cortes en la barbería.
        </p>
      </div>

      {/* Sorteos Activos */}
      <div className="mb-12">
        <h2 className="text-xl font-medium text-[#F5F1E8] mb-6 flex items-center gap-2">
          <Icon name="Gift" size={20} className="text-[#C9A86A]" />
          Sorteos Activos
        </h2>

        {loading ? (
          <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-[#C9A86A] border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : activeRafflesStatus.length > 0 ? (
          <div className="grid gap-4">
            {activeRafflesStatus.map(r => (
              <div key={r.id} className="relative overflow-hidden rounded-2xl p-6" style={{
                background: 'linear-gradient(135deg, rgba(201, 168, 106, 0.1) 0%, rgba(201, 168, 106, 0.02) 100%)',
                border: '1px solid rgba(201, 168, 106, 0.2)'
              }}>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Icon name="Gift" size={64} />
                </div>
                <div className="relative z-10">
                  <span className="inline-flex px-2.5 py-1 text-[10px] uppercase tracking-wider rounded-full border mb-3 bg-[#C9A86A]/10 text-[#C9A86A] border-[#C9A86A]/20">
                    Sorteo Activo
                  </span>
                  <h3 className="text-xl font-medium text-[#F5F1E8] mb-1">{r.title}</h3>
                  <p className="text-sm text-[#9A9489] mb-4">Premio: <span className="text-[#E8C77E] font-medium">{r.prize}</span></p>
                  
                  {r.hasTicket ? (
                    <div className="inline-block bg-[#0A0A0A] rounded-xl p-4 border border-[#C9A86A]/30 shadow-[0_0_15px_rgba(201,168,106,0.1)]">
                      <p className="text-[10px] tracking-widest uppercase text-[#C9A86A] mb-1">¡Ya estás participando! Tu Ticket:</p>
                      <p className="font-mono text-3xl text-[#F5F1E8] tracking-widest">{r.ticketNumber}</p>
                    </div>
                  ) : (
                    <div className="inline-block bg-[#0A0A0A] rounded-xl p-4 border border-white/[0.08]">
                      <p className="text-[11px] tracking-widest uppercase text-[#6A655C] mb-2">Requisitos para participar</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center text-[#F5F1E8] font-mono border border-white/10">
                          {r.appointmentsDone}/{r.min_appointments}
                        </div>
                        <div>
                          <p className="text-sm text-[#F5F1E8]">Cortes completados</p>
                          <p className="text-xs text-[#C56B5A] mt-0.5">Te {r.missing === 1 ? 'falta 1 corte' : `faltan ${r.missing} cortes`} para obtener tu ticket.</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-[#6A655C] mt-5 flex items-center gap-1.5">
                    <Icon name="Calendar" size={12} />
                    El sorteo se realizará el {r.draw_date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-8 rounded-2xl text-center">
            <Icon name="Gift" size={32} className="mx-auto text-[#6A655C] mb-3" />
            <p className="text-[#9A9489]">No hay sorteos activos en este momento.</p>
          </div>
        )}
      </div>

      {/* Historial de Sorteos (Pasados) */}
      <div className="mt-12 pt-12 border-t border-white/[0.06]">
        <h2 className="text-xl font-medium text-[#F5F1E8] mb-6 flex items-center gap-2 opacity-80">
          <Icon name="History" size={20} className="text-[#C9A86A]" />
          Historial de Sorteos
        </h2>
        {loading ? (
          <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-[#C9A86A] border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : pastTickets.length > 0 ? (
          <div className="grid gap-4 opacity-80">
            {pastTickets.map(ticket => {
              const r = ticket.raffles;
              return (
                <div key={ticket.ticket_number} className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-base font-medium text-[#F5F1E8]">{r.title}</h3>
                      <p className="text-xs text-[#9A9489] mt-0.5">Fecha: {r.draw_date}</p>
                    </div>
                    <span className="inline-flex px-2 py-1 text-[10px] uppercase tracking-wider rounded-md bg-white/5 text-[#6A655C] border border-white/10">
                      Finalizado
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <div className="flex-1 bg-[#0A0A0A] rounded-lg p-3 border border-white/5">
                      <p className="text-[10px] tracking-widest uppercase text-[#6A655C] mb-1">Tu Ticket</p>
                      <p className="font-mono text-lg text-[#F5F1E8]">{ticket.ticket_number}</p>
                    </div>
                    
                    <div className={`flex-1 rounded-lg p-3 border ${r.winner_ticket_number === ticket.ticket_number ? 'bg-[#7FA86A]/10 border-[#7FA86A]/20' : 'bg-[#0A0A0A] border-white/5'}`}>
                      <p className="text-[10px] tracking-widest uppercase text-[#6A655C] mb-1">Ticket Ganador</p>
                      <p className={`font-mono text-lg ${r.winner_ticket_number === ticket.ticket_number ? 'text-[#7FA86A]' : 'text-[#E8C77E]'}`}>
                        {r.winner_ticket_number || 'Pendiente'}
                      </p>
                      {r.winner_ticket_number === ticket.ticket_number && (
                        <p className="text-xs text-[#7FA86A] mt-1 font-medium">¡Fuiste el ganador!</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel p-8 rounded-2xl text-center opacity-70">
            <Icon name="History" size={32} className="mx-auto text-[#6A655C] mb-3" />
            <p className="text-[#9A9489]">Aún no has participado en ningún sorteo pasado.</p>
          </div>
        )}
      </div>

    </div>
  );
}
