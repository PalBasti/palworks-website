// lib/supabase/bulkService.js
import { supabase, supabaseAdmin } from './supabase'

const client = supabaseAdmin || supabase

export async function createBulkOrder(order) {
  const { data, error } = await client
    .from('bulk_orders')
    .insert([order])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateBulkProgress(id, processedContracts, status) {
  const { data, error } = await client
    .from('bulk_orders')
    .update({ processed_contracts: processedContracts, status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function listBulkOrders(companyId) {
  let query = client.from('bulk_orders').select('*')
  if (companyId) query = query.eq('company_id', companyId)
  const { data, error } = await query
  if (error) throw error
  return data
}

