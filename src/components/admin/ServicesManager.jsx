import React, { useState, useEffect } from 'react';
import { Icon } from '../Shared';
import { formatCOP } from '../../data/cenitData';
import servicesService from '../../services/servicesService';

const INITIAL_FORM = {
  name: '', description: '', price: '', duration_minutes: 45, category: 'corte', available: true
};

export default function ServicesManager() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { loadServices(); }, []);

  const loadServices = async () => {
    setLoading(true);
    const data = await servicesService.getAllServicesAdmin();
    setServices(data || []);
    setLoading(false);
  };

  const handleEdit = (s) => {
    setEditingId(s.id);
    setForm({
      name: s.name, description: s.description || '', price: s.price, 
      duration_minutes: s.duration_minutes, category: s.category || 'corte', available: s.available
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
        price: Number(form.price),
        duration_minutes: Number(form.duration_minutes),
      };
      if (editingId) {
        await servicesService.updateService(editingId, payload);
      } else {
        await servicesService.createService(payload);
      }
      handleCancel();
      loadServices();
    } catch (err) {
      alert("Error guardando servicio: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHardDelete = async (id) => {
    if (confirm('¿Seguro que deseas eliminar este servicio de forma permanente? Esto fallará si hay citas asociadas a él.')) {
      try {
        await servicesService.deleteService(id);
        loadServices();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  if (loading && !services.length) return <div className="text-sm text-[#9A9489]">Cargando servicios...</div>;

  return (
    <div className="animate-in space-y-6">
      {!showForm ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#9A9489]">Gestiona los servicios y precios de la barbería.</p>
            <button onClick={handleAddNew} className="btn-gold px-4 py-2 text-xs font-semibold rounded flex items-center gap-2">
              <Icon name="Plus" size={14} /> Nuevo Servicio
            </button>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Servicio</th>
                  <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Precio</th>
                  <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Duración</th>
                  <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Estado</th>
                  <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {services.map(s => (
                  <tr key={s.id} className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="text-sm text-[#F5F1E8] font-medium">{s.name}</div>
                      <div className="text-xs text-[#6A655C]">{s.category}</div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-sm text-[#E8C77E]">{formatCOP(s.price)}</td>
                    <td className="px-5 py-3.5 font-mono text-sm text-[#F5F1E8]">{s.duration_minutes} min</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 text-[10px] tracking-wider uppercase rounded-full border ${
                        s.available ? 'text-[#7FA86A] bg-[#7FA86A]/10 border-[#7FA86A]/30' : 'text-[#6A655C] bg-white/[0.03] border-white/[0.06]'
                      }`}>
                        {s.available ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => handleEdit(s)} className="p-2 text-[#9A9489] hover:text-[#C9A86A] transition-colors" title="Editar">
                        <Icon name="Edit2" size={14} />
                      </button>
                      <button onClick={() => handleHardDelete(s.id)} className="p-2 text-[#9A9489] hover:text-red-400 transition-colors" title="Eliminar definitivamente">
                        <Icon name="Trash2" size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 max-w-2xl">
          <h3 className="text-lg font-medium text-[#F5F1E8] mb-6">{editingId ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#9A9489] mb-1">Nombre *</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:border-[#C9A86A] outline-none" />
              </div>
              <div>
                <label className="block text-xs text-[#9A9489] mb-1">Categoría</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:border-[#C9A86A] outline-none">
                  <option value="corte">Corte</option>
                  <option value="afeitado">Afeitado</option>
                  <option value="completo">Completo</option>
                  <option value="diseño">Diseño</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#9A9489] mb-1">Precio *</label>
                <input required type="number" min="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:border-[#C9A86A] outline-none" />
              </div>
              <div>
                <label className="block text-xs text-[#9A9489] mb-1">Duración (min) *</label>
                <input required type="number" min="5" step="5" value={form.duration_minutes} onChange={e => setForm({...form, duration_minutes: e.target.value})}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:border-[#C9A86A] outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-[#9A9489] mb-1">Descripción</label>
              <textarea rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:border-[#C9A86A] outline-none" />
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input type="checkbox" id="available" checked={form.available} onChange={e => setForm({...form, available: e.target.checked})} className="accent-[#C9A86A]" />
              <label htmlFor="available" className="text-sm text-[#F5F1E8]">Servicio Activo</label>
            </div>
            <div className="flex gap-3 pt-4 border-t border-white/[0.06]">
              <button type="submit" disabled={isSubmitting} className="btn-gold px-6 py-2 text-sm font-semibold rounded disabled:opacity-50">
                {isSubmitting ? 'Guardando...' : 'Guardar Servicio'}
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
