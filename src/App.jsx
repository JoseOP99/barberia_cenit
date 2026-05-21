import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Shop from './pages/Shop';
import Admin from './pages/Admin';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Logo, Icon } from './components/Shared';

// Componente para proteger rutas de admin
// En producción con auth activo, descomentar la lógica de protección
function ProtectedAdminRoute() {
  const { isAdmin, loading, isLoggedIn } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0A' }}>
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  // Permitir acceso si no hay sistema de auth activo (modo demo)
  // En producción: cambiar a `if (!isAdmin) return <Navigate to="/" replace />;`
  if (isLoggedIn && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Admin />;
}

function Layout({ children }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const { isLoggedIn } = useAuth();

  if (isAdmin) return children;

  return (
    <div className="min-h-screen flex flex-col font-sans text-white" style={{ background: '#0A0A0A' }}>
      <header className="px-6 lg:px-12 py-5 border-b sticky top-0 z-50 flex items-center justify-between"
              style={{ borderColor: '#2A2530', background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)' }}>
        <Link to="/">
          <Logo size={28}/>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-[11px] font-roman tracking-[0.2em] uppercase" style={{ color: '#E8C77E' }}>
          <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
          <Link to="/shop" className="hover:text-white transition-colors">Boutique</Link>
          <Link to="/booking" className="hover:text-white transition-colors">Reservar</Link>
          <Link to="/admin" className="hover:text-white transition-colors text-[#6A655C]">Admin</Link>
        </nav>
        <button className="md:hidden border p-2 rounded border-[#3A3340] text-[#E8C77E]">
          <Icon name="Menu" size={20}/>
        </button>
      </header>
      
      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t py-8 px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-mono"
              style={{ borderColor: '#2A2530', color: '#6A655C' }}>
        <div>&copy; {new Date().getFullYear()} CÉNITT BARBERÍA. TODOS LOS DERECHOS RESERVADOS.</div>
        <div className="flex gap-4">
          <Link to="/terms" className="hover:text-[#E8C77E]">TÉRMINOS</Link>
          <Link to="/privacy" className="hover:text-[#E8C77E]">PRIVACIDAD</Link>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/admin/*" element={<ProtectedAdminRoute />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}
