import { supabase } from './supabaseClient';

const handleError = (error, context) => {
  const errorMessage = error?.message || 'Error desconocido';
  console.error(`[DailySalesService - ${context}]:`, errorMessage);
  throw new Error(`${context}: ${errorMessage}`);
};

export const dailySalesService = {
  // Obtener ventas por rango de fechas
  async getByDateRange(startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('daily_sales')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) handleError(error, 'getByDateRange');
      return data || [];
    } catch (err) {
      handleError(err, 'getByDateRange');
    }
  },

  // Obtener ventas de un día específico
  async getByDate(date) {
    try {
      const { data, error } = await supabase
        .from('daily_sales')
        .select('*')
        .eq('date', date)
        .order('created_at', { ascending: false });

      if (error) handleError(error, 'getByDate');
      return data || [];
    } catch (err) {
      handleError(err, 'getByDate');
    }
  },

  // Crear registro de venta
  async create(sale) {
    try {
      if (!sale.quantity || !sale.price_per_unit) {
        throw new Error('Cantidad y precio son requeridos');
      }

      const { data, error } = await supabase
        .from('daily_sales')
        .insert([{
          date: sale.date || new Date().toISOString().split('T')[0],
          quantity: parseInt(sale.quantity, 10),
          price_per_unit: parseFloat(sale.price_per_unit),
          description: sale.description || null,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) handleError(error, 'create');
      return data?.[0];
    } catch (err) {
      handleError(err, 'create');
    }
  },

  // Eliminar registro
  async delete(id) {
    try {
      if (!id) throw new Error('ID es requerido');
      const { error } = await supabase
        .from('daily_sales')
        .delete()
        .eq('id', id);

      if (error) handleError(error, 'delete');
      return true;
    } catch (err) {
      handleError(err, 'delete');
    }
  },

  // Obtener resumen por mes (agrupado)
  async getMonthlySummary(year, month) {
    try {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${endDay}`;

      const data = await this.getByDateRange(startDate, endDate);
      
      const totalQuantity = (data || []).reduce((s, d) => s + (d.quantity || 0), 0);
      const totalRevenue = (data || []).reduce((s, d) => s + ((d.quantity || 0) * (d.price_per_unit || 0)), 0);
      
      return { records: data || [], totalQuantity, totalRevenue };
    } catch (err) {
      handleError(err, 'getMonthlySummary');
    }
  }
};

export default dailySalesService;
