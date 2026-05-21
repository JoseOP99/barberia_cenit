import { supabase } from './supabaseClient';

const handleError = (error, context) => {
  const errorMessage = error?.message || 'Error desconocido';
  console.error(`[AppointmentsService - ${context}]:`, errorMessage);
  throw new Error(`${context}: ${errorMessage}`);
};

export const appointmentsService = {
  // Obtener todas las citas (admin)
  async getAllAppointments(filters = {}) {
    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          barbers:barber_id(name, role),
          services:service_id(name, price, duration_minutes)
        `)
        .order('appointment_date', { ascending: false });

      if (filters.date) {
        query = query.eq('appointment_date', filters.date);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.barberId) {
        query = query.eq('barber_id', filters.barberId);
      }

      const { data, error } = await query;
      if (error) handleError(error, 'getAllAppointments');
      return data || [];
    } catch (err) {
      handleError(err, 'getAllAppointments');
    }
  },

  // Obtener citas del usuario actual
  async getUserAppointments(userId) {
    try {
      if (!userId) throw new Error('User ID es requerido');

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          barbers:barber_id(name, role),
          services:service_id(name, price, duration_minutes)
        `)
        .eq('user_id', userId)
        .order('appointment_date', { ascending: false });

      if (error) handleError(error, 'getUserAppointments');
      return data || [];
    } catch (err) {
      handleError(err, 'getUserAppointments');
    }
  },

  // Obtener citas disponibles para una fecha
  async getAvailableSlots(date, barberId = null) {
    try {
      if (!date) throw new Error('Date es requerido');

      let query = supabase
        .from('appointments')
        .select('appointment_time')
        .eq('appointment_date', date)
        .in('status', ['pending', 'confirmed']);

      if (barberId) {
        query = query.eq('barber_id', barberId);
      }

      const { data, error } = await query;
      if (error) handleError(error, 'getAvailableSlots');

      const bookedTimes = (data || []).map(a => a.appointment_time);
      return { booked: bookedTimes, date };
    } catch (err) {
      handleError(err, 'getAvailableSlots');
    }
  },

  // Crear nueva cita
  async createAppointment(appointment) {
    try {
      if (!appointment.client_name || !appointment.client_phone || !appointment.appointment_date || !appointment.appointment_time) {
        throw new Error('Campos requeridos faltantes');
      }

      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          ...appointment,
          status: appointment.status || 'pending',
          created_at: new Date().toISOString()
        }])
        .select(`
          *,
          barbers:barber_id(name, role),
          services:service_id(name, price, duration_minutes)
        `);

      if (error) handleError(error, 'createAppointment');
      return data?.[0];
    } catch (err) {
      handleError(err, 'createAppointment');
    }
  },

  // Actualizar cita
  async updateAppointment(id, updates) {
    try {
      if (!id) throw new Error('ID de cita es requerido');

      const { data, error } = await supabase
        .from('appointments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          barbers:barber_id(name, role),
          services:service_id(name, price, duration_minutes)
        `);

      if (error) handleError(error, 'updateAppointment');
      return data?.[0];
    } catch (err) {
      handleError(err, 'updateAppointment');
    }
  },

  // Cancelar cita
  async cancelAppointment(id) {
    try {
      return await this.updateAppointment(id, { status: 'cancelled' });
    } catch (err) {
      handleError(err, 'cancelAppointment');
    }
  },

  // Obtener cita por ID
  async getAppointmentById(id) {
    try {
      if (!id) throw new Error('ID de cita es requerido');

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          barbers:barber_id(name, role),
          services:service_id(name, price, duration_minutes)
        `)
        .eq('id', id)
        .single();

      if (error) handleError(error, 'getAppointmentById');
      return data;
    } catch (err) {
      handleError(err, 'getAppointmentById');
    }
  }
};

export default appointmentsService;
