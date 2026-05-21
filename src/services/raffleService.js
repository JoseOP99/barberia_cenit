import { supabase } from './supabaseClient';

const handleError = (error, context) => {
  console.error(`[RaffleService - ${context}]:`, error);
  throw new Error(error?.message || 'Error desconocido');
};

export const raffleService = {
  async getRaffles() {
    try {
      const { data, error } = await supabase
        .from('monthly_raffles')
        .select(`
          *,
          winner:profiles!winner_id(first_name, first_lastname, email, phone)
        `)
        .order('raffle_month', { ascending: false });

      if (error) handleError(error, 'getRaffles');
      return data || [];
    } catch (err) {
      handleError(err, 'getRaffles');
    }
  },

  async executeMonthlyRaffle(targetMonthStr) {
    try {
      // targetMonthStr formato 'YYYY-MM-01'
      const { data, error } = await supabase
        .rpc('execute_monthly_raffle', { target_month: targetMonthStr });

      if (error) handleError(error, 'executeMonthlyRaffle');
      return data; // Retorna el winner_id
    } catch (err) {
      handleError(err, 'executeMonthlyRaffle');
    }
  }
};

export default raffleService;
