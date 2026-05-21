import { supabase } from './supabaseClient';

const handleError = (error, context) => {
  const errorMessage = error?.message || 'Error desconocido';
  console.error(`[ScheduleService - ${context}]:`, errorMessage);
  throw new Error(`${context}: ${errorMessage}`);
};

export const scheduleService = {
  // === HORARIO SEMANAL REGULAR ===

  async getBarberSchedules(barberId) {
    try {
      if (!barberId) throw new Error('Barber ID es requerido');
      const { data, error } = await supabase
        .from('barber_schedules')
        .select('*')
        .eq('barber_id', barberId)
        .order('day_of_week', { ascending: true });

      if (error) handleError(error, 'getBarberSchedules');
      return data || [];
    } catch (err) {
      handleError(err, 'getBarberSchedules');
    }
  },

  async updateBarberSchedule(scheduleId, updates) {
    try {
      if (!scheduleId) throw new Error('Schedule ID es requerido');
      const { data, error } = await supabase
        .from('barber_schedules')
        .update(updates)
        .eq('id', scheduleId)
        .select();
      
      if (error) handleError(error, 'updateBarberSchedule');
      return data?.[0];
    } catch (err) {
      handleError(err, 'updateBarberSchedule');
    }
  },

  // === BLOQUEOS / VACACIONES ===

  async getScheduleBlocks(barberId) {
    try {
      if (!barberId) throw new Error('Barber ID es requerido');
      const { data, error } = await supabase
        .from('schedule_blocks')
        .select('*')
        .eq('barber_id', barberId)
        .order('start_date', { ascending: false });

      if (error) handleError(error, 'getScheduleBlocks');
      return data || [];
    } catch (err) {
      handleError(err, 'getScheduleBlocks');
    }
  },

  async createScheduleBlock(blockData) {
    try {
      if (!blockData.barber_id || !blockData.start_date || !blockData.end_date) {
        throw new Error('Datos incompletos para crear el bloqueo');
      }
      const { data, error } = await supabase
        .from('schedule_blocks')
        .insert([{
          ...blockData,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) handleError(error, 'createScheduleBlock');
      return data?.[0];
    } catch (err) {
      handleError(err, 'createScheduleBlock');
    }
  },

  async deleteScheduleBlock(blockId) {
    try {
      if (!blockId) throw new Error('Block ID es requerido');
      const { error } = await supabase
        .from('schedule_blocks')
        .delete()
        .eq('id', blockId);

      if (error) handleError(error, 'deleteScheduleBlock');
      return true;
    } catch (err) {
      handleError(err, 'deleteScheduleBlock');
    }
  }
};

export default scheduleService;
