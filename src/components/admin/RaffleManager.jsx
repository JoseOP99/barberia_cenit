import React, { useState, useEffect } from 'react';
import { Icon } from '../Shared';
import raffleService from '../../services/raffleService';

export default function RaffleManager() {
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [targetMonth, setTargetMonth] = useState(() => {
    // Mes actual por defecto YYYY-MM
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    loadRaffles();
  }, []);

  const loadRaffles = async () => {
    setLoading(true);
    const data = await raffleService.getRaffles();
    setRaffles(data || []);
    setLoading(false);
  };

  const handleExecuteRaffle = async () => {
    if (!targetMonth) return;
    const targetMonthStr = `${targetMonth}-01`;
    if (!confirm(`¿Ejecutar el sorteo para los clientes que asistieron en ${targetMonth}? Esto elegirá un ganador al azar.`)) return;

    setIsExecuting(true);
    try {
      await raffleService.executeMonthlyRaffle(targetMonthStr);
      alert('¡Sorteo ejecutado con éxito! Revisa la tabla para ver al ganador.');
      loadRaffles();
    } catch (err) {
      alert("Error ejecutando sorteo: " + err.message);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="animate-in space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-[#F5F1E8]">Sorteo Mensual Cénit</h3>
        <p className="text-sm text-[#9A9489]">Fideliza a tus clientes sorteando un corte gratis entre los que completaron citas este mes.</p>
      </div>

      <div className="rounded-xl border border-[#C9A86A]/30 bg-[#C9A86A]/5 p-6 mb-8 flex flex-col sm:flex-row gap-4 sm:items-end">
        <div className="flex-1">
          <label className="block text-xs text-[#C9A86A] tracking-wider uppercase mb-2">Seleccionar Mes a Sortear</label>
          <input 
            type="month" 
            value={targetMonth}
            onChange={(e) => setTargetMonth(e.target.value)}
            className="w-full sm:w-auto bg-black/50 border border-[#C9A86A]/30 rounded-lg px-4 py-2.5 text-sm text-[#F5F1E8] focus:border-[#C9A86A] outline-none" 
          />
        </div>
        <button 
          onClick={handleExecuteRaffle} 
          disabled={isExecuting}
          className="btn-gold px-6 py-2.5 text-sm font-semibold rounded disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isExecuting ? 'Sorteando...' : (
            <><Icon name="Gift" size={16} /> Ejecutar Sorteo</>
          )}
        </button>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Mes</th>
              <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Ganador</th>
              <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Premio</th>
              <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Elegibles</th>
              <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Fecha Sorteo</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="p-8 text-center text-[#9A9489] text-sm">Cargando sorteos...</td></tr>
            ) : raffles.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-[#9A9489] text-sm">Aún no has realizado ningún sorteo.</td></tr>
            ) : (
              raffles.map(r => (
                <tr key={r.id} className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-sm text-[#E8C77E]">
                      {new Date(r.raffle_month).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {r.winner ? (
                      <div>
                        <div className="text-sm font-medium text-[#F5F1E8] flex items-center gap-2">
                          <Icon name="Crown" size={14} className="text-[#C9A86A]" /> 
                          {r.winner.first_name} {r.winner.first_lastname}
                        </div>
                        <div className="text-xs text-[#9A9489] mt-0.5">{r.winner.phone || r.winner.email}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-[#6A655C]">Usuario eliminado</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex px-2.5 py-1 text-[10px] tracking-wider uppercase rounded-full border text-[#7FA86A] bg-[#7FA86A]/10 border-[#7FA86A]/30">
                      Corte Gratis
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-sm text-[#9A9489]">{r.eligible_count} clientes</td>
                  <td className="px-5 py-3.5 text-xs text-[#6A655C]">
                    {new Date(r.drawn_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
