import React from 'react';
import { Corners } from '../Shared';
import { CapVisual } from './CapVisual';
import { formatCOP } from '../../data/cenitData';

export function ProductTile({ p, idx, onOpen }) {
  const stockColor = p.stock === 0 ? '#C56B5A' : p.stock < 10 ? '#E8C77E' : '#5A5347';
  return (
    <button onClick={onOpen} className="text-left corner-deco border p-4 hover:border-[#8B6F3F] transition-all bg-[#141312] relative group" style={{ borderColor: '#2A2530' }}>
      {p.discount_percentage > 0 && (
        <div className="absolute top-2 right-2 bg-[#C56B5A] text-white text-[10px] font-black px-2 py-1 rounded-sm z-20 shadow-lg shadow-black/50 tracking-wider transform translate-x-2 -translate-y-2 group-hover:scale-105 transition-transform">
          -{p.discount_percentage}% OFF
        </div>
      )}
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
        {p.product_images && p.product_images.length > 0 ? (
          <img src={p.product_images[0].image_url} alt={p.name} className="w-full h-full object-cover mix-blend-screen opacity-90 p-2" />
        ) : (
          <CapVisual color={p.color_hex || '#1A1816'} accent={p.accent_hex || '#C9A86A'}/>
        )}
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="font-roman text-[10px]" style={{ color: '#C9A86A', letterSpacing: '0.22em' }}>{(p.category_name || p.collection || 'Básicos').toUpperCase()}</span>
          <span className="w-3 h-3 rounded-full border border-white/10" style={{ background: p.color_hex || '#1A1816' }}/>
        </div>
        <h4 className="font-display text-lg leading-tight mb-2" style={{ color: '#F1ECDE', fontStyle: 'italic' }}>{p.name}</h4>
        <div className="flex items-baseline justify-between mt-3">
          <div className="font-mono text-sm" style={{ color: '#E8C77E' }}>
            {p.discount_percentage > 0 ? (
              <div className="flex flex-col">
                <span className="text-[10px] text-[#C56B5A] line-through opacity-80">{formatCOP(p.price)}</span>
                <span className="font-bold">{formatCOP(p.price * (1 - p.discount_percentage / 100))}</span>
              </div>
            ) : (
              formatCOP(p.price)
            )}
          </div>
          <span className="font-mono text-[10px]" style={{ color: stockColor }}>
            {p.stock === 0 ? 'AGOTADO' : p.stock < 10 ? `SOLO ${p.stock}` : 'EN STOCK'}
          </span>
        </div>
      </div>
    </button>
  );
}
