import { supabase } from './supabaseClient';

export const reservationsService = {
  // Crear apartado (reserva)
  async createReservation(productId, userId, quantity = 1, expiresInHours = 6) {
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('reservations')
      .insert([
        {
          product_id: productId,
          user_id: userId,
          quantity,
          status: 'pending',
          expires_at: expiresAt
        }
      ])
      .select();

    if (error) throw error;
    return data[0];
  },

  // Obtener reservas del usuario
  async getUserReservations(userId) {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Obtener todas las reservas (admin)
  async getAllReservations() {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Completar reserva (convertir a venta)
  async completeReservation(id) {
    const { data, error } = await supabase
      .from('reservations')
      .update({ status: 'completed' })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  },

  // Cancelar reserva
  async cancelReservation(id) {
    const { data, error } = await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  },

  // Limpiar reservas expiradas (cron job)
  async cleanExpiredReservations() {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('reservations')
      .update({ status: 'expired' })
      .eq('status', 'pending')
      .lt('expires_at', now);

    if (error) throw error;
  },

  // Obtener reserva por ID
  async getReservationById(id) {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
};

export default reservationsService;
