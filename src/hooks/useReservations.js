import { useState, useEffect, useCallback } from 'react';
import reservationsService from '../services/reservationsService';

export function useReservations(userId = null) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = userId
        ? await reservationsService.getUserReservations(userId)
        : await reservationsService.getAllReservations();
      setReservations(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const createReservation = useCallback(async (productId, userId, quantity = 1, expiresInHours = 6) => {
    try {
      setLoading(true);
      const newReservation = await reservationsService.createReservation(
        productId,
        userId,
        quantity,
        expiresInHours
      );
      setReservations(prev => [newReservation, ...prev]);
      return newReservation;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const completeReservation = useCallback(async (id) => {
    try {
      const updated = await reservationsService.completeReservation(id);
      setReservations(prev => prev.map(r => r.id === id ? updated : r));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const cancelReservation = useCallback(async (id) => {
    try {
      const updated = await reservationsService.cancelReservation(id);
      setReservations(prev => prev.map(r => r.id === id ? updated : r));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    reservations,
    loading,
    error,
    fetchReservations,
    createReservation,
    completeReservation,
    cancelReservation
  };
}

export default useReservations;
