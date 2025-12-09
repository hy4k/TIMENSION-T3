
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
// Updated with the new HTTPS credentials provided by the user
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
                    process.env.SUPABASE_URL || 
                    'https://supabase.fets.in';

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                        process.env.SUPABASE_ANON_KEY || 
                        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2MzU3MTY2MCwiZXhwIjo0OTE5MjQ1MjYwLCJyb2xlIjoiYW5vbiJ9.ApJ13y26_hrkcVO-XhLwHiSt1j6tg_h74WrPc93iPCg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to check if auth is configured
export const isAuthConfigured = () => {
  // Ensure we aren't using a placeholder and have a valid URL structure
  return supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co';
};
