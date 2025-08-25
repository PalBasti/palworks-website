// lib/supabase/authService.js
import { supabase, USER_ROLES, SUBSCRIPTION_STATUS } from '../supabase'

/**
 * Authentication Service für Multi-Tier PalWorks Platform
 * Erweitert bestehende Supabase-Integration um User Management
 */

// ===== USER AUTHENTICATION =====

export const authService = {
  // Current User Session
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      
      if (user) {
        // Hole User Profile mit Subscription Info
        const profile = await this.getUserProfile(user.id)
        return {
          ...user,
          profile
        }
      }
      
      return null
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  },

  // Sign In with Email
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      return { user: data.user, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { user: null, error: error.message }
    }
  },

  // Sign Up with Email
  async signUp(email, password, metadata = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: USER_ROLES.PUBLIC,
            ...metadata
          }
        }
      })
      
      if (error) throw error
      
      // Erstelle User Profile nach erfolgreicher Registrierung
      if (data.user) {
        await this.createUserProfile(data.user)
      }
      
      return { user: data.user, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { user: null, error: error.message }
    }
  },

  // Sign Out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error: error.message }
    }
  },

  // Reset Password
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })
      
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Reset password error:', error)
      return { error: error.message }
    }
  },

  // Update Password
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Update password error:', error)
      return { error: error.message }
    }
  }
}

// ===== USER PROFILE MANAGEMENT =====

export const profileService = {
  // Erstelle User Profile nach Registrierung
  async createUserProfile(user) {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          email: user.email,
          role: USER_ROLES.PUBLIC,
          subscription_status: SUBSCRIPTION_STATUS.INACTIVE,
          subscription_tier: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error creating user profile:', error)
      return false
    }
  },

  // Hole User Profile
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          subscriptions (
            subscription_tier,
            status,
            stripe_subscription_id,
            current_period_end,
            created_at
          )
        `)
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  },

  // Update User Profile
  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating user profile:', error)
      return null
    }
  },

  // Upgrade User Role
  async upgradeUserRole(userId, newRole, subscriptionData = null) {
    try {
      const updates = {
        role: newRole,
        subscription_status: subscriptionData ? SUBSCRIPTION_STATUS.ACTIVE : SUBSCRIPTION_STATUS.INACTIVE
      }

      const profile = await this.updateUserProfile(userId, updates)
      
      // Erstelle Subscription Record falls vorhanden
      if (subscriptionData && profile) {
        await this.createSubscription(userId, subscriptionData)
      }

      return profile
    } catch (error) {
      console.error('Error upgrading user role:', error)
      return null
    }
  }
}

// ===== SUBSCRIPTION MANAGEMENT =====

export const subscriptionService = {
  // Erstelle Subscription
  async createSubscription(userId, subscriptionData) {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          subscription_tier: subscriptionData.tier,
          stripe_subscription_id: subscriptionData.stripeSubscriptionId,
          stripe_customer_id: subscriptionData.stripeCustomerId,
          status: subscriptionData.status || SUBSCRIPTION_STATUS.ACTIVE,
          current_period_start: subscriptionData.currentPeriodStart,
          current_period_end: subscriptionData.currentPeriodEnd,
          created_at: new Date().toISOString()
        })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error creating subscription:', error)
      return false
    }
  },

  // Update Subscription
  async updateSubscription(subscriptionId, updates) {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('stripe_subscription_id', subscriptionId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating subscription:', error)
      return false
    }
  },

  // Get User Subscription
  async getUserSubscription(userId) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', SUBSCRIPTION_STATUS.ACTIVE)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data || null
    } catch (error) {
      console.error('Error fetching user subscription:', error)
      return null
    }
  },

  // Cancel Subscription
  async cancelSubscription(subscriptionId) {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          status: SUBSCRIPTION_STATUS.CANCELLED,
          cancelled_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscriptionId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      return false
    }
  }
}

// ===== ROLE & PERMISSION CHECKS =====

export const roleService = {
  // Check if user has specific role
  hasRole(user, requiredRole) {
    if (!user?.profile) return false
    
    const userRole = user.profile.role
    
    // Role hierarchy: enterprise > founder > public
    const roleHierarchy = {
      [USER_ROLES.PUBLIC]: 1,
      [USER_ROLES.FOUNDER]: 2,
      [USER_ROLES.ENTERPRISE]: 3
    }

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
  },

  // Check if user can access feature
  canAccessFeature(user, feature) {
    if (!user?.profile) return false

    const permissions = {
      // Public Features (verfügbar für alle)
      'public_contracts': [USER_ROLES.PUBLIC, USER_ROLES.FOUNDER, USER_ROLES.ENTERPRISE],
      
      // Founder Features
      'founder_templates': [USER_ROLES.FOUNDER, USER_ROLES.ENTERPRISE],
      'discounted_pricing': [USER_ROLES.FOUNDER, USER_ROLES.ENTERPRISE],
      'priority_support': [USER_ROLES.FOUNDER, USER_ROLES.ENTERPRISE],
      
      // Enterprise Features
      'custom_templates': [USER_ROLES.ENTERPRISE],
      'legal_consultation': [USER_ROLES.ENTERPRISE],
      'white_label': [USER_ROLES.ENTERPRISE],
      'multi_user_accounts': [USER_ROLES.ENTERPRISE],
      'usage_analytics': [USER_ROLES.ENTERPRISE]
    }

    const allowedRoles = permissions[feature] || []
    return allowedRoles.includes(user.profile.role)
  },

  // Get user's subscription status
  getSubscriptionStatus(user) {
    if (!user?.profile) return SUBSCRIPTION_STATUS.INACTIVE
    return user.profile.subscription_status || SUBSCRIPTION_STATUS.INACTIVE
  },

  // Check if subscription is active
  hasActiveSubscription(user) {
    return this.getSubscriptionStatus(user) === SUBSCRIPTION_STATUS.ACTIVE
  }
}

// ===== AUTH STATE LISTENER =====

export const authListener = {
  // Setup auth state change listener
  setupAuthListener(callback) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      let user = null
      
      if (session?.user) {
        // Hole vollständige User-Daten mit Profile
        const profile = await profileService.getUserProfile(session.user.id)
        user = {
          ...session.user,
          profile
        }
      }

      callback(event, user)
    })
  }
}

// Default Export für einfache Nutzung
export default {
  auth: authService,
  profile: profileService,
  subscription: subscriptionService,
  role: roleService,
  listener: authListener
}