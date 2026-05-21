/* global React, Icon, Logo, CENIT_DATA, formatCOP, CapVisual */
const { useState: useStateAdmin, useMemo: useMemoAdmin } = React;

// ============================================================
// ADMIN DASHBOARD — Sidebar + KPI + Citas hoy + Inventario
// ============================================================
function Admin({ onExit }) {
  const [view, setView] = useStateAdmin("dashboard");

  return (
    <div className="min-h-screen flex" style={{ background: '#0A0A0A' }}>
      {/* Sidebar */}
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
            { id: "sorteos",   icon: "Gift",            label: "Sorteos" },
            { id: "ajustes",   icon: "Settings",        label: "Ajustes" }
          ].map(it => (
            <button key={it.id}
              className={`sb-item w-full ${view === it.id ? 'active' : ''}`}
              onClick={() => setView(it.id)}>
              <Icon name={it.icon} size={16}/>
              <span>{it.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t hairline" style={{ borderColor: '#2A2724' }}>
          <div className="flex items-center gap-3 p-3 hover:bg-[#1A1816] transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-display text-sm bg-gold-gradient" style={{ color: '#1A1408' }}>MA</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs" style={{ color: '#F5F1E8' }}>Mateo Alarcón</div>
              <div className="text-[10px] tracking-[0.15em] uppercase" style={{ color: '#6A655C' }}>Administrador</div>
            </div>
            <Icon name="ChevronUp" size={14} style={{ color: '#6A655C' }}/>
          </div>
          <button onClick={onExit} className="w-full mt-2 text-[10px] tracking-[0.25em] uppercase py-2 flex items-center justify-center gap-2"
                  style={{ color: '#9A9489' }}>
            <Icon name="LogOut" size={12}/> Salir del panel
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-x-hidden">
        {/* Top bar */}
        <header className="px-8 py-5 border-b hairline flex items-center justify-between" style={{ borderColor: '#2A2724', background: '#0E0D0C' }}>
          <div>
            <div className="text-[10px] tracking-[0.25em] uppercase" style={{ color: '#6A655C' }}>Cénit / {view}</div>
            <h1 className="font-display text-2xl mt-1 capitalize" style={{ color: '#F5F1E8' }}>
              {view === "dashboard" ? "Dashboard Principal" :
               view === "citas" ? "Gestión de Citas" :
               view === "inventario" ? "Inventario · Gorras" :
               view === "clientes" ? "Clientes" :
               view === "barberos" ? "Equipo" : "Ajustes"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hairline px-3 py-2 flex items-center gap-2 text-xs" style={{ color: '#9A9489' }}>
              <Icon name="Search" size={14}/>
              <input placeholder="Buscar..." className="bg-transparent outline-none w-40"/>
            </div>
            <button className="w-9 h-9 hairline flex items-center justify-center relative">
              <Icon name="Bell" size={14}/>
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ background: '#C9A86A' }}/>
            </button>
            <span className="text-xs hidden md:inline" style={{ color: '#6A655C' }}>{new Date(2026,4,20).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
        </header>

        {/* View body */}
        <div className="p-8">
          {view === "dashboard" && <DashboardView />}
          {view === "citas" && <CitasView />}
          {view === "inventario" && <InventarioView />}
          {(view !== "dashboard" && view !== "citas" && view !== "inventario") && <Placeholder name={view}/>}
        </div>
      </main>
    </div>
  );
}
window.Admin = Admin;

// ----- KPI Card --------------------------------------
function KPI({ label, value, delta, icon, prefix = "" }) {
  const up = delta >= 0;
  return (
    <div className="surface crest p-6 relative">
      <span className="crest-bl"></span><span className="crest-br"></span>
      <div className="flex items-start justify-between mb-4">
        <span className="text-[10px] tracking-[0.25em] uppercase" style={{ color: '#6A655C' }}>{label}</span>
        <Icon name={icon} size={16} style={{ color: '#C9A86A' }}/>
      </div>
      <div className="font-display text-4xl" style={{ color: '#F5F1E8' }}>{prefix}{value}</div>
      <div className="mt-3 flex items-center gap-2 text-xs">
        <span style={{ color: up ? '#7FA86A' : '#C56B5A' }} className="inline-flex items-center gap-1">
          <Icon name={up ? 'TrendingUp' : 'TrendingDown'} size={12}/> {Math.abs(delta)}%
        </span>
        <span style={{ color: '#6A655C' }}>vs ayer</span>
      </div>
    </div>
  );
}

// ----- Dashboard View --------------------------------
function DashboardView() {
  const statusLabel = {
    confirmed: { label: "Confirmada", cls: "pill-gold" },
    "in-chair": { label: "En silla", cls: "pill-green" },
    pending: { label: "Pendiente", cls: "pill-ink" }
  };

  return (
    <div className="space-y-8 fade-up">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Citas Hoy"    value="08"            delta={12}  icon="Calendar" />
        <KPI label="Ingresos Hoy" value="780k" prefix="$" delta={8}  icon="TrendingUp" />
        <KPI label="Ocupación"    value="92%"           delta={4}   icon="UserCheck" />
        <KPI label="Stock Crítico" value="03"          delta={-15}  icon="AlertTriangle" />
      </div>

      {/* Two-column: Citas hoy + Próximo */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Citas */}
        <div className="lg:col-span-2 surface crest relative">
          <span className="crest-bl"></span><span className="crest-br"></span>
          <div className="p-6 flex items-center justify-between border-b hairline" style={{ borderColor: '#2A2724' }}>
            <div>
              <div className="text-[10px] tracking-[0.25em] uppercase" style={{ color: '#C9A86A' }}>Hoy · 20 Mayo</div>
              <h3 className="font-display text-2xl mt-1" style={{ color: '#F5F1E8' }}>Citas del día</h3>
            </div>
            <div className="flex items-center gap-2">
              <button className="hairline px-3 py-1.5 text-[10px] tracking-[0.2em] uppercase hover:border-[#C9A86A]" style={{ color: '#9A9489' }}>
                <Icon name="Filter" size={12} className="inline mr-2"/>Filtrar
              </button>
              <button className="btn-gold inline-flex items-center gap-2" style={{ padding: '8px 16px', fontSize: '10px' }}>
                <Icon name="Plus" size={12}/> Nueva
              </button>
            </div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '90px' }}>Hora</th>
                <th>Cliente</th>
                <th>Servicio</th>
                <th>Barbero</th>
                <th>Estado</th>
                <th style={{ width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {CENIT_DATA.appointments.map(a => (
                <tr key={a.id}>
                  <td><span className="font-display text-lg" style={{ color: '#E8C77E' }}>{a.time}</span></td>
                  <td>
                    <div style={{ color: '#F5F1E8' }}>{a.client}</div>
                    <div className="text-[10px] tracking-[0.1em]" style={{ color: '#6A655C' }}>{a.phone}</div>
                  </td>
                  <td><span style={{ color: '#9A9489' }}>{a.service}</span></td>
                  <td><span style={{ color: '#9A9489' }}>{a.barber}</span></td>
                  <td><span className={`pill ${statusLabel[a.status].cls}`}>{statusLabel[a.status].label}</span></td>
                  <td>
                    <button className="text-[#6A655C] hover:text-[#C9A86A]">
                      <Icon name="MoreVertical" size={16}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Próximo cliente / Equipo */}
        <div className="space-y-6">
          <div className="surface crest p-6 relative">
            <span className="crest-bl"></span><span className="crest-br"></span>
            <div className="text-[10px] tracking-[0.25em] uppercase mb-2" style={{ color: '#C9A86A' }}>Próximo</div>
            <div className="font-display text-4xl" style={{ color: '#F5F1E8' }}>10:30</div>
            <div className="mt-3 text-sm" style={{ color: '#9A9489' }}>Sebastián López</div>
            <div className="text-[10px] tracking-[0.2em] uppercase" style={{ color: '#6A655C' }}>Diseño Barba · Daniel P.</div>
            <div className="mt-6 flex gap-2">
              <button className="btn-gold flex-1 text-center" style={{ padding: '10px', fontSize: '10px' }}>Iniciar</button>
              <button className="btn-ghost" style={{ padding: '10px 14px', fontSize: '10px' }}>
                <Icon name="Phone" size={12}/>
              </button>
            </div>
          </div>

          <div className="surface crest p-6 relative">
            <span className="crest-bl"></span><span className="crest-br"></span>
            <div className="text-[10px] tracking-[0.25em] uppercase mb-4" style={{ color: '#C9A86A' }}>Equipo · Ocupación</div>
            {CENIT_DATA.barbers.map((b, i) => {
              const occ = [92, 78, 88, 64][i];
              return (
                <div key={b.id} className="mb-4 last:mb-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs" style={{ color: '#F5F1E8' }}>{b.name.split(' ')[0]}</span>
                    <span className="text-[10px] tracking-[0.15em]" style={{ color: '#9A9489' }}>{occ}%</span>
                  </div>
                  <div className="h-1 w-full" style={{ background: '#2A2724' }}>
                    <div className="h-full bg-gold-shine" style={{ width: `${occ}%` }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Inventory snapshot */}
      <div className="surface crest p-6 relative">
        <span className="crest-bl"></span><span className="crest-br"></span>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-[10px] tracking-[0.25em] uppercase" style={{ color: '#C9A86A' }}>Inventario · Atención requerida</div>
            <h3 className="font-display text-2xl mt-1" style={{ color: '#F5F1E8' }}>Stock crítico</h3>
          </div>
          <button className="text-[10px] tracking-[0.2em] uppercase inline-flex items-center gap-2" style={{ color: '#E8C77E' }}>
            Ver inventario completo <Icon name="ArrowRight" size={12}/>
          </button>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {CENIT_DATA.products.filter(p => p.stock < 10).map(p => (
            <div key={p.id} className="flex items-center gap-4 hairline p-4">
              <div className="w-16 h-16 shrink-0 flex items-center justify-center" style={{ background: '#1A1816' }}>
                <CapVisual color={p.color} accent={p.accent}/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[9px] tracking-[0.2em] uppercase" style={{ color: '#C9A86A' }}>{p.collection}</div>
                <div className="text-sm truncate" style={{ color: '#F5F1E8' }}>{p.name}</div>
                <div className="text-[10px] tracking-[0.15em] uppercase mt-1" style={{ color: p.stock === 0 ? '#C56B5A' : '#E8C77E' }}>
                  {p.stock === 0 ? 'Agotado' : `${p.stock} en stock`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ----- Citas View ------------------------------------
function CitasView() {
  return (
    <div className="fade-up">
      <div className="surface crest p-6 relative">
        <span className="crest-bl"></span><span className="crest-br"></span>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {["LUN 20","MAR 21","MIÉ 22","JUE 23","VIE 24","SÁB 25","DOM 26"].map((d,i) => (
            <div key={d} className={`text-center py-3 hairline ${i === 0 ? 'bg-[#1A1816]' : ''}`}
                 style={{ borderColor: i === 0 ? '#C9A86A' : '#2A2724' }}>
              <div className="text-[10px] tracking-[0.2em] uppercase" style={{ color: i === 0 ? '#E8C77E' : '#9A9489' }}>{d}</div>
              <div className="font-display text-xl mt-1" style={{ color: '#F5F1E8' }}>{[8,5,7,6,8,9,0][i]}</div>
              <div className="text-[9px] tracking-[0.15em] uppercase mt-1" style={{ color: '#6A655C' }}>citas</div>
            </div>
          ))}
        </div>
      </div>

      {/* Time-grid */}
      <div className="mt-6 surface p-6">
        <div className="space-y-2">
          {["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"].map((h, idx) => (
            <div key={h} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-1 text-[10px] tracking-[0.2em] uppercase text-right pr-3" style={{ color: '#6A655C' }}>{h}</div>
              <div className="col-span-11 h-12 hairline relative" style={{ borderColor: '#2A2724' }}>
                {CENIT_DATA.appointments.filter(a => a.time.startsWith(h.slice(0,2))).map((a, i) => (
                  <div key={a.id} className="absolute top-1 bottom-1 px-3 py-1 hairline-gold flex items-center text-xs"
                       style={{
                         left: `${i * 25 + 2}%`,
                         width: '24%',
                         background: a.status === 'in-chair' ? 'rgba(127,168,106,.1)' : 'rgba(201,168,106,.08)',
                         color: '#F5F1E8'
                       }}>
                    <span className="truncate">{a.client.split(' ')[0]} · {a.service.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ----- Inventario View -------------------------------
function InventarioView() {
  return (
    <div className="fade-up">
      <div className="surface crest p-0 relative overflow-hidden">
        <span className="crest-bl"></span><span className="crest-br"></span>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}></th>
              <th>Producto</th>
              <th>Colección</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th style={{ width: '60px' }}></th>
            </tr>
          </thead>
          <tbody>
            {CENIT_DATA.products.map(p => (
              <tr key={p.id}>
                <td>
                  <div className="w-12 h-12 flex items-center justify-center" style={{ background: '#1A1816' }}>
                    <CapVisual color={p.color} accent={p.accent}/>
                  </div>
                </td>
                <td>
                  <div style={{ color: '#F5F1E8' }}>{p.name}</div>
                  <div className="text-[10px] tracking-[0.1em]" style={{ color: '#6A655C' }}>SKU {p.id.toUpperCase()}</div>
                </td>
                <td><span style={{ color: '#9A9489' }}>{p.collection}</span></td>
                <td><span style={{ color: '#E8C77E' }}>{formatCOP(p.price)}</span></td>
                <td>
                  <div className="flex items-center gap-2">
                    <span style={{ color: '#F5F1E8' }}>{p.stock}</span>
                    <div className="w-20 h-1" style={{ background: '#2A2724' }}>
                      <div className="h-full bg-gold-shine" style={{ width: `${Math.min(100, (p.stock/24)*100)}%` }}/>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`pill ${p.stock === 0 ? 'pill-red' : p.stock < 10 ? 'pill-gold' : 'pill-green'}`}>
                    {p.stock === 0 ? 'Agotado' : p.stock < 10 ? 'Crítico' : 'Disponible'}
                  </span>
                </td>
                <td>
                  <button className="text-[#6A655C] hover:text-[#C9A86A]">
                    <Icon name="MoreVertical" size={16}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Placeholder({ name }) {
  return (
    <div className="surface crest p-20 text-center relative">
      <span className="crest-bl"></span><span className="crest-br"></span>
      <Icon name="Construction" size={32} style={{ color: '#C9A86A' }} className="mx-auto mb-4"/>
      <h3 className="font-display text-2xl capitalize" style={{ color: '#F5F1E8' }}>{name}</h3>
      <p className="text-sm mt-2" style={{ color: '#6A655C' }}>Esta sección está en construcción para el demo.</p>
    </div>
  );
}
