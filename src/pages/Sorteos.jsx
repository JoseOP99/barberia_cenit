import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import raffleService from '../services/raffleService';
import { Icon } from '../components/Shared';

export default function Sorteos() {
  const { user } = useAuth();
  const [activeRaffles, setActiveRaffles] = useState([]);
  const [pastRaffles, setPastRaffles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadSorteos() {
      if (user?.id) {
        if (isMounted) setLoading(true);
        try {
          const allRaffles = await raffleService.getAllRaffles();
          
          if (isMounted) {
            const active = [];
            const past = [];

            // We calculate eligibility for each active raffle
            for (const r of allRaffles) {
              if (r.status === 'active') {
                const eligibility = await raffleService.isUserEligible(user.id, r.id);
                active.push({ ...r, ...eligibility });
              } else {
                past.push(r);
              }
            }
            
            setActiveRaffles(active);
            setPastRaffles(past.sort((a, b) => b.draw_date.localeCompare(a.draw_date))); // Most recent first
          }
        } catch (err) {
          console.error("Error loading sorteos:", err);
        } finally {
          if (isMounted) setLoading(false);
        }
      }
    }
    loadSorteos();
    return () => { isMounted = false; };
  }, [user]);

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
        ) : activeRaffles.length > 0 ? (
          <div className="grid gap-4">
            {activeRaffles.map(r => (
              <div key={r.id} className="relative overflow-hidden rounded-xl p-5" style={{
                background: 'linear-gradient(135deg, rgba(201, 168, 106, 0.12) 0%, rgba(201, 168, 106, 0.04) 100%)',
                border: '1px solid rgba(201, 168, 106, 0.25)'
              }}>
                <div className="absolute top-2 right-2 opacity-10">
                  <Icon name="Gift" size={48} />
                </div>
                <div className="relative z-10 flex flex-col sm:flex-row gap-5 justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-flex px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-full border bg-[#C9A86A]/15 text-[#C9A86A] border-[#C9A86A]/25">
                        Activo
                      </span>
                      <span className="text-xs text-[#6A655C] flex items-center gap-1">
                        <Icon name="Calendar" size={11} /> Sorteo: {r.draw_date}
                      </span>
                    </div>
                    <h3 className="text-xl font-medium text-[#F5F1E8] mb-1">{r.title}</h3>
                    <p className="text-sm text-[#9A9489] mb-4 sm:mb-0">Premio: <span className="text-[#E8C77E] font-medium">{r.prize}</span></p>
                  </div>
                  
                  <div className="shrink-0">
                    {r.eligible ? (
                      <div className="inline-flex items-center gap-2 bg-[#7FA86A]/10 text-[#7FA86A] border border-[#7FA86A]/20 rounded-lg px-4 py-3">
                        <Icon name="CheckCircle" size={18} />
                        <span className="text-sm font-medium">¡Estás participando!</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-3 bg-[#0E0D0C] rounded-lg px-4 py-2.5 border border-white/[0.08]">
                        <div className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center text-[#F5F1E8] font-mono text-sm border border-white/10">
                          {r.appointmentsDone}/{r.min_appointments}
                        </div>
                        <div>
                          <p className="text-xs text-[#F5F1E8]">Cortes completados</p>
                          <p className="text-[11px] text-[#C56B5A]">Te {r.missing === 1 ? 'falta 1 corte' : `faltan ${r.missing} cortes`}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Icon name="Gift" size={28} className="mx-auto text-[#6A655C] mb-2" />
            <p className="text-[#9A9489] text-sm">No hay sorteos activos en este momento.</p>
          </div>
        )}
      </div>

      {/* Historial de Sorteos (Pasados) — most recent first */}
      <div className="pt-8 border-t border-white/[0.08]">
        <h2 className="text-xl font-medium text-[#F5F1E8] mb-5 flex items-center gap-2">
          <Icon name="History" size={20} className="text-[#C9A86A]" />
          Historial de Sorteos
        </h2>
        {loading ? (
          <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-[#C9A86A] border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : pastRaffles.length > 0 ? (
          <div className="grid gap-3">
            {pastRaffles.map(r => {
              const isWinner = r.winner_user_id === user.id;
              
              return (
                <div key={r.id} className="rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-5" style={{
                  background: isWinner ? 'rgba(127, 168, 106, 0.08)' : 'rgba(255,255,255,0.04)',
                  border: isWinner ? '1px solid rgba(127, 168, 106, 0.2)' : '1px solid rgba(255,255,255,0.08)'
                }}>
                  {/* Left: Raffle info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-[#F5F1E8] truncate">{r.title}</h3>
                      <span className="shrink-0 inline-flex px-1.5 py-0.5 text-[9px] uppercase tracking-wider rounded bg-white/[0.06] text-[#6A655C]">
                        Finalizado
                      </span>
                    </div>
                    <p className="text-xs text-[#6A655C]">
                      Premio: <span className="text-[#9A9489]">{r.prize}</span> · Fecha: {r.draw_date}
                    </p>
                  </div>

                  {/* Right: Winner name or result */}
                  <div className="shrink-0 text-left sm:text-right">
                    {isWinner ? (
                      <div className="flex items-center gap-1.5 text-[#7FA86A] bg-[#7FA86A]/10 px-3 py-1.5 rounded-lg border border-[#7FA86A]/20">
                        <Icon name="Trophy" size={16} />
                        <span className="text-sm font-medium">¡Ganaste!</span>
                      </div>
                    ) : r.winner_name || r.winner_ticket_number ? (
                      <div className="bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">
                        <p className="text-[9px] tracking-widest uppercase text-[#6A655C] mb-0.5">Ganador</p>
                        <p className="text-sm text-[#E8C77E]">{r.winner_name || r.winner_ticket_number}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-[#6A655C] bg-white/5 px-2 py-1 rounded">Sin ganador</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Icon name="History" size={28} className="mx-auto text-[#6A655C] mb-2" />
            <p className="text-[#9A9489] text-sm">No hay sorteos pasados registrados.</p>
          </div>
        )}
      </div>

    </div>
  );
}
