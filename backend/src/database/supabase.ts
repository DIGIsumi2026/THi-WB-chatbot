import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { config } from '../config/env.js'

let client: SupabaseClient | undefined

export function getSupabase(): SupabaseClient {
  if (client) return client
  if (!config.supabaseUrl || !config.supabaseServiceKey) {
    throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env')
  }
  // Never expose this service role client/key in the React frontend.
  client = createClient(config.supabaseUrl, config.supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
  return client
}
