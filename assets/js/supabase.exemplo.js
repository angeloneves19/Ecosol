import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

export const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co'
export const SUPABASE_ANON_KEY = 'sb_publishable_SUA_CHAVE_AQUI'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
