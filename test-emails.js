/* eslint-env node */
import nodemailer from 'nodemailer';
import { config } from 'dotenv';
import { buildEmailContent } from './api/utils/emailBuilder.js';

config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.VITE_GMAIL_USER,
    pass: process.env.VITE_GMAIL_PASS
  }
});

const CLIENT_EMAIL = 'josec.ortiz@udea.edu.co';
const ADMIN_EMAIL = 'barbercenit@gmail.com';

async function sendTest(emailConfig, type) {
  try {
    await transporter.sendMail(emailConfig);
    console.log(`✅ Correo de ${type} enviado a ${emailConfig.to || emailConfig.bcc}`);
  } catch (error) {
    console.error(`❌ Error en ${type}:`, error.message);
  }
}

async function sendAllTests() {
  console.log('Iniciando envío de correos de prueba...');

  const ts = Math.floor(Date.now() / 1000);

  // 1. Registro (Cliente)
  let content = buildEmailContent('WELCOME_CLIENT', { first_name: 'Jose' });
  await sendTest({
    from: `"Cénit Barbería" <${process.env.VITE_GMAIL_USER}>`,
    to: CLIENT_EMAIL,
    subject: `${content.subject} (PRUEBA ${ts})`,
    html: content.html
  }, 'Registro (Cliente)');

  // 2. Registro (Admin)
  content = buildEmailContent('NEW_REGISTER_ADMIN', { first_name: 'Jose', first_lastname: 'Ortiz', email: CLIENT_EMAIL, phone: '300 123 4567' });
  await sendTest({
    from: `"Cénit Barbería" <${process.env.VITE_GMAIL_USER}>`,
    to: ADMIN_EMAIL,
    subject: `${content.subject} (PRUEBA ${ts})`,
    html: content.html
  }, 'Registro (Admin)');

  // 3. Cita (Cliente)
  content = buildEmailContent('APPOINTMENT_CONFIRMED_CLIENT', { clientName: 'Jose Ortiz', serviceName: 'Corte Premium', formattedDate: '25/05/2026', formattedTime: '15:00' });
  await sendTest({
    from: `"Cénit Barbería" <${process.env.VITE_GMAIL_USER}>`,
    to: CLIENT_EMAIL,
    subject: `${content.subject} (PRUEBA ${ts})`,
    html: content.html
  }, 'Cita (Cliente)');

  // 4. Cita (Admin)
  content = buildEmailContent('APPOINTMENT_NEW_ADMIN', { clientName: 'Jose Ortiz', serviceName: 'Corte Premium', formattedDate: '25/05/2026', formattedTime: '15:00' });
  await sendTest({
    from: `"Cénit Barbería" <${process.env.VITE_GMAIL_USER}>`,
    to: ADMIN_EMAIL,
    subject: `${content.subject} (PRUEBA ${ts})`,
    html: content.html
  }, 'Cita (Admin)');

  // 5. Descuento
  content = buildEmailContent('PROMO_DISCOUNT_ALL', { name: 'Gorra Cénit Original', price: 150000, discount_percentage: 20 });
  await sendTest({
    from: `"Cénit Barbería" <${process.env.VITE_GMAIL_USER}>`,
    bcc: CLIENT_EMAIL,
    subject: `${content.subject} (PRUEBA ${ts})`,
    html: content.html
  }, 'Promoción');

  // 6. Nuevo Sorteo
  content = buildEmailContent('NEW_RAFFLE_ALL', { title: 'Sorteo Mes del Padre', description: 'Participa por una Gorra Exclusiva acumulando citas.', draw_date: '30/06/2026', prize: 'Gorra Exclusiva' });
  await sendTest({
    from: `"Cénit Barbería" <${process.env.VITE_GMAIL_USER}>`,
    bcc: CLIENT_EMAIL,
    subject: `${content.subject} (PRUEBA ${ts})`,
    html: content.html
  }, 'Nuevo Sorteo');

  // 7. Ganador Sorteo (Cliente)
  content = buildEmailContent('RAFFLE_WINNER_ALL', { raffleTitle: 'Sorteo Mes del Padre', winnerName: 'Jose Ortiz', prize: 'Gorra Exclusiva' });
  await sendTest({
    from: `"Cénit Barbería" <${process.env.VITE_GMAIL_USER}>`,
    bcc: CLIENT_EMAIL,
    subject: `${content.subject} (PRUEBA ${ts})`,
    html: content.html
  }, 'Ganador Sorteo (Cliente)');

  // 8. Ganador Sorteo (Admin)
  content = buildEmailContent('RAFFLE_WINNER_ADMIN', { raffleTitle: 'Sorteo Mes del Padre', winnerName: 'Jose Ortiz', winnerEmail: CLIENT_EMAIL, winnerPhone: '300 123 4567' });
  await sendTest({
    from: `"Cénit Barbería" <${process.env.VITE_GMAIL_USER}>`,
    to: ADMIN_EMAIL,
    subject: `${content.subject} (PRUEBA ${ts})`,
    html: content.html
  }, 'Ganador Sorteo (Admin)');

  // 9. Cron
  content = buildEmailContent('NEW_PRODUCT_CRON', { name: 'Cera Moldeadora', price: 45000, tag: 'NUEVO' });
  await sendTest({
    from: `"Cénit Barbería" <${process.env.VITE_GMAIL_USER}>`,
    bcc: CLIENT_EMAIL,
    subject: `${content.subject} (PRUEBA ${ts})`,
    html: content.html
  }, 'Nuevos Productos (Cron)');

  console.log('🎉 Todas las pruebas enviadas correctamente.');
}

sendAllTests();
