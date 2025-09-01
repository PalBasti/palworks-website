// lib/supabase/businessContractService.js
import { supabase, supabaseAdmin } from './supabase'

const client = supabaseAdmin || supabase

export async function createBusinessContract(contract) {
  const payload = {
    ...contract,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  const { data, error } = await client
    .from('business_contracts')
    .insert([payload])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function listBusinessContracts(companyId) {
  let query = client.from('business_contracts').select('*')
  if (companyId) query = query.eq('company_id', companyId)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function updateBusinessContract(id, updates) {
  const { data, error } = await client
    .from('business_contracts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

