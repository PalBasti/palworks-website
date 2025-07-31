import { supabase } from './supabase'

/**
 * Alle verfügbaren Addons für einen Vertragstyp abrufen
 * @param {string} contractType - 'untermietvertrag', 'garage', 'wg'
 * @returns {Promise<Array>} Array von Addon-Objekten
 */
export async function getAddonsForContract(contractType) {
  try {
    const { data, error } = await supabase
      .from('contract_addons')
      .select('*')
      .eq('contract_type', contractType)
      .eq('is_active', true)
      .order('sort_order')
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching addons:', error)
    throw new Error(`Fehler beim Laden der Addons: ${error.message}`)
  }
}

/**
 * Einzelnes Addon abrufen
 * @param {string} contractType 
 * @param {string} addonKey 
 * @returns {Promise<Object|null>}
 */
export async function getAddon(contractType, addonKey) {
  try {
    const { data, error } = await supabase
      .from('contract_addons')
      .select('*')
      .eq('contract_type', contractType)
      .eq('addon_key', addonKey)
      .eq('is_active', true)
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching addon:', error)
    return null
  }
}

/**
 * Preise für ausgewählte Addons berechnen
 * @param {string} contractType 
 * @param {Array<string>} selectedAddonKeys 
 * @returns {Promise<Object>} { addons: Array, totalPrice: number }
 */
export async function calculateAddonPrices(contractType, selectedAddonKeys) {
  if (!selectedAddonKeys || selectedAddonKeys.length === 0) {
    return { addons: [], totalPrice: 0 }
  }
  
  try {
    const { data, error } = await supabase
      .from('contract_addons')
      .select('*')
      .eq('contract_type', contractType)
      .in('addon_key', selectedAddonKeys)
      .eq('is_active', true)
    
    if (error) throw error
    
    const totalPrice = data.reduce((sum, addon) => sum + parseFloat(addon.price), 0)
    
    return {
      addons: data,
      totalPrice: Math.round(totalPrice * 100) / 100 // Runden auf 2 Dezimalstellen
    }
  } catch (error) {
    console.error('Error calculating addon prices:', error)
    throw new Error(`Fehler bei der Preisberechnung: ${error.message}`)
  }
}
