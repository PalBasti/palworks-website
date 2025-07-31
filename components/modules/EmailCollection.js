// components/modules/EmailCollection.js
import { useState } from 'react'
import { Mail, Check, X } from 'lucide-react'

const EmailCollection = ({ 
  onEmailSubmit, 
  title = "Newsletter abonnieren", 
  description = "Bleiben Sie über neue Vertragsvorlagen informiert",
  buttonText = "Anmelden",
  placeholder = "Ihre E-Mail-Adresse",
  showPrivacyNote = true,
  variant = "default", // default, compact, inline
  className = ""
}) => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('')

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setErrorMessage('Bitte geben Sie eine E-Mail-Adresse ein')
      setStatus('error')
      return
    }

    if (!validateEmail(email)) {
      setErrorMessage('Bitte geben Sie eine gültige E-Mail-Adresse ein')
      setStatus('error')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      await onEmailSubmit(email)
      setStatus('success')
      setEmail('')
    } catch (error) {
      setStatus('error')
      setErrorMessage(error.message || 'Ein Fehler ist aufgetreten')
    }
  }

  // Compact variant for sidebars/footers
  if (variant === 'compact') {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center mb-3">
          <Mail className="h-5 w-5 text-blue-600 mr-2" />
          <h4 className="font-medium text-blue-900">{title}</h4>
        </div>
        
        {status === 'success' ? (
          <div className="flex items-center text-green-700">
            <Check className="h-4 w-4 mr-2" />
            <span className="text-sm">Erfolgreich angemeldet!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              disabled={status === 'loading'}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {status === 'error' && (
              <div className="flex items-center text-red-600 text-sm">
                <X className="h-4 w-4 mr-1" />
                {errorMessage}
              </div>
            )}
            
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-blue-600 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? 'Wird angemeldet...' : buttonText}
            </button>
          </form>
        )}
      </div>
    )
  }

  // Inline variant for form integration
  if (variant === 'inline') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        {status === 'success' ? (
          <div className="flex items-center text-green-700">
            <Check className="h-5 w-5 mr-2" />
            <span>Erfolgreich angemeldet!</span>
          </div>
        ) : (
          <>
            <div className="flex-grow">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                disabled={status === 'loading'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {status === 'error' && (
                <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={status === 'loading'}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {status === 'loading' ? 'Lädt...' : buttonText}
            </button>
          </>
        )}
      </div>
    )
  }

  // Default variant - full component
  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-300 rounded-lg p-6 ${className}`}>
      <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          <div className="bg-blue-100 p-3 rounded-full">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-blue-900 mb-2">{title}</h3>
        <p className="text-blue-700">{description}</p>
      </div>

      {status === 'success' ? (
        <div className="text-center">
          <div className="bg-green-100 p-4 rounded-lg">
            <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-medium text-green-800 mb-1">Erfolgreich angemeldet!</h4>
            <p className="text-green-700 text-sm">Sie erhalten eine Bestätigungs-E-Mail in Kürze.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              disabled={status === 'loading'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
            />
            {status === 'error' && (
              <div className="flex items-center justify-center text-red-600 text-sm mt-2">
                <X className="h-4 w-4 mr-1" />
                {errorMessage}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? 'Wird angemeldet...' : buttonText}
          </button>

          {showPrivacyNote && (
            <p className="text-xs text-blue-600 text-center">
              Mit der Anmeldung akzeptieren Sie unsere{' '}
              <a href="/datenschutz" className="underline hover:no-underline">
                Datenschutzerklärung
              </a>
            </p>
          )}
        </form>
      )}
    </div>
  )
}

export default EmailCollection

