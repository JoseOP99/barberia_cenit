import React, { useState } from 'react';
import { Icon, Logo } from '../components/Shared';
import { CapVisual } from './Shop';
import { CENIT_DATA, formatCOP } from '../data/cenitData';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const [view, setView] = useState("dashboard");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex text-white font-sans" style={{ background: '#0A0A0A' }}>
      <aside className="w-[260px] shrink-0 border-r hairline flex flex-col"
             style={{ background: '#0E0D0C', borderColor: '#2A2724' }}>
        <div className="p-6 border-b hairline" style={{ borderColor: '#2A2724' }}>
          <Logo size={32}/>
          <div className="text-[9px] tracking-[0.3em] uppercase mt-3" style={{ color: '#6A655C' }}>Panel de Control</div>
        </div>

        <nav className="flex-1 py-4">
          {[
            { id: "dashboard", icon: "LayoutDashboard", label: "Dashboard" },
            { id: "citas",     icon: "Calendar",        label: "Gestión de citas" },
            { id: "inventario", icon: "Package",        label: "Inventario" },
            { id: "clientes",  icon: "Users",           label: "Clientes" },
            { id: "barberos",  icon: "Scissors",        label: "Equipo" },
            { id: "ajustes",   icon: "Settings",        label: "Ajustes" }
          ].map(it => (
            <button key={it.id}
              className={`flex items-center gap-3 px-6 py-3 w-full text-left text-sm transition-colors border-l-2
                ${view === it.id ? 'border-[#C9A86A] text-[#C9A86A] bg-[#1A1816]' : 'border-transparent text-[#9A9489] hover:bg-[#1A1816] hover:text-[#F5F1E8]'}`}
              onClick={() => setView(it.id)}>
              <Icon name={it.icon} size={16}/>
              <span>{it.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t hairline" style={{ borderColor: '#2A2724' }}>
          <div className="flex items-center gap-3 p-3 hover:bg-[#1A1816] transition-colors cursor-pointer rounded">
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-display text-sm bg-gradient-to-br from-[#E8C77E] to-[#8B6F3F]" style={{ color: '#1A1408' }}>FM</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-[#F5F1E8]">Fernando Mendoza</div>
              <div className="text-[10px] tracking-[0.15em] uppercase text-[#6A655C]">Administrador</div>
            </div>
            <Icon name="ChevronUp" size={14} className="text-[#6A655C]"/>
          </div>
          <button onClick={() => navigate('/')} className="w-full mt-2 text-[10px] tracking-[0.25em] uppercase py-2 flex items-center justify-center gap-2 text-[#9A9489] hover:text-white transition-colors">
            <Icon name="LogOut" size={12}/> Salir del panel
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-x-hidden">
        <header className="px-8 py-5 border-b flex items-center justify-between sticky top-0 z-10" style={{ borderColor: '#2A2724', background: '#0E0D0C' }}>
          <div>
            <div className="text-[10px] tracking-[0.25em] uppercase text-[#6A655C]">Cénitt / {view}</div>
            <h1 className="font-display text-2xl mt-1 capitalize text-[#F5F1E8]">
              {view === "dashboard" ? "Dashboard Principal" :
               view === "citas" ? "Gestión de Citas" :
               view === "inventario" ? "Inventario · Gorras" :
               view}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="border border-[#2A2724] px-3 py-2 flex items-center gap-2 text-xs text-[#9A9489] rounded">
              <Icon name="Search" size={14}/>
              <input placeholder="Buscar..." className="bg-transparent outline-none w-40 text-white"/>
            </div>
            <button className="w-9 h-9 border border-[#2A2724] rounded flex items-center justify-center relative hover:border-[#C9A86A] transition-colors">
              <Icon name="Bell" size={14}/>
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#C9A86A]"/>
            </button>
          </div>
        </header>

        <div className="p-8">
          {view === "dashboard" && <DashboardView />}
          {view === "citas" && <CitasView />}
          {view === "inventario" && <InventarioView />}
          {(view !== "dashboard" && view !== "citas" && view !== "inventario") && (
            <div className="border border-[#2A2724] p-20 text-center bg-[#141312]">
              <Icon name="Construction" size={32} className="mx-auto mb-4 text-[#C9A86A]"/>
              <h3 className="font-display text-2xl capitalize text-[#F5F1E8]">{view}</h3>
              <p className="text-sm mt-2 text-[#6A655C]">Esta sección está en construcción.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function KPI({ label, value, delta, icon, prefix = "" }) {
  const up = delta >= 0;
  return (
    <div className="bg-[#141312] border border-[#2A2724] p-6 relative">
      <div className="flex items-start justify-between mb-4">
        <span className="text-[10px] tracking-[0.25em] uppercase text-[#6A655C]">{label}</span>
        <Icon name={icon} size={16} className="text-[#C9A86A]"/>
      </div>
      <div className="font-display text-4xl text-[#F5F1E8]">{prefix}{value}</div>
      <div className="mt-3 flex items-center gap-2 text-xs">
        <span className={`inline-flex items-center gap-1 ${up ? 'text-[#7FA86A]' : 'text-[#C56B5A]'}`}>
          <Icon name={up ? 'TrendingUp' : 'TrendingDown'} size={12}/> {Math.abs(delta)}%
        </span>
        <span className="text-[#6A655C]">vs ayer</span>
      </div>
    </div>
  );
}

function DashboardView() {
  const statusLabel = {
    confirmed: { label: "Confirmada", cls: "text-[#C9A86A] bg-[#C9A86A]/10 border border-[#C9A86A]/30" },
    "in-chair": { label: "En silla", cls: "text-[#7FA86A] bg-[#7FA86A]/10 border border-[#7FA86A]/30" },
    pending: { label: "Pendiente", cls: "text-[#9A9489] bg-[#9A9489]/10 border border-[#9A9489]/30" }
  };

  return (
    <div className="space-y-8 fade-up">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Citas Hoy"    value="08"            delta={12}  icon="Calendar" />
        <KPI label="Ingresos Hoy" value="780k" prefix="$" delta={8}  icon="TrendingUp" />
        <KPI label="Ocupación"    value="92%"           delta={4}   icon="UserCheck" />
        <KPI label="Stock Crítico" value="03"          delta={-15}  icon="AlertTriangle" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#141312] border border-[#2A2724]">
          <div className="p-6 flex items-center justify-between border-b border-[#2A2724]">
            <div>
              <div className="text-[10px] tracking-[0.25em] uppercase text-[#C9A86A]">Hoy</div>
              <h3 className="font-display text-2xl mt-1 text-[#F5F1E8]">Citas del día</h3>
            </div>
            <button className="btn-gold px-4 py-2 text-xs flex items-center gap-2">
              <Icon name="Plus" size={14}/> Nueva
            </button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2A2724]">
                <th className="p-4 text-[10px] tracking-[0.2em] uppercase text-[#6A655C] font-normal">Hora</th>
                <th className="p-4 text-[10px] tracking-[0.2em] uppercase text-[#6A655C] font-normal">Cliente</th>
                <th className="p-4 text-[10px] tracking-[0.2em] uppercase text-[#6A655C] font-normal">Servicio</th>
                <th className="p-4 text-[10px] tracking-[0.2em] uppercase text-[#6A655C] font-normal">Barbero</th>
                <th className="p-4 text-[10px] tracking-[0.2em] uppercase text-[#6A655C] font-normal">Estado</th>
              </tr>
            </thead>
            <tbody>
              {CENIT_DATA.appointments.map((a, i) => (
                <tr key={i} className="border-b border-[#2A2724] hover:bg-[#1A1816]/50">
                  <td className="p-4 font-display text-lg text-[#E8C77E]">{a.time}</td>
                  <td className="p-4">
                    <div className="text-[#F5F1E8] text-sm">{a.client}</div>
                    <div className="text-[10px] text-[#6A655C]">{a.phone}</div>
                  </td>
                  <td className="p-4 text-sm text-[#9A9489]">{a.service}</td>
                  <td className="p-4 text-sm text-[#9A9489]">{a.barber}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-[10px] tracking-wider uppercase rounded-full ${statusLabel[a.status].cls}`}>
                      {statusLabel[a.status].label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          <div className="bg-[#141312] border border-[#2A2724] p-6 text-center">
            <div className="text-[10px] tracking-[0.25em] uppercase mb-2 text-[#C9A86A]">Próximo</div>
            <div className="font-display text-4xl text-[#F5F1E8]">10:30</div>
            <div className="mt-3 text-sm text-[#9A9489]">Sebastián López</div>
            <div className="text-[10px] tracking-[0.2em] uppercase text-[#6A655C]">Diseño Barba · Daniel P.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CitasView() {
  return (
    <div className="fade-up">
      <div className="bg-[#141312] border border-[#2A2724] p-6 mb-6">
        <h3 className="font-display text-2xl text-[#F5F1E8] mb-4">Calendario de Citas</h3>
        <p className="text-[#9A9489] text-sm">Vista completa de la semana en construcción.</p>
      </div>
    </div>
  );
}

function InventarioView() {
  return (
    <div className="fade-up">
      <div className="bg-[#141312] border border-[#2A2724] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#2A2724]">
              <th className="p-4 w-16"></th>
              <th className="p-4 text-[10px] tracking-[0.2em] uppercase text-[#6A655C] font-normal">Producto</th>
              <th className="p-4 text-[10px] tracking-[0.2em] uppercase text-[#6A655C] font-normal">Colección</th>
              <th className="p-4 text-[10px] tracking-[0.2em] uppercase text-[#6A655C] font-normal">Precio</th>
              <th className="p-4 text-[10px] tracking-[0.2em] uppercase text-[#6A655C] font-normal">Stock</th>
              <th className="p-4 text-[10px] tracking-[0.2em] uppercase text-[#6A655C] font-normal">Estado</th>
            </tr>
          </thead>
          <tbody>
            {CENIT_DATA.products.map(p => (
              <tr key={p.id} className="border-b border-[#2A2724] hover:bg-[#1A1816]/50">
                <td className="p-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-[#1A1816]">
                    <CapVisual color={p.color} accent={p.accent}/>
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-[#F5F1E8] text-sm">{p.name}</div>
                  <div className="text-[10px] tracking-[0.1em] text-[#6A655C]">SKU {p.id.toUpperCase()}</div>
                </td>
                <td className="p-4 text-sm text-[#9A9489]">{p.collection}</td>
                <td className="p-4 font-mono text-[#E8C77E]">{formatCOP(p.price)}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[#F5F1E8] font-mono">{p.stock}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-[10px] tracking-wider uppercase rounded-full ${p.stock === 0 ? 'text-[#C56B5A] bg-[#C56B5A]/10 border border-[#C56B5A]/30' : p.stock < 10 ? 'text-[#E8C77E] bg-[#E8C77E]/10 border border-[#E8C77E]/30' : 'text-[#7FA86A] bg-[#7FA86A]/10 border border-[#7FA86A]/30'}`}>
                    {p.stock === 0 ? 'Agotado' : p.stock < 10 ? 'Crítico' : 'Disponible'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
