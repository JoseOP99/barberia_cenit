import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { getEmailTemplate } from '../src/utils/emailTemplate.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
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
      const html = getEmailTemplate(
        '¡Nuevos Lanzamientos en Cénit!',
        `<p style="text-align: center;">Se han agregado nuevos productos a nuestra boutique en las últimas horas.</p>
         <div style="background-color: #1A1816; padding: 20px; border-radius: 8px; border: 1px solid #C9A86A; margin: 20px 0; text-align: center;">
           <h2 style="margin: 0; color: #E8C77E; font-size: 20px;">${randomProduct.name}</h2>
           ${randomProduct.tag ? `<p style="display:inline-block; background-color:#C9A86A; color:#0A0A0A; padding:3px 8px; font-size:12px; font-weight:bold; border-radius:3px; margin: 10px 0;">${randomProduct.tag}</p>` : ''}
           <p style="font-family: monospace; font-size: 22px; margin: 10px 0 0 0; color: #F1ECDE;">$${randomProduct.price.toLocaleString('es-CO')}</p>
         </div>`,
        'https://cenit-barber.vercel.app/tienda',
        'Ver Tienda Completa'
      );

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
