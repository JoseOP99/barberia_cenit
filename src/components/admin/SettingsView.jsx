import React, { useState } from 'react';
import { Icon } from '../Shared';

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: 'Settings' },
    { id: 'business', label: 'Negocio', icon: 'Briefcase' },
    { id: 'notifications', label: 'Notificaciones', icon: 'Bell' },
    { id: 'database', label: 'Base de Datos', icon: 'Database' }
  ];

  return (
    <div className="animate-in max-w-4xl">
      <div className="mb-6">
        <h3 className="text-xl font-medium text-[#F5F1E8]">Ajustes del Sistema</h3>
        <p className="text-sm text-[#9A9489] mt-1">Configuración general de Cénit Barbería.</p>
      </div>

      <div className="flex border-b border-white/[0.06] mb-8 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-[#C9A86A] text-[#C9A86A]' 
                : 'border-transparent text-[#6A655C] hover:text-[#9A9489]'
            }`}
          >
            <Icon name={tab.icon} size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <div className="space-y-6">
          <SettingsSection title="Identidad de Marca" description="Configura los colores y logos base de la aplicación.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#6A655C] mb-1.5">Nombre Público</label>
                <input type="text" defaultValue="Cénit Barbería" className="w-full bg-black/50 border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-[#F5F1E8] focus:border-[#C9A86A] outline-none" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#6A655C] mb-1.5">Color Primario (Acento)</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded border border-white/10" style={{ background: '#C9A86A' }}></div>
                  <input type="text" defaultValue="#C9A86A" className="flex-1 bg-black/50 border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-[#F5F1E8] focus:border-[#C9A86A] outline-none" />
                </div>
              </div>
            </div>
          </SettingsSection>
          
          <SettingsSection title="SEO y Metadatos" description="Información para los motores de búsqueda y redes sociales.">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#6A655C] mb-1.5">Descripción del sitio</label>
              <textarea rows="3" defaultValue="Cénit Barbería. Cortes Premium y diseño de barbas en la ciudad." className="w-full bg-black/50 border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-[#F5F1E8] focus:border-[#C9A86A] outline-none resize-none"></textarea>
            </div>
          </SettingsSection>

          <div className="flex justify-end">
            <button className="bg-[#C9A86A] text-[#1A1408] px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#E8C77E] transition">
              Guardar Cambios
            </button>
          </div>
        </div>
      )}

      {activeTab === 'business' && (
        <div className="glass-panel p-8 text-center rounded-xl border border-white/[0.06]">
          <Icon name="Briefcase" size={32} className="mx-auto mb-4 text-[#C9A86A] opacity-50" />
          <h4 className="text-[#F5F1E8] font-medium mb-1">Ajustes de Negocio</h4>
          <p className="text-[#6A655C] text-sm">Próximamente: Configura horarios de apertura, festivos y políticas de cancelación.</p>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <ToggleSetting title="Notificaciones de Citas Nuevas" description="Recibir un email cuando un cliente agende una cita." defaultChecked={true} />
          <ToggleSetting title="Alertas de Inventario Bajo" description="Recibir alertas cuando una gorra llegue a menos de 5 unidades." defaultChecked={true} />
          <ToggleSetting title="Reporte Semanal" description="Recibir un resumen de ingresos y citas los domingos." defaultChecked={false} />
        </div>
      )}

      {activeTab === 'database' && (
        <div className="glass-panel p-8 rounded-xl border border-white/[0.06] bg-red-500/5">
          <h4 className="text-red-400 font-medium mb-2 flex items-center gap-2">
            <Icon name="AlertTriangle" size={18} /> Zona Peligrosa
          </h4>
          <p className="text-[#9A9489] text-sm mb-6">Estas acciones pueden afectar severamente el sistema de Supabase y la información de la barbería.</p>
          <div className="space-y-3">
            <button className="w-full text-left px-5 py-3 rounded-lg border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition text-sm flex justify-between items-center">
              <span>Limpiar Reservas Expiradas de la Tienda</span>
              <Icon name="Trash2" size={16} />
            </button>
            <button className="w-full text-left px-5 py-3 rounded-lg border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition text-sm flex justify-between items-center">
              <span>Sincronizar Stock Manualmente</span>
              <Icon name="RefreshCw" size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

function SettingsSection({ title, description, children }) {
  return (
    <div className="glass-panel p-6 rounded-xl border border-white/[0.06]">
      <h4 className="text-sm font-semibold tracking-widest uppercase text-[#F5F1E8] mb-1">{title}</h4>
      <p className="text-xs text-[#6A655C] mb-6">{description}</p>
      {children}
    </div>
  );
}

function ToggleSetting({ title, description, defaultChecked }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="glass-panel p-5 rounded-xl border border-white/[0.06] flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] transition" onClick={() => setChecked(!checked)}>
      <div>
        <h5 className="text-sm font-medium text-[#F5F1E8]">{title}</h5>
        <p className="text-xs text-[#6A655C] mt-0.5">{description}</p>
      </div>
      <div className={`w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-[#C9A86A]' : 'bg-white/10'}`}>
        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
      </div>
    </div>
  );
}
