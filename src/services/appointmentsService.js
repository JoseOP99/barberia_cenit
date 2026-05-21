import { supabase } from './supabaseClient';

export const appointmentsService = {
  // Obtener todas las citas (admin)
  async getAllAppointments() {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Obtener citas del usuario actual
  async getUserAppointments(userId) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Obtener citas disponibles para una fecha
  async getAvailableSlots(date, barberId = null) {
    let query = supabase
      .from('appointments')
      .select('time', { count: 'exact' })
      .eq('date', date)
      .eq('status', 'confirmed');

    if (barberId) {
      query = query.eq('barber_id', barberId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Crear nueva cita
  async createAppointment(appointment) {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointment])
      .select();
    if (error) throw error;
    return data[0];
  },

  // Actualizar cita
  async updateAppointment(id, updates) {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  // Cancelar cita
  async cancelAppointment(id) {
    return this.updateAppointment(id, { status: 'cancelled' });
  },

  // Obtener cita por ID
  async getAppointmentById(id) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }
};

export default appointmentsService;
