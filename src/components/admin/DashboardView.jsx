import React, { useState, useEffect, useMemo } from 'react';
import { Icon } from '../Shared';
import { formatCOP } from '../../data/cenitData';
import appointmentsService from '../../services/appointmentsService';
import dailySalesService from '../../services/dailySalesService';
import expensesService from '../../services/expensesService';

// ─── Helpers ───
const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MONTH_FULL  = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function getMonthKey(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(key) {
  const [y, m] = key.split('-');
  return `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`;
}

// Helper para obtener fecha local en formato YYYY-MM-DD sin errores de zona horaria UTC
function getLocalDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ─── KPI Card ───
function KPICard({ label, value, icon, subValue, trend, valueClass = 'text-[#F5F1E8]' }) {
  return (
    <div className="rounded-xl p-5 relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#C9A86A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] uppercase tracking-widest text-[#6A655C]">{label}</span>
          <span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(201,168,106,0.1)' }}>
            <Icon name={icon} size={16} className="text-[#C9A86A]" />
          </span>
        </div>
        <div className={`font-display text-2xl ${valueClass}`}>{value}</div>
        {subValue && (
          <div className="flex items-center gap-1.5 mt-2">
            {trend !== undefined && (
              <span className={`text-xs ${trend >= 0 ? 'text-[#7FA86A]' : 'text-[#C56B5A]'}`}>
                <Icon name={trend >= 0 ? 'TrendingUp' : 'TrendingDown'} size={12} className="inline mr-0.5" />
                {trend >= 0 ? '+' : ''}{trend}%
              </span>
            )}
            <span className="text-xs text-[#6A655C]">{subValue}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Dual-bar chart ───
function DualBarChart({ data, formatValue, bar1Key, bar2Key, bar1Color, bar2Color, bar1Label, bar2Label }) {
  const max = Math.max(...data.map(d => Math.max(d[bar1Key], d[bar2Key])), 1);
  return (
    <div className="flex items-end gap-3 h-48 mt-4 px-2">
      {data.map((d, i) => {
        const pct1 = (d[bar1Key] / max) * 100;
        const pct2 = (d[bar2Key] / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 group h-full relative">
            {/* Tooltip on hover */}
            <div className="absolute -top-12 bg-black/90 border border-white/10 rounded-lg p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-32 -ml-8 hidden sm:block shadow-xl">
              <div className="text-[10px] mb-0.5" style={{color: bar1Color}}>{bar1Label}: {formatValue(d[bar1Key])}</div>
              <div className="text-[10px]" style={{color: bar2Color}}>{bar2Label}: {formatValue(d[bar2Key])}</div>
            </div>
            
            {/* Bars container */}
            <div className="w-full flex-1 flex items-end justify-center gap-1 relative">
              {/* Bar 1 */}
              <div
                className="w-full max-w-[20px] rounded-t-sm transition-all duration-700 ease-out"
                style={{
                  height: `${Math.max(pct1, 2)}%`,
                  background: `linear-gradient(to top, ${bar1Color}40, ${bar1Color})`
                }}
              />
              {/* Bar 2 */}
              <div
                className="w-full max-w-[20px] rounded-t-sm transition-all duration-700 ease-out"
                style={{
                  height: `${Math.max(pct2, 2)}%`,
                  background: `linear-gradient(to top, ${bar2Color}40, ${bar2Color})`
                }}
              />
            </div>
            <span className="text-[10px] text-[#9A9489] whitespace-nowrap">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Status badge ───
const STATUS_MAP = {
  confirmed: { label: 'Confirmada', cls: 'text-[#C9A86A] bg-[#C9A86A]/10 border-[#C9A86A]/30' },
  'in-chair': { label: 'En silla', cls: 'text-[#7FA86A] bg-[#7FA86A]/10 border-[#7FA86A]/30' },
  pending: { label: 'Pendiente', cls: 'text-[#9A9489] bg-[#9A9489]/10 border-[#9A9489]/30' },
  completed: { label: 'Completada', cls: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
  cancelled: { label: 'Cancelada', cls: 'text-red-400 bg-red-400/10 border-red-400/30' },
  'no-show': { label: 'No Show', cls: 'text-orange-400 bg-orange-400/10 border-orange-400/30' }
};

// ─── Main Dashboard ───
export default function DashboardView() {
  const [allAppointments, setAllAppointments] = useState([]);
  const [allSales, setAllSales] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartOffset, setChartOffset] = useState(0);
  const [chartView, setChartView] = useState('week'); // 'week' | 'months'

  const loadAll = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const yearAgo = new Date(today.getFullYear(), today.getMonth() - 11, 1);
      const startDate = getLocalDateString(yearAgo);
      const endDate = getLocalDateString(today);

      const [appts, sales, exp] = await Promise.all([
        appointmentsService.getAllAppointments(),
        dailySalesService.getByDateRange(startDate, endDate),
        expensesService.getByDateRange(startDate, endDate)
      ]);
      setAllAppointments(appts || []);
      setAllSales(sales || []);
      setAllExpenses(exp || []);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleUpdateStatus = async (id, status) => {
    await appointmentsService.updateAppointment(id, { status });
    loadAll();
  };

  const handleDelete = async (id) => {
    if (confirm("¿Eliminar esta cita permanentemente?")) {
      await appointmentsService.deleteAppointment(id);
      loadAll();
    }
  };

  const handleCloseDay = async (status) => {
    const todayStr = getLocalDateString();
    const pendings = allAppointments.filter(c =>
      c.appointment_date === todayStr && ['pending', 'confirmed', 'in-chair'].includes(c.status)
    );
    if (pendings.length === 0) { alert("No hay citas pendientes para cerrar."); return; }
    const label = status === 'completed' ? 'COMPLETADAS' : 'NO-SHOW';
    if (!confirm(`¿Marcar las ${pendings.length} citas restantes de hoy como ${label}?`)) return;
    setLoading(true);
    try {
      await Promise.all(pendings.map(c => appointmentsService.updateAppointment(c.id, { status })));
      await loadAll();
    } catch (err) {
      alert("Error cerrando jornada: " + err.message);
      setLoading(false);
    }
  };

  // ─── Computed stats ───
  const stats = useMemo(() => {
    const today = new Date();
    const todayStr = getLocalDateString(today);
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    // Today Appointments
    const todayCitas = allAppointments.filter(a => a.appointment_date === todayStr);
    const todayCompleted = todayCitas.filter(a => ['completed', 'confirmed', 'in-chair'].includes(a.status));
    const todayApptRevenue = todayCompleted.reduce((s, a) => s + (a.services?.price || 0), 0);
    
    // Today Walk-ins
    const todayWalkins = allSales.filter(s => s.date === todayStr);
    const todayWalkinCount = todayWalkins.reduce((s, a) => s + a.quantity, 0);
    const todayWalkinRevenue = todayWalkins.reduce((s, a) => s + (a.quantity * a.price_per_unit), 0);
    
    // Today Totals
    const todayRevenue = todayApptRevenue + todayWalkinRevenue;
    const todayTotalCortes = todayCompleted.length + todayWalkinCount;

    // Next appointment
    const nowTime = new Date().toTimeString().slice(0, 5);
    const nextAppt = todayCitas
      .filter(a => ['pending', 'confirmed'].includes(a.status) && a.appointment_time >= nowTime)
      .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))[0];

    // Current month
    const monthCitas = allAppointments.filter(a => getMonthKey(a.appointment_date) === currentMonth);
    const monthCompleted = monthCitas.filter(a => a.status === 'completed');
    const monthApptRevenue = monthCompleted.reduce((s, a) => s + (a.services?.price || 0), 0);
    
    const monthWalkins = allSales.filter(s => getMonthKey(s.date) === currentMonth);
    const monthWalkinRevenue = monthWalkins.reduce((s, a) => s + (a.quantity * a.price_per_unit), 0);
    
    const monthExpensesList = allExpenses.filter(e => getMonthKey(e.date) === currentMonth);
    const monthExpenses = monthExpensesList.reduce((s, e) => s + e.amount, 0);

    const monthRevenue = monthApptRevenue + monthWalkinRevenue;
    const monthProfit = monthRevenue - monthExpenses;
    const monthCancelled = monthCitas.filter(a => a.status === 'cancelled' || a.status === 'no-show').length;

    // Previous month for comparison
    const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const prevMonthKey = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;
    const prevMonthCompleted = allAppointments.filter(a => getMonthKey(a.appointment_date) === prevMonthKey && a.status === 'completed');
    const prevMonthApptRevenue = prevMonthCompleted.reduce((s, a) => s + (a.services?.price || 0), 0);
    const prevMonthWalkins = allSales.filter(s => getMonthKey(s.date) === prevMonthKey);
    const prevMonthWalkinRevenue = prevMonthWalkins.reduce((s, a) => s + (a.quantity * a.price_per_unit), 0);
    const prevMonthRevenue = prevMonthApptRevenue + prevMonthWalkinRevenue;
    const revenueTrend = prevMonthRevenue > 0 ? Math.round(((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100) : null;

    // Financial chart logic (supports offset)
    const months = [];
    const startIndex = chartOffset * 4;
    for (let i = startIndex + 3; i >= startIndex; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      
      const appts = allAppointments.filter(a => getMonthKey(a.appointment_date) === key && a.status === 'completed');
      const walkins = allSales.filter(s => getMonthKey(s.date) === key);
      const exp = allExpenses.filter(e => getMonthKey(e.date) === key);
      
      const revAppts = appts.reduce((s, a) => s + (a.services?.price || 0), 0);
      const revWalkins = walkins.reduce((s, a) => s + (a.quantity * a.price_per_unit), 0);
      const totalExp = exp.reduce((s, e) => s + e.amount, 0);
      
      months.push({
        label: MONTH_NAMES[d.getMonth()],
        month: MONTH_FULL[d.getMonth()],
        revenue: revAppts + revWalkins,
        expenses: totalExp,
        profit: (revAppts + revWalkins) - totalExp,
        count: appts.length + walkins.reduce((s, w) => s + w.quantity, 0)
      });
    }

    // Weekly chart logic (Last 7 days)
    const weekData = [];
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = getLocalDateString(d);
      
      const appts = allAppointments.filter(a => a.appointment_date === key && a.status === 'completed');
      const walkins = allSales.filter(s => s.date === key);
      
      const revAppts = appts.reduce((s, a) => s + (a.services?.price || 0), 0);
      const revWalkins = walkins.reduce((s, a) => s + (a.quantity * a.price_per_unit), 0);
      
      weekData.push({
        label: i === 0 ? 'Hoy' : dayNames[d.getDay()],
        date: key,
        bar1: revAppts,
        bar2: revWalkins,
        countAppts: appts.length,
        countWalkins: walkins.reduce((s, w) => s + w.quantity, 0)
      });
    }

    // Top clients (by completed appointments count)
    const clientCounts = {};
    allAppointments
      .filter(a => a.status === 'completed')
      .forEach(a => {
        const name = a.client_name || 'Anónimo';
        if (!clientCounts[name]) clientCounts[name] = { name, count: 0, revenue: 0, lastVisit: a.appointment_date };
        clientCounts[name].count++;
        clientCounts[name].revenue += (a.services?.price || 0);
        if (a.appointment_date > clientCounts[name].lastVisit) clientCounts[name].lastVisit = a.appointment_date;
      });
    const topClients = Object.values(clientCounts).sort((a, b) => b.count - a.count).slice(0, 5);

    // Service popularity
    const serviceCounts = {};
    allAppointments
      .filter(a => a.status === 'completed' && a.services?.name)
      .forEach(a => {
        const sName = a.services.name;
        if (!serviceCounts[sName]) serviceCounts[sName] = { name: sName, count: 0, revenue: 0 };
        serviceCounts[sName].count++;
        serviceCounts[sName].revenue += (a.services?.price || 0);
      });
    const topServices = Object.values(serviceCounts).sort((a, b) => b.count - a.count);
    const totalServiceCount = topServices.reduce((s, sv) => s + sv.count, 0);

    // All-time totals
    const allCompleted = allAppointments.filter(a => a.status === 'completed');
    const totalApptRevenue = allCompleted.reduce((s, a) => s + (a.services?.price || 0), 0);
    const totalWalkinRevenue = allSales.reduce((s, a) => s + (a.quantity * a.price_per_unit), 0);
    const totalRevenue = totalApptRevenue + totalWalkinRevenue;
    
    const totalClients = new Set(allCompleted.map(a => a.client_name).filter(Boolean)).size;

    // Completion rate
    const totalWithOutcome = allAppointments.filter(a => ['completed', 'cancelled', 'no-show'].includes(a.status));
    const completionRate = totalWithOutcome.length > 0 ? Math.round((allCompleted.length / totalWithOutcome.length) * 100) : 100;

    return {
      todayCitas, todayRevenue, nextAppt, todayTotalCortes, todayWalkinCount,
      monthCompleted: monthCompleted.length, monthRevenue, monthCancelled, revenueTrend, monthProfit, monthExpenses,
      months, weekData, topClients, topServices, totalServiceCount,
      totalRevenue, totalClients, totalCompleted: allCompleted.length, completionRate,
      currentMonthName: MONTH_FULL[today.getMonth()]
    };
  }, [allAppointments, allSales, allExpenses, chartOffset]);

  if (loading && allAppointments.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#C9A86A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">

      {/* ─── KPI Row: Today ─── */}
      <div>
        <h3 className="text-[10px] uppercase tracking-[0.25em] text-[#6A655C] mb-3 flex items-center gap-2">
          <Icon name="Sun" size={12} className="text-[#C9A86A]" /> Resumen de Hoy
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard label="Ingresos hoy" value={formatCOP(stats.todayRevenue)} icon="DollarSign" />
          <KPICard label="Total Cortes Hoy" value={String(stats.todayTotalCortes).padStart(2, '0')} icon="Scissors" 
            subValue={`${stats.todayCitas.length} citas + ${stats.todayWalkinCount} sin cita`} />
          <KPICard label="Próxima cita" value={stats.nextAppt ? stats.nextAppt.appointment_time.slice(0, 5) : '—'} icon="Clock"
            subValue={stats.nextAppt ? stats.nextAppt.client_name : 'Sin citas pendientes'} />
          <KPICard label="Tasa completadas" value={`${stats.completionRate}%`} icon="Target" subValue="de todas las citas" />
        </div>
      </div>

      {/* ─── KPI Row: Current Month ─── */}
      <div>
        <h3 className="text-[10px] uppercase tracking-[0.25em] text-[#6A655C] mb-3 flex items-center gap-2">
          <Icon name="CalendarRange" size={12} className="text-[#C9A86A]" /> {stats.currentMonthName} — Mes Actual
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard label="Ingreso Bruto" value={formatCOP(stats.monthRevenue)} icon="TrendingUp"
            trend={stats.revenueTrend !== null ? stats.revenueTrend : undefined} 
            subValue={stats.revenueTrend !== null ? "vs mes anterior" : "Sin histórico previo"} />
          <KPICard label="Gastos" value={formatCOP(stats.monthExpenses)} icon="Receipt" valueClass="text-[#C56B5A]" />
          <KPICard label="Ganancia Neta" value={formatCOP(stats.monthProfit)} icon="Wallet" valueClass={stats.monthProfit >= 0 ? 'text-[#7FA86A]' : 'text-[#C56B5A]'} />
          <KPICard label="Clientes únicos" value={String(stats.totalClients)} icon="Users" subValue="histórico de citas" />
        </div>
      </div>
      {/* ─── Two-column layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ─── Revenue & Expenses Chart ─── */}
        <div className="lg:col-span-2 rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-3">
            <div>
              <h3 className="text-sm font-medium text-[#F5F1E8]">{chartView === 'months' ? 'Flujo de Caja' : 'Ingresos Últimos 7 Días'}</h3>
              <p className="text-xs text-[#9A9489]">{chartView === 'months' ? 'Ingresos vs Gastos por mes' : 'Ingresos de Citas vs Tienda Física'}</p>
            </div>
            <div className="flex items-center gap-1 bg-white/[0.02] p-1 rounded-lg border border-white/[0.06]">
              <button 
                onClick={() => setChartView('week')}
                className={`text-xs px-3 py-1.5 rounded-md transition ${chartView === 'week' ? 'bg-[#C9A86A] text-[#1A1816] font-medium' : 'text-[#9A9489] hover:text-[#F5F1E8]'}`}
              >
                7 Días
              </button>
              <button 
                onClick={() => setChartView('months')}
                className={`text-xs px-3 py-1.5 rounded-md transition ${chartView === 'months' ? 'bg-[#C9A86A] text-[#1A1816] font-medium' : 'text-[#9A9489] hover:text-[#F5F1E8]'}`}
              >
                Meses
              </button>
            </div>
          </div>
          
          {chartView === 'months' ? (
            <>
              <div className="flex items-center gap-4 mb-2 text-[10px] uppercase tracking-wider justify-between">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1.5 text-[#C9A86A]">
                    <span className="w-2 h-2 rounded-full bg-[#C9A86A]"></span> Ingresos
                  </span>
                  <span className="flex items-center gap-1.5 text-[#C56B5A]">
                    <span className="w-2 h-2 rounded-full bg-[#C56B5A]"></span> Gastos
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setChartOffset(prev => Math.min(prev + 1, 2))}
                    disabled={chartOffset === 2}
                    className="w-7 h-7 rounded border border-white/[0.08] flex items-center justify-center text-[#9A9489] hover:text-[#C9A86A] transition disabled:opacity-30 disabled:hover:text-[#9A9489]"
                    title="Ver meses anteriores"
                  >
                    <Icon name="ChevronLeft" size={14} />
                  </button>
                  <button 
                    onClick={() => setChartOffset(prev => Math.max(prev - 1, 0))}
                    disabled={chartOffset === 0}
                    className="w-7 h-7 rounded border border-white/[0.08] flex items-center justify-center text-[#9A9489] hover:text-[#C9A86A] transition disabled:opacity-30 disabled:hover:text-[#9A9489]"
                    title="Ver meses recientes"
                  >
                    <Icon name="ChevronRight" size={14} />
                  </button>
                </div>
              </div>
              <DualBarChart data={stats.months} formatValue={formatCOP} bar1Key="revenue" bar2Key="expenses" bar1Color="#C9A86A" bar2Color="#C56B5A" bar1Label="Ingresos" bar2Label="Gastos" />
            </>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-2 pt-2 text-[10px] uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-[#C9A86A]">
                  <span className="w-2 h-2 rounded-full bg-[#C9A86A]"></span> Citas
                </span>
                <span className="flex items-center gap-1.5 text-[#7FA86A]">
                  <span className="w-2 h-2 rounded-full bg-[#7FA86A]"></span> Tienda Física
                </span>
              </div>
              <DualBarChart data={stats.weekData} formatValue={formatCOP} bar1Key="bar1" bar2Key="bar2" bar1Color="#C9A86A" bar2Color="#7FA86A" bar1Label="Ingreso Citas" bar2Label="Ingreso Tienda" />
            </>
          )}
        </div>

        {/* Top clients */}
        <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-[#F5F1E8]">Clientes Más Frecuentes</h4>
            <Icon name="Crown" size={16} className="text-[#C9A86A]" />
          </div>
          {stats.topClients.length === 0 ? (
            <p className="text-sm text-[#6A655C] text-center py-8">Aún no hay datos de clientes.</p>
          ) : (
            <div className="space-y-3">
              {stats.topClients.map((c, i) => (
                <div key={c.name} className="flex items-center gap-3 group">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    i === 0 ? 'bg-gradient-to-br from-[#E8C77E] to-[#8B6F3F] text-[#1A1408]' :
                    i === 1 ? 'bg-[#9A9489]/20 text-[#9A9489]' :
                    i === 2 ? 'bg-[#8B6F3F]/20 text-[#8B6F3F]' :
                    'bg-white/[0.04] text-[#6A655C]'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[#F5F1E8] truncate">{c.name}</div>
                    <div className="text-[10px] text-[#6A655C]">Última visita: {c.lastVisit}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-mono text-[#E8C77E]">{c.count} <span className="text-[10px] text-[#6A655C]">visitas</span></div>
                    <div className="text-[10px] text-[#6A655C]">{formatCOP(c.revenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Service popularity ─── */}
      <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-[#F5F1E8]">Servicios Más Populares</h4>
          <Icon name="Scissors" size={16} className="text-[#C9A86A]" />
        </div>
        {stats.topServices.length === 0 ? (
          <p className="text-sm text-[#6A655C] text-center py-4">Sin datos de servicios.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.topServices.map((sv, i) => {
              const pct = stats.totalServiceCount > 0 ? Math.round((sv.count / stats.totalServiceCount) * 100) : 0;
              return (
                <div key={sv.name} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[#F5F1E8] truncate">{sv.name}</span>
                      <span className="text-xs text-[#9A9489] ml-2 shrink-0">{sv.count}x</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background: i === 0 ? 'linear-gradient(90deg, #C9A86A, #E8C77E)' :
                                     i === 1 ? 'rgba(201,168,106,0.5)' : 'rgba(201,168,106,0.3)'
                        }}
                      />
                    </div>
                    <div className="text-[10px] text-[#6A655C] mt-1">{pct}% · {formatCOP(sv.revenue)} total</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Today's appointments table ─── */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.06] gap-4">
          <h3 className="text-lg font-medium text-[#F5F1E8] flex items-center gap-2">
            <Icon name="Calendar" size={18} className="text-[#C9A86A]" />
            Citas de Hoy
            <span className="text-xs font-mono text-[#6A655C] ml-2">
              {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </h3>
          <div className="flex items-center gap-3">
            <button onClick={() => handleCloseDay('completed')} className="text-xs px-3 py-1.5 rounded-full border border-blue-500/30 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 transition">
              Aprobar Restantes
            </button>
            <div className="w-[1px] h-4 bg-white/[0.1]" />
            <button onClick={loadAll} className="text-[#9A9489] hover:text-[#C9A86A] transition" title="Actualizar">
              <Icon name="RefreshCw" size={16} />
            </button>
          </div>
        </div>
        {stats.todayCitas.length === 0 ? (
          <div className="p-8 text-center text-[#6A655C] text-sm">No hay citas programadas para hoy.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Hora</th>
                  <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Cliente</th>
                  <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Servicio</th>
                  <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Estado</th>
                  <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {stats.todayCitas
                  .sort((a, b) => (a.appointment_time || '').localeCompare(b.appointment_time || ''))
                  .map(a => (
                  <tr key={a.id} className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-mono text-sm text-[#E8C77E]">{a.appointment_time?.slice(0, 5)}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-sm text-[#F5F1E8]">
                        {a.guest_name ? (
                          <>{a.guest_name} <span className="text-xs text-[#6A655C]">(de {a.client_name})</span></>
                        ) : a.client_name}
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
                        {['pending', 'confirmed', 'in-chair'].includes(a.status) && (
                          <>
                            <button onClick={() => handleUpdateStatus(a.id, 'completed')} className="p-1.5 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20 transition flex items-center gap-1.5 text-xs px-2" title="Completar">
                              <Icon name="CheckCircle" size={14} />
                              <span className="hidden sm:inline">Realizado</span>
                            </button>
                            <button onClick={() => handleUpdateStatus(a.id, 'cancelled')} className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition flex items-center gap-1.5 text-xs px-2" title="Cancelar">
                              <Icon name="X" size={14} />
                              <span className="hidden sm:inline">Cancelar</span>
                            </button>
                            <button onClick={() => handleUpdateStatus(a.id, 'no-show')} className="p-1.5 bg-orange-500/10 text-orange-400 rounded hover:bg-orange-500/20 transition flex items-center gap-1.5 text-xs px-2" title="No Show">
                              <Icon name="UserMinus" size={14} />
                              <span className="hidden xl:inline">No Show</span>
                            </button>
                          </>
                        )}
                        <button onClick={() => handleDelete(a.id)} className="p-1.5 text-[#6A655C] hover:text-red-400 rounded hover:bg-red-500/10 transition ml-2" title="Eliminar">
                          <Icon name="Trash2" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
