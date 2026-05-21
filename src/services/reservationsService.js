import { supabase } from './supabaseClient';

const handleError = (error, context) => {
  const errorMessage = error?.message || 'Error desconocido';
  console.error(`[ReservationsService - ${context}]:`, errorMessage);
  throw new Error(`${context}: ${errorMessage}`);
};

export const reservationsService = {
  // Crear apartado (reserva) con validación de stock
  async createReservation(productId, clientData, expiresInHours = 6) {
    try {
      if (!productId) throw new Error('Product ID es requerido');
      if (!clientData.client_name || !clientData.client_email || !clientData.client_phone) {
        throw new Error('Datos del cliente incompletos');
      }

      const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('reservations')
        .insert([{
          product_id: productId,
          user_id: clientData.user_id || null,
          client_name: clientData.client_name,
          client_email: clientData.client_email,
          client_phone: clientData.client_phone,
          quantity: clientData.quantity || 1,
          status: 'pending',
          expires_at: expiresAt,
          created_at: new Date().toISOString()
        }])
        .select(`
          *,
          products:product_id(name, price, color_hex, accent_hex)
        `);

      if (error) handleError(error, 'createReservation');
      return data?.[0];
    } catch (err) {
      handleError(err, 'createReservation');
    }
  },

  // Obtener reservas del usuario
  async getUserReservations(userId) {
    try {
      if (!userId) throw new Error('User ID es requerido');

      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          products:product_id(name, price, color_hex, accent_hex, stock)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) handleError(error, 'getUserReservations');
      return data || [];
    } catch (err) {
      handleError(err, 'getUserReservations');
    }
  },

  // Obtener todas las reservas (admin) con filtros
  async getAllReservations(filters = {}) {
    try {
      let query = supabase
        .from('reservations')
        .select(`
          *,
          products:product_id(name, price, color_hex, accent_hex, stock)
        `)
        .order('created_at', { ascending: false });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.productId) {
        query = query.eq('product_id', filters.productId);
      }

      const { data, error } = await query;
      if (error) handleError(error, 'getAllReservations');
      return data || [];
    } catch (err) {
      handleError(err, 'getAllReservations');
    }
  },

  // Completar reserva (convertir a venta)
  async completeReservation(id) {
    try {
      if (!id) throw new Error('Reservation ID es requerido');

      const { data, error } = await supabase
        .from('reservations')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          products:product_id(name, price, color_hex, accent_hex)
        `);

      if (error) handleError(error, 'completeReservation');
      return data?.[0];
    } catch (err) {
      handleError(err, 'completeReservation');
    }
  },

  // Cancelar reserva
  async cancelReservation(id) {
    try {
      if (!id) throw new Error('Reservation ID es requerido');

      const { data, error } = await supabase
        .from('reservations')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          products:product_id(name, price, color_hex, accent_hex)
        `);

      if (error) handleError(error, 'cancelReservation');
      return data?.[0];
    } catch (err) {
      handleError(err, 'cancelReservation');
    }
  },

  // Limpiar reservas expiradas (cron job / manual call)
  async cleanExpiredReservations() {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('reservations')
        .update({
          status: 'expired',
          updated_at: now
        })
        .eq('status', 'pending')
        .lt('expires_at', now)
        .select();

      if (error) handleError(error, 'cleanExpiredReservations');
      console.log(`Cleaned ${data?.length || 0} expired reservations`);
      return data || [];
    } catch (err) {
      handleError(err, 'cleanExpiredReservations');
    }
  },

  // Obtener reserva por ID
  async getReservationById(id) {
    try {
      if (!id) throw new Error('Reservation ID es requerido');

      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          products:product_id(name, price, color_hex, accent_hex, stock)
        `)
        .eq('id', id)
        .single();

      if (error) handleError(error, 'getReservationById');
      return data;
    } catch (err) {
      handleError(err, 'getReservationById');
    }
  },

  // Obtener disponibilidad de producto considerando apartados activos
  async getProductAvailability(productId) {
    try {
      if (!productId) throw new Error('Product ID es requerido');

      const now = new Date().toISOString();

      const { data: product, error: productError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', productId)
        .single();

      if (productError) handleError(productError, 'getProductAvailability - fetchProduct');

      const { data: activeReservations, error: reservError } = await supabase
        .from('reservations')
        .select('quantity')
        .eq('product_id', productId)
        .eq('status', 'pending')
        .gt('expires_at', now);

      if (reservError) handleError(reservError, 'getProductAvailability - fetchReservations');

      const reserved = (activeReservations || []).reduce((sum, r) => sum + (r.quantity || 1), 0);
      const available = (product?.stock || 0) - reserved;

      return {
        total: product?.stock || 0,
        reserved,
        available: Math.max(0, available)
      };
    } catch (err) {
      handleError(err, 'getProductAvailability');
    }
  }
};

export default reservationsService;
