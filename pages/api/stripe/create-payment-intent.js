// pages/api/stripe/create-payment-intent.js
import Stripe from 'stripe';
import { getContract, updateContract } from '../../../lib/supabase/contractService';
import { logPaymentAttempt, formatPaymentIntentForLog } from '../../../lib/supabase/paymentService';

// Stripe initialisieren
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export default async function handler(req, res) {
  // Nur POST-Requests erlauben
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are allowed'
    });
  }

  try {
    const { contractId } = req.body;

    // Input-Validierung
    if (!contractId) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Contract ID is required'
      });
    }

    console.log('Creating payment intent for contract:', contractId);

    // Contract aus Datenbank laden
    const contractResult = await getContract(contractId);
    if (!contractResult.success) {
      return res.status(404).json({
        error: 'Contract not found',
        message: contractResult.error
      });
    }

    const contract = contractResult.contract;

    // Validierung: Contract muss draft status haben
    if (contract.status !== 'draft') {
      return res.status(400).json({
        error: 'Invalid contract status',
        message: 'Contract must be in draft status for payment'
      });
    }

    // Validierung: Total amount muss vorhanden sein
    if (!contract.total_amount || contract.total_amount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount',
        message: 'Contract must have a valid total amount'
      });
    }

    // Payment Intent bei Stripe erstellen
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(contract.total_amount * 100), // Stripe erwartet Cents
      currency: 'eur',
      payment_method_types: ['card'],
      metadata: {
        contract_id: contractId,
        contract_type: contract.contract_type,
        customer_email: contract.customer_email
      },
      description: `${contract.contract_type} - PalWorks Contract #${contractId}`,
      receipt_email: contract.customer_email
    });

    console.log('Stripe Payment Intent created:', paymentIntent.id);

    // Payment Intent ID im Contract speichern
    const updateResult = await updateContract(contractId, {
      payment_intent_id: paymentIntent.id,
      payment_status: 'pending'
    });

    if (!updateResult.success) {
      console.error('Failed to update contract with payment intent:', updateResult.error);
      // Payment Intent stornieren bei Datenbankfehler
      await stripe.paymentIntents.cancel(paymentIntent.id);
      
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to associate payment with contract'
      });
    }

    // Payment-Versuch loggen
    const logData = formatPaymentIntentForLog(paymentIntent, contractId, contract.customer_email);
    const logResult = await logPaymentAttempt(logData);
    
    if (!logResult.success) {
      console.warn('Failed to log payment attempt:', logResult.error);
      // Nicht kritisch - Payment kann trotzdem fortfahren
    }

    // Erfolgreiche Antwort
    res.status(200).json({
      success: true,
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      amount: contract.total_amount,
      currency: 'eur'
    });

  } catch (error) {
    console.error('Payment Intent creation error:', error);

    // Stripe-spezifische Fehler behandeln
    if (error.type === 'StripeCardError') {
      return res.status(400).json({
        error: 'Card error',
        message: error.message
      });
    } else if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        error: 'Invalid request',
        message: error.message
      });
    } else if (error.type === 'StripeAPIError') {
      return res.status(500).json({
        error: 'Stripe API error',
        message: 'Payment processing temporarily unavailable'
      });
    } else if (error.type === 'StripeConnectionError') {
      return res.status(500).json({
        error: 'Network error',
        message: 'Payment processing temporarily unavailable'
      });
    }

    // Allgemeine Fehler
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred during payment processing'
    });
  }
}

// Konfiguration für größere Request-Bodies
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}
