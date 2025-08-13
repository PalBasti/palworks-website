// lib/supabase/paymentService.js
import { supabase, supabaseAdmin } from './supabase';

/**
 * Payment Service - Vollständige Version für Stripe-Integration
 * Einheitliches Return-Format für alle Funktionen
 */

/**
 * Payment-Versuch loggen
 * @param {Object} paymentData - Payment-Daten
 * @returns {Promise<Object>} { success: boolean, log?: Object, error?: string }
 */
export async function logPayment(paymentData) {
  try {
    const { data, error } = await supabase
      .from('payment_logs')
      .insert([{
        contract_id: paymentData.contractId,
        payment_intent_id: paymentData.paymentIntentId,
        amount: paymentData.amount,
        currency: paymentData.currency || 'eur',
        status: paymentData.status || 'pending',
        payment_method: paymentData.paymentMethod || 'card',
        stripe_response: paymentData.stripeResponse || {},
        customer_email: paymentData.customerEmail,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error logging payment:', error);
      return { success: false, error: 'Failed to log payment' };
    }

    return { success: true, log: data };
  } catch (error) {
    console.error('Payment logging error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Payment-Status aktualisieren
 * @param {string} paymentIntentId - Stripe Payment Intent ID
 * @param {string} status - Neuer Status
 * @param {Object} additionalData - Zusätzliche Daten (optional)
 * @returns {Promise<Object>} { success: boolean, log?: Object, error?: string }
 */
export async function updatePaymentLog(paymentIntentId, status, additionalData = {}) {
  try {
    const updateData = {
      status,
      updated_at: new Date().toISOString(),
      ...additionalData
    };

    const { data, error } = await supabase
      .from('payment_logs')
      .update(updateData)
      .eq('payment_intent_id', paymentIntentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating payment log:', error);
      return { success: false, error: 'Failed to update payment log' };
    }

    return { success: true, log: data };
  } catch (error) {
    console.error('Payment log update error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Payment-Logs für einen Vertrag abrufen
 * @param {string} contractId - Contract ID
 * @returns {Promise<Object>} { success: boolean, logs?: Array, error?: string }
 */
export async function getPaymentLogs(contractId) {
  try {
    if (!contractId) {
      return { success: false, error: 'Contract ID is required' };
    }

    const { data, error } = await supabase
      .from('payment_logs')
      .select('*')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payment logs:', error);
      return { success: false, error: 'Failed to fetch payment logs' };
    }

    return { success: true, logs: data || [] };
  } catch (error) {
    console.error('Payment logs fetch error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Payment-Log nach Stripe Payment Intent ID suchen
 * @param {string} paymentIntentId - Stripe Payment Intent ID
 * @returns {Promise<Object>} { success: boolean, log?: Object, error?: string }
 */
export async function getPaymentLogByIntentId(paymentIntentId) {
  try {
    if (!paymentIntentId) {
      return { success: false, error: 'Payment Intent ID is required' };
    }

    const { data, error } = await supabase
      .from('payment_logs')
      .select('*')
      .eq('payment_intent_id', paymentIntentId)
      .single();

    if (error) {
      console.error('Error fetching payment log:', error);
      return { success: false, error: 'Payment log not found' };
    }

    return { success: true, log: data };
  } catch (error) {
    console.error('Payment log fetch error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Fehlgeschlagene Payments abrufen (für Monitoring)
 * @param {number} limit - Anzahl der Ergebnisse (default: 50)
 * @returns {Promise<Object>} { success: boolean, logs?: Array, error?: string }
 */
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
      return { success: false, error: 'Failed to fetch failed payments' };
    }

    return { success: true, logs: data || [] };
  } catch (error) {
    console.error('Failed payments fetch error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Payment-Statistiken abrufen
 * @returns {Promise<Object>} { success: boolean, stats?: Object, error?: string }
 */
export async function getPaymentStats() {
  try {
    // Gesamtumsatz und -anzahl
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('payment_logs')
      .select('amount, status, created_at')
      .eq('status', 'paid');

    if (paymentsError) {
      return { success: false, error: 'Failed to fetch payment stats' };
    }

    const totalRevenue = paymentsData.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const totalPayments = paymentsData.length;

    // Status-Verteilung
    const { data: statusData, error: statusError } = await supabase
      .from('payment_logs')
      .select('status');

    if (statusError) {
      return { success: false, error: 'Failed to fetch payment status distribution' };
    }

    const statusCounts = statusData.reduce((acc, payment) => {
      acc[payment.status] = (acc[payment.status] || 0) + 1;
      return acc;
    }, {});

    const stats = {
      totalRevenue: totalRevenue.toFixed(2),
      totalPayments,
      successfulPayments: statusCounts.paid || 0,
      failedPayments: statusCounts.failed || 0,
      pendingPayments: statusCounts.pending || 0,
      successRate: totalPayments > 0 ? ((statusCounts.paid || 0) / totalPayments * 100).toFixed(1) : 0
    };

    return { success: true, stats };
  } catch (error) {
    console.error('Payment stats error:', error);
    return { success: false, error: error.message };
  }
}

// ===== SPEZIELLE FUNKTIONEN FÜR API-ENDPOINTS =====

/**
 * Payment-Versuch für API-Endpoints loggen
 * @param {Object} paymentData - Payment-Daten
 * @returns {Promise<Object>} { success: boolean, log?: Object, error?: string }
 */
export async function logPaymentAttempt(paymentData) {
  return await logPayment({
    ...paymentData,
    status: 'pending'
  });
}

/**
 * Payment-Status für API-Endpoints aktualisieren
 * @param {string} paymentIntentId - Stripe Payment Intent ID
 * @param {string} status - Neuer Status ('paid', 'failed', 'canceled')
 * @returns {Promise<Object>} { success: boolean, log?: Object, error?: string }
 */
export async function updatePaymentStatus(paymentIntentId, status) {
  return await updatePaymentLog(paymentIntentId, status, {
    processed_at: new Date().toISOString()
  });
}

/**
 * Stripe Payment Intent für Logs formatieren
 * @param {Object} paymentIntent - Stripe Payment Intent Objekt
 * @param {string} contractId - Contract ID
 * @param {string} customerEmail - Kunden-E-Mail
 * @returns {Object} Formatierte Payment-Daten
 */
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
      created: paymentIntent.created,
      client_secret: paymentIntent.client_secret
    },
    customerEmail
  };
}

/**
 * Stripe-Fehlercodes in benutzerfreundliche Nachrichten übersetzen
 * @param {Object} stripeError - Stripe Error Objekt
 * @returns {string} Benutzerfreundliche Fehlermeldung
 */
export function formatStripeError(stripeError) {
  const errorMessages = {
    'card_declined': 'Ihre Karte wurde abgelehnt. Bitte versuchen Sie eine andere Zahlungsmethode.',
    'expired_card': 'Ihre Karte ist abgelaufen. Bitte verwenden Sie eine gültige Karte.',
    'insufficient_funds': 'Unzureichende Deckung. Bitte prüfen Sie Ihr Konto.',
    'incorrect_cvc': 'Der CVC-Code ist falsch. Bitte prüfen Sie die Eingabe.',
    'processing_error': 'Ein Fehler bei der Verarbeitung ist aufgetreten. Bitte versuchen Sie es erneut.',
    'incorrect_number': 'Die Kartennummer ist falsch. Bitte prüfen Sie die Nummer.'
  };

  return errorMessages[stripeError.code] || stripeError.message || 'Ein unbekannter Fehler ist aufgetreten.';
}
