import { supabase, supabaseAdmin } from './supabase'
import { calculateAddonPrices } from './addonService'

/**
 * Neuen Vertrag erstellen
 * @param {Object} contractData 
 * @returns {Promise<Object>}
 */
export async function createContract(contractData) {
  try {
    // Addon-Preise berechnen
    const addonPricing = await calculateAddonPrices(
      contractData.contract_type, 
      contractData.selected_addons || []
    )
    
    const contract = {
      contract_type: contractData.contract_type,
      customer_email: contractData.customer_email.toLowerCase().trim(),
      form_data: contractData.form_data, // JSONB mit allen Vertragsfeldern
      selected_addons: contractData.selected_addons || [],
      base_price: parseFloat(contractData.base_price),
      addon_prices: addonPricing.addons.reduce((acc, addon) => {
        acc[addon.addon_key] = parseFloat(addon.price)
        return acc
      }, {}),
      total_amount: parseFloat(contractData.base_price) + addonPricing.totalPrice,
      status: 'draft',
      payment_status: 'pending',
      created_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('contracts')
      .insert([contract])
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error creating contract:', error)
    throw new Error(`Vertrag konnte nicht erstellt werden: ${error.message}`)
  }
}

/**
 * Vertrag-Status aktualisieren
 * @param {string} contractId 
 * @param {Object} updates 
 * @returns {Promise<Object>}
 */
export async function updateContract(contractId, updates) {
  try {
    // Verwende Admin-Client für Status-Updates
    const client = supabaseAdmin || supabase
    
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    // Spezielle Timestamp-Felder setzen
    if (updates.payment_status === 'paid' && !updates.paid_at) {
      updateData.paid_at = new Date().toISOString()
    }
    
    if (updates.status === 'completed' && !updates.completed_at) {
      updateData.completed_at = new Date().toISOString()
    }
    
    const { data, error } = await client
      .from('contracts')
      .update(updateData)
      .eq('id', contractId)
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error updating contract:', error)
    throw new Error(`Vertrag-Update fehlgeschlagen: ${error.message}`)
  }
}

/**
 * Vertrag abrufen
 * @param {string} contractId 
 * @returns {Promise<Object|null>}
 */
export async function getContract(contractId) {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching contract:', error)
    return null
  }
}

/**
 * Verträge für E-Mail-Adresse abrufen
 * @param {string} email 
 * @returns {Promise<Array>}
 */
export async function getContractsByEmail(email) {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('customer_email', email.toLowerCase().trim())
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching contracts by email:', error)
    return []
  }
}
