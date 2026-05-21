import React, { useState, useEffect } from 'react';
import { Icon } from '../Shared';
import { formatCOP } from '../../data/cenitData';
import appointmentsService from '../../services/appointmentsService';
import { KPI } from './AdminShared';
const STATUS_MAP = {
  confirmed: { label: 'Confirmada', cls: 'text-[#C9A86A] bg-[#C9A86A]/10 border-[#C9A86A]/30' },
  'in-chair': { label: 'En silla', cls: 'text-[#7FA86A] bg-[#7FA86A]/10 border-[#7FA86A]/30' },
  pending: { label: 'Pendiente', cls: 'text-[#9A9489] bg-[#9A9489]/10 border-[#9A9489]/30' },
  completed: { label: 'Completada', cls: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
  cancelled: { label: 'Cancelada', cls: 'text-red-400 bg-red-400/10 border-red-400/30' },
  'no-show': { label: 'No Show', cls: 'text-orange-400 bg-orange-400/10 border-orange-400/30' }
};



function AppointmentsTable({ appointments, onUpdateStatus }) {
  if (appointments.length === 0) {
    return (
      <div className="p-8 text-center text-[#6A655C] text-sm">
        No hay citas para mostrar.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/[0.06]">
            <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Fecha/Hora</th>
            <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Cliente</th>
            <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Servicio</th>
            <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Estado</th>
            <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map(a => (
            <tr key={a.id} className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
              <td className="px-5 py-3.5">
                <div className="font-mono text-sm text-[#E8C77E]">{a.appointment_time?.slice(0,5)}</div>
                <div className="text-xs text-[#9A9489]">{a.appointment_date}</div>
              </td>
              <td className="px-5 py-3.5">
                <div className="text-sm text-[#F5F1E8]">
                  {a.guest_name ? (
                    <>{a.guest_name} <span className="text-xs text-[#6A655C] font-normal">(de {a.client_name})</span></>
                  ) : (
                    a.client_name
                  )}
                </div>
                <div className="text-xs text-[#9A9489]">{a.client_phone}</div>
              </td>
              <td className="px-5 py-3.5">
                <div className="text-sm text-[#F5F1E8]">{a.services?.name || 'Servicio'}</div>
                <div className="text-xs text-[#C9A86A]">{formatCOP(a.services?.price || 0)}</div>
              </td>
              <td className="px-5 py-3.5">
                <span className={`inline-flex px-2.5 py-1 text-[10px] tracking-wider uppercase rounded-full border ${STATUS_MAP[a.status]?.cls || STATUS_MAP.pending.cls}`}>
                  {STATUS_MAP[a.status]?.label || a.status}
                </span>
              </td>
              <td className="px-5 py-3.5 text-right">
                <div className="flex items-center justify-end gap-2">
                  {(a.status === 'pending' || a.status === 'confirmed' || a.status === 'in-chair') && (
                    <>
                      <button onClick={() => onUpdateStatus(a.id, 'completed')} className="p-1.5 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20 transition flex items-center gap-1.5 text-xs px-2" title="Marcar como Realizado">
                        <Icon name="CheckCircle" size={14} />
                        <span className="hidden sm:inline">Realizado</span>
                      </button>
                      <button onClick={() => onUpdateStatus(a.id, 'cancelled')} className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition flex items-center gap-1.5 text-xs px-2" title="Cancelar Cita">
                        <Icon name="X" size={14} />
                        <span className="hidden sm:inline">Cancelar</span>
                      </button>
                      <button onClick={() => onUpdateStatus(a.id, 'no-show')} className="p-1.5 bg-orange-500/10 text-orange-400 rounded hover:bg-orange-500/20 transition flex items-center gap-1.5 text-xs px-2" title="El cliente no se presentó">
                        <Icon name="UserMinus" size={14} />
                        <span className="hidden xl:inline">No Show</span>
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DashboardView() {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadTodayAppointments = async () => {
      if (isMounted) setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const data = await appointmentsService.getAllAppointments({ date: today });
      if (isMounted) {
        setCitas(data || []);
        setLoading(false);
      }
    };
    loadTodayAppointments();
    return () => { isMounted = false; };
  }, []);

  const reloadTodayAppointments = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const data = await appointmentsService.getAllAppointments({ date: today });
    setCitas(data || []);
    setLoading(false);
  };

  const handleUpdateStatus = async (id, status) => {
    await appointmentsService.updateAppointment(id, { status });
    reloadTodayAppointments(); // Recargar después de actualizar
  };

  const handleCloseDay = async (status) => {
    const pendings = citas.filter(c => ['pending', 'confirmed', 'in-chair'].includes(c.status));
    if (pendings.length === 0) {
      alert("No hay citas pendientes para cerrar.");
      return;
    }
    const label = status === 'completed' ? 'COMPLETADAS' : 'NO-SHOW (No asistieron)';
    if (!confirm(`¿Estás seguro de marcar las ${pendings.length} citas restantes de hoy como ${label}?`)) return;
    
    setLoading(true);
    try {
      await Promise.all(pendings.map(c => appointmentsService.updateAppointment(c.id, { status })));
      await reloadTodayAppointments();
    } catch (err) {
      alert("Error cerrando jornada: " + err.message);
      setLoading(false);
    }
  };

  const todayCitas = citas.length;
  const completedOrConfirmed = citas.filter(c => ['completed', 'in-chair', 'confirmed'].includes(c.status));
  const totalIngresos = completedOrConfirmed.reduce((sum, c) => sum + (c.services?.price || 0), 0);
  
  // Buscar próxima cita pendiente o confirmada que no haya pasado
  const nowTime = new Date().toTimeString().slice(0,5);
  const proximaCita = citas
    .filter(c => (c.status === 'pending' || c.status === 'confirmed') && c.appointment_time >= nowTime)
    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))[0];

  return (
    <div className="space-y-6 animate-in">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KPI label="Citas hoy" value={String(todayCitas).padStart(2, '0')} icon="Calendar" />
        <KPI label="Ingresos esperados/hoy" value={formatCOP(totalIngresos)} icon="TrendingUp" />
        <KPI label="Próxima cita" value={proximaCita ? proximaCita.appointment_time.slice(0,5) : '—'} icon="Clock" />
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.06] gap-4">
          <h3 className="text-lg font-medium text-[#F5F1E8]">Citas de Hoy</h3>
          <div className="flex items-center gap-3">
            <button onClick={() => handleCloseDay('completed')} className="text-xs px-3 py-1.5 rounded-full border border-blue-500/30 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 transition">
              Aprobar Restantes
            </button>
            <button onClick={() => handleCloseDay('no-show')} className="text-xs px-3 py-1.5 rounded-full border border-orange-500/30 text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 transition">
              Rechazar Restantes
            </button>
            <div className="w-[1px] h-4 bg-white/[0.1] mx-1"></div>
            <button onClick={reloadTodayAppointments} className="text-[#9A9489] hover:text-[#C9A86A] transition" title="Actualizar">
              <Icon name="RefreshCw" size={16} />
            </button>
          </div>
        </div>
        {loading ? (
          <div className="p-8 flex justify-center"><div className="w-6 h-6 border-2 border-[#C9A86A] border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <AppointmentsTable appointments={citas} onUpdateStatus={handleUpdateStatus} />
        )}
      </div>
    </div>
  );
}

export function CitasView() {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadAllAppointments = async () => {
      if (isMounted) setLoading(true);
      const data = await appointmentsService.getAllAppointments();
      if (isMounted) {
        setCitas(data || []);
        setLoading(false);
      }
    };
    loadAllAppointments();
    return () => { isMounted = false; };
  }, []);

  const reloadAllAppointments = async () => {
    setLoading(true);
    const data = await appointmentsService.getAllAppointments();
    setCitas(data || []);
    setLoading(false);
  };

  const handleUpdateStatus = async (id, status) => {
    await appointmentsService.updateAppointment(id, { status });
    reloadAllAppointments();
  };

  return (
    <div className="animate-in">
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="text-lg font-medium text-[#F5F1E8]">Historial Completo de Citas</h3>
          <button onClick={reloadAllAppointments} className="text-[#9A9489] hover:text-[#C9A86A] transition">
            <Icon name="RefreshCw" size={16} />
          </button>
        </div>
        {loading ? (
          <div className="p-8 flex justify-center"><div className="w-6 h-6 border-2 border-[#C9A86A] border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <AppointmentsTable appointments={citas} onUpdateStatus={handleUpdateStatus} />
        )}
      </div>
    </div>
  );
}
