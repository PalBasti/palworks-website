// components/shared/CheckoutSection.js - PRODUCTION READY_1
import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, Check, AlertCircle, Info, ShoppingCart, Download, Mail, FileText } from 'lucide-react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
  },
}

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
  showTitle = true,
  customerEmail: customerEmailProp,
  onPaymentSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const stripe = useStripe()
  const elements = useElements()
  const [paymentState, setPaymentState] = useState('idle') // idle, processing, succeeded, failed
  const [paymentError, setPaymentError] = useState(null)

  useEffect(() => {
    console.log('🔎 Stripe readiness:', {
      hasStripe: !!stripe,
      hasElements: !!elements,
      publishableKeyPresent: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    })
  }, [stripe, elements])

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

  const isFormValid = (formData.customer_email || customerEmailProp) && acceptedTerms && !loading;
  const customerEmail = customerEmailProp || formData.customer_email || formData.billing_email || formData.customerEmail

  const handlePayment = async () => {
    if (!stripe || !elements) return
    if (!acceptedTerms) return

    setPaymentState('processing')
    setPaymentError(null)

    try {
      console.log('📝 Creating contract...')
      // 1) Contract erstellen (Draft)
      const contractResponse = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_type: contractType,
          form_data: formData,
          selected_addons: selectedAddons,
          total_amount: totalPrice,
          customer_email: customerEmail
        })
      })

      if (!contractResponse.ok) {
        const errData = await contractResponse.json().catch(() => ({}))
        console.error('❌ Contract creation failed:', errData)
        throw new Error(errData.message || 'Vertragserstellung fehlgeschlagen')
      }
      const { contract } = await contractResponse.json()
      console.log('✅ Contract created:', contract?.id)

      console.log('💳 Creating payment intent for contract:', contract?.id)
      // 2) Payment Intent erstellen
      const paymentResponse = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_id: contract.id
        })
      })

      if (!paymentResponse.ok) {
        const errData = await paymentResponse.json().catch(() => ({}))
        console.error('❌ Payment intent creation failed:', errData)
        throw new Error(errData.message || 'Payment Intent Erstellung fehlgeschlagen')
      }

      const paymentData = await paymentResponse.json()
      console.log('✅ Payment intent response:', paymentData)
      const clientSecret = paymentData?.payment_intent?.client_secret || paymentData?.client_secret
      if (!clientSecret) throw new Error('Client Secret fehlt')

      console.log('✔️ Confirming card payment with client secret...')
      // 3) Payment bestätigen
      const card = elements.getElement(CardElement)
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card,
          billing_details: { email: customerEmail }
        }
      })

      if (stripeError) {
        console.error('❌ Stripe confirmation error:', stripeError)
        setPaymentError(stripeError.message)
        setPaymentState('failed')
        return
      }

      if (paymentIntent?.status === 'succeeded') {
        console.log('🎉 Payment succeeded:', paymentIntent.id)
        setPaymentState('succeeded')
        onPaymentSuccess && onPaymentSuccess(contract.id, paymentIntent.id)
      } else {
        console.warn('⚠️ Payment did not succeed:', paymentIntent?.status)
        setPaymentState('failed')
        setPaymentError('Zahlung nicht erfolgreich abgeschlossen')
      }
    } catch (e) {
      console.error('❌ Payment flow error:', e)
      setPaymentError(e.message)
      setPaymentState('failed')
    }
  }

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
              <div className="flex items-center space-x-2">
                <span className={`text-xs ${stripe ? 'text-green-600' : 'text-gray-500'}`}>{stripe ? 'Stripe bereit' : 'Warte auf Stripe'}</span>
                <span className="text-xs text-gray-500">Visa</span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-500">Mastercard</span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-500">AMEX</span>
              </div>
            </div>
          </label>
        </div>

        {/* Card Element direkt unter Zahlungsart anzeigen */}
        {paymentMethod === 'stripe' && (
          <div className="mt-3">
            <div className="border rounded p-3 bg-gray-50">
              <CardElement options={cardElementOptions} />
            </div>
            <div className="mt-2 text-xs text-gray-600">
              Test-Kreditkarte: 4242 4242 4242 4242 | Beliebiges Datum & CVC
            </div>
          </div>
        )}
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
      {(error || paymentError) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <span className="text-sm text-red-800">{paymentError || error}</span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handlePayment}
        disabled={!isFormValid || !stripe || paymentState === 'processing'}
        className={`
          w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 
          flex items-center justify-center space-x-2
          ${(!isFormValid || !stripe || paymentState === 'processing')
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl'
          }
        `}
      >
        {paymentState === 'processing' ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Zahlung wird verarbeitet...</span>
          </>
        ) : (
          <>
            <Lock className="h-5 w-5" />
            <span>Jetzt kaufen - {totalPrice.toFixed(2)} €</span>
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
