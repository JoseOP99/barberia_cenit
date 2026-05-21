import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Admin from './pages/Admin';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Logo, Icon } from './components/Shared';
import { CONTACT_INFO } from './data/cenitData';

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

const NAV_LINKS = [
  { to: '/', label: 'Inicio' },
  { to: '/reservar', label: 'Reservar' },
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

function Layout({ children }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isAdmin) return children;

  return (
    <div className="min-h-screen flex flex-col font-sans text-white bg-[#0A0A0A]">
      <header className="sticky top-0 z-50 border-b border-white/[0.06]" style={{
        background: 'rgba(10, 10, 10, 0.6)',
        backdropFilter: 'blur(20px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
      }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-[68px] flex items-center justify-between">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>
            <Logo size={36} />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <NavLink key={link.to} {...link} />
            ))}
            <a
              href={CONTACT_INFO.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] font-medium tracking-wide text-[#B5AFA5] hover:text-[#25D366] transition-colors"
            >
              WhatsApp
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/reservar"
              className="hidden sm:inline-flex items-center gap-2 bg-[#C9A86A] text-[#1A1408] text-xs font-semibold tracking-wider uppercase px-5 py-2.5 rounded-full hover:bg-[#E8C77E] transition-colors"
            >
              <Icon name="Calendar" size={14} />
              Reservar
            </Link>
            <button
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full border border-white/10 text-[#B5AFA5] hover:text-[#E8C77E] hover:border-white/20 transition-colors"
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
              <a
                href={CONTACT_INFO.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] text-[#25D366] hover:bg-white/[0.04] transition-colors"
              >
                <Icon name="MessageCircle" size={16} /> WhatsApp
              </a>
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

      <footer className="border-t border-white/[0.06] bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            <div>
              <Logo size={32} />
              <p className="mt-4 text-sm text-[#9A9489] leading-relaxed max-w-xs">
                Tu barbería de confianza en Tuchín. Cortes con dedicación por Fernando Mendoza.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold tracking-widest uppercase text-[#C9A86A] mb-4">Horario</h4>
              <div className="flex flex-col gap-2 text-sm text-[#9A9489]">
                <div className="flex justify-between"><span>Lunes</span><span className="text-[#6A655C]">Cerrado</span></div>
                <div className="flex justify-between"><span>Martes – Sábado</span><span>8:30 AM – 6:00 PM</span></div>
                <div className="flex justify-between"><span>Domingo</span><span>8:30 AM – 3:00 PM</span></div>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold tracking-widest uppercase text-[#C9A86A] mb-4">Contacto</h4>
              <div className="flex flex-col gap-3 text-sm text-[#9A9489]">
                <div className="flex items-center gap-2">
                  <Icon name="MapPin" size={14} className="text-[#6A655C] shrink-0" />
                  Tuchín, Córdoba · Sector San Pedro
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Phone" size={14} className="text-[#6A655C] shrink-0" />
                  {CONTACT_INFO.phone}
                </div>
                <a
                  href={CONTACT_INFO.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#25D366] hover:text-[#2eec73] transition-colors"
                >
                  <Icon name="MessageCircle" size={14} />
                  Escríbenos por WhatsApp
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#6A655C]">
            <span>&copy; {new Date().getFullYear()} Cénit Barbería. Todos los derechos reservados.</span>
            <span>Tuchín, Córdoba</span>
          </div>
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
            <Route path="/reservar" element={<Booking />} />
            <Route path="/booking" element={<Navigate to="/reservar" replace />} />
            <Route path="/admin/*" element={<ProtectedAdminRoute />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}
