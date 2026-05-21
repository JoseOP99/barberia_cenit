import { useState, useEffect, useCallback } from 'react';
import productsService from '../services/productsService';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productsService.getAllProducts();
      setProducts(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const getProduct = useCallback(async (id) => {
    try {
      const data = await productsService.getProductById(id);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const updateProduct = useCallback(async (id, updates) => {
    try {
      const updated = await productsService.updateProduct(id, updates);
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    getProduct,
    updateProduct
  };
}

export default useProducts;
