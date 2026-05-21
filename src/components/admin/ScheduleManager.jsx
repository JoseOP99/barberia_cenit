import React, { useState, useEffect } from 'react';
import { Icon } from '../Shared';
import scheduleService from '../../services/scheduleService';
import barbersService from '../../services/barbersService';

const DAY_LABELS = {
  1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves',
  5: 'Viernes', 6: 'Sábado', 0: 'Domingo'
};

const TIME_OPTIONS = [];
for (let i = 5; i <= 22; i++) {
  const hour = i.toString().padStart(2, '0');
  TIME_OPTIONS.push(`${hour}:00`);
  TIME_OPTIONS.push(`${hour}:30`);
}
TIME_OPTIONS.push('23:00');
TIME_OPTIONS.push('23:59');

function CustomTimeSelect({ value, onChange, disabled }) {
  return (
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="bg-black/20 text-[#E8C77E] font-mono outline-none border border-white/[0.1] rounded-lg pl-3 pr-8 py-2 text-sm focus:border-[#C9A86A] disabled:opacity-30 disabled:cursor-not-allowed appearance-none cursor-pointer transition-colors hover:border-white/[0.2]"
      style={{ 
        backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='none' stroke='%23C9A86A' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'></path></svg>")`, 
        backgroundRepeat: 'no-repeat', 
        backgroundPosition: 'right 0.5rem center', 
        backgroundSize: '1.2em' 
      }}
    >
      {/* Opción actual por si la base de datos tiene una hora extraña como 08:45 */}
      {!TIME_OPTIONS.includes(value) && value && (
        <option value={value} className="bg-[#1A1816] text-[#E8C77E]">{value}</option>
      )}
      {TIME_OPTIONS.map(time => (
        <option key={time} value={time} className="bg-[#1A1816] text-[#E8C77E]">
          {time}
        </option>
      ))}
    </select>
  );
}

