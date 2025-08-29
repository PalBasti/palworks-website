// lib/stripe/subscriptionService.js
import { loadStripe } from '@stripe/stripe-js'
import { subscriptionService, profileService } from '../supabase/authService'
import { USER_ROLES, SUBSCRIPTION_STATUS } from '../supabase'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

/**
 * Stripe Subscription Service für Multi-Tier Platform
 * 
 * Features:
 * - Subscription Management
 * - Plan Upgrades/Downgrades
 * - Payment Processing
 * - Webhook Handling
 * - Integration mit Supabase
 */

// ===== SUBSCRIPTION PLANS =====

export const SUBSCRIPTION_PLANS = {
  FOUNDER: {
    id: 'founder',
    name: 'Founder',
    price: 99,
    currency: 'EUR',
    interval: 'month',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_FOUNDER_PRICE_ID || 'price_founder_monthly',
    features: [
      '25% Rabatt auf alle Verträge',
      'Erweiterte Template Bibliothek',
      'Priority Support (<4h)',
      'Gewerbemietvertrag (Exklusiv)'
    ],
    limits: {
      templatesPerMonth: 50,
      supportResponse: '4 hours'
    }
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 499,
    currency: 'EUR',
    interval: 'month',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_monthly',
    features: [
      'Alle Founder Features',
      'Custom Templates erstellen',
      'Multi-User Company Accounts',
      'Persönliche Rechtsberatung',
      'White-Label Branding',
      'Usage Analytics Dashboard'
    ],
    limits: {
      templatesPerMonth: 'unlimited',
      teamMembers: 10,
      customTemplates: 'unlimited',
      supportResponse: '1 hour'
    }
  }
}

// ===== SUBSCRIPTION MANAGEMENT =====

export const stripeSubscriptionService = {
  // Erstelle Checkout Session für Subscription
  async createCheckoutSession(planId, userId, customerEmail, successUrl, cancelUrl) {
    try {
      const plan = SUBSCRIPTION_PLANS[planId.toUpperCase()]
      if (!plan) {
        throw new Error(`Invalid plan: ${planId}`)
      }

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          userId,
          customerEmail,
          planId: plan.id,
          successUrl,
          cancelUrl,
          mode: 'subscription'
        }),
      })

      const { sessionId, error } = await response.json()
      
      if (error) {
        throw new Error(error)
      }

      // Redirect zu Stripe Checkout
      const stripe = await stripePromise
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }

      return { success: true }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      return { error: error.message }
    }
  },

  // Erstelle Customer Portal Session
  async createCustomerPortalSession(customerId, returnUrl) {
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          returnUrl,
        }),
      })

      const { url, error } = await response.json()
      
      if (error) {
        throw new Error(error)
      }

      // Redirect zu Stripe Customer Portal
      window.location.href = url

      return { success: true }
    } catch (error) {
      console.error('Error creating portal session:', error)
      return { error: error.message }
    }
  },

  // Hole aktuelle Subscription für User
  async getUserSubscription(userId) {
    try {
      const subscription = await subscriptionService.getUserSubscription(userId)
      return subscription
    } catch (error) {
      console.error('Error fetching user subscription:', error)
      return null
    }
  },

  // Update Subscription (upgrade/downgrade)
  async updateSubscription(subscriptionId, newPriceId) {
    try {
      const response = await fetch('/api/stripe/update-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
          newPriceId,
        }),
      })

      const { subscription, error } = await response.json()
      
      if (error) {
        throw new Error(error)
      }

      return { subscription, error: null }
    } catch (error) {
      console.error('Error updating subscription:', error)
      return { subscription: null, error: error.message }
    }
  },

  // Cancel Subscription
  async cancelSubscription(subscriptionId) {
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
        }),
      })

      const { subscription, error } = await response.json()
      
      if (error) {
        throw new Error(error)
      }

      return { subscription, error: null }
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      return { subscription: null, error: error.message }
    }
  },

  // Reaktiviere Subscription
  async reactivateSubscription(subscriptionId) {
    try {
      const response = await fetch('/api/stripe/reactivate-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
        }),
      })

      const { subscription, error } = await response.json()
      
      if (error) {
        throw new Error(error)
      }

      return { subscription, error: null }
    } catch (error) {
      console.error('Error reactivating subscription:', error)
      return { subscription: null, error: error.message }
    }
  }
}

// ===== PRICING UTILITIES =====

export const pricingUtils = {
  // Berechne Preis basierend auf User Role
  calculateContractPrice(basePrice, userRole) {
    switch (userRole) {
      case USER_ROLES.FOUNDER:
      case USER_ROLES.ENTERPRISE:
        return Math.round(basePrice * 0.75 * 100) / 100 // 25% Rabatt
      case USER_ROLES.PUBLIC:
      default:
        return basePrice
    }
  },

  // Format Preis für Anzeige
  formatPrice(price, currency = 'EUR') {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency,
    }).format(price)
  },

  // Berechne Ersparnis
  calculateSavings(originalPrice, discountedPrice) {
    return originalPrice - discountedPrice
  },

  // Get Plan Details
  getPlanDetails(planId) {
    return SUBSCRIPTION_PLANS[planId.toUpperCase()] || null
  },

  // Check if user can access feature based on plan
  canAccessFeature(userRole, feature) {
    const featureAccess = {
      'discounted_pricing': [USER_ROLES.FOUNDER, USER_ROLES.ENTERPRISE],
      'priority_support': [USER_ROLES.FOUNDER, USER_ROLES.ENTERPRISE],
      'extended_templates': [USER_ROLES.FOUNDER, USER_ROLES.ENTERPRISE],
      'custom_templates': [USER_ROLES.ENTERPRISE],
      'multi_user': [USER_ROLES.ENTERPRISE],
      'legal_consultation': [USER_ROLES.ENTERPRISE],
      'white_label': [USER_ROLES.ENTERPRISE],
      'analytics': [USER_ROLES.ENTERPRISE]
    }

    return featureAccess[feature]?.includes(userRole) || false
  }
}

