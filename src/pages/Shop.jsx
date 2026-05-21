import React, { useState, useMemo, useEffect } from 'react';
import { Icon, Corners, Sunburst } from '../components/Shared';
import { CENIT_DATA, formatCOP } from '../data/cenitData';
import { supabase } from '../services/supabaseClient';
import reservationsService from '../services/reservationsService';

export function CapVisual({ color = "#1A1816", accent = "#C9A86A" }) {
  return (
    <svg viewBox="0 0 200 140" className="cap-silhouette w-[70%] drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)]" aria-hidden="true">
      <defs>
        <linearGradient id={`cap-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".95"/>
          <stop offset="100%" stopColor="#000" stopOpacity=".9"/>
        </linearGradient>
      </defs>
      <path d="M40,80 C40,40 70,20 100,20 C130,20 160,40 160,80 L160,90 L40,90 Z"
            fill={`url(#cap-${color.replace('#','')})`} stroke="#000" strokeWidth=".5"/>
      <ellipse cx="105" cy="100" rx="85" ry="10" fill="#0A0A0A" stroke={color} strokeWidth=".5"/>
      <line x1="100" y1="22" x2="100" y2="88" stroke="#000" strokeOpacity=".3" strokeWidth=".5"/>
      <path d="M40,80 Q100,60 160,80" fill="none" stroke="#000" strokeOpacity=".3" strokeWidth=".5"/>
      <g transform="translate(100,55)">
        <circle r="14" fill="none" stroke={accent} strokeWidth=".8" opacity=".9"/>
        <path d="M-8,4 L-2,-6 L0,-2 L4,-8 L8,4 Z" fill="none" stroke={accent} strokeWidth=".8"/>
        <text y="14" textAnchor="middle" fontSize="5" fill={accent}
              fontFamily="Cormorant Garamond" letterSpacing="1">CENITT</text>
      </g>
    </svg>
  );
}

export default function Shop() {
  const [products, setProducts] = useState(CENIT_DATA.products);
  const [dbReady, setDbReady] = useState(false);
  const [filters, setFilters] = useState({ collections: [], colors: [], price: [0, 250000] });
  const [sort, setSort] = useState("featured");
  const [layout, setLayout] = useState("grid");
  const [active, setActive] = useState(null);
  const [search, setSearch] = useState("");
  const [openFilters, setOpenFilters] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from('products').select('*').eq('visible', true);
        if (!error && data?.length) {
          setProducts(data.map(p => ({
            id: p.id, name: p.name, collection: p.collection,
            price: p.price, stock: p.stock, color: p.color_hex || '#1A1816',
            accent: p.accent_hex || '#C9A86A', tag: p.tag,
            material: p.material, colorName: p.color_name,
            description: p.description, sku: p.sku
          })));
          setDbReady(true);
        }
      } catch { /* keep static */ }
    }
    load();
  }, []);

  const collections = [...new Set(products.map(p => p.collection))];
  const colors = [...new Map(products.map(p => [p.colorName || p.color, p.color])).entries()];

  const items = useMemo(() => {
    let list = products;
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (filters.collections.length) list = list.filter(p => filters.collections.includes(p.collection));
    if (filters.colors.length) list = list.filter(p => filters.colors.includes(p.colorName || p.color));
    list = list.filter(p => p.price >= filters.price[0] && p.price <= filters.price[1]);
    if (sort === "price-asc")  list = [...list].sort((a,b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a,b) => b.price - a.price);
    if (sort === "new")        list = [...list].sort((a,b) => (b.tag === "NUEVO" ? 1 : 0) - (a.tag === "NUEVO" ? 1 : 0));
    return list;
  }, [search, filters, sort, products]);

  const toggle = (key, val) => {
    setFilters(f => ({ ...f, [key]: f[key].includes(val) ? f[key].filter(v => v !== val) : [...f[key], val] }));
  };

  const handleReservation = async (product, { qty }, clientData) => {
    if (dbReady && clientData) {
      try {
        await reservationsService.createReservation(product.id, {
          client_name: clientData.name,
          client_email: clientData.email,
          client_phone: clientData.phone,
          quantity: qty
        });
      } catch (err) {
        console.warn('Error creating reservation:', err);
      }
    }
    setActive(null);
  };

  return (
    <div className="fade-up min-h-full flex flex-col">
      <header className="px-6 lg:px-12 pt-8 pb-6 border-b" style={{ borderColor: '#2A2530' }}>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sunburst size={22}/>
              <span className="font-roman text-[11px]" style={{ color: '#C9A86A', letterSpacing: '0.3em' }}>BOUTIQUE &middot; CATALOGO</span>
            </div>
            <h1 className="font-display text-4xl lg:text-6xl leading-none" style={{ color: '#F1ECDE', fontStyle: 'italic' }}>
              The Headwear <span className="text-gold">Collective</span>
            </h1>
            <p className="font-mono text-xs mt-3 max-w-md" style={{ color: '#948A78' }}>
              EDICIONES LIMITADAS &middot; BORDADO A MANO &middot; ENVIO 2-5 DIAS NACIONAL
            </p>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 flex-1 lg:w-64 border-b pb-2" style={{ borderColor: '#3A3340' }}>
              <Icon name="Search" size={14} style={{ color: '#8B6F3F' }}/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar gorra..."
                className="bg-transparent outline-none flex-1 text-sm text-[#F1ECDE]"/>
            </div>
            <button onClick={() => setOpenFilters(true)}
              className="lg:hidden inline-flex items-center gap-2 text-xs py-2 px-4 border" style={{ borderColor: '#3A3340', color: '#948A78' }}>
              <Icon name="SlidersHorizontal" size={12}/> Filtros
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 relative">
        <FilterRail filters={filters} setFilters={setFilters} toggle={toggle}
                    collections={collections} colors={colors} products={products}
                    className="hidden lg:block w-72 shrink-0 border-r p-8 overflow-y-auto" />

        {openFilters && (
          <>
            <div className="fixed inset-0 bg-black/80 z-40 lg:hidden" onClick={() => setOpenFilters(false)}/>
            <aside className="fixed inset-y-0 right-0 w-80 bg-[#0A0A0A] border-l z-50 p-6 overflow-y-auto" style={{ borderColor: '#2A2530' }}>
              <div className="flex items-center justify-between mb-6">
                <span className="font-roman text-sm text-gold" style={{ letterSpacing: '0.3em' }}>FILTROS</span>
                <button onClick={() => setOpenFilters(false)} className="w-9 h-9 border flex items-center justify-center" style={{ borderColor: '#3A3340' }}>
                  <Icon name="X" size={16}/>
                </button>
              </div>
              <FilterRail filters={filters} setFilters={setFilters} toggle={toggle}
                collections={collections} colors={colors} products={products}/>
            </aside>
          </>
        )}

        <div className="flex-1 min-w-0 overflow-y-auto">
          <div className="px-6 lg:px-10 py-4 border-b flex items-center justify-between gap-4 sticky top-0 z-10"
               style={{ borderColor: '#2A2530', background: 'rgba(7,6,10,.9)', backdropFilter: 'blur(12px)' }}>
            <div className="font-mono text-xs" style={{ color: '#948A78' }}>
              <span className="text-gold">{String(items.length).padStart(2,'0')}</span> / {String(products.length).padStart(2,'0')} PIEZAS
              {(filters.collections.length + filters.colors.length > 0) && (
                <button onClick={() => setFilters({ collections: [], colors: [], price: [0, 250000] })}
                  className="ml-3 text-[#C56B5A] hover:text-[#E8C77E]">&middot; LIMPIAR</button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2">
                <span className="font-roman text-[10px]" style={{ color: '#5A5347', letterSpacing: '0.25em' }}>ORDEN</span>
                <select value={sort} onChange={e => setSort(e.target.value)} className="bg-transparent text-xs outline-none text-[#F1ECDE]">
                  <option value="featured">Destacados</option>
                  <option value="price-asc">Precio Asc</option>
                  <option value="price-desc">Precio Desc</option>
                  <option value="new">Novedades</option>
                </select>
              </div>
              <div className="flex border" style={{ borderColor: '#3A3340' }}>
                <button onClick={() => setLayout('grid')} className="w-9 h-9 flex items-center justify-center transition-colors"
                  style={{ background: layout === 'grid' ? '#C9A86A' : 'transparent', color: layout === 'grid' ? '#14100A' : '#948A78' }}>
                  <Icon name="LayoutGrid" size={14}/>
                </button>
                <button onClick={() => setLayout('list')} className="w-9 h-9 flex items-center justify-center transition-colors"
                  style={{ background: layout === 'list' ? '#C9A86A' : 'transparent', color: layout === 'list' ? '#14100A' : '#948A78' }}>
                  <Icon name="List" size={14}/>
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 lg:p-10">
            {items.length === 0 ? (
              <div className="text-center py-20">
                <Icon name="SearchX" size={32} style={{ color: '#3A3340' }} className="mx-auto mb-4"/>
                <p className="font-display text-2xl italic" style={{ color: '#F1ECDE' }}>Sin resultados</p>
                <p className="font-mono text-xs mt-2" style={{ color: '#5A5347' }}>AJUSTA TUS FILTROS</p>
              </div>
            ) : layout === 'grid' ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {items.map((p, i) => <ProductTile key={p.id} p={p} idx={i} onOpen={() => setActive(p)}/>)}
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((p, i) => <ProductRow key={p.id} p={p} idx={i} onOpen={() => setActive(p)}/>)}
              </div>
            )}
          </div>
        </div>
      </div>

      {active && <ProductDrawer product={active} dbReady={dbReady} onClose={() => setActive(null)} onReserve={handleReservation}/>}
    </div>
  );
}

