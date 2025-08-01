// pages/api/stripe/create-payment-intent.js
import Stripe from 'stripe';
import { getContract, updateContract } from '@/lib/supabase/contractService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { contractId, returnUrl } = req.body;

    if (!contractId) {
      return res.status(400).json({ error: 'Contract ID is required' });
    }

    // Get contract from database
    const contract = await getContract(contractId);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Check if contract is already paid
    if (contract.payment_status === 'paid') {
      return res.status(400).json({ error: 'Contract already paid' });
    }

    // Calculate amount in cents (Stripe expects cents)
    const amount = Math.round(contract.total_amount * 100);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        contractId: contract.id,
        contractType: contract.contract_type,
        customerEmail: contract.customer_email,
      },
      description: `PalWorks ${getContractDisplayName(contract.contract_type)} - Contract #${contract.id}`,
      receipt_email: contract.customer_email,
    });

    // Update contract with payment intent ID
    await updateContract(contract.id, {
      payment_intent_id: paymentIntent.id,
      payment_status: 'pending'
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: contract.total_amount,
      currency: 'EUR'
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

function getContractDisplayName(contractType) {
  switch (contractType) {
    case 'untermietvertrag': return 'Untermietvertrag';
    case 'garage': return 'Garage/Stellplatz-Mietvertrag';
    case 'wg_untermietvertrag': return 'WG-Untermietvertrag';
    default: return 'Vertrag';
  }
}
