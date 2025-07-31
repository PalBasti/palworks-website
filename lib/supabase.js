// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// Diese Werte findest du in deinem Supabase Dashboard unter "Settings" > "API"
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL und Anon Key müssen in den Umgebungsvariablen gesetzt sein')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
