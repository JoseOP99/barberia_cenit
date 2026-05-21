import React from 'react';
import { Icon } from '../Shared';

export function KPI({ label, value, icon }) {
  return (
    <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[#6A655C]">{label}</span>
        <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(201,168,106,0.1)' }}>
          <Icon name={icon} size={14} className="text-[#C9A86A]" />
        </span>
      </div>
      <div className="font-display text-2xl text-[#F5F1E8]">{value}</div>
    </div>
  );
}

export function PlaceholderView({ name }) {
  return (
    <div className="rounded-xl p-12 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <Icon name="Construction" size={32} className="mx-auto mb-4 text-[#C9A86A]" />
      <h3 className="text-xl font-medium text-[#F5F1E8]">{name}</h3>
      <p className="text-sm text-[#6A655C] mt-2">En desarrollo.</p>
    </div>
  );
}
