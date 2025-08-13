// lib/supabase/newsletterService.js - Kompatibel mit bestehenden Komponenten
import { supabase } from './supabase'

/**
 * Newsletter-Anmeldung (BESTEHENDE API kompatibel)
 * @param {string} email 
 * @param {string} source 
 * @param {string} contractType 
 * @returns {Promise<Object>}
 */
export async function subscribeToNewsletter(email, source = 'website', contractType = null) {
  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert([{
        email: email.toLowerCase().trim(),
        source,
        contract_type: contractType,
        is_active: true,
        subscribed_at: new Date().toISOString()
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
    return { success: false, error: error.message }
  }
}

/**
 * Newsletter-Status prüfen (NEUE FUNKTION)
 * @param {string} email 
 * @returns {Promise<Object>}
 */
export async function getNewsletterStatus(email) {
  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: true, status: 'not_subscribed' }
      }
      throw error
    }

    return { 
      success: true, 
      status: data.is_active ? 'subscribed' : 'unsubscribed',
      data 
    }
  } catch (error) {
    console.error('Newsletter status error:', error)
    return { success: false, error: error.message }
  }
}
