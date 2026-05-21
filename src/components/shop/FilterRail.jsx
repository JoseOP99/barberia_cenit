import React from 'react';
import { formatCOP } from '../../data/cenitData';

export default function FilterRail({ filters, setFilters, toggle, categories, colors, className = "" }) {
  return (
    <div className={className} style={{ borderColor: '#2A2530' }}>
      <div className="mb-8">
        <h4 className="font-roman text-[10px] text-gold tracking-[0.2em] mb-4">CATEGORÍAS</h4>
        {categories.map(c => {
          const checked = (filters.categories || []).includes(c);
          return (
            <label key={c} className="flex items-center justify-between mb-2 cursor-pointer text-xs">
              <span className="flex items-center gap-3">
                <input type="checkbox" checked={checked} onChange={() => toggle('categories', c)} className="accent-[#C9A86A]"/>
                <span style={{ color: checked ? '#E8C77E' : '#948A78' }}>{c}</span>
              </span>
            </label>
          );
        })}
      </div>

      <div className="mb-8">
        <h4 className="font-roman text-[10px] text-gold tracking-[0.2em] mb-4">COLOR</h4>
        <div className="grid grid-cols-6 gap-2">
          {colors.map(([name, hex]) => {
            const active = (filters.colors || []).includes(name);
            return (
              <button key={name} title={name}
                className={`w-6 h-6 rounded-full border-2 transition-all ${active ? 'border-[#C9A86A] scale-110' : 'border-transparent'}`}
                style={{ background: hex }}
                onClick={() => toggle('colors', name)}/>
            );
          })}
        </div>
      </div>

      <div className="mb-8">
        <h4 className="font-roman text-[10px] text-gold tracking-[0.2em] mb-4">PRECIO</h4>
        <div className="font-mono text-xs mb-3" style={{ color: '#948A78' }}>
          {formatCOP(filters.price[0])} — {formatCOP(filters.price[1])}
        </div>
        <input type="range" min="0" max="250000" step="5000"
          value={filters.price[1]}
          onChange={e => setFilters(f => ({ ...f, price: [f.price[0], +e.target.value] }))}
          className="w-full" style={{ accentColor: '#C9A86A' }}/>
      </div>
    </div>
  );
}
