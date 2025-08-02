// components/modules/EmailCollection.js - VERBESSERTE VERSION
import { useState } from 'react';
import { Mail, Shield, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function EmailCollection({ 
  title = "Newsletter abonnieren",
  description = "Erhalten Sie Updates zu neuen Vertragsvorlagen",
  onEmailSubmit,
  variant = "inline", // "inline", "compact", "full"
  showPrivacyNote = true,
  showNewsletterOption = true,
  required = false
}) {
  const [email, setEmail] = useState('');
  const [wantsNewsletter, setWantsNewsletter] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(''); // 'success', 'error', 'already_subscribed'
  const [error, setError] = useState('');

  // E-Mail validieren
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Newsletter-Anmeldung verarbeiten
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('E-Mail-Adresse ist erforderlich');
      return;
    }

    if (!validateEmail(email)) {
      setError('Bitte geben Sie eine gültige E-Mail-Adresse ein');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setStatus('');

      // Callback an Parent-Komponente
      if (onEmailSubmit) {
        await onEmailSubmit(email, wantsNewsletter);
      }

      // Newsletter-Service aufrufen wenn gewünscht
      if (wantsNewsletter) {
        try {
          const { subscribeToNewsletter } = await import('../../lib/supabase/newsletterService');
          const result = await subscribeToNewsletter(email);
          
          if (result.success) {
            if (result.alreadySubscribed) {
              setStatus('already_subscribed');
            } else {
              setStatus('success');
            }
          } else {
            setStatus('error');
            setError(result.error || 'Newsletter-Anmeldung fehlgeschlagen');
          }
        } catch (importError) {
          console.log('Newsletter service not available, using callback only');
          setStatus('success');
        }
      } else {
        setStatus('success');
      }

    } catch (err) {
      setStatus('error');
      setError(err.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status-Nachrichten rendern
  const renderStatus = () => {
    switch (status) {
      case 'success':
        return (
          <div className="flex items-center text-green-600 text-sm mt-2">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {wantsNewsletter 
              ? 'E-Mail gespeichert und Newsletter angemeldet!' 
              : 'E-Mail erfolgreich gespeichert!'
            }
          </div>
        );
      case 'already_subscribed':
        return (
          <div className="flex items-center text-blue-600 text-sm mt-2">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            E-Mail gespeichert. Sie sind bereits für den Newsletter angemeldet.
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center text-red-600 text-sm mt-2">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        );
      default:
        return null;
    }
  };

  // Kompakte Version für Sidebar
  if (variant === "compact") {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          📧 {title}
        </h3>
        
        {status === 'success' ? (
          <div className="text-center py-4">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-green-700 font-medium">
              Vielen Dank!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ihre@email.de"
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={required}
            />
            
            {showNewsletterOption && (
              <label className="flex items-start space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={wantsNewsletter}
                  onChange={(e) => setWantsNewsletter(e.target.checked)}
                  disabled={isSubmitting}
                  className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">Newsletter abonnieren</span>
              </label>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Wird gespeichert...
                </>
              ) : (
                'Speichern'
              )}
            </button>
            
            {renderStatus()}
          </form>
        )}
      </div>
    );
  }

  // Inline Version (wie bisher)
  if (variant === "inline") {
    return (
      <div className="space-y-4">
        {title && (
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Mail className="h-5 w-5 mr-2 text-blue-600" />
            {title}
          </h3>
        )}
        
        {description && (
          <p className="text-gray-600">{description}</p>
        )}

        {status === 'success' ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-green-900">Erfolgreich gespeichert!</p>
                <p className="text-sm text-green-700 mt-1">
                  {wantsNewsletter 
                    ? 'Sie erhalten Updates zu neuen Vertragsvorlagen.'
                    : 'Ihre E-Mail wurde für die Vertragszustellung gespeichert.'
                  }
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-Mail-Adresse {required && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ihre@email.de"
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={required}
                />
                <Mail className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {showNewsletterOption && (
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="newsletter-checkbox"
                  checked={wantsNewsletter}
                  onChange={(e) => setWantsNewsletter(e.target.checked)}
                  disabled={isSubmitting}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="newsletter-checkbox" className="text-sm text-gray-700 cursor-pointer">
                  <span className="font-medium">Newsletter abonnieren (optional)</span>
                  <p className="text-xs text-gray-600 mt-1">
                    Erhalten Sie Updates zu neuen Vertragsvorlagen, Rechtstipps und besonderen Angeboten. 
                    Abmeldung jederzeit möglich.
                  </p>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Wird verarbeitet...
                </>
              ) : (
                <>
                  <Mail className="h-5 w-5 mr-2" />
                  E-Mail speichern
                </>
              )}
            </button>

            {renderStatus()}
          </form>
        )}

        {/* Datenschutz-Hinweis */}
        {showPrivacyNote && (
          <div className="mt-4 p-3 bg-gray-50 rounded border text-xs text-gray-600">
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-700 mb-1">🔒 Datenschutz-Information</p>
                <p>
                  Ihre E-Mail wird ausschließlich für die Vertragszustellung verwendet. Bei Newsletter-Anmeldung 
                  erhalten Sie gelegentlich Updates (max. 1x pro Monat). Ihre Daten werden nicht an Dritte weitergegeben.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full Version für eigene Seiten
  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-6">
        <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        {description && <p className="text-gray-600">{description}</p>}
      </div>

      {status === 'success' ? (
        <div className="text-center py-8">
          <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-900 mb-2">Vielen Dank!</h3>
          <p className="text-green-700">
            {wantsNewsletter 
              ? 'Sie sind erfolgreich für den Newsletter angemeldet.'
              : 'Ihre E-Mail wurde erfolgreich gespeichert.'
            }
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-Mail-Adresse {required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ihre@email.de"
              disabled={isSubmitting}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required={required}
            />
          </div>

          {showNewsletterOption && (
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="newsletter-full"
                checked={wantsNewsletter}
                onChange={(e) => setWantsNewsletter(e.target.checked)}
                disabled={isSubmitting}
                className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="newsletter-full" className="text-gray-700 cursor-pointer">
                <span className="font-medium">Newsletter abonnieren</span>
                <p className="text-sm text-gray-600 mt-1">
                  Erhalten Sie Updates zu neuen Vertragsvorlagen und Rechtstipps.
                </p>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !email}
            className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Wird verarbeitet...
              </>
            ) : (
              'Anmelden'
            )}
          </button>

          {renderStatus()}
        </form>
      )}

      {showPrivacyNote && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <Shield className="h-5 w-5 text-green-500 mb-2" />
          <p className="font-medium text-gray-700 mb-2">Datenschutz</p>
          <p>
            Ihre Daten werden sicher behandelt und nicht an Dritte weitergegeben. 
            Newsletter können jederzeit abbestellt werden.
          </p>
        </div>
      )}
    </div>
  );
}
