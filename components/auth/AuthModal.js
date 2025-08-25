// components/auth/AuthModal.js
import React, { useState, useEffect } from 'react'
import { X, Mail, Lock, User, Building } from 'lucide-react'
import { useAuth } from '../../lib/contexts/AuthContext'
import toast from 'react-hot-toast'

/**
 * AuthModal - Modular Authentication Component
 * 
 * Features:
 * - Login/Signup Toggle
 * - Company Registration für Enterprise
 * - Responsive Design
 * - Error Handling
 * - Loading States
 */
export default function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    companyName: '',
    agreeToTerms: false
  })

  const { signIn, signUp, resetPassword } = useAuth()

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        companyName: '',
        agreeToTerms: false
      })
    }
  }, [isOpen, initialTab])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { user, error } = await signIn(formData.email, formData.password)
      
      if (error) {
        toast.error(`Login fehlgeschlagen: ${error}`)
        return
      }

      if (user) {
        toast.success('Erfolgreich angemeldet!')
        onClose()
      }
    } catch (error) {
      toast.error('Ein unerwarteter Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwörter stimmen nicht überein')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      toast.error('Passwort muss mindestens 6 Zeichen lang sein')
      setIsLoading(false)
      return
    }

    if (!formData.agreeToTerms) {
      toast.error('Bitte akzeptieren Sie die Nutzungsbedingungen')
      setIsLoading(false)
      return
    }

    try {
      const metadata = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        company_name: formData.companyName || null
      }

      const { user, error } = await signUp(formData.email, formData.password, metadata)
      
      if (error) {
        toast.error(`Registrierung fehlgeschlagen: ${error}`)
        return
      }

      if (user) {
        toast.success('Konto erstellt! Bestätigungsmail versendet.')
        onClose()
      }
    } catch (error) {
      toast.error('Ein unerwarteter Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    
    if (!formData.email) {
      toast.error('Bitte geben Sie Ihre E-Mail-Adresse ein')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await resetPassword(formData.email)
      
      if (error) {
        toast.error(`Fehler: ${error}`)
        return
      }

      toast.success('Passwort-Reset E-Mail versendet!')
      setActiveTab('login')
    } catch (error) {
      toast.error('Ein unerwarteter Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {activeTab === 'login' && 'Anmelden'}
            {activeTab === 'signup' && 'Registrieren'}
            {activeTab === 'reset' && 'Passwort zurücksetzen'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        {activeTab !== 'reset' && (
          <div className="flex border-b">
            <button
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === 'login' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('login')}
            >
              Anmelden
            </button>
            <button
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === 'signup' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('signup')}
            >
              Registrieren
            </button>
          </div>
        )}

        {/* Form Content */}
        <div className="p-6">
          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-Mail-Adresse
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ihre@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passwort
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? 'Anmelden...' : 'Anmelden'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('reset')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Passwort vergessen?
                </button>
              </div>
            </form>
          )}

          {/* Signup Form */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vorname
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Max"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nachname
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mustermann"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unternehmen (optional)
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Muster GmbH"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-Mail-Adresse
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ihre@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passwort
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    minLength="6"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passwort bestätigen
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    minLength="6"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  required
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Ich akzeptiere die{' '}
                  <a href="/terms" className="text-blue-600 hover:text-blue-700">
                    Nutzungsbedingungen
                  </a>{' '}
                  und{' '}
                  <a href="/privacy" className="text-blue-600 hover:text-blue-700">
                    Datenschutzerklärung
                  </a>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? 'Registrieren...' : 'Konto erstellen'}
              </button>
            </form>
          )}

          {/* Password Reset Form */}
          {activeTab === 'reset' && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-Mail-Adresse
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ihre@email.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? 'Senden...' : 'Reset-Link senden'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  ← Zurück zur Anmeldung
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}