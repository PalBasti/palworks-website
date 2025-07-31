// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// KORREKTE URL ohne Leerzeichen
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nphsbwgeverterjbspuf.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5waHNid2dldmVydGVyamJzcHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MzY5NjcsImV4cCI6MjA2OTExMjk2N30.NHmWS-kDWtMrpdxySIRBtHplIOPBMwxmxHv5V5FB8hU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
