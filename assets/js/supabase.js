import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

export const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co'
export const SUPABASE_ANON_KEY = 'SUA-CHAVE-ANON-AQUI'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
