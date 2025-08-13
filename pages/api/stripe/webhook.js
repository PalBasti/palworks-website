// pages/api/stripe/webhook.js
import Stripe from 'stripe';
import { buffer } from 'micro';
import { updateContractPaymentStatus } from '../../../lib/supabase/contractService';
import { updatePaymentStatus, getPaymentLogByIntentId } from '../../../lib/supabase/paymentService';

// Stripe initialisieren
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
  // Nur POST-Requests erlauben
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let event;

  try {
    // Request-Body als Buffer lesen
    const rawBody = await buffer(req);
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      console.error('Missing Stripe signature');
      return res.status(400).json({ error: 'Missing Stripe signature' });
    }

    if (!webhookSecret) {
      console.error('Missing webhook secret in environment');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    // Event von Stripe verifizieren
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    console.log('Webhook event received:', event.type, event.id);

  } catch (error) {
    console.error('Webhook signature verification failed:', error.message);
    return res.status(400).json({ 
      error: 'Webhook signature verification failed',
      message: error.message 
    });
  }

  try {
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
        console.log('Unhandled event type:', event.type);
        break;
    }

    // Erfolgreiche Verarbeitung bestätigen
    res.status(200).json({ 
      received: true,
      event_type: event.type,
      event_id: event.id
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ 
      error: 'Webhook processing failed',
      message: error.message 
    });
  }
}

// Payment erfolgreich
async function handlePaymentSucceeded(paymentIntent) {
  console.log('Processing successful payment:', paymentIntent.id);

  try {
    const contractId = paymentIntent.metadata?.contract_id;
    
    if (!contractId) {
      console.error('No contract ID in payment intent metadata');
      return;
    }

    // Contract-Status auf 'paid' setzen
    const contractResult = await updateContractPaymentStatus(
      contractId, 
      'paid', 
      paymentIntent.id
    );

    if (!contractResult.success) {
      console.error('Failed to update contract status:', contractResult.error);
      return;
    }

    // Payment-Log aktualisieren
    const logResult = await updatePaymentStatus(
      paymentIntent.id, 
      'succeeded',
      {
        amount_received: paymentIntent.amount_received,
        charges: paymentIntent.charges?.data || [],
        receipt_email: paymentIntent.receipt_email
      }
    );

    if (!logResult.success) {
      console.warn('Failed to update payment log:', logResult.error);
    }

    console.log('Payment processing completed for contract:', contractId);

    // TODO: Hier könnte E-Mail-Versand oder PDF-Generierung getriggert werden
    // await sendContractEmail(contractId);
    // await generateContractPDF(contractId);

  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

// Payment fehlgeschlagen
async function handlePaymentFailed(paymentIntent) {
  console.log('Processing failed payment:', paymentIntent.id);

  try {
    const contractId = paymentIntent.metadata?.contract_id;
    
    if (!contractId) {
      console.error('No contract ID in payment intent metadata');
      return;
    }

    // Contract-Status auf 'failed' setzen
    const contractResult = await updateContractPaymentStatus(
      contractId, 
      'failed', 
      paymentIntent.id
    );

    if (!contractResult.success) {
      console.error('Failed to update contract status:', contractResult.error);
      return;
    }

    // Payment-Log aktualisieren mit Fehlerdetails
    const logResult = await updatePaymentStatus(
      paymentIntent.id, 
      'failed',
      {
        last_payment_error: paymentIntent.last_payment_error,
        cancellation_reason: paymentIntent.cancellation_reason
      }
    );

    if (!logResult.success) {
      console.warn('Failed to update payment log:', logResult.error);
    }

    console.log('Failed payment processing completed for contract:', contractId);

    // TODO: Hier könnte eine Benachrichtigung an den Kunden gesendet werden
    // await sendPaymentFailedEmail(contractId, paymentIntent.last_payment_error);

  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

// Payment storniert
async function handlePaymentCanceled(paymentIntent) {
  console.log('Processing canceled payment:', paymentIntent.id);

  try {
    const contractId = paymentIntent.metadata?.contract_id;
    
    if (!contractId) {
      console.error('No contract ID in payment intent metadata');
      return;
    }

    // Contract-Status auf 'canceled' setzen
    const contractResult = await updateContractPaymentStatus(
      contractId, 
      'canceled', 
      paymentIntent.id
    );

    if (!contractResult.success) {
      console.error('Failed to update contract status:', contractResult.error);
      return;
    }

    // Payment-Log aktualisieren
    const logResult = await updatePaymentStatus(
      paymentIntent.id, 
      'canceled',
      {
        cancellation_reason: paymentIntent.cancellation_reason
      }
    );

    if (!logResult.success) {
      console.warn('Failed to update payment log:', logResult.error);
    }

    console.log('Canceled payment processing completed for contract:', contractId);

  } catch (error) {
    console.error('Error handling payment cancellation:', error);
  }
}

// Payment wird verarbeitet
async function handlePaymentProcessing(paymentIntent) {
  console.log('Processing payment in progress:', paymentIntent.id);

  try {
    // Payment-Log aktualisieren
    const logResult = await updatePaymentStatus(
      paymentIntent.id, 
      'processing',
      {
        processing_method: paymentIntent.processing?.metho
