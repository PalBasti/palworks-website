// ✅ 7. CHECKOUT SECTION - KONSISTENT MIT PRICING
// File: components/shared/CheckoutSection.js
import React, { useState } from 'react';
import { CreditCard, Lock, Check, AlertCircle } from 'lucide-react';

const CheckoutSection = ({
  formData = {},
  selectedAddons = [],
  totalPrice = 0,
  onSubmit = () => {},
  loading = false,
  error = null
}) => {
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  // Gewählte Addons für Anzeige
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

  const handleCheckout = async () => {
    try {
      await onSubmit({
        ...formData,
        selected_addons: selectedAddons,
        total_amount: totalPrice,
        payment_method: paymentMethod
      });
    } catch (err) {
      console.error('Checkout failed:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Bestellung abschließen
        </h3>
        <p className="text-sm text-gray-600">
          Sicher bezahlen und sofort Vertrag erhalten
        </p>
      </div>

      {/* Bestellübersicht */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Ihre Bestellung</h4>
        
        {/* Basis-Vertrag */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-700">Basisvertrag</span>
          <span className="text-sm font-medium">{(totalPrice - selectedAddonList.reduce((sum, addon) => sum + addon.price, 0)).toFixed(2)} €</span>
        </div>

        {/* Addons */}
        {selectedAddonList.map((addon, index) => (
          <div key={index} className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-700 flex items-center">
              <span className="mr-2">{addon.icon}</span>
              {addon.name}
            </span>
            <span className="text-sm font-medium">+{addon.price.toFixed(2)} €</span>
          </div>
        ))}

        {/* Gesamt */}
        <div className="border-t pt-2 mt-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Gesamt (inkl. MwSt.)</span>
            <span className="text-lg font-bold text-blue-600">{totalPrice.toFixed(2)} €</span>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Zahlungsart</h4>
        <div className="space-y-2">
          <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="payment_method"
              value="stripe"
              checked={paymentMethod === 'stripe'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <div className="ml-3 flex items-center">
              <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium">Kreditkarte / Debitkarte</span>
            </div>
          </label>
        </div>
      </div>

      {/* Sicherheitshinweis */}
      <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center">
          <Lock className="h-4 w-4 text-green-600 mr-2" />
          <span className="text-sm text-green-800">
            Sichere Zahlung über Stripe • SSL-verschlüsselt
          </span>
        </div>
      </div>

      {/* Was Sie erhalten */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Das erhalten Sie:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li className="flex items-center">
            <Check className="h-4 w-4 mr-2" />
            Sofortiger PDF-Download nach Zahlung
          </li>
          <li className="flex items-center">
            <Check className="h-4 w-4 mr-2" />
            E-Mail mit Vertrag und Rechnung
          </li>
          <li className="flex items-center">
            <Check className="h-4 w-4 mr-2" />
            Rechtssichere Vertragsvorlage
          </li>
          {selectedAddonList.length > 0 && (
            <li className="flex items-center">
              <Check className="h-4 w-4 mr-2" />
              {selectedAddonList.length} Zusatzdokument{selectedAddonList.length > 1 ? 'e' : ''}
            </li>
          )}
        </ul>
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

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        disabled={loading || !formData.customer_email}
        className={`
          w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200
          ${loading || !formData.customer_email
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }
        `}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Verarbeite Zahlung...
          </span>
        ) : (
          `Jetzt kaufen - ${totalPrice.toFixed(2)} €`
        )}
      </button>

      {/* Rechtliche Hinweise */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Mit dem Kauf stimmen Sie unseren 
        <a href="/agb" className="text-blue-600 hover:underline mx-1">AGB</a>
        und 
        <a href="/datenschutz" className="text-blue-600 hover:underline mx-1">Datenschutzbestimmungen</a>
        zu.
      </div>
    </div>
  );
};

export default CheckoutSection;
