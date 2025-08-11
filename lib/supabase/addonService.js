// lib/supabase/addonService.js - KORRIGIERTE VERSION mit getAddonsByContractType

import { supabase } from './supabase'

/**
 * Alle verfügbaren Addons für einen Vertragstyp abrufen
 * @param {string} contractType - 'untermietvertrag', 'garage', 'wg'
 * @returns {Promise<Object>} { success: boolean, data: Array, error?: string }
 */
export async function getAddonsByContractType(contractType) {
  try {
    const { data, error } = await supabase
      .from('contract_addons')
      .select('*')
      .eq('contract_type', contractType)
      .eq('is_active', true)
      .order('sort_order')
    
    if (error) throw error
    
    return {
      success: true,
      data: data || []
    }
  } catch (error) {
    console.error('Error fetching addons:', error)
    return {
      success: false,
      data: [],
      error: error.message
    }
  }
}

/**
 * Alle verfügbaren Addons für einen Vertragstyp abrufen (Alternative Funktionsname)
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

/**
 * Addon-Konfiguration für Frontend erstellen
 * @param {string} contractType 
 * @returns {Promise<Object>} { success: boolean, data: Object }
 */
export async function getAddonConfig(contractType) {
  try {
    const result = await getAddonsByContractType(contractType)
    
    if (!result.success) {
      throw new Error(result.error)
    }

    // Konfiguration für Frontend aufbereiten
    const config = {
      contractType,
      addons: result.data.map(addon => ({
        id: addon.id,
        key: addon.addon_key,
        name: addon.name,
        description: addon.description,
        price: parseFloat(addon.price),
        features: addon.features || [],
        sortOrder: addon.sort_order || 0
      })),
      totalAddons: result.data.length
    }

    return {
      success: true,
      data: config
    }
  } catch (error) {
    console.error('Error creating addon config:', error)
    return {
      success: false,
      data: null,
      error: error.message
    }
  }
}

/**
 * Fallback-Addons wenn Datenbank nicht verfügbar
 * @param {string} contractType 
 * @returns {Array}
 */
export function getFallbackAddons(contractType) {
  const fallbackAddons = {
    untermietvertrag: [
      {
        id: 'fallback-1',
        addon_key: 'explanations',
        name: 'Rechtliche Erläuterungen',
        description: 'Detaillierte Erklärungen aller Vertragsklauseln',
        price: 9.90,
        features: ['Klausel-für-Klausel Erklärung', 'Rechtliche Hintergründe', 'Praxistipps'],
        sort_order: 1
      },
      {
        id: 'fallback-2',
        addon_key: 'handover_protocol',
        name: 'Übergabeprotokoll',
        description: 'Professionelles Übergabeprotokoll',
        price: 7.90,
        features: ['Zustandsdokumentation', 'Mängel-Erfassung', 'Zählerstände'],
        sort_order: 2
      }
    ],
    garagenvertrag: [
      {
        id: 'fallback-3',
        addon_key: 'explanations',
        name: 'Rechtliche Erläuterungen',
        description: 'Spezielle Erläuterungen für Garagenverträge',
        price: 7.90,
        features: ['Garage-spezifische Klauseln', 'Kündigungsrechte', 'Instandhaltung'],
        sort_order: 1
      }
    ]
  }

  return fallbackAddons[contractType] || []
}