// ===== SUBSCRIPTION HOOKS =====

/**
 * React Hook für Subscription Management
 */
export function useSubscription(user) {
  const [subscription, setSubscription] = React.useState(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (user?.id) {
      loadSubscription()
    } else {
      setSubscription(null)
      setLoading(false)
    }
  }, [user?.id])

  const loadSubscription = async () => {
    try {
      const sub = await stripeSubscriptionService.getUserSubscription(user.id)
      setSubscription(sub)
    } catch (error) {
      console.error('Error loading subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const subscribe = async (planId) => {
    const successUrl = `${window.location.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${window.location.origin}/subscription/cancelled`

    return await stripeSubscriptionService.createCheckoutSession(
      planId,
      user.id,
      user.email,
      successUrl,
      cancelUrl
    )
  }

  const manageBilling = async () => {
    if (!subscription?.stripe_customer_id) {
      throw new Error('No active subscription found')
    }

    const returnUrl = `${window.location.origin}/profile`
    return await stripeSubscriptionService.createCustomerPortalSession(
      subscription.stripe_customer_id,
      returnUrl
    )
  }

  const cancelSubscription = async () => {
    if (!subscription?.stripe_subscription_id) {
      throw new Error('No active subscription found')
    }

    const result = await stripeSubscriptionService.cancelSubscription(
      subscription.stripe_subscription_id
    )

    if (result.subscription) {
      await loadSubscription() // Reload subscription data
    }

    return result
  }

  return {
    subscription,
    loading,
    subscribe,
    manageBilling,
    cancelSubscription,
    reload: loadSubscription
  }
}

// ===== WEBHOOKS UTILITIES =====

export const webhookUtils = {
  // Verarbeite Stripe Webhook Events
  async processWebhookEvent(event) {
    switch (event.type) {
      case 'checkout.session.completed':
        return await this.handleCheckoutCompleted(event.data.object)
      
      case 'invoice.payment_succeeded':
        return await this.handlePaymentSucceeded(event.data.object)
      
      case 'invoice.payment_failed':
        return await this.handlePaymentFailed(event.data.object)
      
      case 'customer.subscription.updated':
        return await this.handleSubscriptionUpdated(event.data.object)
      
      case 'customer.subscription.deleted':
        return await this.handleSubscriptionCancelled(event.data.object)
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
        return { success: true }
    }
  },

  // Handle successful checkout
  async handleCheckoutCompleted(session) {
    try {
      const { customer, subscription, metadata } = session
      const { userId, planId } = metadata

      // Update User Profile
      const role = planId === 'founder' ? USER_ROLES.FOUNDER : USER_ROLES.ENTERPRISE
      await profileService.upgradeUserRole(userId, role, {
        tier: planId,
        stripeSubscriptionId: subscription,
        stripeCustomerId: customer,
        status: SUBSCRIPTION_STATUS.ACTIVE
      })

      return { success: true }
    } catch (error) {
      console.error('Error handling checkout completed:', error)
      return { success: false, error: error.message }
    }
  },

  // Handle successful payment
  async handlePaymentSucceeded(invoice) {
    try {
      const subscription = invoice.subscription
      
      await subscriptionService.updateSubscription(subscription, {
        status: SUBSCRIPTION_STATUS.ACTIVE,
        current_period_start: new Date(invoice.period_start * 1000),
        current_period_end: new Date(invoice.period_end * 1000)
      })

      return { success: true }
    } catch (error) {
      console.error('Error handling payment succeeded:', error)
      return { success: false, error: error.message }
    }
  },

  // Handle failed payment
  async handlePaymentFailed(invoice) {
    try {
      const subscription = invoice.subscription
      
      await subscriptionService.updateSubscription(subscription, {
        status: 'past_due'
      })

      return { success: true }
    } catch (error) {
      console.error('Error handling payment failed:', error)
      return { success: false, error: error.message }
    }
  },

  // Handle subscription update
  async handleSubscriptionUpdated(subscription) {
    try {
      await subscriptionService.updateSubscription(subscription.id, {
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000)
      })

      return { success: true }
    } catch (error) {
      console.error('Error handling subscription updated:', error)
      return { success: false, error: error.message }
    }
  },

  // Handle subscription cancellation
  async handleSubscriptionCancelled(subscription) {
    try {
      await subscriptionService.cancelSubscription(subscription.id)

      return { success: true }
    } catch (error) {
      console.error('Error handling subscription cancelled:', error)
      return { success: false, error: error.message }
    }
  }
}

export default stripeSubscriptionService