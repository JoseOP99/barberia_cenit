import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import appointmentsService from '../services/appointmentsService';
import { Icon } from '../components/Shared';
import { formatCOP } from '../data/cenitData';

export default function Profile() {
  const { user, profile, signOut } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAppointments() {
      if (user?.id) {
        setLoading(true);
        const data = await appointmentsService.getUserAppointments(user.id);
        setAppointments(data);
        setLoading(false);
      }
    }
    loadAppointments();
  }, [user]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider rounded-full bg-[#7FA86A]/10 text-[#7FA86A] border border-[#7FA86A]/20">Confirmada</span>;
      case 'pending':
        return <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">Pendiente</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider rounded-full bg-red-500/10 text-red-500 border border-red-500/20">Cancelada</span>;
      case 'completed':
        return <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">Completada</span>;
      default:
        return <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider rounded-full bg-white/5 text-[#9A9489] border border-white/10">{status}</span>;
    }
  };

  const activeAppointments = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed');
  const pastAppointments = appointments.filter(a => a.status === 'cancelled' || a.status === 'completed' || a.status === 'rejected');

  return (
    <div className="animate-in max-w-4xl mx-auto px-5 sm:px-8 py-10 sm:py-16">
      
      <div className="flex flex-col sm:flex-row gap-8 mb-12">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#E8C77E] to-[#8B6F3F] flex items-center justify-center shrink-0 shadow-lg shadow-gold/20">
          <span className="text-3xl font-semibold text-[#1A1408]">
            {profile?.first_name?.[0]}{profile?.first_lastname?.[0]}
          </span>
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-display text-[#F5F1E8]">
            {profile?.first_name} {profile?.first_lastname}
          </h1>
          <p className="text-[#9A9489] mt-2 flex items-center gap-2">
            <Icon name="Mail" size={14} /> {profile?.email}
          </p>
          <p className="text-[#9A9489] mt-1 flex items-center gap-2">
            <Icon name="Phone" size={14} /> {profile?.phone || 'Sin teléfono'}
          </p>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-medium text-[#F5F1E8] mb-6 flex items-center gap-2">
          <Icon name="CalendarClock" size={20} className="text-[#C9A86A]" />
          Próximas Citas
        </h2>
        
        {loading ? (
          <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-[#C9A86A] border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : activeAppointments.length > 0 ? (
          <div className="grid gap-4">
            {activeAppointments.map(app => (
              <div key={app.id} className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusBadge(app.status)}
                    <span className="text-sm font-medium text-[#F5F1E8]">{app.services?.name}</span>
                  </div>
                  <div className="text-sm text-[#9A9489] flex items-center gap-4">
                    <span className="flex items-center gap-1.5"><Icon name="Calendar" size={14} /> {app.appointment_date}</span>
                    <span className="flex items-center gap-1.5"><Icon name="Clock" size={14} /> {app.appointment_time.slice(0, 5)}</span>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="font-mono text-[#E8C77E]">{formatCOP(app.services?.price || 0)}</div>
                  <div className="text-xs text-[#6A655C] mt-1">Con {app.barbers?.name}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-8 rounded-2xl text-center">
            <Icon name="CalendarX" size={32} className="mx-auto text-[#6A655C] mb-3" />
            <p className="text-[#9A9489]">No tienes citas programadas próximas.</p>
          </div>
        )}
      </div>

      {pastAppointments.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-[#F5F1E8] mb-6 opacity-80">Historial de Citas</h2>
          <div className="grid gap-3 opacity-70">
            {pastAppointments.map(app => (
              <div key={app.id} className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    {getStatusBadge(app.status)}
                    <span className="text-sm text-[#F5F1E8]">{app.services?.name}</span>
                  </div>
                  <span className="text-xs text-[#9A9489]">{app.appointment_date} • {app.appointment_time.slice(0, 5)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
