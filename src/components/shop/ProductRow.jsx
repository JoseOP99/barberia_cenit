import React from 'react';
import { Icon, Corners } from '../Shared';
import { CapVisual } from './CapVisual';
import { formatCOP } from '../../data/cenitData';

export function ProductRow({ p, idx, onOpen }) {
  return (
    <button onClick={onOpen}
      className="w-full corner-deco border p-4 flex items-center gap-6 hover:border-[#8B6F3F] transition-colors text-left bg-[#141312]" style={{ borderColor: '#2A2530' }}>
      <Corners/>
      <div className="w-24 h-24 shrink-0 flex items-center justify-center relative overflow-hidden" style={{ background: '#0A090C' }}>
        {p.product_images && p.product_images.length > 0 ? (
          <img src={p.product_images[0].image_url} alt={p.name} className="w-full h-full object-cover mix-blend-screen opacity-90 p-1" />
        ) : (
          <CapVisual color={p.color_hex || '#1A1816'} accent={p.accent_hex || '#C9A86A'}/>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <span className="font-roman text-[10px]" style={{ color: '#C9A86A', letterSpacing: '0.22em' }}>{(p.category_name || p.collection || 'Básicos').toUpperCase()}</span>
          <span className="font-mono text-[10px]" style={{ color: '#5A5347' }}>№{String(idx+1).padStart(3,'0')}</span>
          {p.tag && (
            <span className="font-roman text-[9px] px-2 py-0.5"
              style={{ color: p.tag === 'AGOTADO' ? '#C56B5A' : '#14100A',
                       background: p.tag === 'AGOTADO' ? 'transparent' : '#C9A86A',
                       border: p.tag === 'AGOTADO' ? '1px solid #C56B5A' : 'none',
                       letterSpacing: '0.18em' }}>{p.tag}</span>
          )}
        </div>
        <h4 className="font-display text-xl" style={{ color: '#F1ECDE', fontStyle: 'italic' }}>{p.name}</h4>
        <div className="font-mono text-xs mt-1" style={{ color: '#948A78' }}>
          {[p.material, p.color_name].filter(Boolean).map(v => v.toUpperCase()).join(' · ')}
        </div>
      </div>
      <div className="flex flex-col sm:items-end justify-center w-full sm:w-auto mt-2 sm:mt-0 pb-1 sm:pb-0">
        <div className="font-mono text-lg" style={{ color: '#E8C77E' }}>
          {p.discount_percentage > 0 ? (
            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
              <span className="text-xs text-[#C56B5A] line-through opacity-80">{formatCOP(p.price)}</span>
              <span className="flex items-center gap-2">
                <span className="font-bold">{formatCOP(p.price * (1 - p.discount_percentage / 100))}</span>
                <span className="text-[10px] bg-[#C56B5A] text-white px-1.5 py-0.5 rounded-sm font-sans tracking-wide sm:hidden">-{p.discount_percentage}%</span>
              </span>
            </div>
          ) : (
            formatCOP(p.price)
          )}
        </div>
        <div className="font-mono text-[10px] mt-1" style={{ color: p.stock === 0 ? '#C56B5A' : '#5A5347' }}>
          {p.stock === 0 ? 'AGOTADO' : `${p.stock} EN STOCK`}
        </div>
      </div>
      <Icon name="ArrowRight" size={16} style={{ color: '#8B6F3F' }}/>
    </button>
  );
}
