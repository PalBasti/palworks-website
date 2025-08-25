// pages/api/stripe/create-checkout-session.js
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      priceId,
      userId,
      customerEmail,
      planId,
      successUrl,
      cancelUrl,
      mode = 'subscription'
    } = req.body

    // Validation
    if (!priceId || !userId || !customerEmail) {
      return res.status(400).json({
        error: 'Missing required fields: priceId, userId, customerEmail'
      })
    }

    // Erstelle oder finde existierenden Customer
    let customer
    const existingCustomers = await stripe.customers.list({
      email: customerEmail,
      limit: 1
    })

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
    } else {
      customer = await stripe.customers.create({
        email: customerEmail,
        metadata: {
          userId: userId
        }
      })
    }

    // Erstelle Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: mode,
      payment_method_types: ['card', 'sepa_debit'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId,
        planId: planId,
        customerEmail: customerEmail
      },
      subscription_data: mode === 'subscription' ? {
        metadata: {
          userId: userId,
          planId: planId
        }
      } : undefined,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
        name: 'auto'
      },
      locale: 'de',
      // Steuern für Deutschland
      automatic_tax: {
        enabled: true,
      },
      // Erlaubt Promotional Codes
      allow_promotion_codes: true,
      // Custom Success Page Text
      custom_text: {
        submit: {
          message: 'Ihr Abonnement wird sofort aktiviert nach erfolgreicher Zahlung.'
        }
      }
    })

    res.status(200).json({ sessionId: session.id })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message 
    })
  }
}