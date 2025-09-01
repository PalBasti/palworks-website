// lib/supabase/templateService.js
import { supabase, supabaseAdmin } from './supabase'

const client = supabaseAdmin || supabase

export async function createTemplate(template) {
  const { data, error } = await client
    .from('contract_templates')
    .insert([template])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function listTemplates({ category, industry, active } = {}) {
  let query = client.from('contract_templates').select('*')
  if (category) query = query.eq('category', category)
  if (industry) query = query.eq('industry', industry)
  if (typeof active === 'boolean') query = query.eq('is_active', active)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function deactivateTemplate(id) {
  const { data, error } = await client
    .from('contract_templates')
    .update({ is_active: false })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

