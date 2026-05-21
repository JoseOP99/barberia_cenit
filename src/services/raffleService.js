import { supabase } from './supabaseClient';

const handleError = (error, context) => {
  const errorMessage = error?.message || 'Error desconocido';
  console.error(`[RaffleService - ${context}]:`, errorMessage);
  throw new Error(`${context}: ${errorMessage}`);
};

export const raffleService = {
  // Obtener todos los sorteos
  async getAllRaffles() {
    try {
      const { data, error } = await supabase
        .from('raffles')
        .select(`
          *,
          winner:winner_user_id(first_name, first_lastname)
        `)
        .order('created_at', { ascending: false });

      if (error) handleError(error, 'getAllRaffles');
      return data || [];
    } catch (err) {
      handleError(err, 'getAllRaffles');
    }
  },

  // Obtener sorteos activos
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
          draw_date: raffle.draw_date,
          start_date: raffle.start_date,
          end_date: raffle.end_date,
          min_appointments: isNaN(parseInt(raffle.min_appointments, 10)) ? 1 : parseInt(raffle.min_appointments, 10),
          ticket_digits: parseInt(raffle.ticket_digits, 10) || 6,
          status: 'active'
        }])
        .select();

      if (error) handleError(error, 'createRaffle');
      return data?.[0];
    } catch (err) {
      handleError(err, 'createRaffle');
    }
  },

  // Editar sorteo
  async updateRaffle(id, raffle) {
    try {
      const { data, error } = await supabase
        .from('raffles')
        .update({
          title: raffle.title,
          prize: raffle.prize,
          draw_date: raffle.draw_date,
          start_date: raffle.start_date,
          end_date: raffle.end_date,
          min_appointments: isNaN(parseInt(raffle.min_appointments, 10)) ? 1 : parseInt(raffle.min_appointments, 10),
          ticket_digits: parseInt(raffle.ticket_digits, 10) || 6,
        })
        .eq('id', id)
        .select();

      if (error) handleError(error, 'updateRaffle');
      return data?.[0];
    } catch (err) {
      handleError(err, 'updateRaffle');
    }
  },

  // Cancelar sorteo
  async cancelRaffle(id) {
    try {
      const { data, error } = await supabase
        .from('raffles')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select();

      if (error) handleError(error, 'cancelRaffle');
      return data?.[0];
    } catch (err) {
      handleError(err, 'cancelRaffle');
    }
  },

  // Obtener tickets de un usuario
  async getUserTickets(userId) {
    try {
      const { data, error } = await supabase
        .from('raffle_tickets')
        .select(`
          ticket_number,
          raffles ( id, title, prize, draw_date, status, winner_ticket_number )
        `)
        .eq('user_id', userId);

      if (error) handleError(error, 'getUserTickets');
      return data || [];
    } catch (err) {
      handleError(err, 'getUserTickets');
    }
  },

  // Generar tickets para un sorteo basado en las reglas
  async generateTicketsForRaffle(raffleId) {
    try {
      // 1. Obtener detalles del sorteo
      const { data: raffle, error: err1 } = await supabase
        .from('raffles')
        .select('*')
        .eq('id', raffleId)
        .single();
      if (err1) throw err1;

      // 2. Obtener TODAS las citas completadas en el rango de fechas
      // (Aquí buscamos agrupar por usuario en el cliente, porque PostgREST no soporta GROUP BY nativo tan fácil sin RPC)
      const { data: appointments, error: err2 } = await supabase
        .from('appointments')
        .select('user_id')
        .eq('status', 'completed')
        .gte('appointment_date', raffle.start_date)
        .lte('appointment_date', raffle.end_date)
        .not('user_id', 'is', null);
      if (err2) throw err2;

      // 3. Contar citas por usuario
      const userCounts = {};
      appointments.forEach(app => {
        if (!userCounts[app.user_id]) userCounts[app.user_id] = 0;
        userCounts[app.user_id]++;
      });

      // 4. Filtrar los usuarios que cumplen el mínimo
      const eligibleUsers = Object.keys(userCounts).filter(uid => userCounts[uid] >= raffle.min_appointments);

      if (eligibleUsers.length === 0) return { success: true, count: 0, message: "Ningún cliente cumple los requisitos." };

      // 5. Verificar quiénes ya tienen ticket para NO duplicar (por el UNIQUE constraint fallaría)
      const { data: existingTickets } = await supabase
        .from('raffle_tickets')
        .select('user_id, ticket_number')
        .eq('raffle_id', raffleId);
      const existingUserIds = new Set((existingTickets || []).map(t => t.user_id));

      const newEligible = eligibleUsers.filter(uid => !existingUserIds.has(uid));
      if (newEligible.length === 0) return { success: true, count: 0, message: "Todos los clientes elegibles ya tienen su ticket." };

      // 6. Asignar números y crear registros
      const digits = parseInt(raffle.ticket_digits, 10) || 6;
      const maxVal = Math.pow(10, digits) - 1;
      
      const usedNumbers = new Set((existingTickets || []).map(t => t.ticket_number));

      const generateTicketNumber = () => {
        let num;
        let attempts = 0;
        do {
          num = Math.floor(Math.random() * (maxVal + 1)).toString().padStart(digits, '0');
          attempts++;
        } while (usedNumbers.has(num) && attempts < maxVal);
        usedNumbers.add(num);
        return num;
      };
      
      const ticketsToInsert = newEligible.map(uid => ({
        raffle_id: raffleId,
        user_id: uid,
        ticket_number: generateTicketNumber()
      }));

      const { error: err3 } = await supabase
        .from('raffle_tickets')
        .insert(ticketsToInsert);
      if (err3) throw err3;

      return { success: true, count: ticketsToInsert.length, message: `Se generaron ${ticketsToInsert.length} tickets nuevos.` };

    } catch (err) {
      handleError(err, 'generateTicketsForRaffle');
    }
  },

  // Realizar el sorteo
  async drawWinner(raffleId) {
    try {
      // 1. Obtener todos los tickets de este sorteo
      const { data: tickets, error: err1 } = await supabase
        .from('raffle_tickets')
        .select('*')
        .eq('raffle_id', raffleId);
      
      if (err1) throw err1;
      if (!tickets || tickets.length === 0) {
        throw new Error('No hay tickets generados para este sorteo.');
      }

      // 2. Seleccionar un ganador al azar
      const randomIndex = Math.floor(Math.random() * tickets.length);
      const winningTicket = tickets[randomIndex];

      // 3. Actualizar el sorteo
      const { data: updated, error: err2 } = await supabase
        .from('raffles')
        .update({
          status: 'completed',
          winner_user_id: winningTicket.user_id,
          winner_ticket_number: winningTicket.ticket_number
        })
        .eq('id', raffleId)
        .select()
        .single();
      
      if (err2) throw err2;

      // 4. Buscar el ganador manualmente para evitar errores de foreign key (si la relación falla en Supabase)
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, first_lastname')
        .eq('id', winningTicket.user_id)
        .single();
      
      if (profile) {
        updated.winner = profile;
      }

      return updated;
    } catch (err) {
      handleError(err, 'drawWinner');
    }
  }
};

export default raffleService;
