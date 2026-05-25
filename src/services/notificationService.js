import { supabase } from './supabaseClient';

export const notificationService = {
  async sendEmail({ to, bcc, type, payload }) {
    try {
      // 1. Obtener la sesión actual para autorizar la petición
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // Correos públicos que no requieren estar logueado (ej. registro)
      const isPublicEmail = ['WELCOME_CLIENT', 'NEW_REGISTER_ADMIN'].includes(type);

      if (!token && !isPublicEmail) {
        console.warn(`notificationService: No active session. Email ${type} not sent.`);
        return null; // Opcional: lanzar error si es estricto
      }

      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // 2. Enviar petición segura a nuestra API
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers,
        body: JSON.stringify({ to, bcc, type, payload })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al enviar correo');
      return data;
    } catch (err) {
      console.error('Error in notificationService:', err);
      // No bloqueamos la ejecución si falla el correo
      return null;
    }
  }
};

export default notificationService;
