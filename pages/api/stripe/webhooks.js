// pages/api/stripe/webhooks.js
import Stripe from 'stripe'
import { buffer } from 'micro'
import { webhookUtils } from '../../../lib/stripe/subscriptionService'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

// Disable body parsing for webhooks
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const buf = await buffer(req)
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error.message)
    return res.status(400).json({ error: `Webhook signature verification failed: ${error.message}` })
  }

  console.log(`🔔 Webhook received: ${event.type}`)

  try {
    // Process the webhook event
    const result = await webhookUtils.processWebhookEvent(event)
    
    if (!result.success) {
      console.error(`Failed to process webhook ${event.type}:`, result.error)
      return res.status(500).json({ error: result.error })
    }

    console.log(`✅ Webhook ${event.type} processed successfully`)
    res.status(200).json({ received: true })

  } catch (error) {
    console.error(`Error processing webhook ${event.type}:`, error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
}