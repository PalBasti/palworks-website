import { supabase, supabaseAdmin } from './supabase'

/**
 * Payment-Log erstellen
 * @param {string} contractId 
 * @param {Object} paymentData 
 * @returns {Promise<Object>}
 */
export async function logPayment(contractId, paymentData) {
  try {
    // Verwende Admin-Client für Payment-Logs
    const client = supabaseAdmin || supabase
    
    const logEntry = {
      contract_id: contractId,
      payment_provider: paymentData.provider || 'stripe',
      provider_transaction_id: paymentData.transaction_id,
      amount: parseFloat(paymentData.amount),
      currency: paymentData.currency || 'EUR',
      status: paymentData.status,
      provider_response: paymentData.response || {},
      error_message: paymentData.error_message || null,
      created_at: new Date().toISOString()
    }
    
    const { data, error } = await client
      .from('payment_logs')
      .insert([logEntry])
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error logging payment:', error)
    throw new Error(`Payment-Log fehlgeschlagen: ${error.message}`)
  }
}

/**
 * Payment-Status aktualisieren
 * @param {string} logId 
 * @param {string} status 
 * @param {Object} additionalData 
 * @returns {Promise<Object>}
 */
export async function updatePaymentLog(logId, status, additionalData = {}) {
  try {
    const client = supabaseAdmin || supabase
    
    const updateData = {
      status,
      updated_at: new Date().toISOString(),
      ...additionalData
    }
    
    const { data, error } = await client
      .from('payment_logs')
      .update(updateData)
      .eq('id', logId)
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error updating payment log:', error)
    throw new Error(`Payment-Log-Update fehlgeschlagen: ${error.message}`)
  }
}

/**
 * Payment-Logs für Vertrag abrufen
 * @param {string} contractId 
 * @returns {Promise<Array>}
 */
export async function getPaymentLogs(contractId) {
  try {
    const client = supabaseAdmin || supabase
    
    const { data, error } = await client
      .from('payment_logs')
      .select('*')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching payment logs:', error)
    return []
  }
}
