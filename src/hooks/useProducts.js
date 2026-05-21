import { useState, useEffect, useCallback } from 'react';
import productsService from '../services/productsService';

export function useProducts(options = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { autoFetch = true, adminMode = false } = options;

  const fetchProducts = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = adminMode
        ? await productsService.getAllProductsAdmin()
        : await productsService.getAllProducts(filters);
      setProducts(data || []);
      return data;
    } catch (err) {
      const errorMsg = err.message || 'Error al cargar productos';
      setError(errorMsg);
      console.error('Error fetching products:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [adminMode]);

  useEffect(() => {
    let isMounted = true;
    
    if (autoFetch) {
      fetchProducts().then(data => {
        if (!isMounted) {
          // Ignorar resultado si se desmontó
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [autoFetch, fetchProducts]);

  const getProduct = useCallback(async (id) => {
    try {
      setLoading(true);
      const data = await productsService.getProductById(id);
      return data;
    } catch (err) {
      const errorMsg = err.message || 'Error al obtener producto';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (productData) => {
    try {
      setLoading(true);
      setError(null);
      const newProduct = await productsService.createProduct(productData);
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (err) {
      const errorMsg = err.message || 'Error al crear producto';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProduct = useCallback(async (id, updates) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await productsService.updateProduct(id, updates);
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
      return updated;
    } catch (err) {
      const errorMsg = err.message || 'Error al actualizar producto';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProduct = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await productsService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      const errorMsg = err.message || 'Error al eliminar producto';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStock = useCallback(async (id, quantity) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await productsService.updateStock(id, quantity);
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
      return updated;
    } catch (err) {
      const errorMsg = err.message || 'Error al actualizar stock';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProductAvailability = useCallback(async (id) => {
    try {
      return await productsService.getProductAvailability(id);
    } catch (err) {
      console.error('Error getting availability:', err);
      return null;
    }
  }, []);

  const getCollections = useCallback(async () => {
    try {
      return await productsService.getCollections();
    } catch (err) {
      console.error('Error getting collections:', err);
      return [];
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    getProductAvailability,
    getCollections,
    clearError
  };
}

export default useProducts;
