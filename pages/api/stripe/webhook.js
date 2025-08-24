// pages/api/stripe/webhook.js
import Stripe from 'stripe';
import { buffer } from 'micro'
import { updateContractPaymentStatus } from '../../../lib/supabase/contractService';
import { updatePaymentStatus } from '../../../lib/supabase/paymentService';

// Stripe initialisieren
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// WICHTIG: Raw Body für Webhook-Verification
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  console.log('🔔 Webhook called:', req.method, req.headers['stripe-signature'] ? 'with signature' : 'without signature');

  // Nur POST-Requests erlauben
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let event;

  try {
    // Raw Body als Buffer lesen (für Stripe Signature Verification)
    const buf = await buffer(req)
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      console.error('❌ Missing Stripe signature header');
      return res.status(400).json({ error: 'Missing Stripe signature' });
    }

    if (!webhookSecret) {
      console.error('❌ Missing STRIPE_WEBHOOK_SECRET in environment');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    console.log('🔐 Verifying webhook signature...');
    event = stripe.webhooks.constructEvent(buf, signature, webhookSecret);
    console.log('✅ Webhook signature verified - Event:', event.type, 'ID:', event.id);

  } catch (error) {
    console.error('❌ Webhook signature verification failed:', error.message);
    return res.status(400).json({ 
      error: 'Webhook signature verification failed',
      message: error.message 
    });
  }

  try {
    console.log('🚀 Processing webhook event:', event.type);
    
    // Event-Handler basierend auf Event-Typ
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object);
        break;

      case 'payment_intent.processing':
        await handlePaymentProcessing(event.data.object);
        break;

      default:
        console.log('ℹ️ Unhandled event type:', event.type);
        break;
    }

    // Erfolgreiche Verarbeitung bestätigen
    console.log('✅ Webhook processing completed successfully');
    res.status(200).json({ 
      received: true,
      event_type: event.type,
      event_id: event.id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error processing webhook:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Webhook processing failed',
      message: error.message,
      event_type: event.type,
      event_id: event.id
    });
  }
}

// ========================================
// EVENT HANDLERS
// ========================================

// Payment erfolgreich
async function handlePaymentSucceeded(paymentIntent) {
  console.log('💰 Processing successful payment:', paymentIntent.id);

  try {
    const contractId = paymentIntent.metadata?.contract_id;
    
    if (!contractId) {
      console.error('❌ No contract_id in payment intent metadata');
      console.log('Available metadata:', paymentIntent.metadata);
      return;
    }

    console.log('📄 Updating contract status for ID:', contractId);

    // 1. Contract-Status auf 'paid' setzen
    const contractResult = await updateContractPaymentStatus(
      contractId, 
      'paid', 
      paymentIntent.id
    );

    if (!contractResult.success) {
      console.error('❌ Failed to update contract status:', contractResult.error);
      throw new Error(`Contract update failed: ${contractResult.error}`);
    }

    console.log('✅ Contract status updated to paid');

    // 2. Payment-Log aktualisieren
    const logResult = await updatePaymentStatus(
      paymentIntent.id, 
      'succeeded',
      {
        amount_received: paymentIntent.amount_received,
        charges: paymentIntent.charges?.data || [],
        receipt_email: paymentIntent.receipt_email,
        updated_at: new Date().toISOString()
      }
    );

    if (!logResult.success) {
      console.warn('⚠️ Failed to update payment log (non-critical):', logResult.error);
    } else {
      console.log('✅ Payment log updated');
    }

    console.log('🎉 Payment processing completed successfully for contract:', contractId);

  } catch (error) {
    console.error('❌ Error in handlePaymentSucceeded:', error.message, error.stack);
    throw error; // Re-throw für globales Error-Handling
  }
}

// Payment fehlgeschlagen
async function handlePaymentFailed(paymentIntent) {
  console.log('💸 Processing failed payment:', paymentIntent.id);

  try {
    const contractId = paymentIntent.metadata?.contract_id;
    
    if (!contractId) {
      console.error('❌ No contract_id in payment intent metadata');
      return;
    }

    console.log('📄 Updating contract status for failed payment, Contract ID:', contractId);

    // 1. Contract-Status auf 'payment_failed' setzen
    const contractResult = await updateContractPaymentStatus(
      contractId, 
      'payment_failed', 
      paymentIntent.id
    );

    if (!contractResult.success) {
      console.error('❌ Failed to update contract status:', contractResult.error);
    } else {
      console.log('✅ Contract status updated to payment_failed');
    }

    // 2. Payment-Log mit Fehlerdetails aktualisieren
    const logResult = await updatePaymentStatus(
      paymentIntent.id, 
      'failed',
      {
        last_payment_error: paymentIntent.last_payment_error,
        failure_code: paymentIntent.last_payment_error?.code,
        failure_message: paymentIntent.last_payment_error?.message,
        updated_at: new Date().toISOString()
      }
    );

    if (!logResult.success) {
      console.warn('⚠️ Failed to update payment log:', logResult.error);
    } else {
      console.log('✅ Payment failure logged');
    }

    console.log('📝 Payment failure processing completed for contract:', contractId);

  } catch (error) {
    console.error('❌ Error in handlePaymentFailed:', error.message);
  }
}

// Payment storniert
async function handlePaymentCanceled(paymentIntent) {
  console.log('🚫 Processing canceled payment:', paymentIntent.id);

  try {
    const contractId = paymentIntent.metadata?.contract_id;
    
    if (!contractId) {
      console.error('❌ No contract_id in payment intent metadata');
      return;
    }

    // Contract-Status auf 'canceled' setzen
    const contractResult = await updateContractPaymentStatus(
      contractId, 
      'canceled', 
      paymentIntent.id
    );

    if (!contractResult.success) {
      console.error('❌ Failed to update contract status:', contractResult.error);
    } else {
      console.log('✅ Contract status updated to canceled');
    }

    // Payment-Log aktualisieren
    const logResult = await updatePaymentStatus(
      paymentIntent.id, 
      'canceled',
      {
        cancellation_reason: paymentIntent.cancellation_reason,
        canceled_at: new Date().toISOString()
      }
    );

    if (!logResult.success) {
      console.warn('⚠️ Failed to update payment log:', logResult.error);
    } else {
      console.log('✅ Payment cancellation logged');
    }

    console.log('🗑️ Payment cancellation processing completed for contract:', contractId);

  } catch (error) {
    console.error('❌ Error in handlePaymentCanceled:', error.message);
  }
}

// Payment wird verarbeitet
async function handlePaymentProcessing(paymentIntent) {
  console.log('⏳ Processing payment in progress:', paymentIntent.id);

  try {
    const contractId = paymentIntent.metadata?.contract_id;
    
    if (contractId) {
      // Optional: Contract-Status auf 'processing' setzen
      await updateContractPaymentStatus(contractId, 'processing', paymentIntent.id);
    }

    // Payment-Log aktualisieren
    const logResult = await updatePaymentStatus(
      paymentIntent.id, 
      'processing',
      {
        processing_method: paymentIntent.processing?.method || 'unknown',
        processing_type: paymentIntent.processing?.type || 'unknown',
        processing_started_at: new Date().toISOString()
      }
    );

    if (!logResult.success) {
      console.warn('⚠️ Failed to update payment log:', logResult.error);
    } else {
      console.log('✅ Payment processing status updated');
    }

  } catch (error) {
    console.error('❌ Error in handlePaymentProcessing:', error.message);
  }
}
