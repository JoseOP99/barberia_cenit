import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Icon, Logo } from '../components/Shared';

const ID_TYPES = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'PP', label: 'Pasaporte' },
];

const COUNTRY_CODES = [
  { code: '+57', country: 'COL' },
  { code: '+52', country: 'MEX' },
  { code: '+51', country: 'PER' },
  { code: '+54', country: 'ARG' },
  { code: '+56', country: 'CHL' },
  { code: '+58', country: 'VEN' },
  { code: '+593', country: 'ECU' },
  { code: '+507', country: 'PAN' },
  { code: '+1', country: 'USA/CAN' },
  { code: '+34', country: 'ESP' },
];

function InputField({ label, id, error, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium tracking-wide text-[#B5AFA5] uppercase">
        {label}
      </label>
      <input
        id={id}
        className="w-full px-4 py-3 rounded-xl text-sm text-[#F5F1E8] placeholder-[#6A655C] outline-none transition-all focus:ring-2 focus:ring-[#C9A86A]/40"
        style={{
          background: '#1A1816',
          border: error ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.08)',
        }}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

function SelectField({ label, id, options, error, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium tracking-wide text-[#B5AFA5] uppercase">
        {label}
      </label>
      <select
        id={id}
        className="w-full px-4 py-3 rounded-xl text-sm text-[#F5F1E8] outline-none transition-all cursor-pointer focus:ring-2 focus:ring-[#C9A86A]/40"
        style={{
          background: '#1A1816',
          border: error ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.08)',
        }}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-[#1A1A1A] text-[#F5F1E8]">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── LOGIN TAB ───────────────────────────────────────────────
function LoginForm({ onSwitchTab }) {
  const { signIn, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      await signIn(email, password);
      navigate('/');
    } catch {}
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <InputField
        label="Correo electrónico o Teléfono"
        id="login-email"
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@correo.com o 300 123 4567"
        required
        autoComplete="username"
      />
      <div className="relative">
        <InputField
          label="Contraseña"
          id="login-password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[34px] p-1 text-[#6A655C] hover:text-[#B5AFA5] transition-colors"
          tabIndex={-1}
        >
          <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <Icon name="AlertCircle" size={16} className="text-red-400 shrink-0 mt-0.5" />
          <span className="text-sm text-red-300">{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[#C9A86A] text-[#1A1408] text-sm font-semibold tracking-wider uppercase px-6 py-3.5 rounded-full hover:bg-[#E8C77E] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-[#1A1408] border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Icon name="LogIn" size={16} />
            Iniciar Sesión
          </>
        )}
      </button>

      <button
        type="button"
        onClick={() => onSwitchTab('reset')}
        className="text-sm text-[#9A9489] hover:text-[#C9A86A] transition-colors cursor-pointer"
      >
        ¿Olvidaste tu contraseña?
      </button>
    </form>
  );
}

// ─── REGISTER TAB ────────────────────────────────────────────
function RegisterForm({ onSwitchTab, onSuccess }) {
  const { signUp, loading, error, clearError } = useAuth();
  const [form, setForm] = useState({
    first_name: '', second_name: '',
    first_lastname: '', second_lastname: '',
    email: '', phone: '', countryCode: '+57', password: '', confirmPassword: '',
    identification: '', identification_type: 'CC',
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: null }));
    clearError();
  };

  const validate = () => {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = 'Requerido';
    if (!form.first_lastname.trim()) errs.first_lastname = 'Requerido';
    if (!form.email.trim()) errs.email = 'Requerido';
    if (!form.phone.trim()) errs.phone = 'Requerido';
    if (!form.password) errs.password = 'Requerido';
    else if (form.password.length < 6) errs.password = 'Mínimo 6 caracteres';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Las contraseñas no coinciden';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    clearError();
    try {
      await signUp({
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        second_name: form.second_name || undefined,
        first_lastname: form.first_lastname,
        second_lastname: form.second_lastname || undefined,
        phone: `${form.countryCode} ${form.phone.trim()}`,
        identification: form.identification || undefined,
        identification_type: form.identification_type,
      });
      onSuccess(form.email);
    } catch {}
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Primer nombre *" id="reg-fname" value={form.first_name}
          onChange={(e) => updateField('first_name', e.target.value)}
          placeholder="Fernando" error={fieldErrors.first_name} required />
        <InputField label="Segundo nombre" id="reg-sname" value={form.second_name}
          onChange={(e) => updateField('second_name', e.target.value)}
          placeholder="(Opcional)" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Primer apellido *" id="reg-flast" value={form.first_lastname}
          onChange={(e) => updateField('first_lastname', e.target.value)}
          placeholder="Mendoza" error={fieldErrors.first_lastname} required />
        <InputField label="Segundo apellido" id="reg-slast" value={form.second_lastname}
          onChange={(e) => updateField('second_lastname', e.target.value)}
          placeholder="(Opcional)" />
      </div>
      <InputField label="Correo electrónico *" id="reg-email" type="email" value={form.email}
        onChange={(e) => updateField('email', e.target.value)}
        placeholder="tu@correo.com" error={fieldErrors.email} required autoComplete="email" />
      
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-phone" className="text-xs font-medium tracking-wide text-[#B5AFA5] uppercase">
          Teléfono / WhatsApp *
        </label>
        <div className="flex gap-2">
          <select
            value={form.countryCode}
            onChange={(e) => updateField('countryCode', e.target.value)}
            className="w-28 px-2 py-3 rounded-xl text-sm text-[#F5F1E8] outline-none transition-all cursor-pointer focus:ring-2 focus:ring-[#C9A86A]/40"
            style={{
              background: '#1A1816',
              border: fieldErrors.phone ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {COUNTRY_CODES.map(c => (
              <option key={c.code} value={c.code} className="bg-[#1A1A1A] text-[#F5F1E8]">
                {c.code} {c.country}
              </option>
            ))}
          </select>
          <input
            id="reg-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="300 123 4567"
            className="flex-1 px-4 py-3 rounded-xl text-sm text-[#F5F1E8] placeholder-[#6A655C] outline-none transition-all focus:ring-2 focus:ring-[#C9A86A]/40"
            style={{
              background: '#1A1816',
              border: fieldErrors.phone ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.08)',
            }}
          />
        </div>
        {fieldErrors.phone && <span className="text-xs text-red-400">{fieldErrors.phone}</span>}
        <span className="text-[10px] text-[#9A9489] mt-0.5 ml-1">
          Número de WhatsApp (Aquí podrás recibir notificaciones de eventos o citas).
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField label="Tipo de documento" id="reg-idtype" value={form.identification_type}
          onChange={(e) => updateField('identification_type', e.target.value)}
          options={ID_TYPES} />
        <InputField label="Número de documento" id="reg-idnum" value={form.identification}
          onChange={(e) => updateField('identification', e.target.value)}
          placeholder="1.234.567.890" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Contraseña *" id="reg-pass" type="password" value={form.password}
          onChange={(e) => updateField('password', e.target.value)}
          placeholder="Mínimo 6 caracteres" error={fieldErrors.password} required autoComplete="new-password" />
        <InputField label="Confirmar contraseña *" id="reg-cpass" type="password" value={form.confirmPassword}
          onChange={(e) => updateField('confirmPassword', e.target.value)}
          placeholder="Repetir contraseña" error={fieldErrors.confirmPassword} required autoComplete="new-password" />
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <Icon name="AlertCircle" size={16} className="text-red-400 shrink-0 mt-0.5" />
          <span className="text-sm text-red-300">{error}</span>
        </div>
      )}

      <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/15 mt-1">
        <Icon name="Info" size={16} className="text-amber-400 shrink-0 mt-0.5" />
        <span className="text-xs text-amber-200/80 leading-relaxed">
          Si acumulas 3 citas sin presentarte, tu cuenta será suspendida automáticamente.
        </span>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[#C9A86A] text-[#1A1408] text-sm font-semibold tracking-wider uppercase px-6 py-3.5 rounded-full hover:bg-[#E8C77E] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-[#1A1408] border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Icon name="UserPlus" size={16} />
            Crear Cuenta
          </>
        )}
      </button>
    </form>
  );
}

// ─── RESET PASSWORD TAB ──────────────────────────────────────
function ResetPasswordForm({ onSwitchTab }) {
  const { resetPassword, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      await resetPassword(email);
      setSent(true);
    } catch {}
  };

  if (sent) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
          style={{ background: 'rgba(201, 168, 106, 0.1)', border: '1px solid rgba(201, 168, 106, 0.2)' }}>
          <Icon name="Mail" size={28} className="text-[#C9A86A]" />
        </div>
        <h3 className="text-xl font-medium text-[#F5F1E8] mb-2">Revisa tu correo</h3>
        <p className="text-sm text-[#9A9489] mb-6 max-w-sm mx-auto">
          Te enviamos un enlace a <span className="text-[#E8C77E]">{email}</span> para restablecer tu contraseña.
        </p>
        <button onClick={() => onSwitchTab('login')}
          className="text-sm text-[#C9A86A] hover:text-[#E8C77E] transition-colors cursor-pointer">
          Volver a iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <p className="text-sm text-[#9A9489]">
        Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
      </p>
      <InputField label="Correo electrónico" id="reset-email" type="email" value={email}
        onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" required autoComplete="email" />

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <Icon name="AlertCircle" size={16} className="text-red-400 shrink-0 mt-0.5" />
          <span className="text-sm text-red-300">{error}</span>
        </div>
      )}

      <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[#C9A86A] text-[#1A1408] text-sm font-semibold tracking-wider uppercase px-6 py-3.5 rounded-full hover:bg-[#E8C77E] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]">
        {loading ? (
          <div className="w-5 h-5 border-2 border-[#1A1408] border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Icon name="Send" size={16} />
            Enviar Enlace
          </>
        )}
      </button>
      <button type="button" onClick={() => onSwitchTab('login')}
        className="text-sm text-[#9A9489] hover:text-[#C9A86A] transition-colors cursor-pointer">
        Volver a iniciar sesión
      </button>
    </form>
  );
}

