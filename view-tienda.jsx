/* global React, Icon, Corners, Sunburst, CENIT_DATA, formatCOP, CapVisual, ROMAN */
const { useState: useStateShop, useMemo: useMemoShop } = React;

// ============================================================
// TIENDA — Full e-commerce view. Filter rail + product grid + detail drawer.
// ============================================================
function ViewTienda({ onAddToCart }) {
  const [filters, setFilters] = useStateShop({ collections: [], colors: [], price: [0, 250000] });
  const [sort, setSort] = useStateShop("featured");
  const [layout, setLayout] = useStateShop("grid"); // grid | list
  const [active, setActive] = useStateShop(null);
  const [search, setSearch] = useStateShop("");
  const [openFilters, setOpenFilters] = useStateShop(false);

  const collections = [...new Set(CENIT_DATA.products.map(p => p.collection))];
  const colors = [...new Map(CENIT_DATA.products.map(p => [p.colorName, p.color])).entries()];

  const items = useMemoShop(() => {
    let list = CENIT_DATA.products;
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (filters.collections.length) list = list.filter(p => filters.collections.includes(p.collection));
    if (filters.colors.length) list = list.filter(p => filters.colors.includes(p.colorName));
    list = list.filter(p => p.price >= filters.price[0] && p.price <= filters.price[1]);
    if (sort === "price-asc")  list = [...list].sort((a,b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a,b) => b.price - a.price);
    if (sort === "new")        list = [...list].sort((a,b) => (b.tag === "NUEVO" ? 1 : 0) - (a.tag === "NUEVO" ? 1 : 0));
    return list;
  }, [search, filters, sort]);

  const toggle = (key, val) => {
    setFilters(f => ({ ...f, [key]: f[key].includes(val) ? f[key].filter(v => v !== val) : [...f[key], val] }));
  };

  return (
    <div className="fade-up min-h-full flex flex-col">
      {/* Shop header */}
      <header className="px-6 lg:px-12 pt-8 pb-6 border-b" style={{ borderColor: '#2A2530' }}>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sunburst size={22}/>
              <span className="font-roman text-[11px]" style={{ color: '#C9A86A', letterSpacing: '0.3em' }}>BOUTIQUE · CATÁLOGO</span>
            </div>
            <h1 className="font-display text-4xl lg:text-6xl leading-none" style={{ color: '#F1ECDE', fontStyle: 'italic' }}>
              The Headwear <span className="text-gold">Collective</span>
            </h1>
            <p className="font-mono text-xs mt-3 max-w-md" style={{ color: '#948A78' }}>
              EDICIONES LIMITADAS · BORDADO A MANO · ENVÍO 2–5 DÍAS NACIONAL
            </p>
          </div>

          {/* Search */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 input-box flex-1 lg:w-64">
              <Icon name="Search" size={14} style={{ color: '#8B6F3F' }}/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar gorra..."
                className="bg-transparent outline-none flex-1 text-sm"/>
            </div>
            <button onClick={() => setOpenFilters(true)}
              className="btn-line lg:hidden inline-flex items-center gap-2">
              <Icon name="SlidersHorizontal" size={12}/> Filtros
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Filter rail (desktop) */}
        <FilterRail filters={filters} setFilters={setFilters} toggle={toggle}
                    collections={collections} colors={colors}
                    className="hidden lg:block w-72 shrink-0 border-r p-8" />

        {/* Mobile drawer for filters */}
        {openFilters && (
          <>
            <div className="drawer-back lg:hidden" onClick={() => setOpenFilters(false)}/>
            <aside className="drawer lg:hidden p-6">
              <div className="flex items-center justify-between mb-6">
                <span className="font-roman text-sm text-gold" style={{ letterSpacing: '0.3em' }}>FILTROS</span>
                <button onClick={() => setOpenFilters(false)} className="w-9 h-9 border flex items-center justify-center" style={{ borderColor: '#3A3340' }}>
                  <Icon name="X" size={16}/>
                </button>
              </div>
              <FilterRail filters={filters} setFilters={setFilters} toggle={toggle}
                collections={collections} colors={colors}/>
            </aside>
          </>
        )}

        {/* Product main */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="px-6 lg:px-10 py-4 border-b flex items-center justify-between gap-4 sticky top-0 z-10"
               style={{ borderColor: '#2A2530', background: 'rgba(7,6,10,.9)', backdropFilter: 'blur(12px)' }}>
            <div className="font-mono text-xs" style={{ color: '#948A78' }}>
              <span className="text-gold">{String(items.length).padStart(2,'0')}</span> / {String(CENIT_DATA.products.length).padStart(2,'0')} PIEZAS
              {(filters.collections.length + filters.colors.length > 0) && (
                <button onClick={() => setFilters({ collections: [], colors: [], price: [0, 250000] })}
                  className="ml-3 text-[#C56B5A] hover:text-[#E8C77E]">· LIMPIAR</button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2">
                <span className="font-roman text-[10px]" style={{ color: '#5A5347', letterSpacing: '0.25em' }}>ORDEN</span>
                <select value={sort} onChange={e => setSort(e.target.value)} className="input-box text-xs">
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

          {/* Grid / List */}
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

      {/* Product detail drawer */}
      {active && <ProductDrawer product={active} onClose={() => setActive(null)} onAdd={(prod, opts) => { onAddToCart(prod, opts); setActive(null); }}/>}
    </div>
  );
}
window.ViewTienda = ViewTienda;

// ----- Filter rail -------------------------------
function FilterRail({ filters, setFilters, toggle, collections, colors, className = "" }) {
  return (
    <aside className={className} style={{ borderColor: '#2A2530' }}>
      <div className="filter-section">
        <h4>Colección</h4>
        {collections.map(c => {
          const count = CENIT_DATA.products.filter(p => p.collection === c).length;
          const checked = filters.collections.includes(c);
          return (
            <label key={c} className="check-row">
              <span className="flex items-center gap-3">
                <input type="checkbox" checked={checked} onChange={() => toggle('collections', c)}/>
                <span style={{ color: checked ? '#E8C77E' : 'inherit' }}>{c}</span>
              </span>
              <span className="count">[{String(count).padStart(2,'0')}]</span>
            </label>
          );
        })}
      </div>

      <div className="filter-section">
        <h4>Color</h4>
        <div className="grid grid-cols-6 gap-2">
          {colors.map(([name, hex]) => {
            const active = filters.colors.includes(name);
            return (
              <button key={name} title={name}
                className={`swatch ${active ? 'active' : ''}`}
                style={{ background: hex }}
                onClick={() => toggle('colors', name)}/>
            );
          })}
        </div>
        {filters.colors.length > 0 && (
          <div className="mt-3 font-mono text-[10px]" style={{ color: '#8B6F3F' }}>
            {filters.colors.join(' · ').toUpperCase()}
          </div>
        )}
      </div>

      <div className="filter-section">
        <h4>Precio</h4>
        <div className="font-mono text-xs mb-3" style={{ color: '#948A78' }}>
          {formatCOP(filters.price[0])} — {formatCOP(filters.price[1])}
        </div>
        <input type="range" min="0" max="250000" step="5000"
          value={filters.price[1]}
          onChange={e => setFilters(f => ({ ...f, price: [f.price[0], +e.target.value] }))}
          className="w-full" style={{ accentColor: '#C9A86A' }}/>
      </div>

      <div className="filter-section">
        <h4>Tamaño</h4>
        <div className="flex gap-2 flex-wrap">
          {["S/M","L/XL","7","7½","8","Única"].map(s => (
            <span key={s} className="size-pip" style={{ width: 'auto', padding: '0 10px', height: 32, fontSize: 11 }}>{s}</span>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h4>Disponibilidad</h4>
        <label className="check-row">
          <span className="flex items-center gap-3">
            <input type="checkbox"/> <span>Solo en stock</span>
          </span>
        </label>
        <label className="check-row">
          <span className="flex items-center gap-3">
            <input type="checkbox"/> <span>Edición limitada</span>
          </span>
        </label>
      </div>
    </aside>
  );
}

// ----- Product Tile (grid card) -------------------
function ProductTile({ p, idx, onOpen }) {
  const stockColor = p.stock === 0 ? '#C56B5A' : p.stock < 10 ? '#E8C77E' : '#5A5347';
  return (
    <button onClick={onOpen} className="product-tile text-left corner-deco">
      <Corners/>
      <div className="product-image">
        {p.tag && (
          <span className="absolute top-3 left-3 font-roman text-[9px] z-10 px-2 py-1"
                style={{
                  color: p.tag === "AGOTADO" ? '#C56B5A' : '#14100A',
                  background: p.tag === "AGOTADO" ? 'transparent' : '#C9A86A',
                  border: p.tag === "AGOTADO" ? '1px solid #C56B5A' : 'none',
                  letterSpacing: '0.2em'
                }}>{p.tag}</span>
        )}
        <span className="absolute top-3 right-3 font-mono text-[10px]" style={{ color: '#5A5347' }}>№{String(idx+1).padStart(3,'0')}</span>
        <CapVisual color={p.color} accent={p.accent}/>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="font-roman text-[10px]" style={{ color: '#C9A86A', letterSpacing: '0.22em' }}>{p.collection.toUpperCase()}</span>
          <span className="swatch" style={{ background: p.color, width: 12, height: 12 }}/>
        </div>
        <h4 className="font-display text-lg leading-tight" style={{ color: '#F1ECDE', fontStyle: 'italic' }}>{p.name}</h4>
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

// ----- Product Row (list view) --------------------
function ProductRow({ p, idx, onOpen }) {
  return (
    <button onClick={onOpen}
      className="w-full corner-deco frame-thin p-4 flex items-center gap-6 hover:border-[#8B6F3F] transition-colors text-left">
      <Corners/>
      <div className="w-24 h-24 shrink-0 flex items-center justify-center" style={{ background: '#0A090C' }}>
        <CapVisual color={p.color} accent={p.accent}/>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <span className="font-roman text-[10px]" style={{ color: '#C9A86A', letterSpacing: '0.22em' }}>{p.collection.toUpperCase()}</span>
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
        <div className="font-mono text-xs mt-1" style={{ color: '#948A78' }}>{p.material.toUpperCase()} · {p.colorName.toUpperCase()}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-mono text-lg" style={{ color: '#E8C77E' }}>{formatCOP(p.price)}</div>
        <div className="font-mono text-[10px]" style={{ color: p.stock === 0 ? '#C56B5A' : '#5A5347' }}>
          {p.stock === 0 ? 'AGOTADO' : `${p.stock} EN STOCK`}
        </div>
      </div>
      <Icon name="ArrowRight" size={16} style={{ color: '#8B6F3F' }}/>
    </button>
  );
}

// ----- Product detail drawer ---------------------
function ProductDrawer({ product, onClose, onAdd }) {
  const [size, setSize] = useStateShop(product.sizes[0]);
  const [qty, setQty] = useStateShop(1);

  return (
    <>
      <div className="drawer-back slide-right" onClick={onClose}/>
      <aside className="drawer slide-right">
        <div className="sticky top-0 z-10 p-5 flex items-center justify-between border-b"
             style={{ borderColor: '#2A2530', background: 'rgba(12,11,15,.92)', backdropFilter: 'blur(12px)' }}>
          <div>
            <div className="font-roman text-[10px]" style={{ color: '#8B6F3F', letterSpacing: '0.3em' }}>FICHA DE PRODUCTO</div>
            <div className="font-mono text-[11px] mt-0.5" style={{ color: '#948A78' }}>SKU · {product.id.toUpperCase()}</div>
          </div>
          <button onClick={onClose} className="w-10 h-10 border flex items-center justify-center hover:border-[#C9A86A]"
            style={{ borderColor: '#3A3340' }}>
            <Icon name="X" size={16}/>
          </button>
        </div>

        <div className="p-6 lg:p-8">
          {/* Image */}
          <div className="product-image aspect-square mb-6 corner-deco frame-thin">
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

          {/* Title */}
          <div className="font-roman text-[10px] mb-1" style={{ color: '#C9A86A', letterSpacing: '0.3em' }}>{product.collection.toUpperCase()}</div>
          <h2 className="font-display text-3xl lg:text-4xl mb-2" style={{ color: '#F1ECDE', fontStyle: 'italic' }}>{product.name}</h2>
          <div className="font-mono text-3xl text-gold mb-6">{formatCOP(product.price)}</div>

          {/* Description */}
          <p className="text-sm mb-8" style={{ color: '#948A78', lineHeight: 1.7 }}>{product.desc}</p>

          {/* Specs */}
          <div className="diamond-divider mb-6">◆</div>
          <div className="grid grid-cols-2 gap-3 mb-8">
            <Spec label="Material"     value={product.material}/>
            <Spec label="Color"        value={product.colorName}/>
            <Spec label="Disponibilidad" value={product.stock === 0 ? 'Agotado' : `${product.stock} unidades`}/>
            <Spec label="Edición"      value={product.tag === "PREMIUM" ? "Limitada · 50" : "Regular"}/>
          </div>

          {/* Size selector */}
          {product.sizes.length > 1 && (
            <div className="mb-6">
              <div className="font-roman text-[10px] mb-3" style={{ color: '#C9A86A', letterSpacing: '0.3em' }}>TALLA</div>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map(s => (
                  <button key={s} onClick={() => setSize(s)}
                    className={`size-pip ${size === s ? 'active' : ''}`}
                    style={{ width: 'auto', padding: '0 14px' }}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* Qty */}
          <div className="mb-8">
            <div className="font-roman text-[10px] mb-3" style={{ color: '#C9A86A', letterSpacing: '0.3em' }}>CANTIDAD</div>
            <div className="inline-flex items-center border" style={{ borderColor: '#3A3340' }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-11 h-11 hover:bg-[#1A171C]">
                <Icon name="Minus" size={14}/>
              </button>
              <span className="w-12 text-center font-mono" style={{ color: '#F1ECDE' }}>{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="w-11 h-11 hover:bg-[#1A171C]">
                <Icon name="Plus" size={14}/>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              disabled={product.stock === 0}
              onClick={() => onAdd(product, { size, qty })}
              className="btn-gold w-full inline-flex items-center justify-center gap-3">
              <Icon name="ShoppingBag" size={12}/>
              {product.stock === 0 ? 'Avisarme cuando llegue' : `Añadir · ${formatCOP(product.price * qty)}`}
            </button>
            <button className="btn-line w-full inline-flex items-center justify-center gap-2">
              <Icon name="Heart" size={12}/> Añadir a deseos
            </button>
          </div>

          {/* Care */}
          <div className="mt-10 ticket text-left">
            <div className="font-roman text-[10px] mb-2" style={{ color: '#C9A86A', letterSpacing: '0.3em' }}>NOTA DEL TALLER</div>
            <p className="font-mono text-[11px] leading-relaxed" style={{ color: '#948A78' }}>
              CADA PIEZA SE BORDA EN BOGOTÁ.<br/>
              ENVÍO NACIONAL 2–5 DÍAS · INTERNACIONAL 7–14 DÍAS.<br/>
              CAMBIOS Y DEVOLUCIONES HASTA 30 DÍAS.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

function Spec({ label, value }) {
  return (
    <div className="frame-thin p-3">
      <div className="font-roman text-[10px]" style={{ color: '#8B6F3F', letterSpacing: '0.25em' }}>{label.toUpperCase()}</div>
      <div className="text-sm mt-1" style={{ color: '#F1ECDE' }}>{value}</div>
    </div>
  );
}
