import React, { useState, useEffect } from 'react';
import { Icon } from '../Shared';
import raffleService from '../../services/raffleService';

export default function RaffleManager() {
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Participant viewing state
  const [viewingParticipants, setViewingParticipants] = useState(null); // raffle id
  const [participantsList, setParticipantsList] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [drawResult, setDrawResult] = useState(null);

  const [form, setForm] = useState({
    title: '',
    prize: '',
    start_date: '',
    end_date: '',
    draw_date: '',
    min_appointments: 0
  });

  const loadRaffles = async () => {
    setLoading(true);
    try {
      const data = await raffleService.getAllRaffles();
      setRaffles(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRaffles();
  }, []);

  const handleEdit = (raffle) => {
    setForm({
      title: raffle.title,
      prize: raffle.prize,
      start_date: raffle.start_date,
      end_date: raffle.end_date,
      draw_date: raffle.draw_date,
      min_appointments: raffle.min_appointments
    });
    setEditingId(raffle.id);
    setShowForm(true);
    setViewingParticipants(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      if (editingId) {
        await raffleService.updateRaffle(editingId, form);
      } else {
        await raffleService.createRaffle(form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ title: '', prize: '', start_date: '', end_date: '', draw_date: '', min_appointments: 0 });
      loadRaffles();
    } catch (err) {
      alert("Error guardando el sorteo: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar este sorteo permanentemente?')) {
      try {
        await raffleService.deleteRaffle(id);
        loadRaffles();
        if (viewingParticipants === id) setViewingParticipants(null);
      } catch (err) {
        alert("Error: " + err.message);
      }
    }
  };

  const handleViewParticipants = async (raffleId) => {
    setViewingParticipants(raffleId);
    setParticipantsLoading(true);
    setDrawResult(null);
    try {
      const result = await raffleService.getEligibleParticipants(raffleId);
      setParticipantsList(result.participants || []);
    } catch (err) {
      alert("Error: " + err.message);
      setViewingParticipants(null);
    } finally {
      setParticipantsLoading(false);
    }
  };

  const handleDraw = async (raffleId) => {
    if (!participantsList || participantsList.length === 0) {
      alert("No hay participantes elegibles para realizar el sorteo.");
      return;
    }
    if (!confirm(`¿Realizar el sorteo ahora entre los ${participantsList.length} participantes?`)) return;

    setIsProcessing(true);
    try {
      // Small animation delay for UX
      let counter = 0;
      const interval = setInterval(() => {
        setDrawResult({ name: participantsList[Math.floor(Math.random() * participantsList.length)].name, animating: true });
        counter++;
        if (counter > 10) {
          clearInterval(interval);
        }
      }, 100);

      const updated = await raffleService.drawWinner(raffleId, participantsList);
      
      setTimeout(() => {
        setDrawResult({ name: updated.winner_name, animating: false });
        loadRaffles();
      }, 1200);

    } catch (err) {
      alert("Error en el sorteo: " + err.message);
      setDrawResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="animate-in space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-medium text-[#F5F1E8]">Sorteos</h3>
          <p className="text-sm text-[#9A9489] mt-1">Configura sorteos para premiar a tus clientes más fieles.</p>
        </div>
        {!showForm && (
          <button onClick={() => {
            setForm({ title: '', prize: '', start_date: '', end_date: '', draw_date: '', min_appointments: 0 });
            setEditingId(null);
            setShowForm(true);
            setViewingParticipants(null);
          }} className="px-5 py-2.5 bg-[#C9A86A] text-[#1A1408] text-sm font-semibold rounded-lg hover:bg-[#E8C77E] transition flex items-center gap-2">
            <Icon name="Plus" size={16} /> Crear Sorteo
          </button>
        )}
      </div>

      {showForm && (
        <div className="glass-panel p-6 rounded-2xl animate-in slide-in-from-top-2 border border-[#C9A86A]/20">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold tracking-widest uppercase text-[#C9A86A]">
              {editingId ? 'Editar Sorteo' : 'Detalles del Nuevo Sorteo'}
            </h4>
            <button type="button" onClick={() => setShowForm(false)} className="text-[#6A655C] hover:text-[#F5F1E8]">
              <Icon name="X" size={18} />
            </button>
          </div>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#6A655C] mb-1.5">Título del sorteo</label>
                <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Ej. Sorteo Navideño" className="w-full bg-black/50 border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-[#F5F1E8] focus:border-[#C9A86A] outline-none" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#6A655C] mb-1.5">Premio</label>
                <input required type="text" value={form.prize} onChange={e => setForm({...form, prize: e.target.value})} placeholder="Ej. Corte + Barba Gratis" className="w-full bg-black/50 border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-[#F5F1E8] focus:border-[#C9A86A] outline-none" />
              </div>
            </div>
            
            <div className="p-4 rounded-xl border border-white/[0.08] bg-black/20">
              <label className="block text-xs uppercase tracking-wider text-[#6A655C] mb-3">Período del sorteo</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { label: 'Este mes', fn: () => {
                    const now = new Date();
                    const start = new Date(now.getFullYear(), now.getMonth(), 1);
                    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                    const draw = new Date(end); draw.setDate(draw.getDate() + 1);
                    return { start_date: start.toISOString().split('T')[0], end_date: end.toISOString().split('T')[0], draw_date: draw.toISOString().split('T')[0] };
                  }},
                  { label: 'Próximos 15 días', fn: () => {
                    const now = new Date();
                    const end = new Date(now); end.setDate(end.getDate() + 15);
                    const draw = new Date(end); draw.setDate(draw.getDate() + 1);
                    return { start_date: now.toISOString().split('T')[0], end_date: end.toISOString().split('T')[0], draw_date: draw.toISOString().split('T')[0] };
                  }},
                  { label: 'Próximo mes', fn: () => {
                    const now = new Date();
                    const start = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                    const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);
                    const draw = new Date(end); draw.setDate(draw.getDate() + 1);
                    return { start_date: start.toISOString().split('T')[0], end_date: end.toISOString().split('T')[0], draw_date: draw.toISOString().split('T')[0] };
                  }},
                  { label: 'Desde hoy → fin de mes', fn: () => {
                    const now = new Date();
                    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                    const draw = new Date(end); draw.setDate(draw.getDate() + 1);
                    return { start_date: now.toISOString().split('T')[0], end_date: end.toISOString().split('T')[0], draw_date: draw.toISOString().split('T')[0] };
                  }}
                ].map(preset => (
                  <button key={preset.label} type="button"
                    onClick={() => setForm({ ...form, ...preset.fn() })}
                    className="px-3 py-1.5 text-xs rounded-full border border-[#C9A86A]/30 text-[#C9A86A] bg-[#C9A86A]/5 hover:bg-[#C9A86A]/15 transition"
                  >{preset.label}</button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#6A655C] mb-1">Inicio cortes</label>
                  <input required type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} className="w-full bg-black/50 border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-[#F5F1E8] focus:border-[#C9A86A] outline-none [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#6A655C] mb-1">Fin cortes</label>
                  <input required type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} className="w-full bg-black/50 border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-[#F5F1E8] focus:border-[#C9A86A] outline-none [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#6A655C] mb-1">Fecha del sorteo</label>
                  <input required type="date" value={form.draw_date} onChange={e => setForm({...form, draw_date: e.target.value})} className="w-full bg-black/50 border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-[#F5F1E8] focus:border-[#C9A86A] outline-none [color-scheme:dark]" />
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/2">
              <label className="block text-xs uppercase tracking-wider text-[#6A655C] mb-1.5">Cortes Mínimos Requeridos</label>
              <input required type="number" min="0" value={form.min_appointments} onChange={e => setForm({...form, min_appointments: e.target.value})} className="w-full bg-black/50 border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-[#F5F1E8] focus:border-[#C9A86A] outline-none" />
              <p className="text-xs text-[#9A9489] mt-1">Cantidad de citas para participar (0 = todos participan).</p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button type="submit" disabled={isProcessing} className="bg-[#C9A86A] text-[#1A1408] px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#E8C77E] transition disabled:opacity-50">
                {isProcessing ? 'Guardando...' : (editingId ? 'Guardar Cambios' : 'Crear Sorteo')}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-lg text-sm text-[#9A9489] hover:bg-white/[0.04] transition">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Sorteos */}
      {loading ? (
        <div className="p-12 flex justify-center"><div className="w-8 h-8 border-2 border-[#C9A86A] border-t-transparent rounded-full animate-spin" /></div>
      ) : raffles.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <Icon name="Gift" size={48} className="mx-auto text-[#6A655C] mb-4" />
          <h3 className="text-xl font-medium text-[#F5F1E8]">No hay sorteos</h3>
          <p className="text-[#9A9489] mt-2">Crea tu primer sorteo para empezar a premiar a tus clientes.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {raffles.map(raffle => {
            const isCompleted = raffle.status === 'completed';
            const isViewing = viewingParticipants === raffle.id;
            
            return (
              <div key={raffle.id} className="glass-panel rounded-xl overflow-hidden border border-white/[0.06]">
                <div className="p-5 sm:p-6 flex flex-col md:flex-row gap-6 justify-between items-start">
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-full border ${isCompleted ? 'bg-white/5 text-[#6A655C] border-white/10' : 'bg-[#C9A86A]/10 text-[#C9A86A] border-[#C9A86A]/20'}`}>
                        {isCompleted ? 'Finalizado' : 'Activo'}
                      </span>
                      <span className="text-xs text-[#9A9489] flex items-center gap-1">
                        <Icon name="Calendar" size={12} /> {raffle.draw_date}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-medium text-[#F5F1E8] mb-1">{raffle.title}</h3>
                    <p className="text-[#E8C77E] text-sm mb-4">Premio: {raffle.prize}</p>
                    
                    <div className="flex flex-wrap gap-4 text-xs">
                      <div className="bg-black/30 rounded-lg px-3 py-2 border border-white/[0.04]">
                        <span className="text-[#6A655C] block mb-0.5">Período de cortes</span>
                        <span className="text-[#F5F1E8]">{raffle.start_date} al {raffle.end_date}</span>
                      </div>
                      <div className="bg-black/30 rounded-lg px-3 py-2 border border-white/[0.04]">
                        <span className="text-[#6A655C] block mb-0.5">Requisito</span>
                        <span className="text-[#F5F1E8]">{raffle.min_appointments === 0 ? 'Participan Todos' : `${raffle.min_appointments} Cortes Mínimos`}</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-64 shrink-0 space-y-3">
                    {isCompleted ? (
                      <>
                        <div className="bg-[#7FA86A]/10 border border-[#7FA86A]/20 rounded-xl p-4 text-center">
                          <p className="text-[10px] uppercase tracking-widest text-[#7FA86A] mb-1">Ganador del Sorteo</p>
                          <p className="text-lg font-medium text-[#F5F1E8]">{raffle.winner_name || raffle.winner_ticket_number || 'Ganador'}</p>
                        </div>
                        <button onClick={() => handleDelete(raffle.id)} disabled={isProcessing} className="w-full px-4 py-2 border border-white/[0.08] text-xs text-red-400 rounded-lg hover:bg-red-500/10 transition flex justify-center items-center">
                          Eliminar Historial
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => isViewing ? setViewingParticipants(null) : handleViewParticipants(raffle.id)}
                          disabled={isProcessing}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-[#F5F1E8] text-sm rounded-lg hover:bg-white/10 transition flex items-center justify-center gap-2"
                        >
                          <Icon name="Users" size={16} /> {isViewing ? 'Ocultar Participantes' : 'Ver Participantes'}
                        </button>
                        
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(raffle)} disabled={isProcessing} className="flex-1 px-4 py-2 border border-white/[0.08] text-xs text-[#F5F1E8] rounded-lg hover:bg-white/[0.04] transition flex justify-center items-center">
                            Editar
                          </button>
                          <button onClick={() => handleDelete(raffle.id)} disabled={isProcessing} className="px-4 py-2 border border-white/[0.08] text-xs text-red-400 rounded-lg hover:bg-red-500/10 transition flex justify-center items-center">
                            Eliminar
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Participants View */}
                {isViewing && !isCompleted && (
                  <div className="border-t border-white/[0.06] bg-black/20 p-5 sm:p-6 animate-in slide-in-from-top-2">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-[#F5F1E8] flex items-center gap-2">
                        <Icon name="Users" size={16} className="text-[#C9A86A]" />
                        Participantes Elegibles
                      </h4>
                      <button 
                        onClick={() => handleDraw(raffle.id)}
                        disabled={participantsLoading || participantsList.length === 0 || isProcessing}
                        className="px-5 py-2 bg-gradient-to-r from-[#C9A86A] to-[#E8C77E] text-[#1A1408] text-sm font-bold rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2 shadow-[0_0_15px_rgba(201,168,106,0.3)]"
                      >
                        <Icon name="Play" size={14} fill="currentColor" /> Realizar Sorteo
                      </button>
                    </div>

                    {drawResult ? (
                      <div className="py-12 text-center animate-in zoom-in-95 duration-500">
                        <div className={`text-[10px] uppercase tracking-widest mb-3 ${drawResult.animating ? 'text-[#C9A86A] animate-pulse' : 'text-[#7FA86A]'}`}>
                          {drawResult.animating ? 'Sorteando...' : '¡Tenemos un ganador!'}
                        </div>
                        <div className={`font-display text-4xl sm:text-5xl ${drawResult.animating ? 'text-[#9A9489] blur-[1px]' : 'text-[#F5F1E8]'}`}>
                          {drawResult.name}
                        </div>
                        {!drawResult.animating && (
                          <div className="mt-6 flex justify-center">
                            <Icon name="Trophy" size={48} className="text-[#E8C77E]" />
                          </div>
                        )}
                      </div>
                    ) : participantsLoading ? (
                      <div className="p-8 flex justify-center"><div className="w-5 h-5 border-2 border-[#C9A86A] border-t-transparent rounded-full animate-spin" /></div>
                    ) : participantsList.length === 0 ? (
                      <div className="text-center py-8 text-sm text-[#6A655C]">
                        Ningún cliente cumple los requisitos para participar.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {participantsList.map((p, i) => (
                          <div key={i} className="bg-white/[0.03] border border-white/[0.05] rounded-lg p-3 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-[#9A9489] text-xs font-medium">
                              {i + 1}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm text-[#F5F1E8] truncate">{p.name}</p>
                              {p.phone && <p className="text-[10px] text-[#6A655C] truncate">{p.phone}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
