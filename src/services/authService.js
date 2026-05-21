import { supabase } from './supabaseClient';

const handleError = (error, context) => {
  const errorMessage = error?.message || 'Error desconocido';
  console.error(`[AuthService - ${context}]:`, errorMessage);
  throw new Error(`${context}: ${errorMessage}`);
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const authService = {
  // Registrar nuevo usuario
  async signUp(email, password, fullName = '') {
    try {
      if (!email || !password) throw new Error('Email y contraseña son requeridos');
      if (!validateEmail(email)) throw new Error('Email inválido');
      if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });

      if (error) handleError(error, 'signUp');

      // Crear perfil de usuario
      if (data?.user?.id) {
        await this.upsertProfile(data.user.id, {
          full_name: fullName,
          email,
          role: 'customer'
        });
      }

      return data;
    } catch (err) {
      handleError(err, 'signUp');
    }
  },

  // Login
  async signIn(email, password) {
    try {
      if (!email || !password) throw new Error('Email y contraseña son requeridos');

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) handleError(error, 'signIn');
      return data;
    } catch (err) {
      handleError(err, 'signIn');
    }
  },

  // Logout
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) handleError(error, 'signOut');
    } catch (err) {
      handleError(err, 'signOut');
    }
  },

  // Obtener usuario actual
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) handleError(error, 'getCurrentUser');
      return user;
    } catch (err) {
      handleError(err, 'getCurrentUser');
    }
  },

  // Obtener sesión actual
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) handleError(error, 'getSession');
      return session;
    } catch (err) {
      handleError(err, 'getSession');
    }
  },

  // Crear o actualizar perfil
  async upsertProfile(userId, profileData) {
    try {
      if (!userId) throw new Error('User ID es requerido');

      const { data, error } = await supabase
        .from('profiles')
        .upsert([
          {
            id: userId,
            full_name: profileData.full_name || '',
            email: profileData.email || '',
            phone: profileData.phone || null,
            role: profileData.role || 'customer',
            avatar_url: profileData.avatar_url || null,
            updated_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) handleError(error, 'upsertProfile');
      return data?.[0];
    } catch (err) {
      handleError(err, 'upsertProfile');
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
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select();

      if (error) handleError(error, 'updateProfile');
      return data?.[0];
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

  // Obtener usuario actual completo (user + profile)
  async getCurrentUserWithProfile() {
    try {
      const user = await this.getCurrentUser();
      if (!user) return null;

      const profile = await this.getProfile(user.id);
      return { ...user, profile };
    } catch (err) {
      handleError(err, 'getCurrentUserWithProfile');
    }
  },

  // Escuchar cambios de autenticación
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }
};

export default authService;
