// pages/api/stripe/webhook.js
import Stripe from 'stripe';
import { buffer } from 'micro';
import { updateContractPaymentStatus } from '@/lib/supabase/contractService';
import { logPayment } from '@/lib/supabase/paymentService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Disable body parsing, need raw body for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const body = await buffer(req);
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
        
      case 'payment_intent.processing':
        await handlePaymentProcessing(event.data.object);
        break;
        
      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
    
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

async function handlePaymentSucceeded(paymentIntent) {
  const contractId = paymentIntent.metadata.contractId;
  
  if (!contractId) {
    console.error('No contract ID found in payment intent metadata');
    return;
  }

  try {
    // Update contract status
    await updateContractPaymentStatus(contractId, {
      payment_status: 'paid',
      status: 'paid',
      payment_intent_id: paymentIntent.id,
      paid_at: new Date().toISOString()
    });

    // Log successful payment
    await logPayment({
      contract_id: contractId,
      payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency.toUpperCase(),
      status: 'succeeded',
      payment_method: paymentIntent.payment_method_types?.[0] || 'unknown',
      stripe_event_id: paymentIntent.id,
      processed_at: new Date().toISOString()
    });

    console.log(`Payment succeeded for contract ${contractId}`);
    
    // TODO: Trigger email sending and PDF generation
    // await triggerContractEmail(contractId);
    
  } catch (error) {
    console.error('Error handling payment success:', error);
    throw error;
  }
}

async function handlePaymentFailed(paymentIntent) {
  const contractId = paymentIntent.metadata.contractId;
  
  if (!contractId) {
    console.error('No contract ID found in payment intent metadata');
    return;
  }

  try {
    // Update contract status
    await updateContractPaymentStatus(contractId, {
      payment_status: 'failed',
      payment_error: paymentIntent.last_payment_error?.message || 'Payment failed'
    });

    // Log failed payment
    await logPayment({
      contract_id: contractId,
      payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      status: 'failed',
      payment_method: paymentIntent.payment_method_types?.[0] || 'unknown',
      error_message: paymentIntent.last_payment_error?.message,
      stripe_event_id: paymentIntent.id,
      processed_at: new Date().toISOString()
    });

    console.log(`Payment failed for contract ${contractId}: ${paymentIntent.last_payment_error?.message}`);
    
  } catch (error) {
    console.error('Error handling payment failure:', error);
    throw error;
  }
}

async function handlePaymentProcessing(paymentIntent) {
  const contractId = paymentIntent.metadata.contractId;
  
  if (!contractId) return;

  try {
    await updateContractPaymentStatus(contractId, {
      payment_status: 'processing'
    });

    await logPayment({
      contract_id: contractId,
      payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      status: 'processing',
      payment_method: paymentIntent.payment_method_types?.[0] || 'unknown',
      stripe_event_id: paymentIntent.id,
      processed_at: new Date().toISOString()
    });

    console.log(`Payment processing for contract ${contractId}`);
    
  } catch (error) {
    console.error('Error handling payment processing:', error);
  }
}

async function handlePaymentCanceled(paymentIntent) {
  const contractId = paymentIntent.metadata.contractId;
  
  if (!contractId) return;

  try {
    await updateContractPaymentStatus(contractId, {
      payment_status: 'canceled'
    });

    await logPayment({
      contract_id: contractId,
      payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      status: 'canceled',
      payment_method: paymentIntent.payment_method_types?.[0] || 'unknown',
      stripe_event_id: paymentIntent.id,
      processed_at: new Date().toISOString()
    });

    console.log(`Payment canceled for contract ${contractId}`);
    
  } catch (error) {
    console.error('Error handling payment cancellation:', error);
  }
}
