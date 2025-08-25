// lib/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService, profileService, roleService, authListener, USER_ROLES } from '../supabase/authService'

const AuthContext = createContext({
  user: null,
  loading: true,
  signIn: () => {},
  signUp: () => {},
  signOut: () => {},
  resetPassword: () => {},
  updatePassword: () => {},
  hasRole: () => false,
  canAccessFeature: () => false,
  isAuthenticated: false,
  profile: null
})

/**
 * AuthProvider - Zentrales Authentication Management für PalWorks
 * 
 * Features:
 * - Supabase Auth Integration
 * - User Profile Management
 * - Role-based Access Control
 * - Subscription Status Tracking
 * - Rückwärtskompatibilität zu Version 1.0
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initial user laden
    const loadUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()

    // Auth State Listener setup
    const { data: { subscription } } = authListener.setupAuthListener(async (event, user) => {
      console.log('Auth state changed:', event, user)
      setUser(user)
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  // ===== AUTHENTICATION METHODS =====

  const signIn = async (email, password) => {
    setLoading(true)
    try {
      const result = await authService.signIn(email, password)
      return result
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email, password, metadata = {}) => {
    setLoading(true)
    try {
      const result = await authService.signUp(email, password, metadata)
      return result
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const result = await authService.signOut()
      setUser(null)
      return result
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email) => {
    return await authService.resetPassword(email)
  }

  const updatePassword = async (newPassword) => {
    return await authService.updatePassword(newPassword)
  }

  // ===== ROLE & PERMISSION METHODS =====

  const hasRole = (requiredRole) => {
    return roleService.hasRole(user, requiredRole)
  }

  const canAccessFeature = (feature) => {
    return roleService.canAccessFeature(user, feature)
  }

  const hasActiveSubscription = () => {
    return roleService.hasActiveSubscription(user)
  }

  const getSubscriptionStatus = () => {
    return roleService.getSubscriptionStatus(user)
  }

  // ===== COMPUTED VALUES =====

  const isAuthenticated = !!user
  const profile = user?.profile || null
  const userRole = profile?.role || USER_ROLES.PUBLIC

  // ===== CONTEXT VALUE =====

  const value = {
    // User State
    user,
    loading,
    isAuthenticated,
    profile,
    userRole,

    // Auth Methods
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,

    // Permission Methods
    hasRole,
    canAccessFeature,
    hasActiveSubscription,
    getSubscriptionStatus,

    // Utility Methods
    refreshUser: async () => {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    }
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ===== CUSTOM HOOKS =====

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Role-specific hooks für einfachere Nutzung
export const useRequireAuth = (redirectTo = '/auth/login') => {
  const { isAuthenticated, loading } = useAuth()
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = redirectTo
    }
  }, [isAuthenticated, loading, redirectTo])

  return { isAuthenticated, loading }
}

export const useRequireRole = (requiredRole, redirectTo = '/') => {
  const { hasRole, loading, isAuthenticated } = useAuth()
  const hasRequiredRole = hasRole(requiredRole)

  useEffect(() => {
    if (!loading && isAuthenticated && !hasRequiredRole) {
      window.location.href = redirectTo
    }
  }, [hasRequiredRole, loading, isAuthenticated, redirectTo])

  return { hasRequiredRole, loading }
}

export const useSubscription = () => {
  const { user, hasActiveSubscription, getSubscriptionStatus } = useAuth()
  
  return {
    subscription: user?.profile?.subscriptions?.[0] || null,
    hasActiveSubscription: hasActiveSubscription(),
    status: getSubscriptionStatus(),
    tier: user?.profile?.subscription_tier || null
  }
}