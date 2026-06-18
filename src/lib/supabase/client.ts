import { createClient } from '@supabase/supabase-js';

// Public project defaults. These are safe to ship in the client bundle:
// the publishable (anon) key is designed for browser exposure, and all data
// access is gated by Row Level Security policies on the database. Env vars
// override these when set (e.g. to point at a different project).
const DEFAULT_SUPABASE_URL = 'https://eahuaeuryxbvwegqmwdx.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_ESqIv3Kq8tiYF2CJAqWlkg_kXj0JsSR';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(url, key);
