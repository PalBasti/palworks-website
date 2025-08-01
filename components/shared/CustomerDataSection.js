// components/shared/CustomerDataSection.js
import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle, Info, Shield } from 'lucide-react';
import { subscribeToNewsletter } from '@/lib/supabase/newsletterService';

export default function CustomerDataSection({ 
  formData, 
  handleChange, 
  errors = {},
  className = "" 
}) {
  const [newsletterStatus, setNewsletterStatus] = useState('idle'); // idle, subscribing, success, error, already_subscribed
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [showNewsletterOption, setShowNewsletterOption] = useState(false);

  // Handle email input change and show newsletter option
  const handleEmailChange = (e) => {
    handleChange(e);
    
    // Show newsletter option when user starts typing email
    if (e.target.value.includes('@') && !showNewsletterOption) {
      setShowNewsletterOption(true);
    }
  };

  // Handle newsletter subscription
  const handleNewsletterSubscription = async (subscribe) => {
    if (!subscribe || !formData.customer_email) return;

    setNewsletterStatus('subscribing');
    setNewsletterMessage('');

    try {
      const result = await subscribeToNewsletter(formData.customer_email);
      
      if (result.alreadySubscribed) {
        setNewsletterStatus('already_subscribed');
        setNewsletterMessage('Sie sind bereits für unseren Newsletter angemeldet.');
      } else {
        setNewsletterStatus('success');
        setNewsletterMessage('Erfolgreich für den Newsletter angemeldet!');
      }
    } catch (error) {
      setNewsletterStatus('error');
      setNewsletterMessage('Fehler bei der Newsletter-Anmeldung. Versuchen Sie es später erneut.');
      console.error('Newsletter subscription error:', error);
    }
  };

  const getNewsletterStatusIcon = () => {
    switch (newsletterStatus) {
      case 'subscribing':
        return <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />;
      case 'success':
      case 'already_subscribed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getNewsletterStatusColor = () => {
    switch (newsletterStatus) {
      case 'success':
      case 'already_subscribed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'subscribing':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`bg-indigo-50 border border-indigo-200 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Mail className="h-5 w-5 mr-2 text-indigo-600" />
          Kontaktdaten für Vertragszustellung
        </h3>
        <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">
          Verpflichtend
        </span>
      </div>

      {/* Email Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            E-Mail-Adresse <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              name="customer_email"
              value={formData.customer_email || ''}
              onChange={handleEmailChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                errors.customer_email 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300 bg-white'
              }`}
              placeholder="ihre@email.de"
              required
            />
            <Mail className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
          </div>
          
          {errors.customer_email && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.customer_email}
            </p>
          )}
          
          <p className="text-sm text-gray-600 mt-2 flex items-start">
            <Info className="h-4 w-4 mr-1 mt-0.5 text-blue-500 flex-shrink-0" />
            Ihr fertiger Vertrag wird an diese Adresse gesendet. Sie erhalten eine Bestätigung mit Download-Link.
          </p>
        </div>

        {/* Newsletter Opt-in (appears after email input) */}
        {showNewsletterOption && formData.customer_email && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="newsletter_signup"
                name="newsletter_signup"
                checked={formData.newsletter_signup || false}
                onChange={(e) => {
                  handleChange(e);
                  if (e.target.checked) {
                    handleNewsletterSubscription(true);
                  } else {
                    setNewsletterStatus('idle');
                    setNewsletterMessage('');
                  }
                }}
                className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                disabled={newsletterStatus === 'subscribing'}
              />
              <div className="flex-1">
                <label htmlFor="newsletter_signup" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Newsletter abonnieren (optional)
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  Erhalten Sie Updates zu neuen Vertragsarten und rechtlichen Änderungen. 
                  Jederzeit abbestellbar.
                </p>
                
                {/* Newsletter Status */}
                {newsletterStatus !== 'idle' && newsletterMessage && (
                  <div className={`flex items-center mt-2 text-xs ${getNewsletterStatusColor()}`}>
                    {getNewsletterStatusIcon()}
                    <span className="ml-1">{newsletterMessage}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">Datenschutz & Sicherheit</p>
              <ul className="space-y-1 text-xs">
                <li>• Ihre Daten werden SSL-verschlüsselt übertragen</li>
                <li>• Keine Weitergabe an Dritte ohne Ihre Zustimmung</li>
                <li>• Speicherung nur für die Vertragserstellung und -zusendung</li>
                <li>• Details in unserer <a href="/datenschutz" className="text-indigo-600 hover:underline">Datenschutzerklärung</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">Was passiert nach dem Kauf?</p>
              <ul className="text-blue-800 text-xs space-y-1">
                <li>1. Sofortige Bestätigungs-E-Mail mit Rechnung</li>
                <li>2. Automatische PDF-Generierung Ihres Vertrags</li>
                <li>3. Download-Link per E-Mail (meist innerhalb von 2 Minuten)</li>
                <li>4. Optional: Gedruckte Version per Post (gegen Aufpreis)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
