import { supabase } from './supabaseClient';

const handleError = (error, context) => {
  const errorMessage = error?.message || 'Error desconocido';
  console.error(`[ProductsService - ${context}]:`, errorMessage);
  throw new Error(`${context}: ${errorMessage}`);
};

export const productsService = {
  // Subir imagenes al bucket de storage 'cenit-images' (con compresión fuerte)
  async uploadImages(files) {
    const urls = [];
    
    const compressImage = (file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target.result;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_SIZE = 800; // max dimension para extrema optimización
            let width = img.width;
            let height = img.height;

            if (width > height && width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            } else if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Comprimir a formato WebP (el más ligero) al 70% de calidad
            canvas.toBlob((blob) => {
              resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                type: 'image/webp',
                lastModified: Date.now()
              }));
            }, 'image/webp', 0.7);
          };
        };
      });
    };

    for (const originalFile of files) {
      // Intentar comprimir si es imagen (png, jpg, jpeg, webp)
      const fileToUpload = originalFile.type.startsWith('image/') ? await compressImage(originalFile) : originalFile;

      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.webp`;
      const filePath = `products/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('cenit-images')
        .upload(filePath, fileToUpload);
        
      if (uploadError) handleError(uploadError, 'uploadImage');
      
      const { data } = supabase.storage.from('cenit-images').getPublicUrl(filePath);
      urls.push(data.publicUrl);
    }
    return urls;
  },

  // Obtener todos los productos visibles
  async getAllProducts(filters = {}) {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          product_images(image_url)
        `)
        .eq('visible', true)
        .order('created_at', { ascending: false });

      if (filters.collection) {
        query = query.eq('collection', filters.collection);
      }

      const { data: products, error } = await query;
      if (error) handleError(error, 'getAllProducts');
      
      // Calculate real available stock subtracting active reservations
      const { data: activeReservations } = await supabase
        .from('reservations')
        .select('product_id')
        .in('status', ['active', 'pending']);
      
      const reservedCounts = {};
      (activeReservations || []).forEach(r => {
        reservedCounts[r.product_id] = (reservedCounts[r.product_id] || 0) + 1;
      });

      return (products || []).map(p => ({
        ...p,
        stock: Math.max(0, p.stock - (reservedCounts[p.id] || 0))
      }));
    } catch (err) {
      handleError(err, 'getAllProducts');
    }
  },

  // Obtener todos los productos (incluyendo ocultos) - admin
  async getAllProductsAdmin() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(image_url)
        `)
        .order('created_at', { ascending: false });

      if (error) handleError(error, 'getAllProductsAdmin');
      return data || [];
    } catch (err) {
      handleError(err, 'getAllProductsAdmin');
    }
  },

  // Obtener producto por ID
  async getProductById(id) {
    try {
      if (!id) throw new Error('Product ID es requerido');

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(image_url)
        `)
        .eq('id', id)
        .single();

      if (error) handleError(error, 'getProductById');
      return data;
    } catch (err) {
      handleError(err, 'getProductById');
    }
  },

  // Crear producto (admin)
  async createProduct(product) {
    try {
      if (!product.name || !product.price || product.stock === undefined) {
        throw new Error('Campos requeridos faltantes (name, price, stock)');
      }

      const { image_urls, ...productData } = product;

      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...productData,
          visible: productData.visible !== false,
          sku: productData.sku || `SKU-${Date.now()}`,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) handleError(error, 'createProduct');
      const newProduct = data?.[0];

      if (newProduct && image_urls && image_urls.length > 0) {
        const imageInserts = image_urls.map((url, idx) => ({
          product_id: newProduct.id,
          image_url: url.trim(),
          display_order: idx
        }));
        await supabase.from('product_images').insert(imageInserts);
      }

      return newProduct;
    } catch (err) {
      handleError(err, 'createProduct');
    }
  },

  // Actualizar producto (admin)
  async updateProduct(id, updates) {
    try {
      if (!id) throw new Error('Product ID es requerido');

      const { image_urls, ...productData } = updates;

      const { data, error } = await supabase
        .from('products')
        .update({
          ...productData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) handleError(error, 'updateProduct');

      if (image_urls !== undefined) {
        await supabase.from('product_images').delete().eq('product_id', id);
        if (image_urls.length > 0) {
          const imageInserts = image_urls.map((url, idx) => ({
            product_id: id,
            image_url: url.trim(),
            display_order: idx
          }));
          await supabase.from('product_images').insert(imageInserts);
        }
      }

      return data?.[0];
    } catch (err) {
      handleError(err, 'updateProduct');
    }
  },

  // Eliminar producto permanentemente (admin)
  async deleteProduct(id) {
    try {
      if (!id) throw new Error('Product ID es requerido');

      const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .select();

      if (error) handleError(error, 'deleteProduct');
      return data?.[0];
    } catch (err) {
      handleError(err, 'deleteProduct');
    }
  },

  // Actualizar stock de un producto
  async updateStock(id, quantity) {
    try {
      if (!id) throw new Error('Product ID es requerido');
      if (typeof quantity !== 'number') throw new Error('Quantity debe ser un número');

      const { data, error } = await supabase
        .from('products')
        .update({
          stock: quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) handleError(error, 'updateStock');
      return data?.[0];
    } catch (err) {
      handleError(err, 'updateStock');
    }
  },

  // Obtener disponibilidad completa (stock total vs disponible)
  async getProductAvailability(productId) {
    try {
      if (!productId) throw new Error('Product ID es requerido');

      const now = new Date().toISOString();

      const { data: product, error: productError } = await supabase
        .from('products')
        .select('stock, name, price')
        .eq('id', productId)
        .single();

      if (productError) handleError(productError, 'getProductAvailability');

      const { data: reservations, error: reservError } = await supabase
        .from('reservations')
        .select('quantity')
        .eq('product_id', productId)
        .eq('status', 'pending')
        .gt('expires_at', now);

      if (reservError) handleError(reservError, 'getProductAvailability');

      const reserved = (reservations || []).reduce((sum, r) => sum + (r.quantity || 1), 0);
      const available = Math.max(0, (product?.stock || 0) - reserved);

      return {
        productId,
        name: product?.name,
        price: product?.price,
        total: product?.stock || 0,
        reserved,
        available,
        isAvailable: available > 0
      };
    } catch (err) {
      handleError(err, 'getProductAvailability');
    }
  },

  // Obtener colecciones únicas
  async getCollections() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('collection')
        .eq('visible', true)
        .not('collection', 'is', null);

      if (error) handleError(error, 'getCollections');

      const collections = [...new Set((data || []).map(p => p.collection))].filter(Boolean);
      return collections;
    } catch (err) {
      handleError(err, 'getCollections');
    }
  }
};

export default productsService;
