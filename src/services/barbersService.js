import { supabase } from './supabaseClient';

const handleError = (error, context) => {
  const errorMessage = error?.message || 'Error desconocido';
  console.error(`[BarbersService - ${context}]:`, errorMessage);
  throw new Error(`${context}: ${errorMessage}`);
};

export const barbersService = {
  // Obtener todos los barberos activos
  async getAllBarbers(includeInactive = false) {
    try {
      let query = supabase
        .from('barbers')
        .select('*')
        .order('name', { ascending: true });

      if (!includeInactive) {
        query = query.eq('status', 'active');
      }

      const { data, error } = await query;
      if (error) handleError(error, 'getAllBarbers');
      return data || [];
    } catch (err) {
      handleError(err, 'getAllBarbers');
    }
  },

  // Obtener barbero por ID
  async getBarberById(id) {
    try {
      if (!id) throw new Error('Barber ID es requerido');

      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) handleError(error, 'getBarberById');
      return data;
    } catch (err) {
      handleError(err, 'getBarberById');
    }
  },

  // Crear barbero (admin)
  async createBarber(barberData) {
    try {
      if (!barberData.name || !barberData.role) {
        throw new Error('Campos requeridos faltantes (name, role)');
      }

      const { data, error } = await supabase
        .from('barbers')
        .insert([{
          name: barberData.name,
          role: barberData.role,
          years_experience: barberData.years_experience || 0,
          signature_style: barberData.signature_style || '',
          phone: barberData.phone || null,
          email: barberData.email || null,
          status: barberData.status || 'active',
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) handleError(error, 'createBarber');
      return data?.[0];
    } catch (err) {
      handleError(err, 'createBarber');
    }
  },

  // Actualizar barbero (admin)
  async updateBarber(id, updates) {
    try {
      if (!id) throw new Error('Barber ID es requerido');

      const { data, error } = await supabase
        .from('barbers')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) handleError(error, 'updateBarber');
      return data?.[0];
    } catch (err) {
      handleError(err, 'updateBarber');
    }
  },

  // Cambiar estado del barbero
  async updateBarberStatus(id, status) {
    try {
      if (!id) throw new Error('Barber ID es requerido');
      if (!['active', 'inactive', 'on-leave'].includes(status)) {
        throw new Error('Estado inválido');
      }

      return await this.updateBarber(id, { status });
    } catch (err) {
      handleError(err, 'updateBarberStatus');
    }
  },

  // Obtener disponibilidad de un barbero para una fecha
  async getBarberAvailability(barberId, date) {
    try {
      if (!barberId || !date) throw new Error('Barber ID y date son requeridos');

      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('barber_id', barberId)
        .eq('appointment_date', date)
        .eq('status', 'confirmed');

      if (error) handleError(error, 'getBarberAvailability');

      const bookedTimes = (data || []).map(a => a.appointment_time);
      return { barberId, date, booked: bookedTimes };
    } catch (err) {
      handleError(err, 'getBarberAvailability');
    }
  }
};

export default barbersService;
