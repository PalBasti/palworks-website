// lib/supabase/paymentService.js
import { supabase } from './client';

/**
 * Payment Service - Für Payment-Logging und Stripe-Integration
 * Verwaltet payment_logs Tabelle für Transparenz und Debugging
 */

// Payment-Versuch loggen
export async function logPaymentAttempt(paymentData) {
  try {
    const logEntry = {
      contract_id: paymentData.contractId,
      payment_intent_id: paymentData.paymentIntentId,
      amount: paymentData.amount,
      currency: paymentData.currency || 'eur',
      payment_method: paymentData.paymentMethod || 'card',
      status: paymentData.status || 'pending',
      stripe_response: paymentData.stripeResponse || {},
      customer_email: paymentData.customerEmail,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('payment_logs')
      .insert([logEntry])
      .select()
      .single();

    if (error) {
      console.error('Error logging payment attempt:', error);
      throw new Error('Failed to log payment attempt');
    }

    console.log('Payment attempt logged:', data.id);
    return { success: true, log: data };
  } catch (error) {
    console.error('Payment logging error:', error);
    return { success: false, error: error.message };
  }
}

// Payment-Status aktualisieren
export async function updatePaymentStatus(paymentIntentId, status, stripeResponse = {}) {
  try {
    if (!paymentIntentId || !status) {
      throw new Error('Payment Intent ID and status are required');
    }

    const updates = {
      status,
      stripe_response: stripeResponse,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('payment_logs')
      .update(updates)
      .eq('payment_intent_id', paymentIntentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating payment status:', error);
      throw new Error('Failed to update payment status');
    }

    console.log('Payment status updated:', { paymentIntentId, status });
    return { success: true, log: data };
  } catch (error) {
    console.error('Payment status update error:', error);
    return { success: false, error: error.message };
  }
}

// Payment-Logs für einen Vertrag abrufen
export async function getPaymentLogs(contractId) {
  try {
    if (!contractId) {
      throw new Error('Contract ID is required');
    }

    const { data, error } = await supabase
      .from('payment_logs')
      .select('*')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payment logs:', error);
      throw new Error('Failed to fetch payment logs');
    }

    return { success: true, logs: data };
  } catch (error) {
    console.error('Payment logs fetch error:', error);
    return { success: false, error: error.message };
  }
}

// Payment-Log nach Stripe Payment Intent ID suchen
export async function getPaymentLogByIntentId(paymentIntentId) {
  try {
    if (!paymentIntentId) {
      throw new Error('Payment Intent ID is required');
    }

    const { data, error } = await supabase
      .from('payment_logs')
      .select('*')
      .eq('payment_intent_id', paymentIntentId)
      .single();

    if (error) {
      console.error('Error fetching payment log:', error);
      throw new Error('Payment log not found');
    }

    return { success: true, log: data };
  } catch (error) {
    console.error('Payment log fetch error:', error);
    return { success: false, error: error.message };
  }
}

// Fehlgeschlagene Payments abrufen (für Monitoring)
export async function getFailedPayments(limit = 50) {
  try {
    const { data, error } = await supabase
      .from('payment_logs')
      .select('*')
      .eq('status', 'failed')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching failed payments:', error);
      throw new Error('Failed to fetch failed payments');
    }

    return { success: true, logs: data };
  } catch (error) {
    console.error('Failed payments fetch error:', error);
    return { success: false, error: error.message };
  }
}

// Payment-Statistiken
export async function getPaymentStats(startDate = null, endDate = null) {
  try {
    let query = supabase.from('payment_logs').select('*');

    // Datumsfilter anwenden
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching payment stats:', error);
      throw new Error('Failed to fetch payment stats');
    }

    // Statistiken berechnen
    const stats = {
      total: data.length,
      successful: data.filter(log => log.status === 'succeeded').length,
      failed: data.filter(log => log.status === 'failed').length,
      pending: data.filter(log => log.status === 'pending').length,
      totalAmount: data
        .filter(log => log.status === 'succeeded')
        .reduce((sum, log) => sum + (log.amount || 0), 0),
      averageAmount: 0
    };

    // Durchschnittsbetrag berechnen
    if (stats.successful > 0) {
      stats.averageAmount = stats.totalAmount / stats.successful;
    }

    return { success: true, stats };
  } catch (error) {
    console.error('Payment stats error:', error);
    return { success: false, error: error.message };
  }
}

// Utility: Stripe-Fehler in lesbare Nachrichten umwandeln
export function formatStripeError(stripeError) {
  const errorMessages = {
    'card_declined': 'Ihre Karte wurde abgelehnt. Bitte versuchen Sie eine andere Zahlungsmethode.',
    'insufficient_funds': 'Nicht ausreichende Deckung. Bitte prüfen Sie Ihr Konto.',
    'incorrect_cvc': 'Die Kartenprüfnummer ist falsch. Bitte prüfen Sie die CVC.',
    'expired_card': 'Ihre Karte ist abgelaufen. Bitte verwenden Sie eine gültige Karte.',
    'processing_error': 'Ein Fehler ist bei der Verarbeitung aufgetreten. Bitte versuchen Sie es erneut.',
    'incorrect_number': 'Die Kartennummer ist falsch. Bitte prüfen Sie die Nummer.'
  };

  return errorMessages[stripeError.code] || stripeError.message || 'Ein unbekannter Fehler ist aufgetreten.';
}

// Utility: Payment-Intent für Logs formatieren
export function formatPaymentIntentForLog(paymentIntent, contractId, customerEmail) {
  return {
    contractId,
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount / 100, // Stripe verwendet Cents
    currency: paymentIntent.currency,
    status: paymentIntent.status,
    paymentMethod: paymentIntent.payment_method_types?.[0] || 'card',
    stripeResponse: {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      created: paymentIntent.created
    },
    customerEmail
  };
}
