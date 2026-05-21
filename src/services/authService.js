import { supabase } from './supabaseClient';

export const authService = {
  // Registrar nuevo usuario
  async signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });

    if (error) throw error;
    return data;
  },

  // Login
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  // Logout
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Obtener usuario actual
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Obtener sesión actual
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  // Crear o actualizar perfil
  async upsertProfile(userId, profileData) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert([
        {
          user_id: userId,
          ...profileData,
          updated_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) throw error;
    return data[0];
  },

  // Obtener perfil
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Verificar si es admin
  async isAdmin(userId) {
    const profile = await this.getProfile(userId);
    return profile?.role === 'admin';
  }
};

export default authService;
