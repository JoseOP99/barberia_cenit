import React, { useState, useMemo } from 'react';
import { Icon, Corners, Sunburst } from '../components/Shared';
import { formatCOP } from '../data/cenitData';
import useProducts from '../hooks/useProducts';

export function CapVisual({ color = "#1A1816", accent = "#C9A86A", style = "snapback" }) {
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
              fontFamily="Cormorant Garamond" letterSpacing="1">CÉNITT</text>
      </g>
      {style === 'snapback' && (
        <rect x="180" y="78" width="14" height="14" fill="#0A0A0A" stroke={accent} strokeWidth=".5"/>
      )}
    </svg>
  );
}

export default function Shop({ onAddToCart = () => {} }) {
  const [filters, setFilters] = useState({ collections: [], colors: [], price: [0, 250000] });
  const [sort, setSort] = useState("featured");
  const [layout, setLayout] = useState("grid");
  const [active, setActive] = useState(null);
  const [search, setSearch] = useState("");
  const [openFilters, setOpenFilters] = useState(false);

  const { products: dbProducts, loading } = useProducts({ autoFetch: true });

  const categories = [...new Set(dbProducts.map(p => p.category_name || p.collection).filter(Boolean))];
  const colors = [...new Map(dbProducts.filter(p => p.color_name || p.color_hex).map(p => [p.color_name || p.color_hex, p.color_hex])).entries()];

  const items = useMemo(() => {
    let list = dbProducts;
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (filters.categories?.length) list = list.filter(p => filters.categories.includes(p.category_name || p.collection));
    if (filters.colors?.length) list = list.filter(p => filters.colors.includes(p.colorName || p.color));
    list = list.filter(p => p.price >= filters.price[0] && p.price <= filters.price[1]);
    if (sort === "price-asc")  list = [...list].sort((a,b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a,b) => b.price - a.price);
    if (sort === "new")        list = [...list].sort((a,b) => (b.tag === "NUEVO" ? 1 : 0) - (a.tag === "NUEVO" ? 1 : 0));
    return list;
  }, [dbProducts, search, filters, sort]);

  const toggle = (key, val) => {
    setFilters(f => ({ ...f, [key]: (f[key] || []).includes(val) ? (f[key] || []).filter(v => v !== val) : [...(f[key] || []), val] }));
  };

  const activeTitle = filters.categories?.length === 1 ? filters.categories[0] : "Catálogo General";
  const activeDesc = filters.categories?.length === 1 
    ? `Explora nuestra selección de ${filters.categories[0].toLowerCase()} Cénit.` 
    : "PRODUCTOS EXCLUSIVOS · ESTILO DE VIDA · ENVÍO NACIONAL";

  return (
    <div className="fade-up min-h-full flex flex-col">
      <header className="px-6 lg:px-12 pt-8 pb-6 border-b" style={{ borderColor: '#2A2530' }}>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sunburst size={22}/>
              <span className="font-roman text-[11px]" style={{ color: '#C9A86A', letterSpacing: '0.3em' }}>BOUTIQUE · TIENDA</span>
            </div>
            <h1 className="font-display text-4xl lg:text-6xl leading-none" style={{ color: '#F1ECDE', fontStyle: 'italic' }}>
              {activeTitle}
            </h1>
            <p className="font-mono text-xs mt-3 max-w-md uppercase" style={{ color: '#948A78' }}>
              {activeDesc}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 input-box flex-1 lg:w-64 border-b pb-2" style={{ borderColor: '#3A3340' }}>
              <Icon name="Search" size={14} style={{ color: '#8B6F3F' }}/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar gorra..."
                className="bg-transparent outline-none flex-1 text-sm text-[#F1ECDE]"/>
            </div>
            <button onClick={() => setOpenFilters(true)}
              className="btn-line lg:hidden inline-flex items-center gap-2 text-xs py-2 px-4 border" style={{ borderColor: '#3A3340', color: '#948A78' }}>
              <Icon name="SlidersHorizontal" size={12}/> Filtros
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 relative">
        <FilterRail filters={filters} setFilters={setFilters} toggle={toggle}
                    categories={categories} colors={colors}
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
                categories={categories} colors={colors}/>
            </aside>
          </>
        )}

        <div className="flex-1 min-w-0 overflow-y-auto">
          <div className="px-6 lg:px-10 py-4 border-b flex items-center justify-between gap-4 sticky top-0 z-10"
               style={{ borderColor: '#2A2530', background: 'rgba(7,6,10,.9)', backdropFilter: 'blur(12px)' }}>
            <div className="font-mono text-xs" style={{ color: '#948A78' }}>
              <span className="text-gold">{String(items.length).padStart(2,'0')}</span> / {String(dbProducts.length).padStart(2,'0')} PIEZAS
              {((filters.categories?.length || 0) + (filters.colors?.length || 0) > 0) && (
                <button onClick={() => setFilters({ categories: [], colors: [], price: [0, 250000] })}
                  className="ml-3 text-[#C56B5A] hover:text-[#E8C77E]">· LIMPIAR</button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2">
                <span className="font-roman text-[10px]" style={{ color: '#5A5347', letterSpacing: '0.25em' }}>ORDEN</span>
                <select value={sort} onChange={e => setSort(e.target.value)} className="bg-transparent text-xs outline-none text-[#F1ECDE]">
                  <option value="featured">Destacados</option>
                  <option value="price-asc">Precio · Asc</option>
                  <option value="price-desc">Precio · Desc</option>
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
            {loading ? (
              <div className="text-center py-20 flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-[#C9A86A] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="font-mono text-xs" style={{ color: '#948A78' }}>CARGANDO CATÁLOGO...</p>
              </div>
            ) : items.length === 0 ? (
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

      {active && <ProductDrawer product={active} onClose={() => setActive(null)} onAdd={(prod, opts) => { onAddToCart(prod, opts); setActive(null); }}/>}
    </div>
  );
}

function FilterRail({ filters, setFilters, toggle, categories, colors, className = "" }) {
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

function ProductRow({ p, idx, onOpen }) {
  return (
    <button onClick={onOpen}
      className="w-full corner-deco border p-4 flex items-center gap-6 hover:border-[#8B6F3F] transition-colors text-left bg-[#141312]" style={{ borderColor: '#2A2530' }}>
      <Corners/>
      <div className="w-24 h-24 shrink-0 flex items-center justify-center" style={{ background: '#0A090C' }}>
        <CapVisual color={p.color_hex || '#1A1816'} accent={p.accent_hex || '#C9A86A'}/>
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
        <div className="font-mono text-xs mt-1" style={{ color: '#948A78' }}>{p.material?.toUpperCase() || 'ALGODÓN'} · {p.color_name?.toUpperCase() || 'NEGRO'}</div>
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

function ProductDrawer({ product, onClose, onAdd }) {
  const [size, setSize] = useState("Única");
  const [qty, setQty] = useState(1);
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

          <p className="text-sm mb-8" style={{ color: '#948A78', lineHeight: 1.7 }}>
            {product.description || "Gorra de edición limitada, confeccionada con materiales premium y detalles bordados. Diseñada para un ajuste perfecto y estilo impecable."}
          </p>

          <div className="diamond-divider mb-6">◆</div>
          <div className="grid grid-cols-2 gap-3 mb-8">
            <Spec label="Material"     value={product.material || "Algodón Premium"}/>
            <Spec label="Color"        value={product.color_name || "Tonalidad base"}/>
            <Spec label="Stock"        value={product.stock === 0 ? 'Agotado' : `${product.stock} unidades`}/>
            <Spec label="Edición"      value={product.tag === "PREMIUM" ? "Limitada" : "Regular"}/>
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
              <button onClick={() => setQty(qty + 1)} className="w-11 h-11 hover:bg-[#1A171C] text-[#F1ECDE] flex items-center justify-center">
                <Icon name="Plus" size={14}/>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <button
              disabled={product.stock === 0}
              onClick={() => onAdd(product, { size, qty })}
              className="btn-gold w-full inline-flex items-center justify-center gap-3 py-4 font-mono text-sm">
              <Icon name="ShoppingBag" size={14}/>
              {product.stock === 0 ? 'AGOTADO' : `AÑADIR · ${formatCOP(product.price * qty)}`}
            </button>
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
