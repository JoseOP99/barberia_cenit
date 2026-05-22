import React, { useState, useEffect } from 'react';
import { Icon } from '../Shared';
import { formatCOP } from '../../data/cenitData';
import dailySalesService from '../../services/dailySalesService';

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export default function CashRegister() {
  const today = new Date().toISOString().split('T')[0];
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today);
  const [form, setForm] = useState({ quantity: 1, price_per_unit: 10000, description: '' });

  // Month view
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [monthRecords, setMonthRecords] = useState([]);

  const loadDay = async (date) => {
    setLoading(true);
    try {
      const data = await dailySalesService.getByDate(date);
      setRecords(data || []);
    } catch (err) {
      console.error(err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMonth = async () => {
    try {
      const result = await dailySalesService.getMonthlySummary(viewYear, viewMonth);
      setMonthRecords(result?.records || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { loadDay(selectedDate); }, [selectedDate]);
  useEffect(() => { loadMonth(); }, [viewMonth, viewYear]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dailySalesService.create({ ...form, date: selectedDate });
      setForm({ quantity: 1, price_per_unit: 10000, description: '' });
      loadDay(selectedDate);
      loadMonth();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este registro?')) return;
    try {
      await dailySalesService.delete(id);
      loadDay(selectedDate);
      loadMonth();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const dayTotal = records.reduce((s, r) => s + (r.quantity * r.price_per_unit), 0);
  const dayCount = records.reduce((s, r) => s + r.quantity, 0);
  const monthTotal = monthRecords.reduce((s, r) => s + (r.quantity * r.price_per_unit), 0);
  const monthCount = monthRecords.reduce((s, r) => s + r.quantity, 0);

  return (
    <div className="animate-in space-y-6">

      {/* Quick add form */}
      <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-[#F5F1E8] flex items-center gap-2">
            <Icon name="Banknote" size={18} className="text-[#C9A86A]" />
            Registrar Cortes
          </h3>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            className="bg-black/50 border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-[#F5F1E8] focus:border-[#C9A86A] outline-none [color-scheme:dark]" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[100px]">
            <label className="block text-[10px] uppercase tracking-wider text-[#6A655C] mb-1">Cantidad</label>
            <input required type="number" min="1" value={form.quantity}
              onChange={e => setForm({...form, quantity: e.target.value})}
              className="w-full bg-black/50 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-[#F5F1E8] focus:border-[#C9A86A] outline-none" />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-[10px] uppercase tracking-wider text-[#6A655C] mb-1">Precio c/u</label>
            <input required type="number" min="0" step="500" value={form.price_per_unit}
              onChange={e => setForm({...form, price_per_unit: e.target.value})}
              className="w-full bg-black/50 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-[#F5F1E8] focus:border-[#C9A86A] outline-none" />
          </div>
          <div className="flex-[2] min-w-[160px]">
            <label className="block text-[10px] uppercase tracking-wider text-[#6A655C] mb-1">Descripción</label>
            <input value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              placeholder="Ej: Corte básico, Corte + barba..."
              className="w-full bg-black/50 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-[#F5F1E8] focus:border-[#C9A86A] outline-none" />
          </div>
          <button type="submit" disabled={saving}
            className="px-5 py-2 bg-[#C9A86A] text-[#1A1408] text-sm font-semibold rounded-lg hover:bg-[#E8C77E] transition disabled:opacity-50 flex items-center gap-1.5">
            <Icon name="Plus" size={14} />
            {saving ? 'Guardando...' : 'Agregar'}
          </button>
        </form>

        {form.quantity > 0 && form.price_per_unit > 0 && (
          <div className="mt-2 text-xs text-[#9A9489]">
            Total: <span className="text-[#E8C77E] font-mono">{formatCOP(form.quantity * form.price_per_unit)}</span>
          </div>
        )}
      </div>

      {/* Day summary + records */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-[10px] uppercase tracking-widest text-[#6A655C] mb-1">Cortes del día</div>
          <div className="font-display text-2xl text-[#F5F1E8]">{dayCount}</div>
          <div className="text-xs text-[#6A655C]">{selectedDate === today ? 'hoy' : selectedDate}</div>
        </div>
        <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-[10px] uppercase tracking-widest text-[#6A655C] mb-1">Ingresos del día</div>
          <div className="font-display text-2xl text-[#E8C77E]">{formatCOP(dayTotal)}</div>
          <div className="text-xs text-[#6A655C]">sin cita / walk-in</div>
        </div>
      </div>

      {/* Day records table */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
          <h4 className="text-sm font-medium text-[#F5F1E8]">Registros del {selectedDate === today ? 'Hoy' : selectedDate}</h4>
          <button onClick={() => loadDay(selectedDate)} className="text-[#9A9489] hover:text-[#C9A86A] transition">
            <Icon name="RefreshCw" size={14} />
          </button>
        </div>
        {loading ? (
          <div className="p-6 flex justify-center"><div className="w-5 h-5 border-2 border-[#C9A86A] border-t-transparent rounded-full animate-spin" /></div>
        ) : records.length === 0 ? (
          <div className="p-6 text-center text-sm text-[#6A655C]">Sin registros para este día.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-5 py-2 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Cant.</th>
                <th className="px-5 py-2 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Precio</th>
                <th className="px-5 py-2 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Total</th>
                <th className="px-5 py-2 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Descripción</th>
                <th className="px-5 py-2 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal text-right"></th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id} className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-2.5 font-mono text-sm text-[#F5F1E8]">{r.quantity}</td>
                  <td className="px-5 py-2.5 font-mono text-sm text-[#9A9489]">{formatCOP(r.price_per_unit)}</td>
                  <td className="px-5 py-2.5 font-mono text-sm text-[#E8C77E]">{formatCOP(r.quantity * r.price_per_unit)}</td>
                  <td className="px-5 py-2.5 text-sm text-[#9A9489]">{r.description || '—'}</td>
                  <td className="px-5 py-2.5 text-right">
                    <button onClick={() => handleDelete(r.id)} className="p-1 text-[#6A655C] hover:text-red-400 transition">
                      <Icon name="Trash2" size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Monthly summary */}
      <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-[#F5F1E8]">Resumen Mensual</h4>
          <div className="flex items-center gap-2">
            <button onClick={() => { if (viewMonth === 1) { setViewMonth(12); setViewYear(viewYear - 1); } else setViewMonth(viewMonth - 1); }}
              className="w-7 h-7 rounded border border-white/[0.08] flex items-center justify-center text-[#9A9489] hover:text-[#C9A86A] transition">
              <Icon name="ChevronLeft" size={14} />
            </button>
            <span className="text-sm text-[#F5F1E8] min-w-[120px] text-center">{MONTH_NAMES[viewMonth - 1]} {viewYear}</span>
            <button onClick={() => { if (viewMonth === 12) { setViewMonth(1); setViewYear(viewYear + 1); } else setViewMonth(viewMonth + 1); }}
              className="w-7 h-7 rounded border border-white/[0.08] flex items-center justify-center text-[#9A9489] hover:text-[#C9A86A] transition">
              <Icon name="ChevronRight" size={14} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#6A655C] mb-1">Total cortes</div>
            <div className="text-xl font-display text-[#F5F1E8]">{monthCount}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#6A655C] mb-1">Total ingresos</div>
            <div className="text-xl font-display text-[#E8C77E]">{formatCOP(monthTotal)}</div>
          </div>
        </div>
      </div>

    </div>
  );
}
