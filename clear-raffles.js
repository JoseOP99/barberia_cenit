import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://oferbwqvmloyzcqsmprs.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mZXJid3F2bWxveXpjcXNtcHJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMjI4MDQsImV4cCI6MjA5NDg5ODgwNH0.vNTSQV58mLtiKpsRSgzUPFEmOb0CagXbUBOuCmYKDlk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function clearRaffles() {
  try {
    console.log("Cleaning raffle_tickets...");
    const { error: err1 } = await supabase.from('raffle_tickets').delete().neq('id', 0); // Hack to delete all since we can't use without filters
    if (err1) console.error("raffle_tickets error:", err1);
    
    // Also delete all raffles
    console.log("Cleaning raffles...");
    const { error: err2 } = await supabase.from('raffles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err2) console.error("raffles error:", err2);

    console.log("Raffles cleaned.");
  } catch (err) {
    console.error(err);
  }
}

clearRaffles();
