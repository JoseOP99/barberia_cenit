import { supabase } from './supabaseClient';

const handleError = (error, context) => {
  console.error(`[CustomerService - ${context}]:`, error);
  throw new Error(error?.message || 'Error desconocido');
};

export const customerService = {
  async getAllCustomers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer')
        .order('created_at', { ascending: false });

      if (error) handleError(error, 'getAllCustomers');
      return data || [];
    } catch (err) {
      handleError(err, 'getAllCustomers');
    }
  },

  async updateCustomerStatus(userId, status) {
    try {
      if (!userId || !['active', 'blocked', 'suspended'].includes(status)) {
        throw new Error('Parámetros inválidos');
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', userId)
        .select();

      if (error) handleError(error, 'updateCustomerStatus');
      return data?.[0];
    } catch (err) {
      handleError(err, 'updateCustomerStatus');
    }
  },
  
  async resetStrikes(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ no_show_count: 0, status: 'active' })
        .eq('id', userId)
        .select();

      if (error) handleError(error, 'resetStrikes');
      return data?.[0];
    } catch (err) {
      handleError(err, 'resetStrikes');
    }
  }
};

export default customerService;
