import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://oferbwqvmloyzcqsmprs.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mZXJid3F2bWxveXpjcXNtcHJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMjI4MDQsImV4cCI6MjA5NDg5ODgwNH0.vNTSQV58mLtiKpsRSgzUPFEmOb0CagXbUBOuCmYKDlk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkSupabase() {
  try {
    console.log("Checking appointments...");
    const { data: appointments, error: err1 } = await supabase.from('appointments').select('*', { count: 'exact' });
    if (err1) console.error("Appointments error:", err1);
    else console.log(`Appointments count: ${appointments.length}`);

    console.log("Checking products (inventory)...");
    const { data: products, error: err2 } = await supabase.from('products').select('*', { count: 'exact' });
    if (err2) console.error("Products error:", err2);
    else console.log(`Products count: ${products.length}`);
    
    console.log("Checking reservations...");
    const { data: reservations, error: err3 } = await supabase.from('reservations').select('*', { count: 'exact' });
    if (err3) console.error("Reservations error:", err3);
    else console.log(`Reservations count: ${reservations.length}`);

  } catch (err) {
    console.error(err);
  }
}

checkSupabase();
