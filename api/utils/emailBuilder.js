export const getEmailTemplate = (title, content, actionUrl = null, actionText = 'Ver más') => {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0A0A; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #F5F1E8; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none;">
  <div style="width: 100%; table-layout: fixed; background-color: #0A0A0A; padding: 20px 0;">
    <div style="max-width: 500px; margin: 0 auto; background-color: #121212; border: 1px solid rgba(201, 168, 106, 0.3); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); width: 90%;">
      <div style="text-align: center; padding: 25px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); background: linear-gradient(180deg, #1A1816 0%, #121212 100%);">
        <img src="https://cenit-barber.vercel.app/Logo.png" alt="Cénit Barbería" style="height: 45px; margin: 0 auto 10px auto; display: block; object-fit: contain;">
        <h1 style="color: #E8C77E; font-size: 20px; margin: 0; font-weight: 600; letter-spacing: 0.5px;">${title}</h1>
      </div>
      <div style="padding: 25px; color: #B5AFA5; font-size: 15px; line-height: 1.5;">
        ${content}
      </div>
      ${actionUrl ? `
      <div style="padding: 0 25px 30px 25px; text-align: center;">
        <a href="${actionUrl}" style="display: inline-block; background-color: #C9A86A; color: #1A1408; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; letter-spacing: 0.5px;">${actionText}</a>
      </div>
      ` : ''}
      <div style="padding: 15px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05); font-size: 11px; color: #6A655C; background-color: #0A0A0A;">
        &copy; ${new Date().getFullYear()} Cénit Barbería. Tuchín, Córdoba.
      </div>
    </div>
  </div>
</body>
</html>`;
};

export const buildEmailContent = (type, payload) => {
  switch (type) {
    case 'WELCOME_CLIENT':
      return {
        subject: '¡Bienvenido a Cénit Barbería! 💈',
        html: getEmailTemplate(
          '¡Bienvenido a Cénit!',
          `<p>Hola <b>${payload.first_name}</b>,</p>
           <p>Tu cuenta ha sido creada exitosamente. Bienvenido a la comunidad Cénit, donde el estilo y la elegancia se encuentran.</p>
           <div style="background-color: #1A1816; border: 1px solid #2A2530; padding: 15px; border-radius: 8px; margin: 20px 0;">
             <p style="margin: 0; color: #E8C77E;">Ahora puedes agendar tus citas, comprar en nuestra boutique exclusiva y participar en nuestros sorteos especiales.</p>
           </div>`,
          'https://cenit-barber.vercel.app/auth',
          'Ingresar a mi cuenta'
        )
      };

    case 'NEW_REGISTER_ADMIN':
      return {
        subject: 'Nuevo cliente registrado: ' + payload.first_name + ' ' + payload.first_lastname,
        html: getEmailTemplate(
          'Nuevo Registro',
          `<p>Un nuevo cliente se acaba de registrar en la plataforma:</p>
           <ul style="list-style: none; padding: 0; margin: 15px 0;">
             <li style="margin-bottom: 8px;"><b>Nombre:</b> ${payload.first_name} ${payload.first_lastname}</li>
             <li style="margin-bottom: 8px;"><b>Email:</b> ${payload.email}</li>
             <li style="margin-bottom: 8px;"><b>Teléfono:</b> ${payload.phone || 'No registrado'}</li>
           </ul>`,
          'https://cenit-barber.vercel.app/admin/clients',
          'Ver Clientes'
        )
      };

    case 'APPOINTMENT_CONFIRMED_CLIENT':
      return {
        subject: 'Reserva Confirmada: ' + payload.serviceName,
        html: getEmailTemplate(
          '¡Cita Confirmada!',
          `<p style="margin-bottom: 15px;">Hola <b>${payload.clientName}</b>, hemos agendado tu cita exitosamente.</p>
           <div style="background-color: #1A1816; border: 1px solid #2A2530; border-radius: 8px; padding: 15px; margin: 20px 0;">
             <h3 style="margin: 0 0 10px 0; color: #E8C77E; font-size: 16px;">Detalles de tu reserva:</h3>
             <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px;">
               <li style="margin-bottom: 8px;"><strong style="color:#F1ECDE">Servicio:</strong> ${payload.serviceName}</li>
               <li style="margin-bottom: 8px;"><strong style="color:#F1ECDE">Barbero:</strong> Fernando</li>
               <li style="margin-bottom: 8px;"><strong style="color:#F1ECDE">Fecha:</strong> ${payload.formattedDate}</li>
               <li><strong style="color:#F1ECDE">Hora:</strong> ${payload.formattedTime}</li>
             </ul>
           </div>
           <p style="font-size: 13px; color: #9A9489;"><i>* Te recomendamos llegar 5 minutos antes de tu cita. Si necesitas cancelar, por favor hazlo con anticipación.</i></p>`,
          'https://cenit-barber.vercel.app/perfil',
          'Ver mis citas'
        )
      };

    case 'APPOINTMENT_NEW_ADMIN':
      return {
        subject: 'Nueva cita agendada: ' + payload.clientName,
        html: getEmailTemplate(
          'Nueva Cita Agendada',
          `<p>Tienes una nueva reserva en el sistema:</p>
           <div style="background-color: #1A1816; border: 1px solid #2A2530; border-radius: 8px; padding: 15px; margin: 20px 0;">
             <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px;">
               <li style="margin-bottom: 8px;"><strong style="color:#F1ECDE">Cliente:</strong> ${payload.clientName}</li>
               <li style="margin-bottom: 8px;"><strong style="color:#F1ECDE">Servicio:</strong> ${payload.serviceName}</li>
               <li style="margin-bottom: 8px;"><strong style="color:#F1ECDE">Fecha:</strong> ${payload.formattedDate}</li>
               <li><strong style="color:#F1ECDE">Hora:</strong> ${payload.formattedTime}</li>
             </ul>
           </div>`,
          'https://cenit-barber.vercel.app/admin/appointments',
          'Ver Agenda'
        )
      };

    case 'PROMO_DISCOUNT_ALL':
      const newPrice = payload.price * (1 - payload.discount_percentage / 100);
      return {
        subject: `¡Promoción Especial! ${payload.discount_percentage}% OFF en ${payload.name} 🎉`,
        html: getEmailTemplate(
          '¡Tenemos un descuento especial para ti!',
          `<p style="text-align: center;">Acabamos de rebajar nuestro producto estrella:</p>
           <div style="background-color: #1A1816; padding: 20px; border: 1px solid #C9A86A; border-radius: 8px; margin: 20px 0; text-align: center;">
             <h2 style="color: #E8C77E; margin:0; font-size: 20px;">${payload.name}</h2>
             <p style="font-size: 18px; margin: 15px 0 0 0;">
               <span style="display: block; font-size: 14px; color: #9A9489; margin-bottom: 5px;">Precio original: <del style="color: #C56B5A; opacity: 0.8;">$${payload.price.toLocaleString('es-CO')}</del></span>
               <b style="color: #F1ECDE; font-size: 22px;">¡Llévalo por: $${newPrice.toLocaleString('es-CO')}!</b> <span style="color: #C9A86A; font-weight: bold;">(-${payload.discount_percentage}%)</span>
             </p>
           </div>`,
          'https://cenit-barber.vercel.app/tienda',
          'Aprovechar Promoción'
        )
      };

    case 'NEW_RAFFLE_ALL':
      return {
        subject: `¡Nuevo Sorteo en Cénit! 🎁 Participa por: ${payload.title}`,
        html: getEmailTemplate(
          '¡Nuevo Sorteo Activo!',
          `<div style="background-color: #1A1816; border: 1px solid #C9A86A; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
             <h2 style="color: #E8C77E; margin: 0 0 10px 0;">${payload.title}</h2>
             <p style="color: #F1ECDE; margin: 0; font-size: 16px;">${payload.description}</p>
           </div>
           <p style="text-align: center; color: #9A9489;">Ya puedes participar desde nuestra plataforma. ¡Mucha suerte!</p>`,
          'https://cenit-barber.vercel.app/sorteos',
          'Participar Ahora'
        )
      };

    case 'RAFFLE_WINNER_ALL':
      return {
        subject: '¡Tenemos un ganador en Cénit! 🏆',
        html: getEmailTemplate(
          '¡Tenemos un Ganador!',
          `<p style="text-align: center;">Acabamos de realizar el sorteo: <b>${payload.raffleTitle}</b></p>
           <div style="background-color: #1A1816; border: 1px solid #C9A86A; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center; position: relative;">
             <div style="font-size: 32px; margin-bottom: 10px;">👑</div>
             <p style="color: #9A9489; margin: 0 0 5px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">El afortunado ganador es</p>
             <h2 style="color: #E8C77E; margin: 0; font-size: 24px;">${payload.winnerName}</h2>
             <p style="color: #F1ECDE; margin-top: 10px;">¡Se ha llevado: <b>${payload.prize}</b>!</p>
           </div>
           <p style="text-align: center; color: #B5AFA5;">Gracias a todos por participar. ¡Pronto tendremos más sorpresas!</p>`,
          'https://cenit-barber.vercel.app/sorteos',
          'Ver Resultados'
        )
      };

    case 'RAFFLE_WINNER_ADMIN':
      return {
        subject: 'Sorteo finalizado: Tenemos un ganador',
        html: getEmailTemplate(
          'Sorteo Finalizado',
          `<p>El sistema ha seleccionado automáticamente a un ganador de forma aleatoria para el sorteo <b>'${payload.raffleTitle}'</b>:</p>
           <div style="background-color: #1A1816; border: 1px solid #2A2530; padding: 15px; border-radius: 8px; margin: 20px 0;">
             <p style="margin: 0 0 8px 0;"><strong>Ganador:</strong> <span style="color: #E8C77E;">${payload.winnerName}</span></p>
             <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${payload.winnerEmail || 'No registrado'}</p>
             <p style="margin: 0;"><strong>Teléfono:</strong> ${payload.winnerPhone || 'No registrado'}</p>
           </div>
           <p style="color: #9A9489; font-size: 13px;">El correo de notificación ya fue enviado a todos los participantes.</p>`,
          'https://cenit-barber.vercel.app/admin/raffles',
          'Ver Sorteo'
        )
      };

    case 'NEW_PRODUCT_CRON':
      return {
        subject: 'Descubre los nuevos productos de Cénit 🧢',
        html: getEmailTemplate(
          '¡Nuevos Lanzamientos en Cénit!',
          `<p style="text-align: center;">Se han agregado nuevos productos a nuestra boutique en las últimas horas.</p>
           <div style="background-color: #1A1816; padding: 20px; border-radius: 8px; border: 1px solid #C9A86A; margin: 20px 0; text-align: center;">
             <h2 style="margin: 0; color: #E8C77E; font-size: 20px;">${payload.name}</h2>
             ${payload.tag ? `<p style="display:inline-block; background-color:#C9A86A; color:#0A0A0A; padding:3px 8px; font-size:12px; font-weight:bold; border-radius:3px; margin: 10px 0;">${payload.tag}</p>` : ''}
             <p style="font-family: monospace; font-size: 22px; margin: 10px 0 0 0; color: #F1ECDE;">$${payload.price.toLocaleString('es-CO')}</p>
           </div>`,
          'https://cenit-barber.vercel.app/tienda',
          'Ver Tienda Completa'
        )
      };

    default:
      throw new Error('Unknown email type');
  }
};
