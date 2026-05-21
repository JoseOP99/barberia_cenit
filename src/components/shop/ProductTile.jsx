import React from 'react';
import { Corners } from '../Shared';
import { CapVisual } from './CapVisual';
import { formatCOP } from '../../data/cenitData';

export function ProductTile({ p, idx, onOpen }) {
  const stockColor = p.stock === 0 ? '#C56B5A' : p.stock < 10 ? '#E8C77E' : '#5A5347';
  return (
    <button onClick={onOpen} className="text-left corner-deco border p-4 hover:border-[#8B6F3F] transition-all bg-[#141312]" style={{ borderColor: '#2A2530' }}>
      <Corners/>
      <div className="aspect-square flex items-center justify-center relative bg-gradient-to-br from-[#1A1816] to-[#0A0A0A] mb-4">
        {p.tag && (
          <span className="absolute top-2 left-2 font-roman text-[9px] z-10 px-2 py-1"
                style={{
                  color: p.tag === "AGOTADO" ? '#C56B5A' : '#14100A',
                  background: p.tag === "AGOTADO" ? 'transparent' : '#C9A86A',
                  border: p.tag === "AGOTADO" ? '1px solid #C56B5A' : 'none',
                  letterSpacing: '0.2em'
                }}>{p.tag}</span>
        )}
        <span className="absolute top-2 right-2 font-mono text-[10px]" style={{ color: '#5A5347' }}>№{String(idx+1).padStart(3,'0')}</span>
        <CapVisual color={p.color_hex || '#1A1816'} accent={p.accent_hex || '#C9A86A'}/>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="font-roman text-[10px]" style={{ color: '#C9A86A', letterSpacing: '0.22em' }}>{(p.category_name || p.collection || 'Básicos').toUpperCase()}</span>
          <span className="w-3 h-3 rounded-full border border-white/10" style={{ background: p.color_hex || '#1A1816' }}/>
        </div>
        <h4 className="font-display text-lg leading-tight mb-2" style={{ color: '#F1ECDE', fontStyle: 'italic' }}>{p.name}</h4>
        <div className="flex items-baseline justify-between mt-3">
          <span className="font-mono text-sm" style={{ color: '#E8C77E' }}>{formatCOP(p.price)}</span>
          <span className="font-mono text-[10px]" style={{ color: stockColor }}>
            {p.stock === 0 ? 'AGOTADO' : p.stock < 10 ? `SOLO ${p.stock}` : 'EN STOCK'}
          </span>
        </div>
      </div>
    </button>
  );
}
