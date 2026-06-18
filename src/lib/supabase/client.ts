import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  // eslint-disable-next-line no-console
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY — online features will be unavailable.');
}

// Fall back to placeholder values so createClient doesn't throw at module-load
// time and break the app's initial bundle import when env vars are absent.
export const supabase = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder');
