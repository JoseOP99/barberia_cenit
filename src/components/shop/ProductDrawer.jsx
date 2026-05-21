import React, { useState } from 'react';
import { Icon, Corners } from '../Shared';
import { formatCOP } from '../../data/cenitData';
import { CapVisual } from './CapVisual';

export function ProductDrawer({ product, onClose, onReserve, isReserving }) {
  const [size, setSize] = useState("Única");
  const sizes = ["S/M","L/XL","Única"];

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm" onClick={onClose}/>
      <aside className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-[#0A0A0A] border-l z-50 overflow-y-auto" style={{ borderColor: '#2A2530' }}>
        <div className="sticky top-0 z-10 p-5 flex items-center justify-between border-b"
             style={{ borderColor: '#2A2530', background: 'rgba(10,10,10,.92)', backdropFilter: 'blur(12px)' }}>
          <div>
            <div className="font-roman text-[10px]" style={{ color: '#8B6F3F', letterSpacing: '0.3em' }}>FICHA DE PRODUCTO</div>
            <div className="font-mono text-[11px] mt-0.5" style={{ color: '#948A78' }}>SKU · {product.id.toUpperCase().split('-')[0]}</div>
          </div>
          <button onClick={onClose} className="w-10 h-10 border flex items-center justify-center hover:border-[#C9A86A] text-[#F1ECDE]"
            style={{ borderColor: '#3A3340' }}>
            <Icon name="X" size={16}/>
          </button>
        </div>

        <div className="p-6 lg:p-8">
          <div className="aspect-square mb-6 border relative bg-gradient-to-br from-[#1A1816] to-[#0A0A0A] flex items-center justify-center" style={{ borderColor: '#2A2530' }}>
            <Corners/>
            <CapVisual color={product.color_hex || '#1A1816'} accent={product.accent_hex || '#C9A86A'}/>
            {product.tag && (
              <span className="absolute top-3 left-3 font-roman text-[10px] px-2 py-1"
                style={{ color: product.tag === 'AGOTADO' ? '#C56B5A' : '#14100A',
                         background: product.tag === 'AGOTADO' ? 'transparent' : '#C9A86A',
                         border: product.tag === 'AGOTADO' ? '1px solid #C56B5A' : 'none',
                         letterSpacing: '0.2em' }}>{product.tag}</span>
            )}
          </div>

          <div className="font-roman text-[10px] mb-1" style={{ color: '#C9A86A', letterSpacing: '0.3em' }}>{(product.collection || 'Básicos').toUpperCase()}</div>
          <h2 className="font-display text-3xl lg:text-4xl mb-2" style={{ color: '#F1ECDE', fontStyle: 'italic' }}>{product.name}</h2>
          <div className="font-mono text-3xl text-gold mb-6">{formatCOP(product.price)}</div>

          <div className="diamond-divider mb-6 mt-4">◆</div>
          <div className="grid grid-cols-2 gap-3 mb-8">
            <Spec label="Talla"        value={product.size || "Ajustable"}/>
            <Spec label="Material"     value={product.material || "Algodón"}/>
            <Spec label="Color"        value={product.color_name || "Tonalidad base"}/>
            <Spec label="Stock"        value={product.stock === 0 ? 'Agotado' : `${product.stock} unidades`}/>
          </div>

          <div className="space-y-3 pt-6">
            <button
              disabled={product.stock === 0 || isReserving}
              onClick={onReserve}
              className="btn-gold w-full inline-flex items-center justify-center gap-3 py-4 font-mono text-sm disabled:opacity-50">
              <Icon name="ShoppingBag" size={14}/>
              {isReserving ? 'RESERVANDO...' : product.stock === 0 ? 'AGOTADO' : `RESERVAR (1 HORA)`}
            </button>
            <p className="text-center text-[10px] text-[#C56B5A] uppercase tracking-widest mt-2">
              ⚠️ Tienes 1 hora para confirmar la compra.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

function Spec({ label, value }) {
  return (
    <div className="border border-[#2A2530] p-3 bg-[#141312]">
      <div className="font-roman text-[10px]" style={{ color: '#8B6F3F', letterSpacing: '0.25em' }}>{label.toUpperCase()}</div>
      <div className="text-sm mt-1" style={{ color: '#F1ECDE' }}>{value}</div>
    </div>
  );
}
