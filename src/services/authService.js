import { supabase } from './supabaseClient';

const handleError = (error, context) => {
  const errorMessage = error?.message || 'Error desconocido';
  console.error(`[AuthService - ${context}]:`, errorMessage);
  throw new Error(errorMessage);
};

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const authService = {
  /**
   * Registro extendido con todos los campos del perfil.
   * El trigger on_auth_user_created crea el profile automáticamente.
   */
  async signUp({ email, password, first_name, second_name, first_lastname, second_lastname, phone, identification, identification_type }) {
    try {
      if (!email || !password) throw new Error('Email y contraseña son requeridos');
      if (!validateEmail(email)) throw new Error('Email inválido');
      if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');
      if (!first_name || !first_lastname) throw new Error('Nombre y apellido son requeridos');

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name,
            second_name: second_name || null,
            first_lastname,
            second_lastname: second_lastname || null,
            phone: phone || null,
            identification: identification || null,
            identification_type: identification_type || 'CC',
          }
        }
      });

      if (error) handleError(error, 'signUp');
      return data;
    } catch (err) {
      handleError(err, 'signUp');
    }
  },

  async signIn(email, password) {
    try {
      if (!email || !password) throw new Error('Email y contraseña son requeridos');
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) handleError(error, 'signIn');

      // Verificar si el usuario está bloqueado
      if (data?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', data.user.id)
          .single();

        if (profile?.status === 'blocked') {
          await supabase.auth.signOut();
          throw new Error('Tu cuenta ha sido suspendida por incumplimiento. Contacta al administrador.');
        }
        if (profile?.status === 'suspended') {
          await supabase.auth.signOut();
          throw new Error('Tu cuenta está temporalmente suspendida. Contacta al administrador.');
        }
      }

      return data;
    } catch (err) {
      handleError(err, 'signIn');
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) handleError(error, 'signOut');
    } catch (err) {
      handleError(err, 'signOut');
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user || null;
    } catch {
      return null;
    }
  },

  async getSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session || null;
    } catch {
      return null;
    }
  },

  // Recuperar contraseña
  async resetPassword(email) {
    try {
      if (!email) throw new Error('Email es requerido');
      if (!validateEmail(email)) throw new Error('Email inválido');

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) handleError(error, 'resetPassword');
      return true;
    } catch (err) {
      handleError(err, 'resetPassword');
    }
  },

  // Actualizar contraseña (después de reset)
  async updatePassword(newPassword) {
    try {
      if (!newPassword || newPassword.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) handleError(error, 'updatePassword');
      return true;
    } catch (err) {
      handleError(err, 'updatePassword');
    }
  },

  // Reenviar correo de verificación
  async resendVerificationEmail(email) {
    try {
      if (!email) throw new Error('Email es requerido');
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) handleError(error, 'resendVerification');
      return true;
    } catch (err) {
      handleError(err, 'resendVerification');
    }
  },

  // Obtener perfil
  async getProfile(userId) {
    try {
      if (!userId) throw new Error('User ID es requerido');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) handleError(error, 'getProfile');
      return data;
    } catch (err) {
      handleError(err, 'getProfile');
    }
  },

  // Actualizar perfil
  async updateProfile(userId, updates) {
    try {
      if (!userId) throw new Error('User ID es requerido');
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
      if (error) handleError(error, 'updateProfile');
      return data;
    } catch (err) {
      handleError(err, 'updateProfile');
    }
  },

  // Verificar si es admin
  async isAdmin(userId) {
    try {
      if (!userId) return false;
      const profile = await this.getProfile(userId);
      return profile?.role === 'admin';
    } catch {
      return false;
    }
  },

  // Suscripción a cambios de auth
  onAuthStateChange(callback) {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    return data?.subscription;
  }
};

export default authService;
