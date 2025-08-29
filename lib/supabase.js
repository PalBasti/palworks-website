// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// KORREKTE URL ohne Leerzeichen
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nphsbwgeverterjbspuf.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5waHNid2dldmVydGVyamJzcHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MzY5NjcsImV4cCI6MjA2OTExMjk2N30.NHmWS-kDWtMrpdxySIRBtHplIOPBMwxmxHv5V5FB8hU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Service Role Client für Server-Side Operations
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// ⭐ USER_ROLES hinzufügen - FIX für AuthContext Import-Fehler
export const USER_ROLES = {
  PUBLIC: 'public',
  AUTHENTICATED: 'authenticated', 
  ADMIN: 'admin',
  PREMIUM: 'premium'
}

// ⭐ SUBSCRIPTION_STATUS hinzufügen für Vollständigkeit
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  CANCELLED: 'cancelled'
}

// Service Role Client für Server-Side Operations
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// ⭐ USER_ROLES hinzufügen - FIX für AuthContext Import-Fehler
export const USER_ROLES = {
  PUBLIC: 'public',
  AUTHENTICATED: 'authenticated', 
  ADMIN: 'admin',
  PREMIUM: 'premium'
}

// ⭐ SUBSCRIPTION_STATUS hinzufügen für Vollständigkeit
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  CANCELLED: 'cancelled'
}
