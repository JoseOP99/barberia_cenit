import { supabase } from './supabaseClient';

const handleError = (error, context) => {
  const errorMessage = error?.message || 'Error desconocido';
  console.error(`[StoreService - ${context}]:`, errorMessage);
  throw new Error(`${context}: ${errorMessage}`);
};

export const storeService = {
  // Crear una reserva de producto
  async reserveProduct(productId, userId) {
    try {
      // 1. Obtener perfil del cliente
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('first_name, first_lastname, phone, email')
        .eq('id', userId)
        .single();
        
      if (profileErr) throw new Error("No se pudo obtener el perfil del cliente.");

      // 2. Verificar el stock disponible actual consultando directamente la tabla products
      const { data: productData, error: stockErr } = await supabase
        .from('products')
        .select('stock')
        .eq('id', productId)
        .single();
      
      if (stockErr) throw stockErr;
      
      if (!productData || productData.stock <= 0) {
        throw new Error('El producto ya no se encuentra disponible (Sin stock o reservado por alguien más).');
      }

      // 3. Crear la reserva temporal
      const fullName = `${profileData.first_name || ''} ${profileData.first_lastname || ''}`.trim();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('reservations')
        .insert([{
          product_id: productId,
          user_id: userId,
          status: 'pending',
          client_name: fullName || 'Cliente Tienda',
          client_phone: profileData.phone || '',
          client_email: profileData.email || 'correo@pendiente.com',
          expires_at: expiresAt
        }])
        .select(`
          *,
          products (name, price)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      handleError(err, 'reserveProduct');
    }
  },

  // Obtener todas las reservas de un usuario
  async getUserReservations(userId) {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          products (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      handleError(err, 'getUserReservations');
    }
  },

  // Obtener reservas activas para el Admin
  async getActiveReservations() {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          users:user_id(first_name, first_lastname, phone, email),
          products (*)
        `)
        .eq('status', 'active')
        .order('expires_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      handleError(err, 'getActiveReservations');
    }
  },

  // Actualizar estado de la reserva (Admin)
  async updateReservationStatus(reservationId, status) {
    try {
      // Validar transición
      if (!['sold', 'cancelled'].includes(status)) {
        throw new Error("Estado no válido.");
      }

      const { data: reservation, error: fetchErr } = await supabase
        .from('reservations')
        .select('*')
        .eq('id', reservationId)
        .single();
        
      if (fetchErr) throw fetchErr;
      if (reservation.status !== 'active') {
        throw new Error("Esta reserva ya no está activa.");
      }

      if (status === 'sold') {
        const { data: success, error: rpcErr } = await supabase
          .rpc('decrement_stock_atomic', { p_id: reservation.product_id });
        if (rpcErr) throw rpcErr;
        if (!success) {
          throw new Error("No hay stock suficiente para completar esta venta.");
        }
      }

      const { data, error } = await supabase
        .from('reservations')
        .update({ status })
        .eq('id', reservationId)
        .select();

      if (error) throw error;
      return data;
    } catch (err) {
      handleError(err, 'updateReservationStatus');
    }
  }
};

export default storeService;
