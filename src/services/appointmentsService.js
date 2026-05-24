import { supabase } from './supabaseClient';
import notificationService from './notificationService';
import { getEmailTemplate } from '../utils/emailTemplate';

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

      // 1. Obtener citas agendadas
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

      // Si hay al menos un bloqueo que cubre esta fecha, devolvemos isBlocked: true
      const isBlocked = blocksData && blocksData.length > 0;

      const bookedTimes = (data || []).map(a => a.appointment_time);
      return { booked: bookedTimes, date, isBlocked };
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
          const { data: profile } = await supabase.from('profiles').select('email').eq('id', newAppt.user_id).single();
          if (profile?.email) {
            notificationService.sendEmail({
              to: profile.email,
              subject: 'Reserva Confirmada: ' + newAppt.services?.name,
              html: getEmailTemplate(
                '¡Cita Confirmada!',
                `<p style="margin-bottom: 15px;">Hola <b>${newAppt.client_name}</b>, hemos agendado tu cita exitosamente.</p>
                 <div style="background-color: #1A1816; border: 1px solid #2A2530; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left;">
                   <p style="color: #9A9489; margin: 5px 0;"><b>Servicio:</b> ${newAppt.services?.name || 'Servicio de Barbería'}</p>
                   <p style="color: #9A9489; margin: 5px 0;"><b>Barbero:</b> ${newAppt.barbers?.name || 'Barbero asignado'}</p>
                   <p style="color: #9A9489; margin: 5px 0;"><b>Fecha:</b> ${newAppt.appointment_date}</p>
                   <p style="color: #9A9489; margin: 5px 0;"><b>Hora:</b> ${newAppt.appointment_time}</p>
                 </div>
                 <p style="color: #C56B5A; font-weight: bold; margin-top: 15px;">⚠️ Recuerda llegar 5 minutos antes de tu cita.</p>`,
                'https://cenit-barber.vercel.app/perfil',
                'Ver Mis Citas'
              )
            });
          }
        }

        // Correo a Nando
        notificationService.sendEmail({
          to: 'barbercenit@gmail.com, nandom0201@gmail.com', // Correo del admin
          subject: 'Nueva cita agendada: ' + newAppt.client_name,
          html: getEmailTemplate(
            'Nueva Cita Agendada',
            `<p>Tienes una nueva reserva en el sistema:</p>
             <ul style="list-style: none; padding: 0; margin: 15px 0;">
               <li style="margin-bottom: 8px;"><b>Cliente:</b> ${newAppt.client_name} (${newAppt.client_phone})</li>
               <li style="margin-bottom: 8px;"><b>Servicio:</b> ${newAppt.services?.name || 'Servicio de Barbería'}</li>
               <li style="margin-bottom: 8px;"><b>Barbero:</b> ${newAppt.barbers?.name || 'No especificado'}</li>
               <li style="margin-bottom: 8px;"><b>Fecha:</b> ${newAppt.appointment_date} a las ${newAppt.appointment_time}</li>
             </ul>`,
            'https://cenit-barber.vercel.app/admin/calendar',
            'Ver Calendario'
          )
        });
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
