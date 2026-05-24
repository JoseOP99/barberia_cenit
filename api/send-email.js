import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, bcc, subject, html } = req.body;

    if ((!to && !bcc) || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields (to/bcc, subject, html)' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.VITE_GMAIL_USER || 'barbercenit@gmail.com',
        pass: process.env.VITE_GMAIL_PASS
      }
    });

    const info = await transporter.sendMail({
      from: `"Cénit Barbería" <${process.env.VITE_GMAIL_USER || 'barbercenit@gmail.com'}>`,
      to,
      bcc,
      subject,
      html
    });

    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: error.message });
  }
}