function FilterRail({ filters, setFilters, toggle, collections, colors, products, className = "" }) {
  return (
    <div className={className} style={{ borderColor: '#2A2530' }}>
      <div className="mb-8">
        <h4 className="font-roman text-[10px] text-gold tracking-[0.2em] mb-4">COLECCION</h4>
        {collections.map(c => {
          const count = products.filter(p => p.collection === c).length;
          const checked = filters.collections.includes(c);
          return (
            <label key={c} className="flex items-center justify-between mb-2 cursor-pointer text-xs">
              <span className="flex items-center gap-3">
                <input type="checkbox" checked={checked} onChange={() => toggle('collections', c)} className="accent-[#C9A86A]"/>
                <span style={{ color: checked ? '#E8C77E' : '#948A78' }}>{c}</span>
              </span>
              <span className="font-mono text-[10px]" style={{ color: '#5A5347' }}>[{String(count).padStart(2,'0')}]</span>
            </label>
          );
        })}
      </div>

      <div className="mb-8">
        <h4 className="font-roman text-[10px] text-gold tracking-[0.2em] mb-4">COLOR</h4>
        <div className="grid grid-cols-6 gap-2">
          {colors.map(([name, hex]) => {
            const isActive = filters.colors.includes(name);
            return (
              <button key={name} title={name}
                className={`w-6 h-6 rounded-full border-2 transition-all ${isActive ? 'border-[#C9A86A] scale-110' : 'border-transparent'}`}
                style={{ background: hex }}
                onClick={() => toggle('colors', name)}/>
            );
          })}
        </div>
      </div>

      <div className="mb-8">
        <h4 className="font-roman text-[10px] text-gold tracking-[0.2em] mb-4">PRECIO</h4>
        <div className="font-mono text-xs mb-3" style={{ color: '#948A78' }}>
          {formatCOP(filters.price[0])} - {formatCOP(filters.price[1])}
        </div>
        <input type="range" min="0" max="250000" step="5000"
          value={filters.price[1]}
          onChange={e => setFilters(f => ({ ...f, price: [f.price[0], +e.target.value] }))}
          className="w-full" style={{ accentColor: '#C9A86A' }}/>
      </div>
    </div>
  );
}

