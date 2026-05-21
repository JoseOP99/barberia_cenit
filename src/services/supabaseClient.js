import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://oferbwqvmloyzcqsmprs.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mZXJid3F2bWxveXpjcXNtcHJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMjI4MDQsImV4cCI6MjA5NDg5ODgwNH0.vNTSQV58mLtiKpsRSgzUPFEmOb0CagXbUBOuCmYKDlk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('services').select('count()', { count: 'exact' });
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    console.log('✓ Supabase connected successfully');
    return true;
  } catch (err) {
    console.error('Connection test failed:', err);
    return false;
  }
};

export default supabase;
