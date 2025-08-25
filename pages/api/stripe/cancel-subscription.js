// pages/api/stripe/cancel-subscription.js
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { subscriptionId, immediately = false } = req.body

    // Validation
    if (!subscriptionId) {
      return res.status(400).json({
        error: 'Missing required field: subscriptionId'
      })
    }

    let cancelledSubscription

    if (immediately) {
      // Sofort kündigen
      cancelledSubscription = await stripe.subscriptions.cancel(subscriptionId)
    } else {
      // Am Ende der Abrechnungsperiode kündigen
      cancelledSubscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      })
    }

    res.status(200).json({ subscription: cancelledSubscription })

  } catch (error) {
    console.error('Error cancelling subscription:', error)
    res.status(500).json({ 
      error: 'Failed to cancel subscription',
      details: error.message 
    })
  }
}