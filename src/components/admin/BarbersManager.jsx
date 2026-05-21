import React, { useState, useEffect } from 'react';
import { Icon } from '../Shared';
import barbersService from '../../services/barbersService';

const INITIAL_FORM = {
  name: '', role: 'Barbero', years_experience: 0, signature_style: '', 
  phone: '', email: '', status: 'active'
};

export default function BarbersManager() {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { loadBarbers(); }, []);

  const loadBarbers = async () => {
    setLoading(true);
    const data = await barbersService.getAllBarbers(true); // includeInactive = true
    setBarbers(data || []);
    setLoading(false);
  };

  const handleEdit = (b) => {
    setEditingId(b.id);
    setForm({
      name: b.name, role: b.role, years_experience: b.years_experience || 0,
      signature_style: b.signature_style || '', phone: b.phone || '', 
      email: b.email || '', status: b.status
    });
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(INITIAL_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        years_experience: Number(form.years_experience),
      };
      if (editingId) {
        await barbersService.updateBarber(editingId, payload);
      } else {
        await barbersService.createBarber(payload);
      }
      handleCancel();
      loadBarbers();
    } catch (err) {
      alert("Error guardando barbero: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Seguro que deseas desactivar este barbero?')) {
      await barbersService.updateBarberStatus(id, 'inactive');
      loadBarbers();
    }
  };

  if (loading && !barbers.length) return <div className="text-sm text-[#9A9489]">Cargando barberos...</div>;

  return (
    <div className="animate-in space-y-6">
      {!showForm ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#9A9489]">Gestiona el equipo de barberos.</p>
            <button onClick={handleAddNew} className="btn-gold px-4 py-2 text-xs font-semibold rounded flex items-center gap-2">
              <Icon name="Plus" size={14} /> Nuevo Barbero
            </button>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Nombre</th>
                  <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Rol</th>
                  <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Experiencia</th>
                  <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Estado</th>
                  <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {barbers.map(b => (
                  <tr key={b.id} className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="text-sm text-[#F5F1E8] font-medium">{b.name}</div>
                      <div className="text-xs text-[#6A655C]">{b.phone}</div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-[#E8C77E]">{b.role}</td>
                    <td className="px-5 py-3.5 font-mono text-sm text-[#F5F1E8]">{b.years_experience} años</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 text-[10px] tracking-wider uppercase rounded-full border ${
                        b.status === 'active' ? 'text-[#7FA86A] bg-[#7FA86A]/10 border-[#7FA86A]/30' : 'text-[#6A655C] bg-white/[0.03] border-white/[0.06]'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => handleEdit(b)} className="p-2 text-[#9A9489] hover:text-[#C9A86A] transition-colors" title="Editar">
                        <Icon name="Edit2" size={14} />
                      </button>
                      {b.status === 'active' && (
                        <button onClick={() => handleDelete(b.id)} className="p-2 text-[#9A9489] hover:text-red-400 transition-colors" title="Desactivar">
                          <Icon name="UserMinus" size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 max-w-2xl">
          <h3 className="text-lg font-medium text-[#F5F1E8] mb-6">{editingId ? 'Editar Barbero' : 'Nuevo Barbero'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#9A9489] mb-1">Nombre *</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:border-[#C9A86A] outline-none" />
              </div>
              <div>
                <label className="block text-xs text-[#9A9489] mb-1">Rol</label>
                <input required value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:border-[#C9A86A] outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#9A9489] mb-1">Años de Experiencia</label>
                <input type="number" min="0" value={form.years_experience} onChange={e => setForm({...form, years_experience: e.target.value})}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:border-[#C9A86A] outline-none" />
              </div>
              <div>
                <label className="block text-xs text-[#9A9489] mb-1">Teléfono</label>
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:border-[#C9A86A] outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#9A9489] mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:border-[#C9A86A] outline-none" />
              </div>
              <div>
                <label className="block text-xs text-[#9A9489] mb-1">Estilo (Especialidad)</label>
                <input value={form.signature_style} onChange={e => setForm({...form, signature_style: e.target.value})}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:border-[#C9A86A] outline-none" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="bg-white/[0.04] border border-white/[0.08] text-sm text-[#F5F1E8] rounded-lg px-3 py-1.5 outline-none">
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="on-leave">De vacaciones / Permiso</option>
              </select>
              <label className="text-sm text-[#F5F1E8]">Estado</label>
            </div>
            <div className="flex gap-3 pt-4 border-t border-white/[0.06]">
              <button type="submit" disabled={isSubmitting} className="btn-gold px-6 py-2 text-sm font-semibold rounded disabled:opacity-50">
                {isSubmitting ? 'Guardando...' : 'Guardar Barbero'}
              </button>
              <button type="button" onClick={handleCancel} disabled={isSubmitting} className="px-6 py-2 text-sm text-[#9A9489] hover:text-[#F5F1E8]">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
