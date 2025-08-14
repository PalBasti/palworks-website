// pages/api/stripe/create-payment-intent.js
import Stripe from 'stripe';
import { getContract, updateContract } from '../../../lib/supabase/contractService';
import { createPaymentLogFromIntent } from '../../../lib/supabase/paymentService';

// Stripe initialisieren
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export default async function handler(req, res) {
  console.log('💳 Payment Intent API called:', req.method);

  // Nur POST-Requests erlauben
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are allowed'
    });
  }

  try {
    const { contractId, contract_id } = req.body;
    
    // Support für beide Parameter-Namen
    const finalContractId = contractId || contract_id;

    console.log('📋 Request body:', req.body);
    console.log('🆔 Contract ID:', finalContractId);

    // Input-Validierung
    if (!finalContractId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'contractId is required'
      });
    }

    // Stripe Secret Key prüfen
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY not configured');
      return res.status(500).json({
        success: false,
        error: 'Payment configuration error',
        message: 'Stripe not properly configured'
      });
    }

    console.log('🔍 Loading contract from database...');

    // Contract aus Datenbank laden
    const contractResult = await getContract(finalContractId);
    if (!contractResult.success) {
      console.error('❌ Contract not found:', contractResult.error);
      return res.status(404).json({
        success: false,
        error: 'Contract not found',
        message: contractResult.error
      });
    }

    const contract = contractResult.contract;
    console.log('📄 Contract loaded:', {
      id: contract.id,
      type: contract.contract_type,
      amount: contract.total_amount,
      status: contract.status
    });

    // Validierung: Contract muss draft status haben
    if (contract.status !== 'draft') {
      return res.status(400).json({
        success: false,
        error: 'Invalid contract status',
        message: `Contract status is ${contract.status}, must be draft for payment`
      });
    }

    // Validierung: Total amount muss vorhanden sein
    if (!contract.total_amount || contract.total_amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount',
        message: 'Contract must have a valid total amount'
      });
    }

    // Bereits vorhandenen Payment Intent prüfen
    if (contract.payment_intent_id) {
      console.log('⚠️ Contract already has payment intent:', contract.payment_intent_id);
      
      try {
        // Bestehenden Payment Intent von Stripe abrufen
        const existingPaymentIntent = await stripe.paymentIntents.retrieve(contract.payment_intent_id);
        
        if (existingPaymentIntent.status === 'requires_payment_method') {
          console.log('✅ Reusing existing payment intent');
          return res.status(200).json({
            success: true,
            payment_intent: {
              id: existingPaymentIntent.id,
              client_secret: existingPaymentIntent.client_secret,
              status: existingPaymentIntent.status
            },
            amount: contract.total_amount,
            currency: 'eur',
            reused: true
          });
        }
      } catch (stripeError) {
        console.log('⚠️ Existing payment intent invalid, creating new one');
      }
    }

    console.log('💰 Creating new Stripe Payment Intent...');

    // Payment Intent bei Stripe erstellen
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(contract.total_amount * 100), // Stripe erwartet Cents
      currency: 'eur',
      payment_method_types: ['card'],
      metadata: {
        contract_id: finalContractId,
        contract_type: contract.contract_type,
        customer_email: contract.customer_email
      },
      description: `${contract.contract_type} - PalWorks Contract #${finalContractId.slice(0, 8)}`,
      receipt_email: contract.customer_email
    });

    console.log('✅ Stripe Payment Intent created:', paymentIntent.id);

    // Payment Intent ID im Contract speichern
    console.log('💾 Updating contract with payment intent...');
    const updateResult = await updateContract(finalContractId, {
      payment_intent_id: paymentIntent.id,
      payment_status: 'pending'
    });

    if (!updateResult.success) {
      console.error('❌ Failed to update contract:', updateResult.error);
      
      // Payment Intent stornieren bei Datenbankfehler
      try {
        await stripe.paymentIntents.cancel(paymentIntent.id);
        console.log('🚫 Payment intent canceled due to database error');
      } catch (cancelError) {
        console.error('❌ Failed to cancel payment intent:', cancelError);
      }
      
      return res.status(500).json({
        success: false,
        error: 'Database error',
        message: 'Failed to associate payment with contract'
      });
    }

    console.log('✅ Contract updated with payment intent');

    // Payment-Versuch loggen
    try {
      const logResult = await createPaymentLogFromIntent(paymentIntent, finalContractId);
      if (!logResult.success) {
        console.warn('⚠️ Failed to log payment attempt:', logResult.error);
        // Nicht kritisch - Payment kann trotzdem fortfahren
      } else {
        console.log('✅ Payment attempt logged');
      }
    } catch (logError) {
      console.warn('⚠️ Payment logging error:', logError.message);
    }

    // Erfolgreiche Antwort
    console.log('🎉 Payment Intent successfully created and configured');
    return res.status(200).json({
      success: true,
      payment_intent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        status: paymentIntent.status
      },
      amount: contract.total_amount,
      currency: 'eur',
      contract_id: finalContractId
    });

  } catch (error) {
    console.error('❌ Payment Intent creation error:', error.message);
    console.error('❌ Stack trace:', error.stack);

    // Stripe-spezifische Fehler behandeln
    if (error.type) {
      switch (error.type) {
        case 'StripeCardError':
          return res.status(400).json({
            success: false,
            error: 'Card error',
            message: error.message
          });
        case 'StripeInvalidRequestError':
          return res.status(400).json({
            success: false,
            error: 'Invalid request',
            message: error.message
          });
        case 'StripeAPIError':
          return res.status(500).json({
            success: false,
            error: 'Stripe API error',
            message: 'Payment processing temporarily unavailable'
          });
        case 'StripeConnectionError':
          return res.status(500).json({
            success: false,
            error: 'Network error',
            message: 'Payment processing temporarily unavailable'
          });
      }
    }

    // Allgemeine Fehler
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred during payment processing',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
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
};
