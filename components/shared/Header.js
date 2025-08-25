// components/shared/Header.js
import React, { useState } from 'react'
import Link from 'next/link'
import { FileText, Menu, X, User, LogOut, Settings, Crown, Building } from 'lucide-react'
import { useAuth } from '../../lib/contexts/AuthContext'
import AuthModal from '../auth/AuthModal'
import { USER_ROLES } from '../../lib/supabase'

/**
 * Header - Responsive Navigation mit Authentication
 * 
 * Features:
 * - Responsive Design
 * - Authentication State Management
 * - Role-based Navigation
 * - Mobile Menu
 * - User Dropdown
 * - Rückwärtskompatibilität zu Version 1.0
 */
export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState('login')

  const { user, isAuthenticated, signOut, hasRole, userRole } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    setIsUserMenuOpen(false)
    toast.success('Erfolgreich abgemeldet')
  }

  const handleAuthClick = (tab) => {
    setAuthModalTab(tab)
    setIsAuthModalOpen(true)
  }

  // Navigation Items basierend auf User Role
  const getNavigationItems = () => {
    const baseItems = [
      { href: '/#vertraege', label: 'Verträge' },
      { href: '/#preise', label: 'Preise' },
      { href: '/#ueber-uns', label: 'Über uns' },
      { href: '/#kontakt', label: 'Kontakt' }
    ]

    if (!isAuthenticated) {
      return baseItems
    }

    // Authenticated user navigation
    const authenticatedItems = [...baseItems]

    if (hasRole(USER_ROLES.FOUNDER)) {
      authenticatedItems.splice(1, 0, { href: '/founder', label: 'Founder Bereich' })
    }

    if (hasRole(USER_ROLES.ENTERPRISE)) {
      authenticatedItems.splice(1, 0, { href: '/enterprise', label: 'Enterprise' })
    }

    return authenticatedItems
  }

  const navigationItems = getNavigationItems()

  return (
    <>
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">PalWorks</h1>
              </Link>
              
              {/* Version Badge für Development */}
              {process.env.NODE_ENV === 'development' && (
                <span className="ml-3 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                  v2.0-dev
                </span>
              )}
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      {/* Role Badge */}
                      {userRole === USER_ROLES.FOUNDER && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                      {userRole === USER_ROLES.ENTERPRISE && (
                        <Building className="h-4 w-4 text-purple-500" />
                      )}
                      
                      <User className="h-5 w-5" />
                      <span className="font-medium">
                        {user?.user_metadata?.first_name || user?.email?.split('@')[0]}
                      </span>
                    </div>
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      
                      {/* Dropdown Menu */}
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                        {/* User Info */}
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
                          </p>
                          <p className="text-sm text-gray-500">{user?.email}</p>
                          
                          {/* Role Badge */}
                          <div className="mt-1">
                            {userRole === USER_ROLES.FOUNDER && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Crown className="h-3 w-3 mr-1" />
                                Founder
                              </span>
                            )}
                            {userRole === USER_ROLES.ENTERPRISE && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                <Building className="h-3 w-3 mr-1" />
                                Enterprise
                              </span>
                            )}
                            {userRole === USER_ROLES.PUBLIC && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Public
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                          {hasRole(USER_ROLES.FOUNDER) && (
                            <Link
                              href="/founder/dashboard"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <Crown className="h-4 w-4 mr-3 text-yellow-500" />
                              Founder Dashboard
                            </Link>
                          )}

                          {hasRole(USER_ROLES.ENTERPRISE) && (
                            <Link
                              href="/enterprise/dashboard"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <Building className="h-4 w-4 mr-3 text-purple-500" />
                              Enterprise Dashboard
                            </Link>
                          )}

                          <Link
                            href="/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4 mr-3" />
                            Profil & Einstellungen
                          </Link>
                        </div>

                        <div className="border-t border-gray-100 py-1">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <LogOut className="h-4 w-4 mr-3" />
                            Abmelden
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleAuthClick('login')}
                    className="text-gray-700 hover:text-blue-600 font-medium"
                  >
                    Anmelden
                  </button>
                  <button
                    onClick={() => handleAuthClick('signup')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Registrieren
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:text-blue-600"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 pb-4">
              <div className="pt-4 space-y-2">
                {navigationItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}

                {/* Mobile Auth Section */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <div className="px-4 py-2">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.user_metadata?.first_name || user?.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>

                      {hasRole(USER_ROLES.FOUNDER) && (
                        <Link
                          href="/founder/dashboard"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Founder Dashboard
                        </Link>
                      )}

                      {hasRole(USER_ROLES.ENTERPRISE) && (
                        <Link
                          href="/enterprise/dashboard"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Enterprise Dashboard
                        </Link>
                      )}

                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Profil & Einstellungen
                      </Link>

                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        Abmelden
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          handleAuthClick('login')
                          setIsMobileMenuOpen(false)
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded"
                      >
                        Anmelden
                      </button>
                      <button
                        onClick={() => {
                          handleAuthClick('signup')
                          setIsMobileMenuOpen(false)
                        }}
                        className="block w-full text-left px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Registrieren
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </>
  )
}