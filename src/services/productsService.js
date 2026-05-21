import { supabase } from './supabaseClient';

export const productsService = {
  // Obtener todos los productos
  async getAllProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Obtener producto por ID
  async getProductById(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  // Crear producto (admin)
  async createProduct(product) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select();
    if (error) throw error;
    return data[0];
  },

  // Actualizar producto (admin)
  async updateProduct(id, updates) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  // Eliminar producto (admin)
  async deleteProduct(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Obtener stock disponible (restando reservas activas)
  async getAvailableStock(productId) {
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('stock')
      .eq('id', productId)
      .single();

    if (productError) throw productError;

    const { data: reservations, error: reservError } = await supabase
      .from('reservations')
      .select('quantity', { count: 'exact' })
      .eq('product_id', productId)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString());

    if (reservError) throw reservError;

    const reservedQty = reservations.reduce((sum, r) => sum + (r.quantity || 1), 0);
    return product.stock - reservedQty;
  }
};

export default productsService;