export default function ScheduleManager() {
  const [barber, setBarber] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states para Schedule Blocks (Vacaciones/Permisos)
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [blockForm, setBlockForm] = useState({
    reason: '', start_date: '', end_date: '', block_type: 'vacation'
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const barbers = await barbersService.getAllBarbers(false);
      if (barbers && barbers.length > 0) {
        const primaryBarber = barbers[0];
        setBarber(primaryBarber);
        await refreshSchedules(primaryBarber.id);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const refreshSchedules = async (barberId) => {
    const s = await scheduleService.getBarberSchedules(barberId);
    const b = await scheduleService.getScheduleBlocks(barberId);
    setSchedules(s || []);
    setBlocks(b || []);
  };

  const handleToggleDay = async (scheduleItem) => {
    await scheduleService.updateBarberSchedule(scheduleItem.id, { is_active: !scheduleItem.is_active });
    refreshSchedules(barber.id);
  };

  const handleTimeChange = async (id, field, value) => {
    await scheduleService.updateBarberSchedule(id, { [field]: value });
    refreshSchedules(barber.id);
  };

  const handleCreateBlock = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await scheduleService.createScheduleBlock({
        barber_id: barber.id,
        ...blockForm
      });
      setShowBlockForm(false);
      setBlockForm({ reason: '', start_date: '', end_date: '', block_type: 'vacation' });
      refreshSchedules(barber.id);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBlock = async (id) => {
    if (confirm('¿Eliminar este permiso/vacación?')) {
      await scheduleService.deleteScheduleBlock(id);
      refreshSchedules(barber.id);
    }
  };

  if (loading) return <div className="text-sm text-[#9A9489] p-4">Cargando horario...</div>;
  if (!barber) return <div className="text-sm text-[#9A9489] p-4">No hay barberos configurados.</div>;

  // Ordenar días para mostrar Lunes a Domingo (Lunes=1... Domingo=0)
  const sortedSchedules = [...schedules].sort((a, b) => {
    const sortVal = (x) => x.day_of_week === 0 ? 7 : x.day_of_week;
    return sortVal(a) - sortVal(b);
  });

  return (
    <div className="animate-in space-y-10">
      
      {/* SECCIÓN 1: Horario Regular */}
      <section>
        <div className="mb-4">
          <h3 className="text-lg font-medium text-[#F5F1E8]">Horario Regular</h3>
          <p className="text-sm text-[#9A9489]">Define los días y horas de apertura de {barber.name}.</p>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Día</th>
                <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Apertura</th>
                <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Cierre</th>
                <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal text-right">Estado</th>
              </tr>
            </thead>
            <tbody>
              {sortedSchedules.map(s => (
                <tr key={s.id} className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5 text-sm text-[#F5F1E8] font-medium">{DAY_LABELS[s.day_of_week]}</td>
                  <td className="px-5 py-3.5">
                    <CustomTimeSelect 
                      value={s.open_time.slice(0, 5)} 
                      onChange={(val) => handleTimeChange(s.id, 'open_time', val)}
                      disabled={!s.is_active}
                    />
                  </td>
                  <td className="px-5 py-3.5">
                    <CustomTimeSelect 
                      value={s.close_time.slice(0, 5)} 
                      onChange={(val) => handleTimeChange(s.id, 'close_time', val)}
                      disabled={!s.is_active}
                    />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button 
                      onClick={() => handleToggleDay(s)}
                      className={`inline-flex px-3 py-1.5 text-[10px] tracking-wider uppercase rounded-full border transition-colors ${
                        s.is_active ? 'text-[#7FA86A] bg-[#7FA86A]/10 border-[#7FA86A]/30 hover:bg-[#7FA86A]/20' : 'text-[#6A655C] bg-white/[0.03] border-white/[0.06] hover:text-[#9A9489]'
                      }`}
                    >
                      {s.is_active ? 'Abierto' : 'Cerrado'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECCIÓN 2: Excepciones (Vacaciones / Permisos) */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-[#F5F1E8]">Vacaciones y Permisos</h3>
            <p className="text-sm text-[#9A9489]">Bloquea el calendario para fechas específicas.</p>
          </div>
          {!showBlockForm && (
            <button onClick={() => setShowBlockForm(true)} className="btn-gold px-4 py-2 text-xs font-semibold rounded flex items-center gap-2">
              <Icon name="CalendarPlus" size={14} /> Añadir Bloqueo
            </button>
          )}
        </div>

        {showBlockForm && (
          <div className="mb-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h4 className="text-sm font-medium text-[#F5F1E8] mb-4">Nuevo Bloqueo</h4>
            <form onSubmit={handleCreateBlock} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#9A9489] mb-1">Fecha Inicio *</label>
                  <input required type="date" value={blockForm.start_date} onChange={e => setBlockForm({...blockForm, start_date: e.target.value})}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:border-[#C9A86A] outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-[#9A9489] mb-1">Fecha Fin *</label>
                  <input required type="date" value={blockForm.end_date} onChange={e => setBlockForm({...blockForm, end_date: e.target.value})}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:border-[#C9A86A] outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#9A9489] mb-1">Motivo</label>
                  <input required type="text" placeholder="Ej: Viaje familiar" value={blockForm.reason} onChange={e => setBlockForm({...blockForm, reason: e.target.value})}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:border-[#C9A86A] outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-[#9A9489] mb-1">Tipo</label>
                  <select value={blockForm.block_type} onChange={e => setBlockForm({...blockForm, block_type: e.target.value})}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:border-[#C9A86A] outline-none">
                    <option value="vacation">Vacaciones</option>
                    <option value="day_off">Día Libre</option>
                    <option value="custom">Otro</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={isSubmitting} className="btn-gold px-6 py-2 text-sm font-semibold rounded disabled:opacity-50">
                  {isSubmitting ? 'Guardando...' : 'Guardar Bloqueo'}
                </button>
                <button type="button" onClick={() => setShowBlockForm(false)} disabled={isSubmitting} className="px-6 py-2 text-sm text-[#9A9489] hover:text-[#F5F1E8]">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {blocks.length > 0 ? (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Fechas</th>
                  <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Motivo</th>
                  <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Tipo</th>
                  <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {blocks.map(b => (
                  <tr key={b.id} className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="text-sm font-mono text-[#F5F1E8]">{b.start_date} <span className="text-[#6A655C]">a</span> {b.end_date}</div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-[#9A9489]">{b.reason}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex px-2.5 py-1 text-[10px] tracking-wider uppercase rounded-full border text-orange-400 bg-orange-400/10 border-orange-400/30">
                        {b.block_type === 'vacation' ? 'Vacaciones' : b.block_type === 'day_off' ? 'Día Libre' : 'Otro'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => handleDeleteBlock(b.id)} className="p-2 text-[#9A9489] hover:text-red-400 transition-colors" title="Eliminar bloqueo">
                        <Icon name="Trash2" size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-white/[0.06] border-dashed p-8 text-center text-[#6A655C] text-sm">
            No hay excepciones ni vacaciones programadas.
          </div>
        )}
      </section>
    </div>
  );
}
