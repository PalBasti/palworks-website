// components/auth/ProtectedRoute.js
import React, { useEffect, useState } from 'react'
import { useAuth } from '../../lib/contexts/AuthContext'
import { USER_ROLES } from '../../lib/supabase'
import { Loader2, Crown, Building, Lock } from 'lucide-react'

/**
 * ProtectedRoute - Route Protection mit Role-based Access Control
 * 
 * Features:
 * - Role-based Access Control
 * - Loading States
 * - Upgrade Prompts
 * - Subscription Checks
 * - Fallback Components
 */
export default function ProtectedRoute({ 
  children, 
  requiredRole = USER_ROLES.PUBLIC,
  requiredSubscription = false,
  fallback = null,
  redirectTo = null 
}) {
  const { 
    user, 
    loading, 
    isAuthenticated, 
    hasRole, 
    hasActiveSubscription 
  } = useAuth()
  
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (loading) return

    // Nicht authentifiziert -> Login
    if (!isAuthenticated && requiredRole !== USER_ROLES.PUBLIC) {
      if (redirectTo) {
        setIsRedirecting(true)
        window.location.href = redirectTo
      }
      return
    }

    // Authentifiziert aber keine berechtigung -> Redirect
    if (isAuthenticated && !hasRole(requiredRole)) {
      if (redirectTo) {
        setIsRedirecting(true)
        window.location.href = redirectTo
      }
      return
    }

    // Subscription erforderlich aber nicht aktiv
    if (requiredSubscription && !hasActiveSubscription()) {
      if (redirectTo) {
        setIsRedirecting(true)
        window.location.href = redirectTo
      }
      return
    }
  }, [
    loading, 
    isAuthenticated, 
    hasRole, 
    hasActiveSubscription, 
    requiredRole, 
    requiredSubscription, 
    redirectTo
  ])

  // Loading State
  if (loading || isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Lade...</p>
        </div>
      </div>
    )
  }

  // Nicht authentifiziert
  if (!isAuthenticated && requiredRole !== USER_ROLES.PUBLIC) {
    return fallback || <LoginRequired />
  }

  // Keine Berechtigung
  if (isAuthenticated && !hasRole(requiredRole)) {
    return fallback || <UpgradeRequired requiredRole={requiredRole} />
  }

  // Subscription erforderlich
  if (requiredSubscription && !hasActiveSubscription()) {
    return fallback || <SubscriptionRequired />
  }

  // Zugriff gewährt
  return children
}

// ===== FALLBACK COMPONENTS =====

function LoginRequired() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <Lock className="h-16 w-16 text-gray-400 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Anmeldung erforderlich
        </h1>
        <p className="text-gray-600 mb-6">
          Sie müssen sich anmelden, um auf diesen Bereich zuzugreifen.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.location.href = '/?auth=login'}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Jetzt anmelden
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Zurück zur Startseite
          </button>
        </div>
      </div>
    </div>
  )
}

function UpgradeRequired({ requiredRole }) {
  const roleInfo = {
    [USER_ROLES.FOUNDER]: {
      icon: Crown,
      name: 'Founder',
      color: 'yellow',
      price: '99€',
      description: 'Erweiterte Template-Bibliothek und günstigere Preise'
    },
    [USER_ROLES.ENTERPRISE]: {
      icon: Building,
      name: 'Enterprise',
      color: 'purple',
      price: '499€',
      description: 'Custom Templates, Rechtsberatung und White-Label Features'
    }
  }

  const info = roleInfo[requiredRole]
  const Icon = info.icon

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-${info.color}-100 mb-6`}>
          <Icon className={`h-8 w-8 text-${info.color}-600`} />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {info.name} Upgrade erforderlich
        </h1>
        
        <p className="text-gray-600 mb-2">
          Diese Funktion ist nur für {info.name} Kunden verfügbar.
        </p>
        
        <p className="text-sm text-gray-500 mb-6">
          {info.description}
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {info.price}
          </div>
          <div className="text-sm text-gray-500">
            pro Monat
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.location.href = `/upgrade?plan=${requiredRole}`}
            className={`w-full bg-${info.color}-600 text-white py-3 px-4 rounded-lg hover:bg-${info.color}-700 transition-colors`}
          >
            Jetzt upgraden
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Zurück zur Startseite
          </button>
        </div>
      </div>
    </div>
  )
}

function SubscriptionRequired() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
          <Lock className="h-8 w-8 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Aktives Abonnement erforderlich
        </h1>
        
        <p className="text-gray-600 mb-6">
          Ihr Abonnement ist abgelaufen oder wurde gekündigt. Aktivieren Sie Ihr Abonnement, um auf diese Funktion zuzugreifen.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => window.location.href = '/billing'}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Abonnement aktivieren
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Zurück zur Startseite
          </button>
        </div>
      </div>
    </div>
  )
}

// ===== UTILITY HOOKS =====

/**
 * Hook für einfache Route Protection in Pages
 */
export function useProtectedRoute(requiredRole = USER_ROLES.PUBLIC, requiredSubscription = false) {
  const { 
    user, 
    loading, 
    isAuthenticated, 
    hasRole, 
    hasActiveSubscription 
  } = useAuth()

  const hasAccess = () => {
    if (loading) return false
    if (!isAuthenticated && requiredRole !== USER_ROLES.PUBLIC) return false
    if (isAuthenticated && !hasRole(requiredRole)) return false
    if (requiredSubscription && !hasActiveSubscription()) return false
    return true
  }

  return {
    hasAccess: hasAccess(),
    loading,
    isAuthenticated,
    user
  }
}