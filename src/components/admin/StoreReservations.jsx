import React, { useState, useEffect } from 'react';
import { Icon } from '../Shared';
import { formatCOP } from '../../data/cenitData';
import storeService from '../../services/storeService';

export default function StoreReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const loadReservations = async () => {
    setLoading(true);
    try {
      const data = await storeService.getActiveReservations();
      setReservations(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
    // Auto-refresh cada 1 minuto
    const interval = setInterval(loadReservations, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id, action) => {
    const isSold = action === 'sold';
    const message = isSold 
      ? '¿Confirmas que el cliente ya pagó y se entregó el producto? Esto descontará el stock definitivamente.'
      : '¿Deseas cancelar esta reserva y liberar el producto para otros clientes?';
    
    if (!confirm(message)) return;

    setProcessingId(id);
    try {
      await storeService.updateReservationStatus(id, action);
      loadReservations();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading && !reservations.length) {
    return <div className="text-sm text-[#9A9489]">Cargando reservas activas...</div>;
  }

  return (
    <div className="animate-in space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-[#F5F1E8]">Reservas Activas (1 Hora)</h3>
        <p className="text-sm text-[#9A9489]">Gestiona los productos apartados. Las reservas expiran automáticamente 1 hora después de su creación.</p>
      </div>

      <div className="grid gap-4">
        {reservations.length === 0 ? (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 text-center text-sm text-[#6A655C]">
            No hay reservas activas en este momento.
          </div>
        ) : (
          reservations.map(res => {
            const isExpiringSoon = new Date(res.expires_at).getTime() - new Date().getTime() < 15 * 60000; // Menos de 15 mins
            const user = res.users || {};
            const p = res.products || {};
            const isProcessing = processingId === res.id;

            return (
              <div key={res.id} className="glass-panel p-5 rounded-xl border-l-4 border-l-[#C9A86A] flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-[#F5F1E8]">
                      {user.first_name} {user.first_lastname}
                    </span>
                    <span className="text-xs text-[#9A9489]">{user.phone}</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm">
                    <span className="text-[#C9A86A]">{p.name}</span>
                    <span className="hidden sm:block text-[#3A3340]">•</span>
                    <span className="font-mono text-[#E8C77E]">{formatCOP(p.price)}</span>
                  </div>
                  
                  <div className={`text-xs px-3 py-1 rounded-full flex items-center gap-1.5 ${
                    isExpiringSoon ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-[#C9A86A]/10 text-[#C9A86A] border border-[#C9A86A]/20'
                  }`}>
                    <Icon name="Clock" size={12} />
                    Expira: {new Date(res.expires_at).toLocaleString('es-CO', {day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      disabled={isProcessing}
                      onClick={() => handleAction(res.id, 'cancelled')}
                      className="flex-1 sm:flex-none px-4 py-2 border border-white/[0.08] text-xs text-[#F5F1E8] rounded-lg hover:bg-white/[0.04] transition disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button 
                      disabled={isProcessing}
                      onClick={() => handleAction(res.id, 'sold')}
                      className="flex-1 sm:flex-none px-4 py-2 bg-[#C9A86A] text-[#1A1408] text-xs font-semibold rounded-lg hover:bg-[#E8C77E] transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      <Icon name="CheckCircle" size={14} /> Vendido
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
