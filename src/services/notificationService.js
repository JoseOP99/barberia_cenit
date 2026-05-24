export const notificationService = {
  async sendEmail({ to, bcc, subject, html }) {
    try {
      // Usamos ruta relativa, Vercel lo ruteará correctamente
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ to, bcc, subject, html })
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
