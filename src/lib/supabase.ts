import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Keep session across refreshes (user stays logged in until they explicitly sign out)
    persistSession: true,
    // Detect session from URL hash on OAuth callbacks
    detectSessionInUrl: true,
    // Auto-refresh token before it expires
    autoRefreshToken: true,
  },
});
