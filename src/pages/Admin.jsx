import React, { useState } from 'react';
import { Icon, Logo } from '../components/Shared';
import { OPERATING_HOURS } from '../data/cenitData';
import { useNavigate } from 'react-router-dom';
import InventoryManager from '../components/admin/InventoryManager';
import { DashboardView, CitasView } from '../components/admin/CalendarManager';
import ServicesManager from '../components/admin/ServicesManager';
import BarbersManager from '../components/admin/BarbersManager';
import ScheduleManager from '../components/admin/ScheduleManager';
import CustomerManager from '../components/admin/CustomerManager';
import RaffleManager from '../components/admin/RaffleManager';

const NAV_ITEMS = [
  { id: 'dashboard', icon: 'LayoutDashboard', label: 'Dashboard' },
  { id: 'citas', icon: 'Calendar', label: 'Citas' },
  { id: 'clientes', icon: 'Users', label: 'Clientes' },
  { id: 'tienda', icon: 'ShoppingBag', label: 'Tienda' },
  { id: 'servicios', icon: 'Scissors', label: 'Servicios' },
  { id: 'equipo', icon: 'UserCircle', label: 'Equipo' },
  { id: 'horario', icon: 'Clock', label: 'Horario' },
  { id: 'sorteos', icon: 'Gift', label: 'Sorteos' },
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
          {view === 'clientes' && <CustomerManager />}
          {view === 'tienda' && <InventoryManager />}
          {view === 'servicios' && <ServicesManager />}
          {view === 'equipo' && <BarbersManager />}
          {view === 'horario' && <ScheduleManager />}
          {view === 'sorteos' && <RaffleManager />}
          {view === 'ajustes' && <PlaceholderView name="Ajustes Generales" />}
        </main>
      </div>
    </div>
  );
}

// Las vistas de Dashboard y Citas fueron movidas a CalendarManager.jsx

// AppointmentsTable was moved to CalendarManager.jsx

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
