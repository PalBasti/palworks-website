// lib/supabase/newsletterService.js
import { supabase, supabaseAdmin } from './supabase';

/**
 * Newsletter Service - Verwaltung von E-Mail-Abonnements
 * Kompatibel mit bestehender newsletter_subscribers Tabelle
 */

// Newsletter-Anmeldung (mit Duplikat-Behandlung)
export async function subscribeToNewsletter(email, source = 'website', contractType = null) {
  try {
    if (!email || typeof email !== 'string') {
      throw new Error('Valid email is required');
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // E-Mail-Format validieren
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      throw new Error('Invalid email format');
    }

    // Prüfen ob bereits angemeldet
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, is_active, unsubscribed_at')
      .eq('email', normalizedEmail)
      .single();

    if (existing) {
      if (existing.is_active) {
        // Bereits aktiv angemeldet
        return { 
          success: true, 
          alreadySubscribed: true,
          message: 'E-Mail ist bereits für den Newsletter angemeldet'
        };
      } else {
        // Reaktivierung einer abgemeldeten E-Mail
        const { data, error } = await supabase
          .from('newsletter_subscribers')
          .update({
            is_active: true,
            resubscribed_at: new Date().toISOString(),
            source: source,
            contract_type: contractType
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;

        return { 
          success: true, 
          reactivated: true,
          subscriber: data,
          message: 'Newsletter-Anmeldung reaktiviert'
        };
      }
    }

    // Neue Anmeldung
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert([{
        email: normalizedEmail,
        is_active: true,
        source: source,
        contract_type: contractType,
        subscribed_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      // Duplikat-Fehler behandeln (Race-Condition)
      if (error.code === '23505') {
        return { 
          success: true, 
          alreadySubscribed: true,
          message: 'E-Mail ist bereits für den Newsletter angemeldet'
        };
      }
      throw error;
    }

    console.log('Newsletter subscription created:', data.id);
    return { 
      success: true, 
      subscriber: data,
      message: 'Erfolgreich für Newsletter angemeldet'
    };

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return { 
      success: false, 
      error: error.message,
      message: 'Newsletter-Anmeldung fehlgeschlagen'
    };
  }
}

// Newsletter-Status abrufen
export async function getNewsletterStatus(email) {
  try {
    if (!email) {
      throw new Error('Email is required');
    }

    const normalizedEmail = email.toLowerCase().trim();

    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', normalizedEmail)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Keine Daten gefunden
        return { success: true, status: 'not_subscribed' };
      }
      throw error;
    }

    return { 
      success: true, 
      status: data.is_active ? 'subscribed' : 'unsubscribed',
      subscriber: data
    };

  } catch (error) {
    console.error('Newsletter status check error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Newsletter abmelden
export async function unsubscribeFromNewsletter(email) {
  try {
    if (!email) {
      throw new Error('Email is required');
    }

    const normalizedEmail = email.toLowerCase().trim();

    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .update({
        is_active: false,
        unsubscribed_at: new Date().toISOString()
      })
      .eq('email', normalizedEmail)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // E-Mail war nicht angemeldet
        return { 
          success: true, 
          message: 'E-Mail war nicht für Newsletter angemeldet'
        };
      }
      throw error;
    }

    console.log('Newsletter unsubscribed:', normalizedEmail);
    return { 
      success: true, 
      subscriber: data,
      message: 'Erfolgreich vom Newsletter abgemeldet'
    };

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Newsletter-Statistiken (für Admin-Dashboard)
export async function getNewsletterStats() {
  try {
    // Verwende Admin-Client für Statistiken
    const client = supabaseAdmin || supabase;

    // Gesamtanzahl aktive Abonnenten
    const { count: activeCount, error: activeError } = await client
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (activeError) throw activeError;

    // Gesamtanzahl jemals angemeldet
    const { count: totalCount, error: totalError } = await client
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    // Verteilung nach Quelle
    const { data: sourceStats, error: sourceError } = await client
      .from('newsletter_subscribers')
      .select('source')
      .eq('is_active', true);

    if (sourceError) throw sourceError;

    // Verteilung nach Vertragstyp
    const { data: contractStats, error: contractError } = await client
      .from('newsletter_subscribers')
      .select('contract_type')
      .eq('is_active', true)
      .not('contract_type', 'is', null);

    if (contractError) throw contractError;

    // Statistiken berechnen
    const sourceDistribution = sourceStats.reduce((acc, sub) => {
      acc[sub.source || 'unknown'] = (acc[sub.source || 'unknown'] || 0) + 1;
      return acc;
    }, {});

    const contractTypeDistribution = contractStats.reduce((acc, sub) => {
      acc[sub.contract_type] = (acc[sub.contract_type] || 0) + 1;
      return acc;
    }, {});

    return {
      success: true,
      stats: {
        active: activeCount,
        total: totalCount,
        unsubscribed: totalCount - activeCount,
        sourceDistribution,
        contractTypeDistribution
      }
    };

  } catch (error) {
    console.error('Newsletter stats error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Utility: E-Mail-Validierung
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'E-Mail ist erforderlich' };
  }

  const normalizedEmail = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(normalizedEmail)) {
    return { isValid: false, error: 'Ungültiges E-Mail-Format' };
  }

  if (normalizedEmail.length > 254) {
    return { isValid: false, error: 'E-Mail ist zu lang' };
  }

  return { isValid: true, email: normalizedEmail };
}
