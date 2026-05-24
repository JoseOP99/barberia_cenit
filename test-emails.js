import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { getEmailTemplate } from './src/utils/emailTemplate.js';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.VITE_GMAIL_USER || 'barbercenit@gmail.com',
    pass: process.env.VITE_GMAIL_PASS
  }
});

const CLIENT_EMAIL = 'josec.ortiz@udea.edu.co';
const ADMIN_EMAIL = 'barbercenit@gmail.com';

async function sendAllTests() {
  console.log('Iniciando envío de correos de prueba...');

  const ts = Math.floor(Date.now() / 1000);

  try {
    // 1. Registro (Cliente)
    await transporter.sendMail({
      from: `"Cénit Barbería" <${process.env.VITE_GMAIL_USER}>`,
      to: CLIENT_EMAIL,
      subject: `¡Bienvenido a Cénit Barbería! 💈 (PRUEBA ${ts})`,
      html: getEmailTemplate(
        '¡Bienvenido a Cénit!',
        `<p>Hola <b>Jose Ortiz</b>,</p>
         <p>Tu cuenta ha sido creada exitosamente. Bienvenido a la comunidad Cénit, donde el estilo y la elegancia se encuentran.</p>
         <div style="background-color: #1A1816; border: 1px solid #2A2530; padding: 15px; border-radius: 8px; margin: 20px 0;">
           <p style="margin: 0; color: #E8C77E;">Ahora puedes agendar tus citas, comprar en nuestra boutique exclusiva y participar en nuestros sorteos especiales.</p>
         </div>`,
        'https://cenit-barber.vercel.app/auth',
        'Ingresar a mi cuenta'
      )
    });
    console.log('✅ Correo de Registro (Cliente) enviado a', CLIENT_EMAIL);

    // 2. Registro (Admin)
    await transporter.sendMail({
      from: `"Cénit Barbería" <${process.env.VITE_GMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: `Nuevo cliente registrado: Jose Ortiz (PRUEBA ${ts})`,
      html: getEmailTemplate(
        'Nuevo Registro',
        `<p>Un nuevo cliente se acaba de registrar en la plataforma:</p>
         <ul style="list-style: none; padding: 0; margin: 15px 0;">
           <li style="margin-bottom: 8px;"><b>Nombre:</b> Jose Ortiz</li>
           <li style="margin-bottom: 8px;"><b>Email:</b> ${CLIENT_EMAIL}</li>
           <li style="margin-bottom: 8px;"><b>Teléfono:</b> 3001234567</li>
         </ul>`,
        'https://cenit-barber.vercel.app/admin/clients',
        'Ver Clientes'
      )
    });
    console.log('✅ Correo de Registro (Admin) enviado a', ADMIN_EMAIL);

    // 3. Cita Agendada (Cliente)
    await transporter.sendMail({
      from: `"Cénit Barbería" <${process.env.VITE_GMAIL_USER}>`,
      to: CLIENT_EMAIL,
      subject: `Reserva Confirmada: Corte Premium (PRUEBA ${ts})`,
      html: getEmailTemplate(
        '¡Cita Confirmada!',
        `<p style="margin-bottom: 15px;">Hola <b>Jose Ortiz</b>, hemos agendado tu cita exitosamente.</p>
         <div style="background-color: #1A1816; border: 1px solid #2A2530; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left;">
           <p style="color: #9A9489; margin: 5px 0;"><b>Servicio:</b> Corte Premium</p>
           <p style="color: #9A9489; margin: 5px 0;"><b>Barbero:</b> Nando</p>
           <p style="color: #9A9489; margin: 5px 0;"><b>Fecha:</b> 2026-06-01</p>
           <p style="color: #9A9489; margin: 5px 0;"><b>Hora:</b> 15:30</p>
         </div>
         <p style="color: #C56B5A; font-weight: bold; margin-top: 15px;">⚠️ Recuerda llegar 5 minutos antes de tu cita.</p>`,
        'https://cenit-barber.vercel.app/perfil',
        'Ver Mis Citas'
      )
    });
    console.log('✅ Correo de Cita (Cliente) enviado a', CLIENT_EMAIL);

    // 4. Cita Agendada (Admin)
    await transporter.sendMail({
      from: `"Cénit Barbería" <${process.env.VITE_GMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: `Nueva cita agendada: Jose Ortiz (PRUEBA ${ts})`,
      html: getEmailTemplate(
        'Nueva Cita Agendada',
        `<p>Tienes una nueva reserva en el sistema:</p>
         <ul style="list-style: none; padding: 0; margin: 15px 0;">
           <li style="margin-bottom: 8px;"><b>Cliente:</b> Jose Ortiz (3001234567)</li>
           <li style="margin-bottom: 8px;"><b>Servicio:</b> Corte Premium</li>
           <li style="margin-bottom: 8px;"><b>Barbero:</b> Nando</li>
           <li style="margin-bottom: 8px;"><b>Fecha:</b> 2026-06-01 a las 15:30</li>
         </ul>`,
        'https://cenit-barber.vercel.app/admin/calendar',
        'Ver Calendario'
      )
    });
    console.log('✅ Correo de Cita (Admin) enviado a', ADMIN_EMAIL);

    // 5. Promociones/Descuento (Todos/Cliente)
    await transporter.sendMail({
      from: `"Cénit Barbería" <${process.env.VITE_GMAIL_USER}>`,
      to: CLIENT_EMAIL,
      subject: `¡Promoción Especial! 20% OFF en Gorra Cénit Original 🎉 (PRUEBA ${ts})`,
      html: getEmailTemplate(
        '¡Tenemos un descuento especial para ti!',
        `<p style="text-align: center;">Acabamos de rebajar nuestro producto estrella:</p>
         <div style="background-color: #1A1816; padding: 20px; border: 1px solid #C9A86A; border-radius: 8px; margin: 20px 0; text-align: center;">
           <h2 style="color: #E8C77E; margin:0; font-size: 20px;">Gorra Cénit Original</h2>
           <p style="font-size: 18px; margin: 15px 0 0 0;">
             <span style="display: block; font-size: 14px; color: #9A9489; margin-bottom: 5px;">Precio original: <del style="color: #C56B5A; opacity: 0.8;">$150,000</del></span>
             <b style="color: #F1ECDE; font-size: 22px;">¡Llévalo por: $120,000!</b> <span style="color: #C9A86A; font-weight: bold;">(-20%)</span>
           </p>
         </div>`,
        'https://cenit-barber.vercel.app/tienda',
        'Aprovechar Promoción'
      )
    });
    console.log('✅ Correo de Promoción enviado a', CLIENT_EMAIL);

    // 6. Nuevo Sorteo Creado (Todos/Cliente)
    await transporter.sendMail({
      from: `"Cénit Barbería" <${process.env.VITE_GMAIL_USER}>`,
      to: CLIENT_EMAIL,
      subject: `¡Nuevo Sorteo en Cénit! 🎁 Participa por: Gorra Exclusiva (PRUEBA ${ts})`,
      html: getEmailTemplate(
        '¡Nuevo Sorteo Activo!',
        `<div style="background-color: #1A1816; border: 1px solid #C9A86A; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
           <h2 style="color: #E8C77E; margin: 0; font-size: 20px;">Sorteo Mes del Padre</h2>
           <p style="font-size: 18px; color: #F1ECDE; margin-top: 10px;">Premio: <b>Gorra Exclusiva</b></p>
         </div>
         <p style="color: #9A9489; margin: 5px 0;">El sorteo se realizará el <b>2026-06-30</b>.</p>
         <p style="color: #9A9489;">Para participar, debes acumular al menos <b>2 citas</b> antes de la fecha del sorteo.</p>`,
        'https://cenit-barber.vercel.app/sorteos',
        'Ver Sorteos'
      )
    });
    console.log('✅ Correo de Sorteo Creado enviado a', CLIENT_EMAIL);

    // 7. Ganador Sorteo (Todos/Cliente)
    await transporter.sendMail({
      from: `"Cénit Barbería" <${process.env.VITE_GMAIL_USER}>`,
      to: CLIENT_EMAIL,
      subject: `¡Tenemos un ganador en Cénit! 🏆 (PRUEBA ${ts})`,
      html: getEmailTemplate(
        '¡Tenemos un Ganador!',
        `<p style="text-align: center;">Acabamos de realizar el sorteo: <b>Sorteo Mes del Padre</b></p>
         <div style="background-color: #1A1816; border: 1px solid #C9A86A; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
           <p style="color: #9A9489; font-size: 14px; margin: 0;">EL AFORTUNADO GANADOR ES:</p>
           <h2 style="color: #E8C77E; font-size: 24px; margin: 10px 0 0 0;">🎉 JOSE ORTIZ 🎉</h2>
           <p style="color: #F1ECDE; margin-top: 10px;">¡Se ha llevado: <b>Gorra Exclusiva</b>!</p>
         </div>
         <p style="color: #9A9489; text-align: center; font-size: 14px;">Si fuiste tú, por favor comunícate con nosotros para reclamar tu premio. Si no fuiste tú, ¡mantente atento a nuestros próximos sorteos!</p>`,
        'https://cenit-barber.vercel.app/sorteos',
        'Ver Sorteos'
      )
    });
    console.log('✅ Correo de Ganador Sorteo (Cliente) enviado a', CLIENT_EMAIL);
    
    // 7.1 Ganador Sorteo (Admin)
    await transporter.sendMail({
      from: `"Cénit Barbería" <${process.env.VITE_GMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: `Sorteo finalizado: Tenemos un ganador (PRUEBA ${ts})`,
      html: getEmailTemplate(
        'Sorteo Finalizado',
        `<p>El sistema ha seleccionado automáticamente a un ganador de forma aleatoria para el sorteo <b>'Sorteo Mes del Padre'</b>:</p>
         <ul style="list-style: none; padding: 0; margin: 15px 0;">
           <li style="margin-bottom: 8px;"><b>Ganador:</b> Jose Ortiz</li>
           <li style="margin-bottom: 8px;"><b>Email:</b> ${CLIENT_EMAIL}</li>
           <li style="margin-bottom: 8px;"><b>Teléfono:</b> 3001234567</li>
         </ul>
         <p>Por favor contáctalo para entregar el premio.</p>`,
        'https://cenit-barber.vercel.app/admin/raffles',
        'Ver Panel de Sorteos'
      )
    });
    console.log('✅ Correo de Ganador Sorteo (Admin) enviado a', ADMIN_EMAIL);

    // 8. Cronjob Novedades Inventario (Todos/Cliente)
    await transporter.sendMail({
      from: `"Cénit Barbería" <${process.env.VITE_GMAIL_USER}>`,
      to: CLIENT_EMAIL,
      subject: `Descubre los nuevos productos de Cénit 🧢 (PRUEBA ${ts})`,
      html: getEmailTemplate(
        '¡Nuevos Lanzamientos en Cénit!',
        `<p style="text-align: center;">Se han agregado nuevos productos a nuestra boutique en las últimas horas.</p>
         <div style="background-color: #1A1816; padding: 20px; border-radius: 8px; border: 1px solid #C9A86A; margin: 20px 0; text-align: center;">
           <h2 style="margin: 0; color: #E8C77E; font-size: 20px;">Gorra Trucker Negra</h2>
           <p style="display:inline-block; background-color:#C9A86A; color:#0A0A0A; padding:3px 8px; font-size:12px; font-weight:bold; border-radius:3px; margin: 10px 0;">NUEVO</p>
           <p style="font-family: monospace; font-size: 22px; margin: 10px 0 0 0; color: #F1ECDE;">$120,000</p>
         </div>`,
        'https://cenit-barber.vercel.app/tienda',
        'Ver Tienda Completa'
      )
    });
    console.log('✅ Correo de Cron Novedades enviado a', CLIENT_EMAIL);

    console.log('🎉 Todas las pruebas enviadas correctamente.');
  } catch (error) {
    console.error('❌ Error enviando correos:', error);
  }
}

sendAllTests();
