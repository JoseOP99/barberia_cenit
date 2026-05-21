import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://oferbwqvmloyzcqsmprs.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mZXJid3F2bWxveXpjcXNtcHJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMjI4MDQsImV4cCI6MjA5NDg5ODgwNH0.vNTSQV58mLtiKpsRSgzUPFEmOb0CagXbUBOuCmYKDlk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test connection (silently - tables may not exist yet)
export const testConnection = async () => {
  try {
    const { error } = await supabase.from('barbers').select('id').limit(1);
    if (error) {
      console.warn('Supabase: tablas no encontradas (ejecutar schema.sql primero)');
      return false;
    }
    console.log('Supabase connected');
    return true;
  } catch {
    return false;
  }
};

export default supabase;
