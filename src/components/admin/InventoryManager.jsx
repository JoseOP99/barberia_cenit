import React, { useState } from 'react';
import { Icon } from '../Shared';
import { formatCOP } from '../../data/cenitData';
import useProducts from '../../hooks/useProducts';

const INITIAL_FORM = {
  name: '', description: '', price: '', stock: '', collection: '',
  material: '', color_name: '', color_hex: '#1A1816', accent_hex: '#C9A86A',
  tag: '', visible: true
};

export default function InventoryManager() {
  const { products, loading, createProduct, updateProduct, deleteProduct } = useProducts({ adminMode: true });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name, description: p.description || '', price: p.price, stock: p.stock,
      collection: p.collection || '', material: p.material || '', color_name: p.color_name || '',
      color_hex: p.color_hex || '#1A1816', accent_hex: p.accent_hex || '#C9A86A',
      tag: p.tag || '', visible: p.visible
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
        stock: Number(form.stock),
      };
      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }
      handleCancel();
    } catch (err) {
      alert("Error guardando producto: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Seguro que deseas ocultar este producto de la tienda?')) {
      await deleteProduct(id);
    }
  };

  if (loading && !products.length) {
    return <div className="text-sm text-[#9A9489]">Cargando inventario...</div>;
  }

  return (
    <div className="animate-in space-y-6">
      {!showForm ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#9A9489]">Gestiona el catálogo de tu tienda, precios y stock.</p>
            <button onClick={handleAddNew} className="btn-gold px-4 py-2 text-xs font-semibold rounded flex items-center gap-2">
              <Icon name="Plus" size={14} /> Nuevo Producto
            </button>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Producto</th>
                  <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Precio</th>
                  <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Stock</th>
                  <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Estado</th>
                  <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-8 text-center text-sm text-[#6A655C]">No hay productos en el inventario.</td>
                  </tr>
                ) : products.map(p => (
                  <tr key={p.id} className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="text-sm text-[#F5F1E8] font-medium">{p.name}</div>
                      <div className="text-xs text-[#6A655C]">{p.collection || 'Básicos'}</div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-sm text-[#E8C77E]">{formatCOP(p.price)}</td>
                    <td className="px-5 py-3.5 font-mono text-sm">
                      <span className={p.stock === 0 ? 'text-red-400' : 'text-[#F5F1E8]'}>{p.stock}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 text-[10px] tracking-wider uppercase rounded-full border ${
                        p.visible ? 'text-[#7FA86A] bg-[#7FA86A]/10 border-[#7FA86A]/30' : 'text-[#6A655C] bg-white/[0.03] border-white/[0.06]'
                      }`}>
                        {p.visible ? 'Visible' : 'Oculto'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => handleEdit(p)} className="p-2 text-[#9A9489] hover:text-[#C9A86A] transition-colors" title="Editar">
                        <Icon name="Edit2" size={14} />
                      </button>
                      {p.visible && (
                        <button onClick={() => handleDelete(p.id)} className="p-2 text-[#9A9489] hover:text-red-400 transition-colors" title="Ocultar">
                          <Icon name="EyeOff" size={14} />
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
          <h3 className="text-lg font-medium text-[#F5F1E8] mb-6">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#9A9489] mb-1">Nombre *</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:border-[#C9A86A] outline-none" />
              </div>
              <div>
                <label className="block text-xs text-[#9A9489] mb-1">Colección</label>
                <input value={form.collection} onChange={e => setForm({...form, collection: e.target.value})}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:border-[#C9A86A] outline-none"
                  placeholder="Ej: Essentials" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#9A9489] mb-1">Precio *</label>
                <input required type="number" min="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:border-[#C9A86A] outline-none" />
              </div>
              <div>
                <label className="block text-xs text-[#9A9489] mb-1">Stock *</label>
                <input required type="number" min="0" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:border-[#C9A86A] outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-[#9A9489] mb-1">Nombre Color</label>
                <input value={form.color_name} onChange={e => setForm({...form, color_name: e.target.value})}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:border-[#C9A86A] outline-none" />
              </div>
              <div>
                <label className="block text-xs text-[#9A9489] mb-1">Color Base (Hex)</label>
                <input type="color" value={form.color_hex} onChange={e => setForm({...form, color_hex: e.target.value})}
                  className="w-full h-[38px] bg-white/[0.04] border border-white/[0.08] rounded-lg px-1 py-1 cursor-pointer" />
              </div>
              <div>
                <label className="block text-xs text-[#9A9489] mb-1">Color Acento (Hex)</label>
                <input type="color" value={form.accent_hex} onChange={e => setForm({...form, accent_hex: e.target.value})}
                  className="w-full h-[38px] bg-white/[0.04] border border-white/[0.08] rounded-lg px-1 py-1 cursor-pointer" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#9A9489] mb-1">Material</label>
                <input value={form.material} onChange={e => setForm({...form, material: e.target.value})}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:border-[#C9A86A] outline-none" />
              </div>
              <div>
                <label className="block text-xs text-[#9A9489] mb-1">Etiqueta (NUEVO, AGOTADO)</label>
                <input value={form.tag} onChange={e => setForm({...form, tag: e.target.value})}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:border-[#C9A86A] outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#9A9489] mb-1">Descripción</label>
              <textarea rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:border-[#C9A86A] outline-none" />
            </div>

            <div className="flex items-center gap-2 mt-4">
              <input type="checkbox" id="visible" checked={form.visible} onChange={e => setForm({...form, visible: e.target.checked})}
                className="accent-[#C9A86A]" />
              <label htmlFor="visible" className="text-sm text-[#F5F1E8]">Visible en la tienda</label>
            </div>

            <div className="flex gap-3 pt-4 border-t border-white/[0.06]">
              <button type="submit" disabled={isSubmitting} className="btn-gold px-6 py-2 text-sm font-semibold rounded disabled:opacity-50">
                {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
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
