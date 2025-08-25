// pages/upgrade.js
import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Header from '../components/shared/Header'
import { useAuth } from '../lib/contexts/AuthContext'
import { Crown, Building, CheckCircle, ArrowRight, Loader2 } from 'lucide-react'
import { SUBSCRIPTION_PLANS, stripeSubscriptionService } from '../lib/stripe/subscriptionService'
import { USER_ROLES } from '../lib/supabase'
import toast from 'react-hot-toast'

/**
 * Upgrade Page - Plan Selection & Checkout
 * 
 * Features:
 * - Plan Comparison
 * - Stripe Checkout Integration
 * - User Role Checking
 * - Dynamic Pricing
 * - Redirect Handling
 */
export default function UpgradePage() {
  const router = useRouter()
  const { user, isAuthenticated, hasRole } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [loading, setLoading] = useState(false)

  // Get plan from URL query
  useEffect(() => {
    const { plan } = router.query
    if (plan && SUBSCRIPTION_PLANS[plan.toUpperCase()]) {
      setSelectedPlan(plan.toLowerCase())
    }
  }, [router.query])

  // Redirect if user already has required role
  useEffect(() => {
    if (isAuthenticated && selectedPlan) {
      const requiredRole = selectedPlan === 'founder' ? USER_ROLES.FOUNDER : USER_ROLES.ENTERPRISE
      if (hasRole(requiredRole)) {
        toast.success('Sie haben bereits Zugang zu diesem Plan!')
        router.push(`/${selectedPlan}/dashboard`)
      }
    }
  }, [isAuthenticated, selectedPlan, hasRole, router])

  const handleUpgrade = async (planId) => {
    if (!isAuthenticated) {
      toast.error('Bitte melden Sie sich zuerst an')
      router.push('/?auth=login')
      return
    }

    setLoading(true)
    
    try {
      const result = await stripeSubscriptionService.createCheckoutSession(
        planId,
        user.id,
        user.email,
        `${window.location.origin}/subscription/success`,
        `${window.location.origin}/upgrade?plan=${planId}`
      )

      if (result.error) {
        toast.error(`Fehler beim Upgrade: ${result.error}`)
      }
      
    } catch (error) {
      toast.error('Ein unerwarteter Fehler ist aufgetreten')
      console.error('Upgrade error:', error)
    } finally {
      setLoading(false)
    }
  }

  const planDetails = Object.values(SUBSCRIPTION_PLANS)

  return (
    <>
      <Head>
        <title>Plan Upgrade - PalWorks</title>
        <meta name="description" content="Upgraden Sie zu Founder oder Enterprise für exklusive Features" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Wählen Sie Ihren Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Upgraden Sie zu Founder oder Enterprise und nutzen Sie exklusive Features für Ihr Business
            </p>
          </div>

          {/* Plan Selection */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Founder Plan */}
            <div className={`bg-white rounded-lg shadow-xl p-8 relative ${
              selectedPlan === 'founder' ? 'ring-2 ring-yellow-500' : ''
            }`}>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-semibold">
                  Beliebt
                </span>
              </div>

              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <Crown className="h-8 w-8 text-yellow-500 mr-3" />
                  <h2 className="text-2xl font-bold">Founder</h2>
                </div>
                
                <div className="text-5xl font-bold text-yellow-600 mb-2">
                  €{SUBSCRIPTION_PLANS.FOUNDER.price}
                </div>
                <p className="text-gray-500">pro Monat</p>
              </div>

              <ul className="space-y-4 mb-8">
                {SUBSCRIPTION_PLANS.FOUNDER.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade('founder')}
                disabled={loading || (isAuthenticated && hasRole(USER_ROLES.FOUNDER))}
                className="w-full bg-yellow-600 text-white py-3 px-6 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="h-5 w-5 mr-2" />
                )}
                {isAuthenticated && hasRole(USER_ROLES.FOUNDER) 
                  ? 'Bereits aktiv' 
                  : 'Founder werden'
                }
              </button>

              {selectedPlan === 'founder' && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Sie haben den Founder Plan ausgewählt. Klicken Sie auf "Founder werden" um fortzufahren.
                  </p>
                </div>
              )}
            </div>

            {/* Enterprise Plan */}
            <div className={`bg-white rounded-lg shadow-xl p-8 relative ${
              selectedPlan === 'enterprise' ? 'ring-2 ring-purple-500' : ''
            }`}>
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <Building className="h-8 w-8 text-purple-600 mr-3" />
                  <h2 className="text-2xl font-bold">Enterprise</h2>
                </div>
                
                <div className="text-5xl font-bold text-purple-600 mb-2">
                  €{SUBSCRIPTION_PLANS.ENTERPRISE.price}
                </div>
                <p className="text-gray-500">pro Monat</p>
              </div>

              <ul className="space-y-4 mb-8">
                {SUBSCRIPTION_PLANS.ENTERPRISE.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade('enterprise')}
                disabled={loading || (isAuthenticated && hasRole(USER_ROLES.ENTERPRISE))}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="h-5 w-5 mr-2" />
                )}
                {isAuthenticated && hasRole(USER_ROLES.ENTERPRISE) 
                  ? 'Bereits aktiv' 
                  : 'Enterprise werden'
                }
              </button>

              {selectedPlan === 'enterprise' && (
                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-800">
                    Sie haben den Enterprise Plan ausgewählt. Klicken Sie auf "Enterprise werden" um fortzufahren.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Comparison Table */}
          <div className="mt-16 bg-white rounded-lg shadow-lg p-8 max-w-5xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-8">Detaillierter Vergleich</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 font-semibold">Feature</th>
                    <th className="text-center py-4 font-semibold">Public</th>
                    <th className="text-center py-4 font-semibold text-yellow-600">Founder</th>
                    <th className="text-center py-4 font-semibold text-purple-600">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-4">Standard Verträge</td>
                    <td className="text-center py-4"><CheckCircle className="h-5 w-5 text-green-500 mx-auto" /></td>
                    <td className="text-center py-4"><CheckCircle className="h-5 w-5 text-green-500 mx-auto" /></td>
                    <td className="text-center py-4"><CheckCircle className="h-5 w-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-4">Preisrabatt</td>
                    <td className="text-center py-4 text-gray-400">-</td>
                    <td className="text-center py-4 font-semibold text-yellow-600">25%</td>
                    <td className="text-center py-4 font-semibold text-purple-600">25%</td>
                  </tr>
                  <tr>
                    <td className="py-4">Erweiterte Templates</td>
                    <td className="text-center py-4 text-gray-400">-</td>
                    <td className="text-center py-4"><CheckCircle className="h-5 w-5 text-green-500 mx-auto" /></td>
                    <td className="text-center py-4"><CheckCircle className="h-5 w-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-4">Priority Support</td>
                    <td className="text-center py-4 text-gray-400">24h</td>
                    <td className="text-center py-4 font-semibold text-yellow-600">&lt;4h</td>
                    <td className="text-center py-4 font-semibold text-purple-600">&lt;1h</td>
                  </tr>
                  <tr>
                    <td className="py-4">Custom Templates</td>
                    <td className="text-center py-4 text-gray-400">-</td>
                    <td className="text-center py-4 text-gray-400">-</td>
                    <td className="text-center py-4"><CheckCircle className="h-5 w-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-4">Multi-User Accounts</td>
                    <td className="text-center py-4 text-gray-400">-</td>
                    <td className="text-center py-4 text-gray-400">-</td>
                    <td className="text-center py-4"><CheckCircle className="h-5 w-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-4">Rechtsberatung</td>
                    <td className="text-center py-4 text-gray-400">-</td>
                    <td className="text-center py-4 text-gray-400">-</td>
                    <td className="text-center py-4"><CheckCircle className="h-5 w-5 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-4">White-Label Branding</td>
                    <td className="text-center py-4 text-gray-400">-</td>
                    <td className="text-center py-4 text-gray-400">-</td>
                    <td className="text-center py-4"><CheckCircle className="h-5 w-5 text-green-500 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-8">Häufige Fragen</h3>
            
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 shadow">
                <h4 className="font-semibold mb-2">Kann ich jederzeit kündigen?</h4>
                <p className="text-gray-600">
                  Ja, Sie können Ihr Abonnement jederzeit kündigen. Es läuft dann zum Ende der aktuellen Abrechnungsperiode aus.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow">
                <h4 className="font-semibold mb-2">Kann ich zwischen den Plänen wechseln?</h4>
                <p className="text-gray-600">
                  Ja, Sie können jederzeit zwischen Founder und Enterprise wechseln. Upgrades sind sofort aktiv, Downgrades zum nächsten Abrechnungszyklus.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow">
                <h4 className="font-semibold mb-2">Welche Zahlungsmethoden werden akzeptiert?</h4>
                <p className="text-gray-600">
                  Wir akzeptieren alle gängigen Kreditkarten sowie SEPA-Lastschrift für europäische Kunden.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-4">
              Haben Sie noch Fragen? Kontaktieren Sie uns gerne!
            </p>
            <a 
              href="mailto:support@palworks.de"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              support@palworks.de
            </a>
          </div>
        </div>
      </main>
    </>
  )
}