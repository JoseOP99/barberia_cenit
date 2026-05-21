import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oferbwqvmloyzcqsmprs.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mZXJid3F2bWxveXpjcXNtcHJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMjI4MDQsImV4cCI6MjA5NDg5ODgwNH0.vNTSQV58mLtiKpsRSgzUPFEmOb0CagXbUBOuCmYKDlk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
