// components/shared/CustomerDataSection.js - PRODUCTION READY_1
import React, { useState } from 'react';
import { Mail, User, CheckCircle, Info } from 'lucide-react';

const CustomerDataSection = ({
  formData = {},
  handleChange = () => {},
  errors = {},
  showNewsletter = true,
  compact = false,
  showTitle = true
}) => {
  const [emailFocused, setEmailFocused] = useState(false);
  const [showEmailHint, setShowEmailHint] = useState(false);

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${compact ? 'p-4' : 'p-6'}`}>
      {showTitle && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Ihre Kontaktdaten
          </h3>
          <p className="text-sm text-gray-600">
            Für die Vertragszustellung und weitere Kommunikation
          </p>
        </div>
      )}

      {/* E-Mail Eingabe */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          E-Mail-Adresse *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className={`h-5 w-5 transition-colors duration-200 ${
              emailFocused ? 'text-blue-500' : 'text-gray-400'
            }`} />
          </div>
          <input
            type="email"
            name="customer_email"
            value={formData.customer_email || ''}
            onChange={handleChange}
            onFocus={() => {
              setEmailFocused(true);
              setShowEmailHint(true);
            }}
            onBlur={() => {
              setEmailFocused(false);
              setShowEmailHint(false);
            }}
            className={`
              block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${errors.customer_email 
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:border-blue-500'
              }
            `}
            placeholder="ihre@email.de"
            autoComplete="email"
          />
          
          {/* Success Indicator */}
          {formData.customer_email && !errors.customer_email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email) && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          )}
        </div>
        
        {/* Error Message */}
        {errors.customer_email && (
          <div className="mt-2 flex items-center">
            <Info className="h-4 w-4 text-red-500 mr-1" />
            <p className="text-sm text-red-600">{errors.customer_email}</p>
          </div>
        )}
        
        {/* Help Text */}
        <div className={`mt-2 transition-all duration-200 ${
          showEmailHint ? 'opacity-100' : 'opacity-70'
        }`}>
          <p className="text-xs text-gray-500 flex items-center">
            <Info className="h-3 w-3 mr-1" />
            Ihr Vertrag wird als PDF an diese Adresse gesendet
          </p>
        </div>
      </div>

      {/* Newsletter Anmeldung */}
      {showNewsletter && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              name="newsletter_signup"
              checked={formData.newsletter_signup || false}
              onChange={handleChange}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
            />
            <div className="ml-3">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700">
                  📬 Newsletter abonnieren
                </span>
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Optional
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Erhalten Sie Tipps zu Mietrecht, neue Vertragsvorlagen und rechtliche Updates. 
                Jederzeit abbestellbar, kein Spam.
              </p>
              
              {/* Newsletter Benefits */}
              <div className="mt-2 space-y-1">
                <div className="text-xs text-gray-500 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                  Kostenlose Rechtstipps
                </div>
                <div className="text-xs text-gray-500 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                  Neue Vertragsvorlagen zuerst erhalten
                </div>
                <div className="text-xs text-gray-500 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                  Wichtige Gesetzesänderungen
                </div>
              </div>
            </div>
          </label>
        </div>
      )}

      {/* Compact Mode: Success Summary */}
      {compact && formData.customer_email && !errors.customer_email && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-800">
              Kontaktdaten vollständig
            </span>
          </div>
          <p className="text-xs text-green-700 mt-1">
            Vertrag wird an {formData.customer_email} gesendet
            {formData.newsletter_signup && ' • Newsletter abonniert'}
          </p>
        </div>
      )}

      {/* DSGVO Hinweis */}
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-start">
          <Info className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
          <div className="text-xs text-gray-600">
            <p className="font-medium mb-1">Datenschutz-Hinweis:</p>
            <p>
              Ihre E-Mail-Adresse wird ausschließlich für die Vertragszustellung verwendet. 
              Bei Newsletter-Anmeldung erhalten Sie zusätzlich unsere Rechtstipps. 
              Mehr in unserer{' '}
              <a 
                href="/datenschutz" 
                className="text-blue-600 hover:text-blue-700 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Datenschutzerklärung
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDataSection;
