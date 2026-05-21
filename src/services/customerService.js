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
  },

  async deleteCustomer(userId) {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        if (error.code === '23503') { // Foreign key violation
          throw new Error('No se puede eliminar el cliente porque tiene historial de citas o compras. Por favor, bloquea su acceso en su lugar.');
        }
        handleError(error, 'deleteCustomer');
      }
      return true;
    } catch (err) {
      handleError(err, 'deleteCustomer');
    }
  }
};

export default customerService;
