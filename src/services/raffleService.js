import { supabase } from './supabaseClient';

const handleError = (error, context) => {
  const errorMessage = error?.message || 'Error desconocido';
  console.error(`[RaffleService - ${context}]:`, errorMessage);
  throw new Error(`${context}: ${errorMessage}`);
};

export const raffleService = {
  // Obtener todos los sorteos (admin)
  async getAllRaffles() {
    try {
      const { data, error } = await supabase
        .from('raffles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) handleError(error, 'getAllRaffles');

      // Fetch winner profiles manually
      if (data && data.length > 0) {
        const winnerIds = [...new Set(data.filter(r => r.winner_user_id).map(r => r.winner_user_id))];
        if (winnerIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, first_name, first_lastname')
            .in('id', winnerIds);
          if (profiles) {
            data.forEach(r => {
              if (r.winner_user_id) {
                const p = profiles.find(pr => pr.id === r.winner_user_id);
                if (p) r.winner = { first_name: p.first_name, first_lastname: p.first_lastname };
              }
            });
          }
        }
      }

      return data || [];
    } catch (err) {
      handleError(err, 'getAllRaffles');
    }
  },

  // Obtener sorteos activos (para clientes)
  async getActiveRaffles() {
    try {
      const { data, error } = await supabase
        .from('raffles')
        .select('*')
        .eq('status', 'active')
        .order('draw_date', { ascending: true });

      if (error) handleError(error, 'getActiveRaffles');
      return data || [];
    } catch (err) {
      handleError(err, 'getActiveRaffles');
    }
  },

  // Crear sorteo
  async createRaffle(raffle) {
    try {
      const { data, error } = await supabase
        .from('raffles')
        .insert([{
          title: raffle.title,
          prize: raffle.prize,
          start_date: raffle.start_date,
          end_date: raffle.end_date,
          draw_date: raffle.draw_date,
          min_appointments: parseInt(raffle.min_appointments, 10) || 0,
          status: 'active',
          created_at: new Date().toISOString()
        }])
        .select();
      if (error) handleError(error, 'createRaffle');
      return data?.[0];
    } catch (err) {
      handleError(err, 'createRaffle');
    }
  },

  // Actualizar sorteo
  async updateRaffle(id, updates) {
    try {
      const { data, error } = await supabase
        .from('raffles')
        .update(updates)
        .eq('id', id)
        .select();
      if (error) handleError(error, 'updateRaffle');
      return data?.[0];
    } catch (err) {
      handleError(err, 'updateRaffle');
    }
  },

  // Eliminar sorteo
  async deleteRaffle(id) {
    try {
      // Clean up any old tickets if they exist
      await supabase.from('raffle_tickets').delete().eq('raffle_id', id);
      const { error } = await supabase.from('raffles').delete().eq('id', id);
      if (error) handleError(error, 'deleteRaffle');
      return true;
    } catch (err) {
      handleError(err, 'deleteRaffle');
    }
  },

  // Obtener participantes elegibles para un sorteo (sin crear tickets)
  async getEligibleParticipants(raffleId) {
    try {
      // 1. Obtener detalles del sorteo
      const { data: raffle, error: err1 } = await supabase
        .from('raffles')
        .select('*')
        .eq('id', raffleId)
        .single();
      if (err1) throw err1;

      // 2. Determinar usuarios elegibles
      let eligibleUserIds = [];

      if (raffle.min_appointments === 0) {
        // Participan TODOS los usuarios registrados excepto el admin y barberos
        const { data: profiles, error: errProfiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'customer');
        if (errProfiles) throw errProfiles;
        eligibleUserIds = (profiles || []).map(p => p.id);
      } else {
        // Obtener citas completadas en el rango de fechas
        const { data: appointments, error: err2 } = await supabase
          .from('appointments')
          .select('user_id')
          .eq('status', 'completed')
          .gte('appointment_date', raffle.start_date)
          .lte('appointment_date', raffle.end_date)
          .not('user_id', 'is', null);
        if (err2) throw err2;

        // Contar citas por usuario
        const userCounts = {};
        (appointments || []).forEach(app => {
          if (!userCounts[app.user_id]) userCounts[app.user_id] = 0;
          userCounts[app.user_id]++;
        });

        // Filtrar los que cumplen el mínimo
        eligibleUserIds = Object.keys(userCounts).filter(uid => userCounts[uid] >= raffle.min_appointments);
      }

      if (eligibleUserIds.length === 0) {
        return { participants: [], count: 0, message: 'Ningún cliente cumple los requisitos.' };
      }

      // 3. Obtener perfiles completos (asegurando que sean solo clientes)
      const { data: profiles, error: errP } = await supabase
        .from('profiles')
        .select('id, first_name, first_lastname, phone, email')
        .in('id', eligibleUserIds)
        .eq('role', 'customer');
      if (errP) throw errP;

      const participants = (profiles || []).map(p => ({
        user_id: p.id,
        name: `${p.first_name || ''} ${p.first_lastname || ''}`.trim() || 'Sin nombre',
        phone: p.phone || '',
        email: p.email || ''
      }));

      return {
        participants,
        count: participants.length,
        message: `${participants.length} cliente${participants.length !== 1 ? 's' : ''} elegible${participants.length !== 1 ? 's' : ''}.`
      };
    } catch (err) {
      handleError(err, 'getEligibleParticipants');
    }
  },

  // Realizar el sorteo — selecciona un ganador al azar de los participantes
  async drawWinner(raffleId, participants) {
    try {
      if (!participants || participants.length === 0) {
        throw new Error('No hay participantes para este sorteo.');
      }

      // Seleccionar ganador al azar
      const randomIndex = Math.floor(Math.random() * participants.length);
      const winner = participants[randomIndex];

      // Actualizar el sorteo con el ganador
      const { data: updated, error: err } = await supabase
        .from('raffles')
        .update({
          status: 'completed',
          winner_user_id: winner.user_id,
          winner_ticket_number: winner.name // Reuse field to store winner name
        })
        .eq('id', raffleId)
        .select()
        .single();

      if (err) throw err;

      updated.winner = { first_name: winner.name.split(' ')[0], first_lastname: winner.name.split(' ').slice(1).join(' ') };
      updated.winner_name = winner.name;

      return updated;
    } catch (err) {
      handleError(err, 'drawWinner');
    }
  },

  // Check if a user is eligible for a raffle
  async isUserEligible(userId, raffleId) {
    try {
      const { data: raffle, error: err1 } = await supabase
        .from('raffles')
        .select('*')
        .eq('id', raffleId)
        .single();
      if (err1) throw err1;

      if (raffle.min_appointments === 0) return { eligible: true, appointmentsDone: 0, missing: 0 };

      const { data: appointments, error: err2 } = await supabase
        .from('appointments')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('appointment_date', raffle.start_date)
        .lte('appointment_date', raffle.end_date);
      if (err2) throw err2;

      const count = (appointments || []).length;
      return {
        eligible: count >= raffle.min_appointments,
        appointmentsDone: count,
        missing: Math.max(0, raffle.min_appointments - count)
      };
    } catch (err) {
      handleError(err, 'isUserEligible');
    }
  }
};

export default raffleService;
