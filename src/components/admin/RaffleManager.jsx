import React, { useState, useEffect } from 'react';
import { Icon } from '../Shared';
import raffleService from '../../services/raffleService';

export default function RaffleManager() {
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Formulario nuevo sorteo
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    prize: '',
    draw_date: '',
    start_date: '',
    end_date: '',
    min_appointments: 1
  });

  useEffect(() => {
    loadRaffles();
  }, []);

  const loadRaffles = async () => {
    setLoading(true);
    try {
      const data = await raffleService.getAllRaffles();
      setRaffles(data || []);
    } catch (err) {
      console.error(err);
      setRaffles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await raffleService.createRaffle(form);
      setShowForm(false);
      setForm({ title: '', prize: '', draw_date: '', start_date: '', end_date: '', min_appointments: 1 });
      loadRaffles();
    } catch (err) {
      alert("Error al crear sorteo: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateTickets = async (raffleId) => {
    setIsProcessing(true);
    try {
      const result = await raffleService.generateTicketsForRaffle(raffleId);
      alert(result.message);
    } catch (err) {
      alert("Error al generar tickets: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrawWinner = async (raffleId) => {
    if (!confirm('¿Estás seguro de realizar el sorteo ahora? Esta acción no se puede deshacer.')) return;
    setIsProcessing(true);
    try {
      const winner = await raffleService.drawWinner(raffleId);
      alert(`¡Sorteo finalizado!\nEl ganador es: ${winner.winner.first_name} ${winner.winner.first_lastname}\nTicket: ${winner.winner_ticket_number}`);
      loadRaffles();
    } catch (err) {
      alert("Error al realizar el sorteo: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const activeRaffles = raffles.filter(r => r.status === 'active');
  const pastRaffles = raffles.filter(r => r.status === 'completed');

  return (
    <div className="animate-in space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-medium text-[#F5F1E8]">Sorteos y Fidelización</h3>
          <p className="text-sm text-[#9A9489] mt-1">Crea dinámicas para premiar a tus clientes más fieles.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn-gold px-5 py-2.5 text-sm font-semibold rounded-full flex items-center justify-center gap-2"
        >
          <Icon name={showForm ? 'X' : 'Plus'} size={16} />
          {showForm ? 'Cancelar' : 'Nuevo Sorteo'}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="glass-panel p-6 rounded-2xl animate-in slide-in-from-top-2 border border-[#C9A86A]/20">
          <h4 className="text-sm font-semibold tracking-widest uppercase text-[#C9A86A] mb-4">Detalles del Nuevo Sorteo</h4>
          <form onSubmit={handleCreate} className="space-y-4">
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#6A655C] mb-1.5">Fecha de Inicio (Cortes)</label>
                <input required type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} className="w-full bg-black/50 border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-[#F5F1E8] focus:border-[#C9A86A] outline-none [color-scheme:dark]" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#6A655C] mb-1.5">Fecha de Fin (Cortes)</label>
                <input required type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} className="w-full bg-black/50 border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-[#F5F1E8] focus:border-[#C9A86A] outline-none [color-scheme:dark]" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#6A655C] mb-1.5">Fecha del Sorteo</label>
                <input required type="date" value={form.draw_date} onChange={e => setForm({...form, draw_date: e.target.value})} className="w-full bg-black/50 border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-[#F5F1E8] focus:border-[#C9A86A] outline-none [color-scheme:dark]" />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#6A655C] mb-1.5">Cortes Mínimos Requeridos</label>
              <input required type="number" min="1" value={form.min_appointments} onChange={e => setForm({...form, min_appointments: e.target.value})} className="w-full sm:w-1/3 bg-black/50 border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-[#F5F1E8] focus:border-[#C9A86A] outline-none" />
              <p className="text-xs text-[#9A9489] mt-1">Los clientes deben tener al menos esta cantidad de citas completadas en el rango de fechas para recibir un ticket.</p>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={isProcessing} className="bg-[#C9A86A] text-[#1A1408] px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#E8C77E] transition disabled:opacity-50">
                {isProcessing ? 'Guardando...' : 'Crear Sorteo'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sorteos Activos */}
      <div>
        <h4 className="text-sm font-semibold tracking-widest uppercase text-[#9A9489] mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Sorteos Activos
        </h4>
        
        {loading ? (
          <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-[#C9A86A] border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : activeRaffles.length === 0 ? (
          <div className="glass-panel p-6 rounded-xl text-center text-[#6A655C] text-sm">No hay sorteos activos en este momento.</div>
        ) : (
          <div className="grid gap-4">
            {activeRaffles.map(r => (
              <div key={r.id} className="glass-panel p-5 rounded-xl border-l-4 border-l-[#C9A86A] flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <h5 className="text-lg font-medium text-[#F5F1E8]">{r.title}</h5>
                  <p className="text-sm text-[#C9A86A] mb-3">Premio: {r.prize}</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="block text-[#6A655C] uppercase tracking-wider mb-0.5">Rango de Cortes</span>
                      <span className="text-[#9A9489]">{r.start_date} al {r.end_date}</span>
                    </div>
                    <div>
                      <span className="block text-[#6A655C] uppercase tracking-wider mb-0.5">Mínimo</span>
                      <span className="text-[#9A9489]">{r.min_appointments} citas</span>
                    </div>
                    <div>
                      <span className="block text-[#6A655C] uppercase tracking-wider mb-0.5">Fecha de Sorteo</span>
                      <span className="text-[#F5F1E8] font-medium">{r.draw_date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <button 
                    onClick={() => handleGenerateTickets(r.id)}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-white/5 border border-white/10 text-sm text-[#F5F1E8] rounded-lg hover:bg-white/10 transition flex items-center justify-center gap-2"
                  >
                    <Icon name="Users" size={14} /> Asignar Tickets
                  </button>
                  <button 
                    onClick={() => handleDrawWinner(r.id)}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-[#C9A86A] text-[#1A1408] text-sm font-semibold rounded-lg hover:bg-[#E8C77E] transition flex items-center justify-center gap-2"
                  >
                    <Icon name="Crown" size={14} /> Realizar Sorteo
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historial */}
      <div className="pt-8 border-t border-white/[0.06]">
        <h4 className="text-sm font-semibold tracking-widest uppercase text-[#6A655C] mb-4">Historial de Ganadores</h4>
        
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Sorteo</th>
                <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Premio</th>
                <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Fecha</th>
                <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Ganador</th>
                <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Ticket</th>
              </tr>
            </thead>
            <tbody>
              {!loading && pastRaffles.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-[#6A655C] text-sm">No hay sorteos finalizados.</td></tr>
              ) : (
                pastRaffles.map(r => (
                  <tr key={r.id} className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 text-sm text-[#F5F1E8]">{r.title}</td>
                    <td className="px-5 py-3.5 text-sm text-[#9A9489]">{r.prize}</td>
                    <td className="px-5 py-3.5 text-xs text-[#6A655C]">{r.draw_date}</td>
                    <td className="px-5 py-3.5 text-sm text-[#E8C77E] font-medium">
                      {r.winner ? `${r.winner.first_name} ${r.winner.first_lastname}` : '—'}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-sm text-[#7FA86A]">{r.winner_ticket_number || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
