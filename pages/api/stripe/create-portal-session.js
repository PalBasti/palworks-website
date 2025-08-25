// pages/api/stripe/create-portal-session.js
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { customerId, returnUrl } = req.body

    // Validation
    if (!customerId) {
      return res.status(400).json({
        error: 'Missing required field: customerId'
      })
    }

    // Erstelle Customer Portal Session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${req.headers.origin}/profile`,
      locale: 'de'
    })

    res.status(200).json({ url: session.url })

  } catch (error) {
    console.error('Error creating portal session:', error)
    res.status(500).json({ 
      error: 'Failed to create portal session',
      details: error.message 
    })
  }
}