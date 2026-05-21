import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Shop from './pages/Shop';
import Admin from './pages/Admin';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Logo, Icon } from './components/Shared';
import LoginModal from './components/LoginModal';

function ProtectedAdminRoute() {
  const { isAdmin, loading, isLoggedIn } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0A' }}>
        <div className="text-white font-mono text-sm">Cargando...</div>
      </div>
    );
  }

  if (isLoggedIn && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Admin />;
}

function Layout({ children }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { isLoggedIn, isAdmin, profile, signOut } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  if (isAdminRoute) return <>{children}{showLogin && <LoginModal onClose={() => setShowLogin(false)}/>}</>;

  const navLinks = [
    { to: '/', label: 'Inicio' },
    { to: '/shop', label: 'Boutique' },
    { to: '/booking', label: 'Reservar' },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans text-white" style={{ background: '#0A0A0A' }}>
      <header className="px-6 lg:px-12 py-5 border-b sticky top-0 z-50 flex items-center justify-between"
              style={{ borderColor: '#2A2530', background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)' }}>
        <Link to="/" onClick={() => setMobileMenu(false)}>
          <Logo size={28}/>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[11px] font-roman tracking-[0.2em] uppercase" style={{ color: '#E8C77E' }}>
          {navLinks.map(l => (
            <Link key={l.to} to={l.to}
              className={`hover:text-white transition-colors ${location.pathname === l.to ? 'text-white' : ''}`}>
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" className="hover:text-white transition-colors text-[#6A655C]">Admin</Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <div className="relative">
              <button onClick={() => setUserMenu(!userMenu)}
                className="flex items-center gap-2 text-xs font-roman tracking-[0.15em] uppercase transition-colors hover:text-[#E8C77E]"
                style={{ color: '#948A78' }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-display"
                     style={{ background: 'linear-gradient(135deg, #E8C77E, #8B6F3F)', color: '#1A1408' }}>
                  {(profile?.full_name || profile?.email || 'U')[0].toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate">{profile?.full_name || 'Usuario'}</span>
                <Icon name="ChevronDown" size={12}/>
              </button>
              {userMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenu(false)}/>
                  <div className="absolute right-0 top-full mt-2 w-48 border z-50 py-2"
                       style={{ background: '#0E0D0C', borderColor: '#2A2530' }}>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs hover:bg-[#1A1816] transition-colors" style={{ color: '#E8C77E' }}>
                        <Icon name="LayoutDashboard" size={14}/> Panel Admin
                      </Link>
                    )}
                    <button onClick={() => { signOut(); setUserMenu(false); }}
                      className="flex items-center gap-2 px-4 py-2 text-xs hover:bg-[#1A1816] transition-colors w-full text-left" style={{ color: '#948A78' }}>
                      <Icon name="LogOut" size={14}/> Cerrar Sesion
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button onClick={() => setShowLogin(true)}
              className="flex items-center gap-2 text-xs font-roman tracking-[0.15em] uppercase transition-colors hover:text-[#E8C77E]"
              style={{ color: '#948A78' }}>
              <Icon name="LogIn" size={14}/> Entrar
            </button>
          )}
        </div>

        <button className="md:hidden border p-2 rounded transition-colors hover:border-[#C9A86A]"
                style={{ borderColor: '#3A3340', color: '#E8C77E' }}
                onClick={() => setMobileMenu(!mobileMenu)}>
          <Icon name={mobileMenu ? 'X' : 'Menu'} size={20}/>
        </button>
      </header>

      {mobileMenu && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setMobileMenu(false)}/>
          <div className="fixed top-[73px] left-0 right-0 z-40 md:hidden border-b"
               style={{ background: '#0E0D0C', borderColor: '#2A2530' }}>
            <nav className="p-6 space-y-1">
              {navLinks.map(l => (
                <Link key={l.to} to={l.to} onClick={() => setMobileMenu(false)}
                  className="flex items-center gap-3 py-3 text-sm font-roman tracking-[0.15em] uppercase transition-colors hover:text-[#E8C77E]"
                  style={{ color: location.pathname === l.to ? '#E8C77E' : '#948A78' }}>
                  {l.label}
                </Link>
              ))}
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileMenu(false)}
                  className="flex items-center gap-3 py-3 text-sm font-roman tracking-[0.15em] uppercase text-[#6A655C] hover:text-[#E8C77E] transition-colors">
                  <Icon name="LayoutDashboard" size={16}/> Admin
                </Link>
              )}
              <div className="pt-4 border-t" style={{ borderColor: '#2A2530' }}>
                {isLoggedIn ? (
                  <button onClick={() => { signOut(); setMobileMenu(false); }}
                    className="flex items-center gap-3 py-3 text-sm font-roman tracking-[0.15em] uppercase text-[#948A78]">
                    <Icon name="LogOut" size={16}/> Cerrar Sesion
                  </button>
                ) : (
                  <button onClick={() => { setShowLogin(true); setMobileMenu(false); }}
                    className="flex items-center gap-3 py-3 text-sm font-roman tracking-[0.15em] uppercase text-[#E8C77E]">
                    <Icon name="LogIn" size={16}/> Iniciar Sesion
                  </button>
                )}
              </div>
            </nav>
          </div>
        </>
      )}

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t py-8 px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-mono"
              style={{ borderColor: '#2A2530', color: '#6A655C' }}>
        <div>&copy; {new Date().getFullYear()} CENITT BARBERIA. TODOS LOS DERECHOS RESERVADOS.</div>
        <div className="flex gap-4">
          <Link to="/terms" className="hover:text-[#E8C77E]">TERMINOS</Link>
          <Link to="/privacy" className="hover:text-[#E8C77E]">PRIVACIDAD</Link>
        </div>
      </footer>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)}/>}
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
