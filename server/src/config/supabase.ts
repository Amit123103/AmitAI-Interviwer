import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;

// Server-side Supabase client (use service role key for admin operations)
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Anon client for non-privileged operations
export const supabaseAnon = createClient(
    supabaseUrl,
    process.env.SUPABASE_ANON_KEY!
);
