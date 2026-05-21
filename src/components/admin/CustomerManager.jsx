import React, { useState, useEffect } from 'react';
import { Icon } from '../Shared';
import customerService from '../../services/customerService';

export default function CustomerManager() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    const data = await customerService.getAllCustomers();
    setCustomers(data || []);
    setLoading(false);
  };

  const handleToggleBlock = async (customer) => {
    const newStatus = customer.status === 'blocked' ? 'active' : 'blocked';
    const action = newStatus === 'blocked' ? 'bloquear' : 'desbloquear';
    
    if (confirm(`¿Estás seguro de ${action} a ${customer.first_name}?`)) {
      await customerService.updateCustomerStatus(customer.id, newStatus);
      loadCustomers();
    }
  };

  const handleResetStrikes = async (customer) => {
    if (confirm(`¿Perdonar las faltas (strikes) de ${customer.first_name}? Esto lo dejará en 0 faltas y lo activará.`)) {
      await customerService.resetStrikes(customer.id);
      loadCustomers();
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás SEGURO de eliminar a este cliente permanentemente? Todo su perfil será borrado.')) {
      try {
        await customerService.deleteCustomer(id);
        loadCustomers();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const filtered = customers.filter(c => {
    const term = search.toLowerCase();
    return (
      (c.first_name || '').toLowerCase().includes(term) ||
      (c.first_lastname || '').toLowerCase().includes(term) ||
      (c.email || '').toLowerCase().includes(term) ||
      (c.phone || '').includes(term)
    );
  });

  return (
    <div className="animate-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium text-[#F5F1E8]">Gestión de Clientes</h3>
          <p className="text-sm text-[#9A9489]">Revisa el historial de faltas y administra el acceso a la plataforma.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 w-full sm:w-64">
          <Icon name="Search" size={14} className="text-[#9A9489]" />
          <input 
            type="text" 
            placeholder="Buscar cliente..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-[#F5F1E8] w-full"
          />
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Cliente</th>
              <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Contacto</th>
              <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">No-Shows</th>
              <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal">Estado</th>
              <th className="px-5 py-3 text-[10px] tracking-widest uppercase text-[#6A655C] font-normal text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-[#9A9489] text-sm">Cargando clientes...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-[#9A9489] text-sm">No se encontraron clientes.</td>
              </tr>
            ) : (
              filtered.map(c => (
                <tr key={c.id} className={`border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors ${c.status === 'blocked' ? 'opacity-60' : ''}`}>
                  <td className="px-5 py-3.5">
                    <div className="text-sm text-[#F5F1E8] font-medium">{c.first_name} {c.first_lastname}</div>
                    <div className="text-xs text-[#6A655C]">Unido: {new Date(c.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-sm text-[#E8C77E]">{c.phone || 'Sin teléfono'}</div>
                    <div className="text-xs text-[#9A9489]">{c.email}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <span key={i} className={`w-2 h-2 rounded-full ${i < c.no_show_count ? 'bg-red-500' : 'bg-white/10'}`} />
                      ))}
                      <span className="text-xs text-[#6A655C] ml-2">({c.no_show_count}/3)</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2.5 py-1 text-[10px] tracking-wider uppercase rounded-full border ${
                      c.status === 'active' ? 'text-[#7FA86A] bg-[#7FA86A]/10 border-[#7FA86A]/30' : 
                      'text-red-400 bg-red-400/10 border-red-400/30'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    {c.no_show_count > 0 && (
                      <button onClick={() => handleResetStrikes(c)} className="p-2 text-[#9A9489] hover:text-[#7FA86A] transition-colors" title="Perdonar faltas (Reset 0)">
                        <Icon name="RotateCcw" size={14} />
                      </button>
                    )}
                    <button onClick={() => handleToggleBlock(c)} className={`p-2 transition-colors ${c.status === 'blocked' ? 'text-[#9A9489] hover:text-[#7FA86A]' : 'text-[#9A9489] hover:text-orange-400'}`} title={c.status === 'blocked' ? 'Desbloquear' : 'Bloquear acceso'}>
                      <Icon name={c.status === 'blocked' ? 'Unlock' : 'Lock'} size={14} />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="p-2 text-[#9A9489] hover:text-red-400 transition-colors" title="Eliminar permanentemente">
                      <Icon name="Trash2" size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
