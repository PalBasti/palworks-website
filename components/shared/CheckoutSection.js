// components/shared/CheckoutSection.js - PRODUCTION READY
import React, { useState } from 'react';
import { CreditCard, Lock, Check, AlertCircle, Info, ShoppingCart, Download, Mail, FileText } from 'lucide-react';

const CheckoutSection = ({
  formData = {},
  selectedAddons = [],
  totalPrice = 0,
  basePrice = 0,
  contractType = 'untermietvertrag',
  onSubmit = () => {},
  loading = false,
  error = null,
  compact = false,
  showTitle = true
}) => {
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // ✅ KONSISTENTE Addon-Details mit anderen Modulen
  const addonDetails = {
    'explanation': { name: 'Vertragserläuterungen', price: 9.90, icon: '📝' },
    'handover_protocol': { name: 'Übergabeprotokoll', price: 7.90, icon: '📋' },
    'legal_review': { name: 'Anwaltliche Prüfung', price: 29.90, icon: '⚖️' },
    'insurance_clause': { name: 'Versicherungsklauseln', price: 4.90, icon: '🛡️' },
    'maintenance_guide': { name: 'Wartungshandbuch', price: 12.90, icon: '🔧' },
    'house_rules': { name: 'WG-Hausordnung', price: 6.90, icon: '🏠' },
    'cleaning_schedule': { name: 'Putzplan-Template', price: 3.90, icon: '🧹' }
  };

  const selectedAddonList = selectedAddons.map(key => addonDetails[key]).filter(Boolean);
  const addonTotal = selectedAddonList.reduce((sum, addon) => sum + addon.price, 0);
  const calculatedBasePrice = totalPrice - addonTotal;

  // Contract Type Labels
  const contractLabels = {
    'untermietvertrag': 'Untermietvertrag',
    'garage': 'Garagenvertrag', 
    'wg': 'WG-Untermietvertrag'
  };

  const handleCheckout = async () => {
    if (!acceptedTerms) {
      alert('Bitte akzeptieren Sie die AGB und Datenschutzbestimmungen.');
      return;
    }

    try {
      await onSubmit({
        ...formData,
        selected_addons: selectedAddons,
        total_amount: totalPrice,
        payment_method: paymentMethod,
        accepted_terms: acceptedTerms
      });
    } catch (err) {
      console.error('Checkout failed:', err);
    }
  };

  const isFormValid = formData.customer_email && acceptedTerms && !loading;

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${compact ? 'p-4' : 'p-6'}`}>
      {showTitle && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Bestellung abschließen
          </h3>
          <p className="text-sm text-gray-600">
            Sicher bezahlen und sofort Vertrag erhalten
          </p>
        </div>
      )}

      {/* Bestellübersicht */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          Ihre Bestellung
        </h4>
        
        {/* Basis-Vertrag */}
        <div className="flex justify-between items-center mb-2 pb-2">
          <div className="flex items-center">
            <span className="text-lg mr-2">📄</span>
            <span className="text-sm text-gray-700 font-medium">
              {contractLabels[contractType] || 'Vertrag'}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {(calculatedBasePrice || basePrice).toFixed(2)} €
          </span>
        </div>

        {/* Addons */}
        {selectedAddonList.length > 0 && (
          <div className="border-t pt-2 mb-2">
            <div className="text-xs text-gray-500 mb-2 font-medium">Zusatzleistungen:</div>
            {selectedAddonList.map((addon, index) => (
              <div key={index} className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600 flex items-center">
                  <span className="mr-2">{addon.icon}</span>
                  {addon.name}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  +{addon.price.toFixed(2)} €
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Gesamt */}
        <div className="border-t pt-2 mt-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Gesamt (inkl. 19% MwSt.)</span>
            <span className="text-lg font-bold text-blue-600">{totalPrice.toFixed(2)} €</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Netto: {(totalPrice / 1.19).toFixed(2)} € + {(totalPrice - totalPrice / 1.19).toFixed(2)} € MwSt.
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <CreditCard className="h-4 w-4 mr-2" />
          Zahlungsart
        </h4>
        <div className="space-y-2">
          <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200">
            <input
              type="radio"
              name="payment_method"
              value="stripe"
              checked={paymentMethod === 'stripe'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div className="ml-3 flex items-center justify-between w-full">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium">Kreditkarte / Debitkarte</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-500">Visa</span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-500">Mastercard</span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-500">AMEX</span>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Sicherheitshinweis */}
      <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center">
          <Lock className="h-4 w-4 text-green-600 mr-2" />
          <span className="text-sm text-green-800 font-medium">
            Sichere Zahlung über Stripe
          </span>
        </div>
        <p className="text-xs text-green-700 mt-1">
          SSL-verschlüsselt • PCI-DSS konform • Keine Kartendaten gespeichert
        </p>
      </div>

      {/* Was Sie erhalten */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-3 flex items-center">
          <Download className="h-4 w-4 mr-2" />
          Das erhalten Sie:
        </h4>
        <ul className="text-sm text-blue-800 space-y-2">
          <li className="flex items-center">
            <Check className="h-4 w-4 mr-2 text-blue-600" />
            Sofortiger PDF-Download nach Zahlung
          </li>
          <li className="flex items-center">
            <Mail className="h-4 w-4 mr-2 text-blue-600" />
            E-Mail mit Vertrag und Rechnung
          </li>
          <li className="flex items-center">
            <FileText className="h-4 w-4 mr-2 text-blue-600" />
            Rechtssichere Vertragsvorlage
          </li>
          {selectedAddonList.length > 0 && (
            <li className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-blue-600" />
              {selectedAddonList.length} professionelle{selectedAddonList.length > 1 ? '' : 's'} Zusatzdokument{selectedAddonList.length > 1 ? 'e' : ''}
            </li>
          )}
          <li className="flex items-center">
            <Check className="h-4 w-4 mr-2 text-blue-600" />
            Unbegrenzte Nutzung und Anpassung
          </li>
        </ul>
      </div>

      {/* AGB Checkbox */}
      <div className="mb-6 p-3 border border-gray-200 rounded-lg">
        <label className="flex items-start cursor-pointer">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="ml-3">
            <span className="text-sm text-gray-700">
              Ich akzeptiere die{' '}
              <a 
                href="/agb" 
                className="text-blue-600 hover:text-blue-700 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Allgemeinen Geschäftsbedingungen
              </a>
              {' '}und{' '}
              <a 
                href="/datenschutz" 
                className="text-blue-600 hover:text-blue-700 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Datenschutzbestimmungen
              </a>
              .
            </span>
          </div>
        </label>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {!formData.customer_email && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center">
            <Info className="h-4 w-4 text-amber-600 mr-2" />
            <span className="text-sm text-amber-800">
              Bitte geben Sie Ihre E-Mail-Adresse ein
            </span>
          </div>
        </div>
      )}

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        disabled={!isFormValid}
        className={`
          w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 
          flex items-center justify-center space-x-2
          ${!isFormValid
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl'
          }
        `}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Verarbeite Zahlung...</span>
          </>
        ) : (
          <>
            <Lock className="h-5 w-5" />
            <span>Jetzt sicher kaufen - {totalPrice.toFixed(2)} €</span>
          </>
        )}
      </button>

      {/* Geld-zurück-Garantie */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center px-3 py-2 bg-green-50 border border-green-200 rounded-full">
          <Check className="h-4 w-4 text-green-600 mr-2" />
          <span className="text-sm font-medium text-green-800">
            30 Tage Geld-zurück-Garantie
          </span>
        </div>
      </div>

      {/* Support Hinweis */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>
          Bei Fragen erreichen Sie uns unter{' '}
          <a 
            href="mailto:support@palworks.de" 
            className="text-blue-600 hover:underline"
          >
            support@palworks.de
          </a>
          <br />
          Antwort innerhalb von 24 Stunden garantiert
        </p>
      </div>
    </div>
  );
};

export default CheckoutSection;
