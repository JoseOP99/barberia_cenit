import React, { useState, useMemo } from 'react';
import { Icon, Corners, Sunburst } from '../components/Shared';
import { formatCOP, CONTACT_INFO } from '../data/cenitData';
import useProducts from '../hooks/useProducts';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import storeService from '../services/storeService';
import { CapVisual } from '../components/shop/CapVisual';
import FilterRail from '../components/shop/FilterRail';
import { ProductTile } from '../components/shop/ProductTile';
import { ProductRow } from '../components/shop/ProductRow';
import { ProductDrawer } from '../components/shop/ProductDrawer';


export default function Shop({ onAddToCart = () => {} }) {
  const [filters, setFilters] = useState({ collections: [], colors: [], price: [0, 250000] });
  const [sort, setSort] = useState("featured");
  const [layout, setLayout] = useState("grid");
  const [active, setActive] = useState(null);
  const [search, setSearch] = useState("");
  const [openFilters, setOpenFilters] = useState(false);

  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [reserving, setReserving] = useState(false);
  const { products: dbProducts, loading, fetchProducts } = useProducts({ autoFetch: true });

  const categories = [...new Set(dbProducts.map(p => p.category_name || p.collection).filter(Boolean))];
  const colors = [...new Map(dbProducts.filter(p => p.color_name || p.color_hex).map(p => [p.color_name || p.color_hex, p.color_hex])).entries()];

  const items = useMemo(() => {
    let list = dbProducts.filter(p => p.stock > 0); // Solo productos con stock disponible
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (filters.categories?.length) list = list.filter(p => filters.categories.includes(p.category_name || p.collection));
    if (filters.colors?.length) list = list.filter(p => filters.colors.includes(p.colorName || p.color));
    list = list.filter(p => p.price >= filters.price[0] && p.price <= filters.price[1]);
    if (sort === "price-asc")  list = [...list].sort((a,b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a,b) => b.price - a.price);
    if (sort === "new")        list = [...list].sort((a,b) => (b.tag === "NUEVO" ? 1 : 0) - (a.tag === "NUEVO" ? 1 : 0));
    return list;
  }, [dbProducts, search, filters, sort]);

  const handleReserve = async (product) => {
    if (!isLoggedIn) {
      navigate('/auth?redirect=/tienda');
      return;
    }
    setReserving(true);
    try {
      await storeService.reserveProduct(product.id, user.id);
      alert('¡Producto reservado exitosamente!\n\n⚠️ Tienes 1 hora para confirmar la compra mediante WhatsApp o asistir a la tienda. De lo contrario, la reserva se cancelará.');
      
      const msg = `Hola Fernando, acabo de reservar el producto: ${product.name} (Catálogo). Quiero coordinar el pago.`;
      const waUrl = `${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank');

      setActive(null);
      fetchProducts(); // Recargar stock real
    } catch (err) {
      alert(err.message);
    } finally {
      setReserving(false);
    }
  };

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

      {active && <ProductDrawer product={active} onClose={() => setActive(null)} onReserve={() => handleReserve(active)} isReserving={reserving}/>}
    </div>
  );
}


