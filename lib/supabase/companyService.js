// lib/supabase/companyService.js
import { supabase, supabaseAdmin } from './supabase'

const client = supabaseAdmin || supabase

export async function createCompany(company) {
  const { data, error } = await client
    .from('companies')
    .insert([company])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getCompanyById(companyId) {
  const { data, error } = await client
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single()
  if (error) throw error
  return data
}

export async function listCompanies(params = {}) {
  let query = client.from('companies').select('*')
  if (params.search) {
    query = query.ilike('name', `%${params.search}%`)
  }
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function updateCompany(companyId, updates) {
  const { data, error } = await client
    .from('companies')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', companyId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function addCompanyUser(companyUser) {
  const { data, error } = await client
    .from('company_users')
    .insert([companyUser])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function listCompanyUsers(companyId) {
  const { data, error } = await client
    .from('company_users')
    .select('*')
    .eq('company_id', companyId)
  if (error) throw error
  return data
}

