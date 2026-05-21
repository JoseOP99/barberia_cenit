import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Admin from './pages/Admin';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Sorteos from './pages/Sorteos';
import Shop from './pages/Shop';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Logo, Icon } from './components/Shared';
import { CONTACT_INFO } from './data/cenitData';
import AnimatedBackground from './components/AnimatedBackground';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/PageTransition';

function ProtectedAdminRoute() {
  const { isAdmin, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="w-8 h-8 border-2 border-[#C9A86A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Admin />;
}

function ProtectedProfileRoute() {
  const { isLoggedIn, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="w-8 h-8 border-2 border-[#C9A86A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isLoggedIn) return <Navigate to="/auth" replace />;
  return <Profile />;
}

function ProtectedBookingRoute() {
  const { isLoggedIn, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="w-8 h-8 border-2 border-[#C9A86A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isLoggedIn) return <Navigate to="/auth?tab=login&redirect=/reservar" replace />;
  return <Booking />;
}

function ProtectedSorteosRoute() {
  const { isLoggedIn, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="w-8 h-8 border-2 border-[#C9A86A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isLoggedIn) return <Navigate to="/auth?tab=login&redirect=/sorteos" replace />;
  return <Sorteos />;
}

const NAV_LINKS = [
  { to: '/', label: 'Inicio' },
  { to: '/tienda', label: 'Tienda' },
  { to: '/sorteos', label: 'Sorteos' }
];

function NavLink({ to, label, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`text-[13px] font-medium tracking-wide transition-colors duration-200 ${
        isActive ? 'text-[#E8C77E]' : 'text-[#B5AFA5] hover:text-[#F5F1E8]'
      }`}
    >
      {label}
    </Link>
  );
}

function UserMenu() {
  const { isLoggedIn, profile, signOut, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);

  if (!isLoggedIn) {
    return (
      <Link
        to="/auth"
        className="inline-flex items-center gap-2 text-[13px] font-medium tracking-wide text-[#B5AFA5] hover:text-[#E8C77E] transition-colors"
      >
        <Icon name="LogIn" size={16} />
        <span className="hidden sm:inline">Ingresar</span>
      </Link>
    );
  }

  const initials = profile
    ? `${(profile.first_name || '')[0] || ''}${(profile.first_lastname || '')[0] || ''}`.toUpperCase()
    : '??';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E8C77E] to-[#8B6F3F] flex items-center justify-center">
          <span className="text-[11px] font-semibold text-[#1A1408]">{initials}</span>
        </div>
        <Icon name="ChevronDown" size={14} className="text-[#6A655C] group-hover:text-[#B5AFA5] transition-colors" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-2 w-56 rounded-xl py-2 z-50"
            style={{
              background: 'rgba(20, 20, 20, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            }}
          >
            <div className="px-4 py-2.5 border-b border-white/[0.06]">
              <p className="text-sm text-[#F5F1E8] font-medium truncate">
                {profile?.first_name} {profile?.first_lastname}
              </p>
              <p className="text-xs text-[#6A655C] truncate">{profile?.email}</p>
            </div>

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#B5AFA5] hover:text-[#E8C77E] hover:bg-white/[0.04] transition-colors"
              >
                <Icon name="LayoutDashboard" size={16} />
                Panel Admin
              </Link>
            )}

            <button
              onClick={async () => { setOpen(false); await signOut(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#B5AFA5] hover:text-red-400 hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              <Icon name="LogOut" size={16} />
              Cerrar Sesión
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function UserMenuProxyProfile() {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return null;
  return <NavLink to="/perfil" label="Mi Perfil y Citas" />;
}

function UserMenuProxyProfileMobile({ closeMenu }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return null;
  return (
    <Link
      to="/perfil"
      onClick={closeMenu}
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] text-[#B5AFA5] hover:text-[#F5F1E8] hover:bg-white/[0.04] transition-colors"
    >
      <Icon name="User" size={16} /> Mi Perfil y Citas
    </Link>
  );
}

function Layout({ children }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isAdminRoute) return children;

  return (
    <div className="min-h-screen flex flex-col font-sans text-white bg-transparent">
      <header className="sticky top-0 z-50 border-b border-white/[0.06]" style={{
        background: 'rgba(10, 10, 10, 0.6)',
        backdropFilter: 'blur(20px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
      }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-[76px] flex items-center justify-between">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>
            <Logo size={46} />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <NavLink key={link.to} {...link} />
            ))}
            {/* Si está logueado, mostramos el perfil en la barra principal */}
            <UserMenuProxyProfile />
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/reservar"
              className="hidden sm:inline-flex items-center gap-2 bg-[#C9A86A] text-[#1A1408] text-xs font-semibold tracking-wider uppercase px-5 py-2.5 rounded-full hover:bg-[#E8C77E] transition-colors"
            >
              <Icon name="Calendar" size={14} />
              Reservar
            </Link>
            <UserMenu />
            <button
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full border border-white/10 text-[#B5AFA5] hover:text-[#E8C77E] hover:border-white/20 transition-colors cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menú"
            >
              <Icon name={mobileMenuOpen ? 'X' : 'Menu'} size={20} />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.06] animate-slide-down" style={{
            background: 'rgba(10, 10, 10, 0.85)',
            backdropFilter: 'blur(20px)',
          }}>
            <nav className="flex flex-col px-5 py-4 gap-1">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] text-[#B5AFA5] hover:text-[#F5F1E8] hover:bg-white/[0.04] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {/* Link de perfil en el menú móvil si está logueado */}
              <UserMenuProxyProfileMobile closeMenu={() => setMobileMenuOpen(false)} />
              <Link
                to="/reservar"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 flex items-center justify-center gap-2 bg-[#C9A86A] text-[#1A1408] text-sm font-semibold tracking-wider uppercase px-5 py-3 rounded-full"
              >
                <Icon name="Calendar" size={14} />
                Reservar Cita
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Botón Flotante de WhatsApp */}
      <a 
        href={CONTACT_INFO.whatsapp} 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
        style={{ background: '#25D366', boxShadow: '0 4px 14px rgba(37, 211, 102, 0.4)' }}
        aria-label="Contactar por WhatsApp"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
        </svg>
      </a>

      <footer className="border-t border-white/[0.06] bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-4">
            
            {/* Logo y descripción */}
            <div className="flex items-center gap-4">
              <Logo size={24} />
              <p className="text-[12px] text-[#9A9489] max-w-sm hidden sm:block">
                Tu barbería de confianza en Tuchín. Cortes con dedicación por Fernando Mendoza.
              </p>
            </div>

            {/* Info y Horarios comprimidos */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-[#9A9489]">
              <div className="flex items-center gap-1.5">
                <Icon name="Clock" size={12} className="text-[#C9A86A]" />
                <span>Mar-Sáb: 8:30-6:00PM | Dom: 8:30-3:00PM</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <Icon name="MapPin" size={12} className="text-[#C9A86A]" />
                <span>Sector San Pedro, Tuchín</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Icon name="Phone" size={12} className="text-[#C9A86A]" />
                <span>{CONTACT_INFO.phone}</span>
              </div>

              <a href={CONTACT_INFO.whatsapp} target="_blank" rel="noopener noreferrer" 
                 className="flex items-center gap-1.5 text-[#25D366] hover:text-[#2eec73] transition-colors">
                <Icon name="MessageCircle" size={12} />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
          <div className="border-t border-white/[0.06] pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-[#6A655C]">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <span>&copy; {new Date().getFullYear()} Cénit Barbería. Todos los derechos reservados.</span>
              <span className="hidden sm:inline">•</span>
              <span>Tuchín, Córdoba</span>
            </div>
            
            <a 
              href="https://zenubit.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#9A9489] hover:text-[#E8C77E] transition-colors group text-xs"
            >
              <span>Desarrollado por <strong className="font-semibold tracking-wider text-[#C9A86A]">ZENUBIT</strong></span>
              <img 
                src="/zenubit-logo.png" 
                alt="ZENUBIT Logo" 
                className="h-8 w-auto opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105 drop-shadow-[0_0_8px_rgba(201,168,106,0.4)]"
              />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/reservar" element={<PageTransition><ProtectedBookingRoute /></PageTransition>} />
        <Route path="/booking" element={<Navigate to="/reservar" replace />} />
        <Route path="/tienda" element={<PageTransition><Shop /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/auth/reset-password" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/perfil" element={<PageTransition><ProtectedProfileRoute /></PageTransition>} />
        <Route path="/sorteos" element={<PageTransition><ProtectedSorteosRoute /></PageTransition>} />
        <Route path="/admin/*" element={<PageTransition><ProtectedAdminRoute /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <div className="min-h-screen text-[#F5F1E8] flex flex-col relative font-sans">
      
      {/* Fondo Animado con Framer Motion */}
      <AnimatedBackground />

      <BrowserRouter>
        <AuthProvider>
          <div className="relative z-10 flex flex-col min-h-screen">
            <Layout>
              <AnimatedRoutes />
            </Layout>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}
