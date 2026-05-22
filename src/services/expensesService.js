import { supabase } from './supabaseClient';

const handleError = (error, context) => {
  const errorMessage = error?.message || 'Error desconocido';
  console.error(`[ExpensesService - ${context}]:`, errorMessage);
  throw new Error(`${context}: ${errorMessage}`);
};

export const EXPENSE_CATEGORIES = [
  'Productos',
  'Herramientas',
  'Local',
  'Servicios',
  'Insumos',
  'Otro'
];

export const expensesService = {
  // Obtener gastos por rango de fechas
  async getByDateRange(startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('expenses')
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

  // Crear gasto
  async create(expense) {
    try {
      if (!expense.description || !expense.amount) {
        throw new Error('Descripción y monto son requeridos');
      }

      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          date: expense.date || new Date().toISOString().split('T')[0],
          category: expense.category || 'Otro',
          description: expense.description,
          amount: parseFloat(expense.amount),
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) handleError(error, 'create');
      return data?.[0];
    } catch (err) {
      handleError(err, 'create');
    }
  },

  // Eliminar gasto
  async delete(id) {
    try {
      if (!id) throw new Error('ID es requerido');
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) handleError(error, 'delete');
      return true;
    } catch (err) {
      handleError(err, 'delete');
    }
  },

  // Resumen por mes
  async getMonthlySummary(year, month) {
    try {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${endDay}`;

      const data = await this.getByDateRange(startDate, endDate);
      
      const totalAmount = (data || []).reduce((s, d) => s + (d.amount || 0), 0);
      
      // Agrupar por categoría
      const byCategory = {};
      (data || []).forEach(d => {
        const cat = d.category || 'Otro';
        if (!byCategory[cat]) byCategory[cat] = { category: cat, total: 0, count: 0 };
        byCategory[cat].total += (d.amount || 0);
        byCategory[cat].count++;
      });

      return {
        records: data || [],
        totalAmount,
        byCategory: Object.values(byCategory).sort((a, b) => b.total - a.total)
      };
    } catch (err) {
      handleError(err, 'getMonthlySummary');
    }
  }
};

export default expensesService;
