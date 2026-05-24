import React, { useState } from 'react';
import { Icon, Corners } from '../Shared';
import { formatCOP } from '../../data/cenitData';
import { CapVisual } from './CapVisual';

export function ProductDrawer({ product, onClose, onReserve, isReserving }) {
  const [size, setSize] = useState("Única");
  const [currentImg, setCurrentImg] = useState(0);
  const images = product.product_images || [];
  const hasMultipleImages = images.length > 1;

  const nextImg = () => setCurrentImg(i => (i + 1) % images.length);
  const prevImg = () => setCurrentImg(i => (i - 1 + images.length) % images.length);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-in fade-in zoom-in-95 duration-200">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}/>
      
      <div className="relative w-full max-w-5xl bg-[#0A0A0A] border rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl max-h-[90vh] z-10" style={{ borderColor: '#2A2530' }}>
        
        {/* Lado Izquierdo: Galería de imágenes */}
        <div className="w-full md:w-1/2 flex flex-col border-b md:border-b-0 md:border-r bg-gradient-to-br from-[#1A1816] to-[#0A0A0A] relative aspect-square md:aspect-auto" style={{ borderColor: '#2A2530' }}>
          
          <div className="flex-1 overflow-hidden relative flex items-center justify-center">
            <Corners />
            
            {images.length > 0 ? (
              <div className="w-full h-full p-4 sm:p-8 flex items-center justify-center relative">
                <img key={currentImg} src={images[currentImg].image_url} alt={`${product.name} ${currentImg+1}`} className="max-w-full max-h-full object-contain mix-blend-screen opacity-90 drop-shadow-2xl animate-in fade-in duration-300" />
                
                {hasMultipleImages && (
                  <>
                    <button onClick={prevImg} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 border rounded-full bg-black/50 backdrop-blur flex items-center justify-center hover:border-[#C9A86A] text-[#F1ECDE] z-10" style={{ borderColor: '#3A3340' }}>
                      <Icon name="ChevronLeft" size={20}/>
                    </button>
                    <button onClick={nextImg} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 border rounded-full bg-black/50 backdrop-blur flex items-center justify-center hover:border-[#C9A86A] text-[#F1ECDE] z-10" style={{ borderColor: '#3A3340' }}>
                      <Icon name="ChevronRight" size={20}/>
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                      {images.map((_, i) => (
                        <div key={i} className={`h-1 rounded-full transition-all ${i === currentImg ? 'w-4 bg-[#C9A86A]' : 'w-1 bg-white/30'}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center p-8">
                <CapVisual color={product.color_hex || '#1A1816'} accent={product.accent_hex || '#C9A86A'}/>
              </div>
            )}
            
            {product.discount_percentage > 0 && (
              <span className="absolute top-6 left-6 font-black text-[12px] px-3 py-1.5 z-10 rounded-sm shadow-xl tracking-widest text-white bg-[#C56B5A]">
                -{product.discount_percentage}% OFF
              </span>
            )}
            
            {product.tag && (
              <span className="absolute top-6 right-6 font-roman text-[10px] px-3 py-1.5 z-10 rounded-sm"
                style={{ color: product.tag === 'AGOTADO' ? '#C56B5A' : '#14100A',
                         background: product.tag === 'AGOTADO' ? 'transparent' : '#C9A86A',
                         border: product.tag === 'AGOTADO' ? '1px solid #C56B5A' : 'none',
                         letterSpacing: '0.2em' }}>{product.tag}</span>
            )}
          </div>
        </div>

        {/* Lado Derecho: Información con Scroll Interno si es necesario */}
        <div className="w-full md:w-1/2 flex flex-col overflow-y-auto bg-[#0A0A0A] relative">
          
          <button onClick={onClose} className="absolute top-4 right-4 z-20 w-10 h-10 border rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center hover:border-[#C9A86A] text-[#9A9489] hover:text-[#F1ECDE] transition-all"
            style={{ borderColor: '#2A2530' }}>
            <Icon name="X" size={16}/>
          </button>

          <div className="p-6 sm:p-8 lg:p-10 flex flex-col min-h-full justify-between mt-6 md:mt-0">
            <div>
              <div className="font-roman text-[10px] mb-2" style={{ color: '#C9A86A', letterSpacing: '0.3em' }}>
                {(product.collection || 'Básicos').toUpperCase()} · SKU: {product.id.toUpperCase().split('-')[0]}
              </div>
              <h2 className="font-display text-4xl lg:text-5xl mb-3" style={{ color: '#F1ECDE', fontStyle: 'italic', lineHeight: '1.1' }}>{product.name}</h2>
              <div className="font-mono text-3xl text-gold mb-8">
                {product.discount_percentage > 0 ? (
                  <div className="flex flex-col">
                    <span className="text-lg text-[#C56B5A] line-through opacity-80 mb-1">{formatCOP(product.price)}</span>
                    <span className="flex items-center gap-3">
                      <span className="font-bold">{formatCOP(product.price * (1 - product.discount_percentage / 100))}</span>
                    </span>
                  </div>
                ) : (
                  formatCOP(product.price)
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {product.size && <Spec label="Talla" value={product.size} />}
                {product.material && <Spec label="Material" value={product.material} />}
                {product.color_name && <Spec label="Color" value={product.color_name} />}
                <Spec label="Stock" value={product.stock === 0 ? 'Agotado' : `${product.stock} unidades`}/>
              </div>
            </div>

            <div className="space-y-4 pt-6 mt-6 border-t shrink-0" style={{ borderColor: '#1A1816' }}>
              <button
                disabled={product.stock === 0 || isReserving}
                onClick={onReserve}
                className="btn-gold w-full inline-flex items-center justify-center gap-3 py-4 font-mono text-sm disabled:opacity-50">
                <Icon name="ShoppingBag" size={14}/>
                {isReserving ? 'RESERVANDO...' : product.stock === 0 ? 'AGOTADO' : `RESERVAR (1 HORA)`}
              </button>
              <p className="text-center text-[10px] text-[#C56B5A] uppercase tracking-widest">
                ⚠️ Tienes 1 hora para confirmar la compra.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
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
