import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) console.error("VITE_SUPABASE_URL não foi carregado pelo Vite!");
if (!supabaseAnonKey) console.error("VITE_SUPABASE_ANON_KEY não foi carregado pelo Vite!");

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "")
