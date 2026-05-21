/* global React, Icon, Eyebrow, CENIT_DATA, formatCOP */
const { useState: useStateShop, useMemo: useMemoShop } = React;

// ============================================================
// CapVisual — SVG silhouette of a cap (snapback)
// ============================================================
function CapVisual({ color = "#1A1816", accent = "#C9A86A", style = "snapback" }) {
  return (
    <svg viewBox="0 0 200 140" className="cap-silhouette" aria-hidden="true">
      <defs>
        <linearGradient id={`cap-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".95"/>
          <stop offset="100%" stopColor="#000" stopOpacity=".9"/>
        </linearGradient>
      </defs>
      {/* Crown */}
      <path d="M40,80 C40,40 70,20 100,20 C130,20 160,40 160,80 L160,90 L40,90 Z"
            fill={`url(#cap-${color.replace('#','')})`} stroke="#000" strokeWidth=".5"/>
      {/* Brim */}
      <ellipse cx="105" cy="100" rx="85" ry="10" fill="#0A0A0A" stroke={color} strokeWidth=".5"/>
      {/* Panel stitching */}
      <line x1="100" y1="22" x2="100" y2="88" stroke="#000" strokeOpacity=".3" strokeWidth=".5"/>
      <path d="M40,80 Q100,60 160,80" fill="none" stroke="#000" strokeOpacity=".3" strokeWidth=".5"/>
      {/* Logo emblem on crown */}
      <g transform="translate(100,55)">
        <circle r="14" fill="none" stroke={accent} strokeWidth=".8" opacity=".9"/>
        <path d="M-8,4 L-2,-6 L0,-2 L4,-8 L8,4 Z" fill="none" stroke={accent} strokeWidth=".8"/>
        <text y="14" textAnchor="middle" fontSize="5" fill={accent}
              fontFamily="Cormorant Garamond" letterSpacing="1">CÉNIT</text>
      </g>
      {style === 'snapback' && (
        <rect x="180" y="78" width="14" height="14" fill="#0A0A0A" stroke={accent} strokeWidth=".5"/>
      )}
    </svg>
  );
}

// ============================================================
// SHOP — Grid de gorras con filtros & quick-add
// ============================================================
function Shop({ onAddToCart }) {
  const [filter, setFilter] = useStateShop("Todos");
  const [sort, setSort] = useStateShop("Destacados");
  const [hovered, setHovered] = useStateShop(null);

  const collections = ["Todos", ...new Set(CENIT_DATA.products.map(p => p.collection))];

  const items = useMemoShop(() => {
    let list = filter === "Todos" ? CENIT_DATA.products : CENIT_DATA.products.filter(p => p.collection === filter);
    if (sort === "Precio asc") list = [...list].sort((a,b) => a.price - b.price);
    if (sort === "Precio desc") list = [...list].sort((a,b) => b.price - a.price);
    return list;
  }, [filter, sort]);

  return (
    <section id="tienda" className="py-28 px-6 lg:px-12" style={{ background: '#0A0A0A' }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-14">
          <div>
            <Eyebrow left>The Headwear Collective</Eyebrow>
            <h2 className="font-display text-5xl md:text-7xl mt-6 leading-[1]" style={{ color: '#F5F1E8' }}>
              Gorras <em className="italic text-gold-gradient">Cénit</em>.
            </h2>
            <p className="mt-4 text-sm max-w-md" style={{ color: '#9A9489' }}>
              Piezas de edición limitada diseñadas para complementar el estilo del caballero moderno. Maestría en cada detalle.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] tracking-[0.25em] uppercase" style={{ color: '#6A655C' }}>Ordenar:</span>
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="bg-transparent hairline px-3 py-2 text-xs"
              style={{ color: '#F5F1E8' }}>
              {["Destacados","Precio asc","Precio desc"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 mb-10 flex-wrap">
          {collections.map(c => (
            <button key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-2 text-[11px] tracking-[0.18em] uppercase border transition-all`}
              style={{
                borderColor: filter === c ? '#C9A86A' : '#2A2724',
                color: filter === c ? '#1A1408' : '#9A9489',
                background: filter === c ? '#C9A86A' : 'transparent'
              }}>
              {c}
            </button>
          ))}
          <span className="text-[10px] tracking-[0.2em] uppercase ml-2" style={{ color: '#6A655C' }}>
            · {items.length} piezas
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map(p => (
            <article key={p.id}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}
              className="product-card crest border" style={{ borderColor: '#2A2724' }}>
              <span className="crest-bl"></span><span className="crest-br"></span>

              {/* Image */}
              <div className="product-image aspect-square flex items-center justify-center relative">
                {/* tag */}
                {p.tag && (
                  <span className="absolute top-3 left-3 text-[9px] tracking-[0.2em] uppercase px-2 py-1"
                        style={{
                          color: p.tag === "AGOTADO" ? '#C56B5A' : '#1A1408',
                          background: p.tag === "AGOTADO" ? 'transparent' : '#C9A86A',
                          border: p.tag === "AGOTADO" ? '1px solid #C56B5A' : 'none'
                        }}>{p.tag}</span>
                )}
                <CapVisual color={p.color} accent={p.accent}/>

                {/* Quick add */}
                <button className="quick-add absolute bottom-3 left-3 right-3 btn-gold inline-flex items-center justify-center gap-2"
                        disabled={p.stock === 0}
                        style={{ opacity: p.stock === 0 ? 0.3 : 1 }}
                        onClick={() => p.stock > 0 && onAddToCart && onAddToCart(p)}>
                  <Icon name="ShoppingBag" size={12}/> {p.stock === 0 ? 'Agotado' : 'Añadir'}
                </button>
              </div>

              {/* Meta */}
              <div className="p-4 md:p-5">
                <div className="text-[9px] tracking-[0.25em] uppercase mb-2" style={{ color: '#C9A86A' }}>{p.collection}</div>
                <h4 className="font-display text-lg md:text-xl mb-1 leading-tight" style={{ color: '#F5F1E8' }}>{p.name}</h4>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm" style={{ color: '#E8C77E' }}>{formatCOP(p.price)}</span>
                  <span className="text-[10px] tracking-[0.15em] uppercase" style={{ color: p.stock < 10 ? '#C56B5A' : '#6A655C' }}>
                    {p.stock === 0 ? 'Sin stock' : p.stock < 10 ? `Solo ${p.stock}` : 'En stock'}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CTA strip */}
        <div className="mt-20 flex flex-col md:flex-row items-center justify-between gap-6 surface-2 p-8 crest relative">
          <span className="crest-bl"></span><span className="crest-br"></span>
          <div>
            <Eyebrow left>Bespoke</Eyebrow>
            <h3 className="font-display text-3xl mt-3" style={{ color: '#F5F1E8' }}>¿Quieres tu propia gorra firmada?</h3>
          </div>
          <button className="btn-gold inline-flex items-center gap-3">
            Pedir Bespoke <Icon name="ArrowUpRight" size={14}/>
          </button>
        </div>
      </div>
    </section>
  );
}
window.Shop = Shop;
window.CapVisual = CapVisual;
