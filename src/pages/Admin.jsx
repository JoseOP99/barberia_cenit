import React, { useState } from 'react';
import { Icon, Logo } from '../components/Shared';
import { CENIT_DATA, OPERATING_HOURS, formatCOP } from '../data/cenitData';
import { useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { id: 'dashboard', icon: 'LayoutDashboard', label: 'Dashboard' },
  { id: 'citas', icon: 'Calendar', label: 'Citas' },
  { id: 'horario', icon: 'Clock', label: 'Horario' },
  { id: 'ajustes', icon: 'Settings', label: 'Ajustes' },
];

export default function Admin() {
  const [view, setView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex text-white bg-[#0A0A0A]">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 w-56 bg-[#0E0D0C] border-r border-white/[0.06] flex flex-col transition-transform lg:translate-x-0 lg:static ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-5 border-b border-white/[0.06]">
          <Logo size={28} />
          <div className="text-[10px] tracking-widest uppercase text-[#6A655C] mt-2">Admin</div>
        </div>
        <nav className="flex-1 py-3">
          {NAV_ITEMS.map(it => (
            <button
              key={it.id}
              onClick={() => { setView(it.id); setSidebarOpen(false); }}
              className={`flex items-center gap-3 px-5 py-2.5 w-full text-left text-sm transition-colors border-l-2 ${
                view === it.id
                  ? 'border-[#C9A86A] text-[#C9A86A] bg-[#C9A86A]/5'
                  : 'border-transparent text-[#9A9489] hover:text-[#F5F1E8] hover:bg-white/[0.02]'
              }`}
            >
              <Icon name={it.icon} size={16} /> {it.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E8C77E] to-[#8B6F3F] flex items-center justify-center text-xs font-semibold text-[#1A1408]">FM</div>
            <div className="text-xs text-[#F5F1E8]">Fernando Mendoza</div>
          </div>
          <button onClick={() => navigate('/')} className="w-full mt-2 text-xs text-[#9A9489] hover:text-[#F5F1E8] py-2 flex items-center justify-center gap-2 transition-colors">
            <Icon name="LogOut" size={12} /> Salir
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 px-5 sm:px-8 h-14 border-b border-white/[0.06] bg-[#0E0D0C] flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-9 h-9 rounded-lg border border-white/[0.08] flex items-center justify-center text-[#9A9489]">
            <Icon name="Menu" size={16} />
          </button>
          <div>
            <div className="text-[10px] tracking-widest uppercase text-[#6A655C]">Cénit / {view}</div>
            <h1 className="text-sm font-medium text-[#F5F1E8] capitalize">{NAV_ITEMS.find(n => n.id === view)?.label}</h1>
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-8 overflow-y-auto">
          {view === 'dashboard' && <DashboardView />}
          {view === 'citas' && <CitasView />}
          {view === 'horario' && <HorarioView />}
          {view === 'ajustes' && <PlaceholderView name="Ajustes" />}
        </main>
      </div>
    </div>
  );
}

const STATUS_MAP = {
  confirmed: { label: 'Confirmada', cls: 'text-[#C9A86A] bg-[#C9A86A]/10 border-[#C9A86A]/30' },
  'in-chair': { label: 'En silla', cls: 'text-[#7FA86A] bg-[#7FA86A]/10 border-[#7FA86A]/30' },
  pending: { label: 'Pendiente', cls: 'text-[#9A9489] bg-[#9A9489]/10 border-[#9A9489]/30' },
};

function DashboardView() {
  const todayCitas = CENIT_DATA.appointments.length;
  const totalIngresos = todayCitas * CENIT_DATA.services[0].price;
  return (
    <div className="space-y-6 animate-in">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KPI label="Citas hoy" value={String(todayCitas).padStart(2, '0')} icon="Calendar" />
        <KPI label="Ingresos hoy" value={formatCOP(totalIngresos)} icon="TrendingUp" />
        <KPI label="Próxima cita" value={CENIT_DATA.appointments.find(a => a.status === 'pending')?.time || '—'} icon="Clock" />
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-white/[0.06]">
          <h3 className="text-lg font-medium text-[#F5F1E8]">Citas del día</h3>
        </div>
        <AppointmentsTable />
      </div>
    </div>
  );
}

function CitasView() {
  return (
    <div className="animate-in">
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h3 className="text-lg font-medium text-[#F5F1E8]">Todas las citas</h3>
        </div>
        <AppointmentsTable />
      </div>
    </div>
  );
}

function HorarioView() {
  const dayLabels = {
    monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles', thursday: 'Jueves',
    friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo',
  };
  return (
    <div className="animate-in space-y-6">
      <p className="text-sm text-[#9A9489]">Configura tu horario de atención. Los cambios se aplicarán a nuevas reservas.</p>
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Día</th>
              <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Apertura</th>
              <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Cierre</th>
              <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Estado</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(OPERATING_HOURS).map(([key, hours]) => (
              <tr key={key} className="border-b border-white/[0.06] last:border-0">
                <td className="px-5 py-3.5 text-sm text-[#F5F1E8]">{dayLabels[key]}</td>
                <td className="px-5 py-3.5 font-mono text-sm text-[#9A9489]">{hours?.open || '—'}</td>
                <td className="px-5 py-3.5 font-mono text-sm text-[#9A9489]">{hours?.close || '—'}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex px-2.5 py-1 text-[10px] tracking-wider uppercase rounded-full border ${
                    hours ? 'text-[#7FA86A] bg-[#7FA86A]/10 border-[#7FA86A]/30' : 'text-[#6A655C] bg-white/[0.03] border-white/[0.06]'
                  }`}>
                    {hours ? 'Abierto' : 'Cerrado'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-[#6A655C]">Próximamente podrás editar estos horarios directamente desde aquí.</p>
    </div>
  );
}

function AppointmentsTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {['Hora', 'Cliente', 'Teléfono', 'Estado'].map(h => (
              <th key={h} className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CENIT_DATA.appointments.map(a => (
            <tr key={a.id} className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
              <td className="px-5 py-3.5 font-mono text-sm text-[#E8C77E]">{a.time}</td>
              <td className="px-5 py-3.5 text-sm text-[#F5F1E8]">{a.client}</td>
              <td className="px-5 py-3.5 text-sm text-[#9A9489]">{a.phone}</td>
              <td className="px-5 py-3.5">
                <span className={`inline-flex px-2.5 py-1 text-[10px] tracking-wider uppercase rounded-full border ${STATUS_MAP[a.status].cls}`}>
                  {STATUS_MAP[a.status].label}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function KPI({ label, value, icon }) {
  return (
    <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[#6A655C]">{label}</span>
        <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(201,168,106,0.1)' }}>
          <Icon name={icon} size={14} className="text-[#C9A86A]" />
        </span>
      </div>
      <div className="font-display text-2xl text-[#F5F1E8]">{value}</div>
    </div>
  );
}

function PlaceholderView({ name }) {
  return (
    <div className="rounded-xl p-12 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <Icon name="Construction" size={32} className="mx-auto mb-4 text-[#C9A86A]" />
      <h3 className="text-xl font-medium text-[#F5F1E8]">{name}</h3>
      <p className="text-sm text-[#6A655C] mt-2">En desarrollo.</p>
    </div>
  );
}
