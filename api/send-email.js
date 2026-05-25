import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import { buildEmailContent } from './utils/emailBuilder.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Procesar Orden (No aceptar HTML directo)
    const { to, bcc, type, payload } = req.body;

    if ((!to && !bcc) || !type || !payload) {
      return res.status(400).json({ error: 'Missing required fields (to/bcc, type, payload)' });
    }

    // 2. Validar Autenticación (JWT) para correos privados
    const isPublicEmail = ['WELCOME_CLIENT', 'NEW_REGISTER_ADMIN'].includes(type);
    
    if (!isPublicEmail) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid token for private email' });
      }
      const token = authHeader.split(' ')[1];
      
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
      }
    }

    // 3. Construir el contenido internamente de forma segura
    const { subject, html } = buildEmailContent(type, payload);

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
