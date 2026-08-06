import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

if (!supabaseUrl || !supabaseAnonKey) {
  // Não arremessa em runtime do cliente para evitar quebrar o build em ambientes locais,
  // mas logamos para ajudar a diagnosticar erros de configuração.
  console.warn('Aviso: variáveis de ambiente do Supabase não encontradas.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
