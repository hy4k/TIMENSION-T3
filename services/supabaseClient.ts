
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
// Updated with the new HTTPS credentials provided by the user
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'http://supabasekong-ewso0gog8kk040ss4s40okoc.72.61.171.192.sslip.io';

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2NTAxMjU2MCwiZXhwIjo0OTIwNjg2MTYwLCJyb2xlIjoiYW5vbiJ9.ZM6ejVTRIy3oPSNl_n6mbdA6KgghYCy7hYXyfFgxmD4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to check if auth is configured
export const isAuthConfigured = () => {
  // Ensure we aren't using a placeholder and have a valid URL structure
  return supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co';
};
