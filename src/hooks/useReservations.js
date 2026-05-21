import { useState, useEffect, useCallback } from 'react';
import reservationsService from '../services/reservationsService';

export function useReservations(userId = null, options = {}) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { autoFetch = true } = options;

  const fetchReservations = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = userId
        ? await reservationsService.getUserReservations(userId)
        : await reservationsService.getAllReservations(filters);
      setReservations(data || []);
      return data;
    } catch (err) {
      const errorMsg = err.message || 'Error al cargar apartados';
      setError(errorMsg);
      console.error('Error fetching reservations:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (autoFetch) {
      fetchReservations();
    }
  }, [autoFetch, fetchReservations]);

  const createReservation = useCallback(async (productId, clientData, expiresInHours = 6) => {
    try {
      setLoading(true);
      setError(null);
      const newReservation = await reservationsService.createReservation(
        productId,
        clientData,
        expiresInHours
      );
      setReservations(prev => [newReservation, ...prev]);
      return newReservation;
    } catch (err) {
      const errorMsg = err.message || 'Error al crear apartado';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const completeReservation = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await reservationsService.completeReservation(id);
      setReservations(prev => prev.map(r => r.id === id ? updated : r));
      return updated;
    } catch (err) {
      const errorMsg = err.message || 'Error al completar apartado';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelReservation = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await reservationsService.cancelReservation(id);
      setReservations(prev => prev.map(r => r.id === id ? updated : r));
      return updated;
    } catch (err) {
      const errorMsg = err.message || 'Error al cancelar apartado';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cleanExpired = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const expired = await reservationsService.cleanExpiredReservations();
      await fetchReservations();
      return expired;
    } catch (err) {
      const errorMsg = err.message || 'Error al limpiar apartados expirados';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchReservations]);

  const getProductAvailability = useCallback(async (productId) => {
    try {
      return await reservationsService.getProductAvailability(productId);
    } catch (err) {
      console.error('Error getting product availability:', err);
      return null;
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    reservations,
    loading,
    error,
    fetchReservations,
    createReservation,
    completeReservation,
    cancelReservation,
    cleanExpired,
    getProductAvailability,
    clearError
  };
}

export default useReservations;
