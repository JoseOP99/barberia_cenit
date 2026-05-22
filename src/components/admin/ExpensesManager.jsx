import React, { useState, useEffect } from 'react';
import { Icon } from '../Shared';
import { formatCOP } from '../../data/cenitData';
import expensesService, { EXPENSE_CATEGORIES } from '../../services/expensesService';

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const CATEGORY_ICONS = {
  'Productos': 'Package',
  'Herramientas': 'Wrench',
  'Local': 'Home',
  'Servicios': 'Zap',
  'Insumos': 'Droplets',
  'Otro': 'MoreHorizontal'
};

export default function ExpensesManager() {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({ totalAmount: 0, byCategory: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ date: today, category: 'Productos', description: '', amount: '' });

  const loadMonth = async () => {
    setLoading(true);
    try {
      const result = await expensesService.getMonthlySummary(viewYear, viewMonth);
      setRecords(result?.records || []);
      setSummary({ totalAmount: result?.totalAmount || 0, byCategory: result?.byCategory || [] });
    } catch (err) {
      console.error(err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMonth(); }, [viewMonth, viewYear]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await expensesService.create(form);
      setForm({ date: today, category: 'Productos', description: '', amount: '' });
      loadMonth();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este gasto?')) return;
    try {
      await expensesService.delete(id);
      loadMonth();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="animate-in space-y-6">

      {/* Form */}
      <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 className="text-lg font-medium text-[#F5F1E8] mb-4 flex items-center gap-2">
          <Icon name="Receipt" size={18} className="text-[#C9A86A]" />
          Registrar Gasto
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
          <div className="w-[130px]">
            <label className="block text-[10px] uppercase tracking-wider text-[#6A655C] mb-1">Fecha</label>
            <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
              className="w-full bg-black/50 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-[#F5F1E8] focus:border-[#C9A86A] outline-none [color-scheme:dark]" />
          </div>
          <div className="w-[140px]">
            <label className="block text-[10px] uppercase tracking-wider text-[#6A655C] mb-1">Categoría</label>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
              className="w-full bg-black/50 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-[#F5F1E8] focus:border-[#C9A86A] outline-none [color-scheme:dark]">
              {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-[2] min-w-[160px]">
            <label className="block text-[10px] uppercase tracking-wider text-[#6A655C] mb-1">Descripción</label>
            <input required value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              placeholder="Ej: Cera para cabello, crema de afeitar..."
              className="w-full bg-black/50 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-[#F5F1E8] focus:border-[#C9A86A] outline-none" />
          </div>
          <div className="w-[130px]">
            <label className="block text-[10px] uppercase tracking-wider text-[#6A655C] mb-1">Monto</label>
            <input required type="number" min="0" step="100" value={form.amount}
              onChange={e => setForm({...form, amount: e.target.value})}
              placeholder="$"
              className="w-full bg-black/50 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-[#F5F1E8] focus:border-[#C9A86A] outline-none" />
          </div>
          <button type="submit" disabled={saving}
            className="px-5 py-2 bg-[#C9A86A] text-[#1A1408] text-sm font-semibold rounded-lg hover:bg-[#E8C77E] transition disabled:opacity-50 flex items-center gap-1.5">
            <Icon name="Plus" size={14} />
            {saving ? 'Guardando...' : 'Agregar'}
          </button>
        </form>
      </div>

      {/* Month navigation + summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button onClick={() => { if (viewMonth === 1) { setViewMonth(12); setViewYear(viewYear - 1); } else setViewMonth(viewMonth - 1); }}
            className="w-8 h-8 rounded border border-white/[0.08] flex items-center justify-center text-[#9A9489] hover:text-[#C9A86A] transition">
            <Icon name="ChevronLeft" size={14} />
          </button>
          <span className="text-base font-medium text-[#F5F1E8] min-w-[140px] text-center">{MONTH_NAMES[viewMonth - 1]} {viewYear}</span>
          <button onClick={() => { if (viewMonth === 12) { setViewMonth(1); setViewYear(viewYear + 1); } else setViewMonth(viewMonth + 1); }}
            className="w-8 h-8 rounded border border-white/[0.08] flex items-center justify-center text-[#9A9489] hover:text-[#C9A86A] transition">
            <Icon name="ChevronRight" size={14} />
          </button>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-widest text-[#6A655C]">Total gastos del mes</div>
          <div className="text-xl font-display text-[#C56B5A]">{formatCOP(summary.totalAmount)}</div>
        </div>
      </div>

      {/* Category breakdown */}
      {summary.byCategory.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {summary.byCategory.map(cat => (
            <div key={cat.category} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Icon name={CATEGORY_ICONS[cat.category] || 'Tag'} size={12} className="text-[#C9A86A]" />
                <span className="text-[10px] uppercase tracking-wider text-[#6A655C]">{cat.category}</span>
              </div>
              <div className="font-mono text-sm text-[#F5F1E8]">{formatCOP(cat.total)}</div>
              <div className="text-[10px] text-[#6A655C]">{cat.count} registro{cat.count !== 1 ? 's' : ''}</div>
            </div>
          ))}
        </div>
      )}

      {/* Records table */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
          <h4 className="text-sm font-medium text-[#F5F1E8]">Detalle de Gastos</h4>
          <span className="text-xs text-[#6A655C]">{records.length} registro{records.length !== 1 ? 's' : ''}</span>
        </div>
        {loading ? (
          <div className="p-6 flex justify-center"><div className="w-5 h-5 border-2 border-[#C9A86A] border-t-transparent rounded-full animate-spin" /></div>
        ) : records.length === 0 ? (
          <div className="p-6 text-center text-sm text-[#6A655C]">Sin gastos registrados este mes.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-5 py-2 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Fecha</th>
                  <th className="px-5 py-2 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Categoría</th>
                  <th className="px-5 py-2 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Descripción</th>
                  <th className="px-5 py-2 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Monto</th>
                  <th className="px-5 py-2 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal text-right"></th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id} className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-2.5 text-xs text-[#9A9489]">{r.date}</td>
                    <td className="px-5 py-2.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-full bg-white/[0.04] text-[#9A9489] border border-white/[0.06]">
                        <Icon name={CATEGORY_ICONS[r.category] || 'Tag'} size={10} />
                        {r.category}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-sm text-[#F5F1E8]">{r.description}</td>
                    <td className="px-5 py-2.5 font-mono text-sm text-[#C56B5A]">{formatCOP(r.amount)}</td>
                    <td className="px-5 py-2.5 text-right">
                      <button onClick={() => handleDelete(r.id)} className="p-1 text-[#6A655C] hover:text-red-400 transition">
                        <Icon name="Trash2" size={13} />
                      </button>
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
