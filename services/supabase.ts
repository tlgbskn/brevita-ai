import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = !!supabaseUrl && !!supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseAnonKey !== 'YOUR_ANON_KEY';

if (!isConfigured) {
    console.warn("Supabase credentials missing! Cloud features will be disabled.");
}

export const supabase = createClient(
    isConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
    isConfigured ? supabaseAnonKey : 'placeholder'
);
