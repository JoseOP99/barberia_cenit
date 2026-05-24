import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { buildEmailContent } from './utils/emailBuilder.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Verificación de seguridad requerida por Vercel Cron
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized: Invalid CRON_SECRET' });
  }

  try {
    // 1. Obtener productos creados en las últimas 24 horas
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: newProducts, error: prodError } = await supabase
      .from('products')
      .select('name, tag, price')
      .gte('created_at', yesterday.toISOString());

    if (prodError) throw prodError;

    if (!newProducts || newProducts.length === 0) {
      return res.status(200).json({ message: 'No hay productos nuevos hoy.' });
    }

    const randomProduct = newProducts[Math.floor(Math.random() * newProducts.length)];

    // 2. Obtener clientes a los que notificar
    const { data: customers, error: custError } = await supabase
      .from('profiles')
      .select('email, name')
      .eq('role', 'customer');

    if (custError) throw custError;

    if (!customers || customers.length === 0) {
      return res.status(200).json({ message: 'No hay clientes para notificar.' });
    }

    // 3. Configurar Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.VITE_GMAIL_USER || 'barbercenit@gmail.com',
        pass: process.env.VITE_GMAIL_PASS
      }
    });

    const emails = customers.map(c => c.email).filter(Boolean);

    if (emails.length > 0) {
      const payload = {
        name: randomProduct.name,
        price: randomProduct.price,
        tag: randomProduct.tag
      };
      const { subject, html } = buildEmailContent('NEW_PRODUCT_CRON', payload);

      await transporter.sendMail({
        from: `"Cénit Barbería" <${process.env.VITE_GMAIL_USER || 'barbercenit@gmail.com'}>`,
        bcc: emails, // Usar BCC (copia oculta) para privacidad masiva
        subject: 'Descubre los nuevos productos de Cénit 🧢',
        html
      });
    }

    return res.status(200).json({ success: true, notifiedCount: emails.length });
  } catch (error) {
    console.error('Error in cron job:', error);
    return res.status(500).json({ error: error.message });
  }
}
