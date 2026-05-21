import { supabase } from './supabaseClient';

const handleError = (error, context) => {
  const errorMessage = error?.message || 'Error desconocido';
  console.error(`[ServicesService - ${context}]:`, errorMessage);
  throw new Error(`${context}: ${errorMessage}`);
};

export const servicesService = {
  // Obtener todos los servicios disponibles
  async getAllServices() {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('available', true)
        .order('display_order', { ascending: true });

      if (error) handleError(error, 'getAllServices');
      return data || [];
    } catch (err) {
      handleError(err, 'getAllServices');
    }
  },

  // Obtener todos los servicios (incluyendo deshabilitados) - admin
  async getAllServicesAdmin() {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) handleError(error, 'getAllServicesAdmin');
      return data || [];
    } catch (err) {
      handleError(err, 'getAllServicesAdmin');
    }
  },

  // Obtener servicio por ID
  async getServiceById(id) {
    try {
      if (!id) throw new Error('Service ID es requerido');

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

      if (error) handleError(error, 'getServiceById');
      return data;
    } catch (err) {
      handleError(err, 'getServiceById');
    }
  },

  // Obtener servicios por categoría
  async getServicesByCategory(category) {
    try {
      if (!category) throw new Error('Category es requerida');

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('category', category)
        .eq('available', true)
        .order('display_order', { ascending: true });

      if (error) handleError(error, 'getServicesByCategory');
      return data || [];
    } catch (err) {
      handleError(err, 'getServicesByCategory');
    }
  },

  // Crear servicio (admin)
  async createService(serviceData) {
    try {
      if (!serviceData.name || !serviceData.price || serviceData.duration_minutes === undefined) {
        throw new Error('Campos requeridos faltantes (name, price, duration_minutes)');
      }

      const { data, error } = await supabase
        .from('services')
        .insert([{
          name: serviceData.name,
          subtitle: serviceData.subtitle || '',
          description: serviceData.description || '',
          price: serviceData.price,
          duration_minutes: serviceData.duration_minutes,
          category: serviceData.category || 'general',
          available: serviceData.available !== false,
          display_order: serviceData.display_order || 999,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) handleError(error, 'createService');
      return data?.[0];
    } catch (err) {
      handleError(err, 'createService');
    }
  },

  // Actualizar servicio (admin)
  async updateService(id, updates) {
    try {
      if (!id) throw new Error('Service ID es requerido');

      const { data, error } = await supabase
        .from('services')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) handleError(error, 'updateService');
      return data?.[0];
    } catch (err) {
      handleError(err, 'updateService');
    }
  },

  // Cambiar disponibilidad de servicio
  async updateServiceAvailability(id, available) {
    try {
      if (!id) throw new Error('Service ID es requerido');

      return await this.updateService(id, { available });
    } catch (err) {
      handleError(err, 'updateServiceAvailability');
    }
  },

  // Obtener todas las categorías
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('category')
        .eq('available', true)
        .not('category', 'is', null);

      if (error) handleError(error, 'getCategories');

      const categories = [...new Set((data || []).map(s => s.category))].filter(Boolean);
      return categories;
    } catch (err) {
      handleError(err, 'getCategories');
    }
  }
};

export default servicesService;
