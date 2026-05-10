import { createClient } from '@supabase/supabase-js'

// Tentamos obter de import.meta.env (Vite) e process.env (Vercel runtime)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || ""
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ""

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("ERRO: Variáveis do Supabase não encontradas durante o runtime!")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
