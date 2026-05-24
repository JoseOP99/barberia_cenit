import React, { useState } from 'react';
import { Icon } from '../Shared';
import { formatCOP } from '../../data/cenitData';
import useProducts from '../../hooks/useProducts';
import { productsService } from '../../services/productsService';

const INITIAL_FORM = {
  name: '', description: '', price: '', stock: 1, collection: 'Gorra',
  material: '', size: '', color_name: '', color_hex: '#1A1816', accent_hex: '#C9A86A',
  tag: '', visible: true, image_urls: ''
};

export default function InventoryManager() {
  const { products, loading, createProduct, updateProduct, deleteProduct } = useProducts({ adminMode: true });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleEdit = (p) => {
    setEditingId(p.id);
    setSelectedFiles([]);
    setForm({
      name: p.name, description: p.description || '', price: p.price, stock: p.stock,
      collection: p.collection || '', material: p.material || '', size: p.size || 'Ajustable', color_name: p.color_name || '',
      color_hex: p.color_hex || '#1A1816', accent_hex: p.accent_hex || '#C9A86A',
      tag: p.tag || '', visible: p.visible,
      image_urls: p.product_images ? p.product_images.map(img => img.image_url).join(', ') : ''
    });
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setSelectedFiles([]);
    setForm(INITIAL_FORM);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setSelectedFiles([]);
    setForm(INITIAL_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let uploadedUrls = [];
      if (selectedFiles.length > 0) {
        uploadedUrls = await productsService.uploadImages(selectedFiles);
      }

      const existingUrls = form.image_urls ? form.image_urls.split(',').map(u => u.trim()).filter(Boolean) : [];
      const allUrls = [...existingUrls, ...uploadedUrls];

      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        collection: form.collection,
        visible: form.visible,
        image_urls: allUrls
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

  const handleHardDelete = async (id) => {
    if (confirm('¿Seguro que deseas eliminar este producto permanentemente de la tienda?')) {
      try {
        await deleteProduct(id);
      } catch (err) {
        alert(err.message);
      }
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
                      <div className="text-xs text-[#6A655C]">{p.collection || 'Básicos'} • {p.color_name || 'Negro'}</div>
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
                      <button onClick={() => handleHardDelete(p.id)} className="p-2 text-[#9A9489] hover:text-red-400 transition-colors" title="Eliminar definitivamente">
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
          <h3 className="text-lg font-medium text-[#F5F1E8] mb-6">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#9A9489] mb-1">Nombre *</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:border-[#C9A86A] outline-none" />
              </div>
              <div>
                <label className="block text-xs text-[#9A9489] mb-1">Descripción corta</label>
                <input value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:border-[#C9A86A] outline-none" />
              </div>

              <div>
                <label className="block text-xs text-[#9A9489] mb-2">Fotos del producto</label>
                
                {form.image_urls && (
                  <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                    {form.image_urls.split(',').filter(Boolean).map((url, i) => (
                      <div key={i} className="relative w-12 h-12 shrink-0 border border-white/[0.08] rounded bg-[#1A1816] overflow-hidden">
                        <img src={url.trim()} alt="" className="w-full h-full object-cover mix-blend-screen opacity-90" />
                      </div>
                    ))}
                  </div>
                )}

                {selectedFiles.length > 0 && (
                  <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                    {selectedFiles.map((file, i) => (
                      <div key={`new-${i}`} className="relative w-12 h-12 shrink-0 border border-[#C9A86A]/50 rounded bg-[#1A1816] overflow-hidden">
                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover mix-blend-screen opacity-90" />
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="space-y-2">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={e => setSelectedFiles(Array.from(e.target.files))}
                    className="w-full text-sm text-[#9A9489] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#C9A86A]/10 file:text-[#C9A86A] hover:file:bg-[#C9A86A]/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#9A9489] mb-1">Precio *</label>
                <input required type="number" min="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:border-[#C9A86A] outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-[#9A9489] mb-1">Stock *</label>
                <input required type="number" min="0" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:border-[#C9A86A] outline-none" />
              </div>
              <div>
                <label className="block text-xs text-[#9A9489] mb-1">Colección</label>
                <input list="colecciones" value={form.collection} onChange={e => setForm({...form, collection: e.target.value})}
                  className="w-full bg-[#1A1816] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:border-[#C9A86A] outline-none"
                  placeholder="Escribe o elige..." />
                <datalist id="colecciones">
                  <option value="Gorra" />
                  <option value="Camiseta" />
                  <option value="Básicos" />
                  <option value="Edición Limitada" />
                </datalist>
              </div>
              <div>
                <label className="block text-xs text-[#9A9489] mb-1">Color Base</label>
                <input list="colores" value={form.color_name} onChange={e => {
                    const val = e.target.value;
                    let hex = '#1A1816'; // Default Negro
                    const lowerVal = val.toLowerCase();
                    if(lowerVal.includes('blanco')) hex = '#F5F1E8';
                    if(lowerVal.includes('dorado') || lowerVal.includes('oro')) hex = '#C9A86A';
                    if(lowerVal.includes('verde')) hex = '#7FA86A';
                    if(lowerVal.includes('rojo')) hex = '#C56B5A';
                    if(lowerVal.includes('azul')) hex = '#3B82F6';
                    if(lowerVal.includes('gris')) hex = '#9CA3AF';
                    setForm({...form, color_name: val, color_hex: hex});
                  }}
                  className="w-full bg-[#1A1816] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:border-[#C9A86A] outline-none"
                  placeholder="Escribe o elige..."
                />
                <datalist id="colores">
                  <option value="Negro" />
                  <option value="Blanco" />
                  <option value="Dorado" />
                  <option value="Verde" />
                  <option value="Rojo" />
                  <option value="Azul" />
                  <option value="Gris" />
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#9A9489] mb-1">Talla</label>
                <input value={form.size} onChange={e => setForm({...form, size: e.target.value})}
                  className="w-full bg-[#1A1816] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:border-[#C9A86A] outline-none"
                  placeholder="Ej: Ajustable, M, L..." />
              </div>
              <div>
                <label className="block text-xs text-[#9A9489] mb-1">Material</label>
                <input value={form.material} onChange={e => setForm({...form, material: e.target.value})}
                  className="w-full bg-[#1A1816] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:border-[#C9A86A] outline-none"
                  placeholder="Ej: Algodón..." />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.06]">
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
