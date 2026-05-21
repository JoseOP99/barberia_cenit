import { useState, useEffect, useCallback } from 'react';
import appointmentsService from '../services/appointmentsService';

export function useAppointments(userId = null, options = {}) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { autoFetch = true } = options;

  const fetchAppointments = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = userId
        ? await appointmentsService.getUserAppointments(userId)
        : await appointmentsService.getAllAppointments(filters);
      setAppointments(data || []);
      return data;
    } catch (err) {
      const errorMsg = err.message || 'Error al cargar citas';
      setError(errorMsg);
      console.error('Error fetching appointments:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (autoFetch) {
      fetchAppointments();
    }
  }, [autoFetch, fetchAppointments]);

  const createAppointment = useCallback(async (appointmentData) => {
    try {
      setLoading(true);
      setError(null);
      const newAppointment = await appointmentsService.createAppointment(appointmentData);
      setAppointments(prev => [newAppointment, ...prev]);
      return newAppointment;
    } catch (err) {
      const errorMsg = err.message || 'Error al crear cita';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAppointment = useCallback(async (id, updates) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await appointmentsService.updateAppointment(id, updates);
      setAppointments(prev => prev.map(a => a.id === id ? updated : a));
      return updated;
    } catch (err) {
      const errorMsg = err.message || 'Error al actualizar cita';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelAppointment = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await appointmentsService.cancelAppointment(id);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
    } catch (err) {
      const errorMsg = err.message || 'Error al cancelar cita';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    clearError
  };
}

export default useAppointments;
