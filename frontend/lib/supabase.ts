import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ── Singleton guard ────────────────────────────────────────────────────────────
// Next.js hot-reload re-executes modules; attach instance to globalThis so the
// same object survives across HMR cycles and prevents GoTrueClient warnings.
declare global {
  // eslint-disable-next-line no-var
  var __supabase: SupabaseClient | undefined
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '[supabase] Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_KEY in .env.local'
  )
}

// Re-use existing instance on globalThis, otherwise create once.
export const supabase: SupabaseClient =
  globalThis.__supabase ??
  createClient(supabaseUrl, supabaseKey, {
    auth: {
      // Prevents a second GoTrueClient from spinning up in server components.
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  })

if (process.env.NODE_ENV !== 'production') {
  // Only pin to globalThis in dev (HMR); prod modules are not re-executed.
  globalThis.__supabase = supabase
}
