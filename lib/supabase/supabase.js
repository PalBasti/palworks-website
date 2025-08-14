// lib/supabase/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

// Public client (für Frontend)
export const supabase = createClient(supabaseUrl, supabaseKey)

// Admin client (für API-Endpoints mit Service Role)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Fallback wenn Service Key fehlt
if (!supabaseAdmin) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY missing - using regular client')
}
