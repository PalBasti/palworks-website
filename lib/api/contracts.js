// lib/api/contracts.js
import { supabase } from '../supabase'

// Newsletter-Funktionen
export const subscribeToNewsletter = async (email, source = 'website', contractType = null) => {
  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert([{
        email,
        source,
        contract_type: contractType
      }])
      .select()

    if (error) {
      // Wenn E-Mail bereits existiert, als Erfolg behandeln
      if (error.code === '23505') {
        return { success: true, message: 'E-Mail bereits registriert' }
      }
      throw error
    }

    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    throw new Error('Newsletter-Anmeldung fehlgeschlagen')
  }
}

// Addons für Vertragstyp laden
export const getContractAddons = async (contractType) => {
  try {
    const { data, error } = await supabase
      .from('contract_addons')
      .select('*')
      .eq('contract_type', contractType)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) throw error

    return data.map(addon => ({
      id: addon.addon_key,
      name: addon.name,
      description: addon.description,
      price: parseFloat(addon.price),
      features: addon.features || []
    }))
  } catch (error) {
    console.error('Error loading addons:', error)
    return []
  }
}

// Vertrag erstellen
export const createContract = async (contractData) => {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .insert([contractData])
      .select()

    if (error) throw error
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Contract creation error:', error)
    throw new Error('Vertrag konnte nicht erstellt werden')
  }
}

// Vertrag-Status aktualisieren
export const updateContractStatus = async (contractId, status, additionalData = {}) => {
  try {
    const updateData = {
      status,
      ...additionalData,
      updated_at: new Date().toISOString()
    }

    if (status === 'paid') {
      updateData.paid_at = new Date().toISOString()
    }
    if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('contracts')
      .update(updateData)
      .eq('id', contractId)
      .select()

    if (error) throw error
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Contract update error:', error)
    throw new Error('Vertrag-Status konnte nicht aktualisiert werden')
  }
}

// Payment-Log erstellen
export const logPayment = async (paymentData) => {
  try {
    const { data, error } = await supabase
      .from('payment_logs')
      .insert([paymentData])
      .select()

    if (error) throw error
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Payment log error:', error)
    // Payment-Logs sind nicht kritisch, daher nur loggen
    return { success: false, error }
  }
}

// Pricing-Funktionen
export const calculateContractPrice = (contractType, selectedAddons, addonsConfig) => {
  const basePrices = {
    untermietvertrag: 12.90,
    mietvertrag: 15.90,
    gewerbemietvertrag: 24.90,
    // Weitere Vertragstypen...
  }

  const basePrice = basePrices[contractType] || 12.90
  
  const addonTotal = selectedAddons.reduce((total, addonId) => {
    const addon = addonsConfig.find(a => a.id === addonId)
    return total + (addon ? addon.price : 0)
  }, 0)

  return {
    basePrice,
    addonTotal,
    total: basePrice + addonTotal
  }
}

// Utility-Funktionen
export const formatPrice = (price, currency = '€') => {
  return price.toFixed(2).replace('.', ',') + ' ' + currency
}

export const validateFormData = (formData, requiredFields) => {
  const errors = {}
  
  requiredFields.forEach(field => {
    if (!formData[field] || formData[field].toString().trim() === '') {
      errors[field] = 'Dieses Feld ist erforderlich'
    }
  })

  // E-Mail-Validierung
  if (formData.customer_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
    errors.customer_email = 'Ungültige E-Mail-Adresse'
  }

  // PLZ-Validierung (Deutschland)
  if (formData.property_postal && !/^\d{5}$/.test(formData.property_postal)) {
    errors.property_postal = 'PLZ muss 5 Ziffern haben'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Vertragsdaten für PDF-Generierung formatieren
export const formatContractDataForPDF = (contract) => {
  return {
    id: contract.id,
    type: contract.contract_type,
    formData: contract.form_data,
    addons: contract.selected_addons,
    pricing: {
      basePrice: contract.base_price,
      addonPrices: contract.addon_prices,
      total: contract.total_amount
    },
    metadata: {
      createdAt: contract.created_at,
      paidAt: contract.paid_at,
      customerEmail: contract.customer_email
    }
  }
}
