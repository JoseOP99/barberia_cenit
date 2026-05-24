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
