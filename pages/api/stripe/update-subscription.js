// pages/api/stripe/update-subscription.js
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { subscriptionId, newPriceId } = req.body

    // Validation
    if (!subscriptionId || !newPriceId) {
      return res.status(400).json({
        error: 'Missing required fields: subscriptionId, newPriceId'
      })
    }

    // Hole aktuelle Subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' })
    }

    // Update Subscription
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPriceId,
      }],
      proration_behavior: 'create_prorations',
      billing_cycle_anchor: 'unchanged'
    })

    res.status(200).json({ subscription: updatedSubscription })

  } catch (error) {
    console.error('Error updating subscription:', error)
    res.status(500).json({ 
      error: 'Failed to update subscription',
      details: error.message 
    })
  }
}