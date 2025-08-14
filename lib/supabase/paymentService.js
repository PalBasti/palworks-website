// lib/supabase/paymentService.js
import { supabase, supabaseAdmin } from './supabase';

/**
 * Payment Service - Vollständige Implementation
 * Handhabt Payment-Logging und Status-Updates
 */

export async function logPaymentAttempt(paymentData) {
  try {
    console.log('💳 Logging payment attempt:', paymentData);

    // Admin Client verwenden
    const client = supabaseAdmin || supabase;

    const logEntry = {
      payment_intent_id: paymentData.payment_intent_id || paymentData.id,
      contract_id: paymentData.contract_id,
      amount: paymentData.amount || 0,
      currency: paymentData.currency || 'eur',
      status: paymentData.status || 'pending',
      provider: 'stripe',
      provider_data: paymentData.provider_data || paymentData,
      customer_email: paymentData.customer_email,
      created_at: new Date().toISOString()
    };

    const { data, error } = await client
      .from('payment_logs')
      .insert([logEntry])
      .select()
      .single();

    if (error) {
      console.error('❌ Payment log error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Payment attempt logged successfully');
    return { success: true, log: data };

  } catch (error) {
    console.error('❌ Payment logging error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function updatePaymentStatus(paymentIntentId, status, additionalData = {}) {
  try {
    if (!paymentIntentId || !status) {
      return { success: false, error: 'Payment Intent ID and status are required' };
    }

    console.log('🔄 Updating payment status:', paymentIntentId, 'to:', status);

    // Admin Client verwenden
    const client = supabaseAdmin || supabase;

    const updates = {
      status: status,
      updated_at: new Date().toISOString(),
      ...additionalData
    };

    // Spezielle Felder für verschiedene Status
    if (status === 'succeeded') {
      updates.completed_at = new Date().toISOString();
    } else if (status === 'failed') {
      updates.failed_at = new Date().toISOString();
    } else if (status === 'canceled') {
      updates.canceled_at = new Date().toISOString();
    }

    const { data, error } = await client
      .from('payment_logs')
      .update(updates)
      .eq('payment_intent_id', paymentIntentId)
      .select()
      .single();

    if (error) {
      console.error('❌ Payment status update error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Payment status updated successfully');
    return { success: true, log: data };

  } catch (error) {
    console.error('❌ Payment status update error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function getPaymentLogByIntentId(paymentIntentId) {
  try {
    if (!paymentIntentId) {
      return { success: false, error: 'Payment Intent ID is required' };
    }

    console.log('🔍 Fetching payment log for:', paymentIntentId);

    // Admin Client verwenden
    const client = supabaseAdmin || supabase;

    const { data, error } = await client
      .from('payment_logs')
      .select('*')
      .eq('payment_intent_id', paymentIntentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Kein Record gefunden
        return { success: false, error: 'Payment log not found' };
      }
      console.error('❌ Payment log fetch error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Payment log fetched successfully');
    return { success: true, log: data };

  } catch (error) {
    console.error('❌ Payment log fetch error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function getPaymentLogsByContract(contractId) {
  try {
    if (!contractId) {
      return { success: false, error: 'Contract ID is required' };
    }

    console.log('📄 Fetching payment logs for contract:', contractId);

    // Admin Client verwenden
    const client = supabaseAdmin || supabase;

    const { data, error } = await client
      .from('payment_logs')
      .select('*')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Payment logs fetch error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Payment logs fetched successfully:', data.length);
    return { success: true, logs: data };

  } catch (error) {
    console.error('❌ Payment logs fetch error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function createPaymentLogFromIntent(paymentIntent, contractId) {
  try {
    console.log('🔗 Creating payment log from Stripe Payment Intent');

    const paymentData = {
      payment_intent_id: paymentIntent.id,
      contract_id: contractId,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      customer_email: paymentIntent.receipt_email || paymentIntent.metadata?.customer_email,
      provider_data: {
        client_secret: paymentIntent.client_secret,
        created: paymentIntent.created,
        description: paymentIntent.description,
        metadata: paymentIntent.metadata
      }
    };

    return await logPaymentAttempt(paymentData);

  } catch (error) {
    console.error('❌ Error creating payment log from intent:', error.message);
    return { success: false, error: error.message };
  }
}

// Utility: Payment Intent für Webhook formatieren
export function formatPaymentIntentForLog(paymentIntent) {
  return {
    payment_intent_id: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: paymentIntent.status,
    customer_email: paymentIntent.receipt_email,
    provider_data: {
      charges: paymentIntent.charges?.data || [],
      payment_method: paymentIntent.payment_method,
      last_payment_error: paymentIntent.last_payment_error,
      metadata: paymentIntent.metadata,
      created: paymentIntent.created,
      updated: new Date().getTime() / 1000
    }
  };
}

// Utility: Payment-Status validieren
export function isValidPaymentStatus(status) {
  const validStatuses = [
    'pending',
    'processing',
    'succeeded',
    'failed',
    'canceled',
    'requires_action',
    'requires_confirmation'
  ];
  return validStatuses.includes(status);
}

// Utility: Payment-Statistiken abrufen
export async function getPaymentStats(timeframe = '30d') {
  try {
    console.log('📊 Fetching payment statistics for:', timeframe);

    // Admin Client verwenden
    const client = supabaseAdmin || supabase;

    // Zeitraum berechnen
    const now = new Date();
    const startDate = new Date();
    
    if (timeframe === '7d') {
      startDate.setDate(now.getDate() - 7);
    } else if (timeframe === '30d') {
      startDate.setDate(now.getDate() - 30);
    } else if (timeframe === '90d') {
      startDate.setDate(now.getDate() - 90);
    }

    const { data, error } = await client
      .from('payment_logs')
      .select('status, amount, created_at')
      .gte('created_at', startDate.toISOString());

    if (error) {
      console.error('❌ Payment stats error:', error);
      return { success: false, error: error.message };
    }

    // Statistiken berechnen
    const stats = {
      total_payments: data.length,
      successful_payments: data.filter(p => p.status === 'succeeded').length,
      failed_payments: data.filter(p => p.status === 'failed').length,
      total_amount: data
        .filter(p => p.status === 'succeeded')
        .reduce((sum, p) => sum + (p.amount || 0), 0),
      timeframe: timeframe
    };

    stats.success_rate = stats.total_payments > 0 
      ? (stats.successful_payments / stats.total_payments * 100).toFixed(2)
      : 0;

    console.log('✅ Payment statistics calculated:', stats);
    return { success: true, stats };

  } catch (error) {
    console.error('❌ Payment stats error:', error.message);
    return { success: false, error: error.message };
  }
}
