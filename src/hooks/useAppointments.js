import { useState, useEffect, useCallback } from 'react';
import appointmentsService from '../services/appointmentsService';

export function useAppointments(userId = null) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = userId
        ? await appointmentsService.getUserAppointments(userId)
        : await appointmentsService.getAllAppointments();
      setAppointments(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const createAppointment = useCallback(async (appointmentData) => {
    try {
      setLoading(true);
      const newAppointment = await appointmentsService.createAppointment(appointmentData);
      setAppointments(prev => [newAppointment, ...prev]);
      return newAppointment;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelAppointment = useCallback(async (id) => {
    try {
      await appointmentsService.cancelAppointment(id);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    createAppointment,
    cancelAppointment
  };
}

export default useAppointments;