function ProductTile({ p, idx, onOpen }) {
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
        <span className="absolute top-2 right-2 font-mono text-[10px]" style={{ color: '#5A5347' }}>No{String(idx+1).padStart(3,'0')}</span>
        <CapVisual color={p.color} accent={p.accent}/>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="font-roman text-[10px]" style={{ color: '#C9A86A', letterSpacing: '0.22em' }}>{(p.collection || '').toUpperCase()}</span>
          <span className="w-3 h-3 rounded-full border border-white/10" style={{ background: p.color }}/>
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

function ProductRow({ p, idx, onOpen }) {
  return (
    <button onClick={onOpen}
      className="w-full corner-deco border p-4 flex items-center gap-6 hover:border-[#8B6F3F] transition-colors text-left bg-[#141312]" style={{ borderColor: '#2A2530' }}>
      <Corners/>
      <div className="w-24 h-24 shrink-0 flex items-center justify-center" style={{ background: '#0A090C' }}>
        <CapVisual color={p.color} accent={p.accent}/>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <span className="font-roman text-[10px]" style={{ color: '#C9A86A', letterSpacing: '0.22em' }}>{(p.collection || '').toUpperCase()}</span>
          <span className="font-mono text-[10px]" style={{ color: '#5A5347' }}>No{String(idx+1).padStart(3,'0')}</span>
          {p.tag && (
            <span className="font-roman text-[9px] px-2 py-0.5"
              style={{ color: p.tag === 'AGOTADO' ? '#C56B5A' : '#14100A',
                       background: p.tag === 'AGOTADO' ? 'transparent' : '#C9A86A',
                       border: p.tag === 'AGOTADO' ? '1px solid #C56B5A' : 'none',
                       letterSpacing: '0.18em' }}>{p.tag}</span>
          )}
        </div>
        <h4 className="font-display text-xl" style={{ color: '#F1ECDE', fontStyle: 'italic' }}>{p.name}</h4>
        <div className="font-mono text-xs mt-1" style={{ color: '#948A78' }}>{(p.material || 'ALGODON').toUpperCase()} &middot; {(p.colorName || 'NEGRO').toUpperCase()}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-mono text-lg" style={{ color: '#E8C77E' }}>{formatCOP(p.price)}</div>
        <div className="font-mono text-[10px] mt-1" style={{ color: p.stock === 0 ? '#C56B5A' : '#5A5347' }}>
          {p.stock === 0 ? 'AGOTADO' : `${p.stock} EN STOCK`}
        </div>
      </div>
      <Icon name="ArrowRight" size={16} style={{ color: '#8B6F3F' }}/>
    </button>
  );
}

function ProductDrawer({ product, dbReady, onClose, onReserve }) {
  const [size, setSize] = useState("Unica");
  const [qty, setQty] = useState(1);
  const [showReserve, setShowReserve] = useState(false);
  const [reserveData, setReserveData] = useState({ name: '', email: '', phone: '' });
  const [reserving, setReserving] = useState(false);
  const [reserved, setReserved] = useState(false);
  const sizes = ["S/M","L/XL","Unica"];

  const handleReserve = async () => {
    if (!reserveData.name || !reserveData.email || !reserveData.phone) return;
    setReserving(true);
    await onReserve(product, { size, qty }, reserveData);
    setReserved(true);
    setReserving(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm" onClick={onClose}/>
      <aside className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-[#0A0A0A] border-l z-50 overflow-y-auto" style={{ borderColor: '#2A2530' }}>
        <div className="sticky top-0 z-10 p-5 flex items-center justify-between border-b"
             style={{ borderColor: '#2A2530', background: 'rgba(10,10,10,.92)', backdropFilter: 'blur(12px)' }}>
          <div>
            <div className="font-roman text-[10px]" style={{ color: '#8B6F3F', letterSpacing: '0.3em' }}>FICHA DE PRODUCTO</div>
            <div className="font-mono text-[11px] mt-0.5" style={{ color: '#948A78' }}>SKU &middot; {product.sku || product.id?.slice(0,8).toUpperCase()}</div>
          </div>
          <button onClick={onClose} className="w-10 h-10 border flex items-center justify-center hover:border-[#C9A86A] text-[#F1ECDE]"
            style={{ borderColor: '#3A3340' }}>
            <Icon name="X" size={16}/>
          </button>
        </div>

        <div className="p-6 lg:p-8">
          <div className="aspect-square mb-6 border relative bg-gradient-to-br from-[#1A1816] to-[#0A0A0A] flex items-center justify-center" style={{ borderColor: '#2A2530' }}>
            <Corners/>
            <CapVisual color={product.color} accent={product.accent}/>
            {product.tag && (
              <span className="absolute top-3 left-3 font-roman text-[10px] px-2 py-1"
                style={{ color: product.tag === 'AGOTADO' ? '#C56B5A' : '#14100A',
                         background: product.tag === 'AGOTADO' ? 'transparent' : '#C9A86A',
                         border: product.tag === 'AGOTADO' ? '1px solid #C56B5A' : 'none',
                         letterSpacing: '0.2em' }}>{product.tag}</span>
            )}
          </div>

          <div className="font-roman text-[10px] mb-1" style={{ color: '#C9A86A', letterSpacing: '0.3em' }}>{(product.collection || '').toUpperCase()}</div>
          <h2 className="font-display text-3xl lg:text-4xl mb-2" style={{ color: '#F1ECDE', fontStyle: 'italic' }}>{product.name}</h2>
          <div className="font-mono text-3xl text-gold mb-6">{formatCOP(product.price)}</div>

          <p className="text-sm mb-8" style={{ color: '#948A78', lineHeight: 1.7 }}>
            {product.description || "Gorra de edicion limitada, confeccionada con materiales premium y detalles bordados. Disenada para un ajuste perfecto y estilo impecable."}
          </p>

          <div className="diamond-divider mb-6">&#9670;</div>
          <div className="grid grid-cols-2 gap-3 mb-8">
            <Spec label="Material"  value={product.material || "Algodon Premium"}/>
            <Spec label="Color"     value={product.colorName || "Tonalidad base"}/>
            <Spec label="Stock"     value={product.stock === 0 ? 'Agotado' : `${product.stock} unidades`}/>
            <Spec label="Edicion"   value={product.tag === "PREMIUM" ? "Limitada" : "Regular"}/>
          </div>

          <div className="mb-6">
            <div className="font-roman text-[10px] mb-3" style={{ color: '#C9A86A', letterSpacing: '0.3em' }}>TALLA</div>
            <div className="flex gap-2 flex-wrap">
              {sizes.map(s => (
                <button key={s} onClick={() => setSize(s)}
                  className={`border py-2 px-4 text-xs font-mono transition-colors ${size === s ? 'border-[#C9A86A] text-[#C9A86A]' : 'border-[#3A3340] text-[#948A78]'}`}
                  >{s}</button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <div className="font-roman text-[10px] mb-3" style={{ color: '#C9A86A', letterSpacing: '0.3em' }}>CANTIDAD</div>
            <div className="inline-flex items-center border" style={{ borderColor: '#3A3340' }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-11 h-11 hover:bg-[#1A171C] text-[#F1ECDE] flex items-center justify-center">
                <Icon name="Minus" size={14}/>
              </button>
              <span className="w-12 text-center font-mono" style={{ color: '#F1ECDE' }}>{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock || 99, qty + 1))} className="w-11 h-11 hover:bg-[#1A171C] text-[#F1ECDE] flex items-center justify-center">
                <Icon name="Plus" size={14}/>
              </button>
            </div>
          </div>

          {reserved ? (
            <div className="text-center py-6 border" style={{ borderColor: '#2A2530', background: 'rgba(127,168,106,0.05)' }}>
              <Icon name="Check" size={32} style={{ color: '#7FA86A' }} className="mx-auto mb-3"/>
              <div className="font-display text-xl italic" style={{ color: '#F1ECDE' }}>Apartado Confirmado</div>
              <div className="font-mono text-xs mt-2" style={{ color: '#7FA86A' }}>
                Tienes 6 horas para recogerlo en tienda
              </div>
              <button onClick={onClose} className="btn-gold mt-4 inline-flex items-center gap-2">
                Continuar Comprando
              </button>
            </div>
          ) : showReserve ? (
            <div className="space-y-4 border p-6" style={{ borderColor: '#2A2530', background: '#141312' }}>
              <div className="font-roman text-[10px] mb-2" style={{ color: '#C9A86A', letterSpacing: '0.3em' }}>DATOS PARA APARTAR</div>
              <input type="text" placeholder="Nombre completo" value={reserveData.name}
                onChange={e => setReserveData(d => ({ ...d, name: e.target.value }))}
                className="w-full bg-transparent border-b pb-2 text-white text-sm outline-none focus:border-[#C9A86A] transition-colors" style={{ borderColor: '#3A3340' }}/>
              <input type="email" placeholder="Correo electronico" value={reserveData.email}
                onChange={e => setReserveData(d => ({ ...d, email: e.target.value }))}
                className="w-full bg-transparent border-b pb-2 text-white text-sm outline-none focus:border-[#C9A86A] transition-colors" style={{ borderColor: '#3A3340' }}/>
              <input type="tel" placeholder="Telefono" value={reserveData.phone}
                onChange={e => setReserveData(d => ({ ...d, phone: e.target.value }))}
                className="w-full bg-transparent border-b pb-2 text-white text-sm outline-none focus:border-[#C9A86A] transition-colors" style={{ borderColor: '#3A3340' }}/>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowReserve(false)}
                  className="btn-ghost flex-1 inline-flex items-center justify-center gap-2 py-3 text-xs">
                  Cancelar
                </button>
                <button onClick={handleReserve}
                  disabled={reserving || !reserveData.name || !reserveData.email || !reserveData.phone}
                  className="btn-gold flex-1 inline-flex items-center justify-center gap-2 py-3 text-xs"
                  style={{ opacity: reserving ? 0.7 : 1 }}>
                  <Icon name="Clock" size={14}/>
                  {reserving ? 'Apartando...' : 'Confirmar Apartado'}
                </button>
              </div>
              <div className="font-mono text-[10px] text-center" style={{ color: '#5A5347' }}>
                El apartado dura 6 horas. Recogelo en tienda.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                disabled={product.stock === 0}
                onClick={() => setShowReserve(true)}
                className="btn-gold w-full inline-flex items-center justify-center gap-3 py-4 font-mono text-sm"
                style={{ opacity: product.stock === 0 ? 0.5 : 1 }}>
                <Icon name="Clock" size={14}/>
                {product.stock === 0 ? 'AGOTADO' : `APARTAR &middot; ${formatCOP(product.price * qty)}`}
              </button>
              <div className="font-mono text-[10px] text-center" style={{ color: '#5A5347' }}>
                PAGO EN TIENDA &middot; APARTADO POR 6 HORAS
              </div>
            </div>
          )}
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
