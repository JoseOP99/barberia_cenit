import { supabase } from './supabaseClient';
import { notificationService } from './notificationService';

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

      // 1. Obtener citas agendadas con hora de inicio y fin
      let query = supabase
        .from('appointments')
        .select('appointment_time, end_time, service_id')
        .eq('appointment_date', date)
        .in('status', ['pending', 'confirmed']);

      if (barberId) {
        query = query.eq('barber_id', barberId);
      }

      const { data, error } = await query;
      if (error) handleError(error, 'getAvailableSlots');

      // 2. Obtener bloqueos de vacaciones/permisos aplicables a esta fecha
      // Asumimos un solo barbero general, o usamos el barberId si lo pasan
      let blocksQuery = supabase
        .from('schedule_blocks')
        .select('*')
        .lte('start_date', date)
        .gte('end_date', date);

      if (barberId) {
        blocksQuery = blocksQuery.eq('barber_id', barberId);
      }

      const { data: blocksData, error: blocksErr } = await blocksQuery;
      if (blocksErr) handleError(blocksErr, 'getAvailableSlots (blocks)');

      // Diferenciar entre bloqueos de día completo y bloqueos parciales (ej. almuerzo)
      const fullDayBlocks = (blocksData || []).filter(b => !b.start_time || !b.end_time);
      const partialBlocks = (blocksData || []).filter(b => b.start_time && b.end_time);

      const isBlocked = fullDayBlocks.length > 0;

      // Devolver los objetos completos para poder calcular solapamientos
      const bookedTimes = data || [];
      return { booked: bookedTimes, date, isBlocked, partialBlocks };
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
      
      const newAppt = data?.[0];

      if (newAppt) {
        // Enviar correos si hay user_id (para sacar el email) o si tenemos un email
        if (newAppt.user_id) {
          const { data: profile } = await supabase.from('profiles').select('email, name').eq('id', newAppt.user_id).single();
          // 2. Enviar notificaciones por correo (En segundo plano)
          if (profile?.email) {
            // Correo al cliente
            notificationService.sendEmail({
              to: profile.email,
              type: 'APPOINTMENT_CONFIRMED_CLIENT',
              payload: {
                clientName: profile.name,
                serviceName: newAppt.services?.name,
                formattedDate: newAppt.appointment_date,
                formattedTime: newAppt.appointment_time
              }
            });

            // Correo a Nando
            notificationService.sendEmail({
              to: 'barbercenit@gmail.com, nandom0201@gmail.com', // Correo del admin
              type: 'APPOINTMENT_NEW_ADMIN',
              payload: {
                clientName: newAppt.client_name,
                serviceName: newAppt.services?.name,
                formattedDate: newAppt.appointment_date,
                formattedTime: newAppt.appointment_time
              }
            });
          }
        }
      }

      return newAppt;
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

  // Eliminar cita físicamente (Hard delete)
  async deleteAppointment(id) {
    try {
      if (!id) throw new Error('ID de cita es requerido');
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) handleError(error, 'deleteAppointment');
      return true;
    } catch (err) {
      handleError(err, 'deleteAppointment');
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
