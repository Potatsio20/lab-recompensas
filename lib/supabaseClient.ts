import { createClient } from '@supabase/supabase-js';

// Usa la URL del server si existe; si no, la pública del cliente
const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!SUPABASE_URL) {
  throw new Error('SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL is required');
}

// Cliente anónimo (browser)
export const supabaseAnon = createClient(
  SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { db: { schema: 'rewards' } }
);

// Cliente admin (server: rutas /api)
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
    db: { schema: 'rewards' }
  }
);
