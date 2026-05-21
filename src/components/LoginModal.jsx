import React, { useState } from 'react';
import { Icon } from './Shared';
import { useAuth } from '../contexts/AuthContext';

export default function LoginModal({ onClose }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
        onClose();
      } else {
        if (!name.trim()) {
          setError('El nombre es requerido');
          setLoading(false);
          return;
        }
        await signUp(email, password, name);
        setSuccess('Cuenta creada exitosamente. Revisa tu correo para confirmar.');
        setMode('login');
      }
    } catch (err) {
      const msg = err.message || 'Error al procesar';
      if (msg.includes('Invalid login')) setError('Correo o contraseña incorrectos');
      else if (msg.includes('already registered')) setError('Este correo ya está registrado');
      else setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" onClick={onClose}/>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-[#0E0D0C] border w-full max-w-md p-8 relative fade-up"
             style={{ borderColor: '#2A2530' }}
             onClick={e => e.stopPropagation()}>

          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 border flex items-center justify-center hover:border-[#C9A86A] text-[#F1ECDE] transition-colors"
            style={{ borderColor: '#3A3340' }}>
            <Icon name="X" size={14}/>
          </button>

          <div className="text-center mb-8">
            <div className="font-roman text-[10px] tracking-[0.3em] mb-2" style={{ color: '#C9A86A' }}>
              {mode === 'login' ? 'BIENVENIDO DE VUELTA' : 'UNETE AL CLUB'}
            </div>
            <h2 className="font-display text-3xl italic" style={{ color: '#F1ECDE' }}>
              {mode === 'login' ? 'Iniciar Sesion' : 'Crear Cuenta'}
            </h2>
          </div>

          <div className="flex mb-8 border-b" style={{ borderColor: '#2A2530' }}>
            <button onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 pb-3 text-xs tracking-[0.2em] uppercase transition-colors
                ${mode === 'login' ? 'text-[#E8C77E] border-b-2 border-[#C9A86A]' : 'text-[#6A655C]'}`}>
              Iniciar Sesion
            </button>
            <button onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 pb-3 text-xs tracking-[0.2em] uppercase transition-colors
                ${mode === 'register' ? 'text-[#E8C77E] border-b-2 border-[#C9A86A]' : 'text-[#6A655C]'}`}>
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'register' && (
              <div>
                <label className="font-roman text-[10px] tracking-[0.3em]" style={{ color: '#C9A86A' }}>NOMBRE COMPLETO</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full mt-2 bg-transparent border-b pb-2 text-white outline-none focus:border-[#C9A86A] transition-colors text-sm"
                  style={{ borderColor: '#3A3340' }}
                  placeholder="Tu nombre completo"/>
              </div>
            )}
            <div>
              <label className="font-roman text-[10px] tracking-[0.3em]" style={{ color: '#C9A86A' }}>CORREO ELECTRONICO</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full mt-2 bg-transparent border-b pb-2 text-white outline-none focus:border-[#C9A86A] transition-colors text-sm"
                style={{ borderColor: '#3A3340' }}
                placeholder="correo@ejemplo.com"/>
            </div>
            <div>
              <label className="font-roman text-[10px] tracking-[0.3em]" style={{ color: '#C9A86A' }}>CONTRASENA</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                className="w-full mt-2 bg-transparent border-b pb-2 text-white outline-none focus:border-[#C9A86A] transition-colors text-sm"
                style={{ borderColor: '#3A3340' }}
                placeholder="Minimo 6 caracteres"/>
            </div>

            {error && (
              <div className="text-xs p-3" style={{ color: '#C56B5A', border: '1px solid rgba(197,107,90,0.3)', background: 'rgba(197,107,90,0.1)' }}>
                {error}
              </div>
            )}
            {success && (
              <div className="text-xs p-3" style={{ color: '#7FA86A', border: '1px solid rgba(127,168,106,0.3)', background: 'rgba(127,168,106,0.1)' }}>
                {success}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-gold w-full flex items-center justify-center gap-2"
              style={{ opacity: loading ? 0.7 : 1 }}>
              <Icon name={mode === 'login' ? 'LogIn' : 'UserPlus'} size={14}/>
              {loading ? 'Procesando...' : mode === 'login' ? 'Entrar' : 'Crear Cuenta'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
