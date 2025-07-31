import { supabase } from './supabase'

/**
 * Newsletter-Anmeldung
 * @param {string} email 
 * @param {string|null} contractType 
 * @param {string} source 
 * @returns {Promise<Object>}
 */
export async function subscribeToNewsletter(email, contractType = null, source = 'website') {
  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert([{
        email: email.toLowerCase().trim(),
        contract_type: contractType,
        source,
        subscribed_at: new Date().toISOString(),
        is_active: true
      }])
      .select()
    
    if (error) {
      // Falls E-Mail bereits existiert, ignorieren
      if (error.code === '23505') {
        return { success: true, message: 'E-Mail bereits im Newsletter registriert' }
      }
      throw error
    }
    
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Error subscribing to newsletter:', error)
    throw new Error(`Newsletter-Anmeldung fehlgeschlagen: ${error.message}`)
  }
}

/**
 * Newsletter-Status prüfen
 * @param {string} email 
 * @returns {Promise<Object|null>}
 */
export async function getNewsletterStatus(email) {
  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single()
    
    if (error) return null
    return data
  } catch (error) {
    console.error('Error checking newsletter status:', error)
    return null
  }
}