// ─── EMAIL VERIFICATION SUCCESS ──────────────────────────────
function VerificationSent({ email, onSwitchTab }) {
  return (
    <div className="text-center py-6">
      <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
        style={{ background: 'rgba(127, 168, 106, 0.1)', border: '1px solid rgba(127, 168, 106, 0.2)' }}>
        <Icon name="MailCheck" size={28} className="text-[#7FA86A]" />
      </div>
      <h3 className="text-xl font-medium text-[#F5F1E8] mb-2">Verifica tu correo</h3>
      <p className="text-sm text-[#9A9489] mb-6 max-w-sm mx-auto">
        Enviamos un enlace de confirmación a <span className="text-[#E8C77E]">{email}</span>.
        Revisa tu bandeja de entrada (y spam) para activar tu cuenta.
      </p>
      <button onClick={() => onSwitchTab('login')}
        className="inline-flex items-center gap-2 text-sm text-[#C9A86A] hover:text-[#E8C77E] transition-colors cursor-pointer">
        <Icon name="ArrowLeft" size={14} />
        Ir a iniciar sesión
      </button>
    </div>
  );
}

// ─── MAIN AUTH PAGE ──────────────────────────────────────────
export default function Auth() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'login';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [verificationEmail, setVerificationEmail] = useState('');
  const { isLoggedIn, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  // Si está cargando, mostrar nada o un loader pequeño para evitar parpadeos
  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C9A86A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Si ya está logueado, redirigir dependiendo de su rol
  if (isLoggedIn) {
    if (isAdmin) {
      navigate('/admin', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
    return null;
  }

  const handleRegisterSuccess = (email) => {
    navigate('/');
  };

  const tabs = [
    { id: 'login', label: 'Ingresar', icon: 'LogIn' },
    { id: 'register', label: 'Registrarse', icon: 'UserPlus' },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-in">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size={44} />
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 sm:p-8" style={{
          background: 'rgba(12, 11, 10, 0.96)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          {/* Tabs */}
          {(activeTab === 'login' || activeTab === 'register') && (
            <div className="flex gap-1 p-1 rounded-xl mb-6" style={{
              background: 'rgba(15, 14, 12, 0.98)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[#C9A86A]/15 text-[#E8C77E] border border-[#C9A86A]/20'
                      : 'text-[#6A655C] hover:text-[#B5AFA5]'
                  }`}
                >
                  <Icon name={tab.icon} size={14} />
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Reset password header */}
          {activeTab === 'reset' && (
            <div className="mb-6">
              <h2 className="text-xl font-medium text-[#F5F1E8]">Recuperar contraseña</h2>
            </div>
          )}

          {/* Forms */}
          {activeTab === 'login' && <LoginForm onSwitchTab={setActiveTab} />}
          {activeTab === 'register' && <RegisterForm onSwitchTab={setActiveTab} onSuccess={handleRegisterSuccess} />}
          {activeTab === 'reset' && <ResetPasswordForm onSwitchTab={setActiveTab} />}
          {activeTab === 'verify' && <VerificationSent email={verificationEmail} onSwitchTab={setActiveTab} />}
        </div>
      </div>
    </div>
  );
}
