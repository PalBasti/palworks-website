// lib/supabase/newsletterService.js - NEUE DATEI
import { supabase } from './supabase'

/**
 * Subscribe email to newsletter
 */
export async function subscribeToNewsletter(email) {
  try {
    // Check if already subscribed
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, is_active')
      .eq('email', email.toLowerCase().trim())
      .single()
    
    if (existing) {
      if (existing.is_active) {
        return { success: true, alreadySubscribed: true }
      } else {
        // Reactivate subscription
        const { error: updateError } = await supabase
          .from('newsletter_subscribers')
          .update({ 
            is_active: true,
            resubscribed_at: new Date().toISOString()
          })
          .eq('id', existing.id)
        
        if (updateError) throw updateError
        return { success: true, reactivated: true }
      }
    }
    
    // Create new subscription
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: email.toLowerCase().trim(),
        is_active: true,
        subscribed_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return { success: true, data }
    
  } catch (error) {
    console.error('Error subscribing to newsletter:', error)
    // Graceful fallback - don't break the form if newsletter fails
    return { success: false, error: error.message }
  }
}
