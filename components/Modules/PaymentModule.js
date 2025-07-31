// components/modules/PaymentModule.js
import { useState } from 'react'
import { CreditCard, Smartphone, Lock, CheckCircle, AlertCircle } from 'lucide-react'

const PaymentModule = ({
  amount,
  currency = "€",
  orderDescription = "PalWorks Vertragserstellung",
  customerEmail = "",
  onPaymentSuccess,
  onPaymentError,
  onPaymentInitiated,
  enabledMethods = ['card', 'paypal', 'sofort'],
  showSecurityBadge = true,
  className = ""
}) => {
  const [selectedMethod, setSelectedMethod] = useState('card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState('idle') // idle, processing, success, error
  const [errorMessage, setErrorMessage] = useState('')

  const paymentMethods = [
    {
      id: 'card',
      name: 'Kreditkarte',
      icon: CreditCard,
      description: 'Visa, Mastercard, American Express'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: () => (
        <div className="w-5 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
          P
        </div>
      ),
      description: 'Sicher mit PayPal bezahlen'
    },
    {
      id: 'sofort',
      name: 'Sofortüberweisung',
      icon: () => (
        <div className="w-5 h-5 bg-pink-500 rounded text-white text-xs flex items-center justify-center font-bold">
          S
        </div>
      ),
      description: 'Direkt vom Bankkonto'
    },
    {
      id: 'giropay',
      name: 'Giropay',
      icon: () => (
        <div className="w-5 h-5 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">
          G
        </div>
      ),
      description: 'Online-Banking Deutschland'
    }
  ]

  const formatAmount = (amount) => {
    return amount.toFixed(2).replace('.', ',')
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    setPaymentStatus('processing')
    setErrorMessage('')

    if (onPaymentInitiated) {
      onPaymentInitiated(selectedMethod, amount)
    }

    try {
      // Hier würde die echte Payment-Integration stattfinden
      // Beispiel für Stripe, PayPal oder andere Provider
      const paymentData = {
        method: selectedMethod,
        amount: amount,
        currency: currency,
        description: orderDescription,
        customerEmail: customerEmail
      }

      // Simulierte API-Anfrage - in Realität würde hier dein Payment Provider aufgerufen
      const response = await processPayment(paymentData)
      
      if (response.success) {
        setPaymentStatus('success')
        if (onPaymentSuccess) {
          onPaymentSuccess(response)
        }
      } else {
        throw new Error(response.error || 'Zahlung fehlgeschlagen')
      }
    } catch (error) {
      setPaymentStatus('error')
      setErrorMessage(error.message)
      if (onPaymentError) {
        onPaymentError(error)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  // Simulierte Payment-Funktion - ersetzen durch echte Implementation
  const processPayment = async (paymentData) => {
    // Simuliere API-Aufruf
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simuliere 90% Erfolgsrate
    if (Math.random() > 0.1) {
      return {
        success: true,
        transactionId: 'txn_' + Date.now(),
        paymentMethod: paymentData.method
      }
    } else {
      return {
        success: false,
        error: 'Zahlung wurde von der Bank abgelehnt'
      }
    }
  }

  if (paymentStatus === 'success') {
    return (
      <div className={`bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center ${className}`}>
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-green-800 mb-2">Zahlung erfolgreich!</h3>
        <p className="text-green-700 mb-4">
          Ihre Zahlung über {formatAmount(amount)} {currency} wurde erfolgreich verarbeitet.
        </p>
        <p className="text-sm text-green-600">
          Sie erhalten in Kürze eine Bestätigung per E-Mail.
        </p>
      </div>
    )
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Zahlung</h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {formatAmount(amount)} {currency}
            </div>
            <div className="text-sm text-gray-600">{orderDescription}</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {paymentStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800 font-medium">Zahlung fehlgeschlagen</span>
            </div>
            <p className="text-red-700 mt-1">{errorMessage}</p>
          </div>
        )}

        {/* Payment Method Selection */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Zahlungsart wählen</h4>
          <div className="grid grid-cols-1 gap-3">
            {paymentMethods
              .filter(method => enabledMethods.includes(method.id))
              .map(method => {
                const IconComponent = method.icon
                return (
                  <label
                    key={method.id}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedMethod === method.id}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center flex-grow">
                      <IconComponent className="h-5 w-5 mr-3 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">{method.name}</div>
                        <div className="text-sm text-gray-600">{method.description}</div>
                      </div>
                    </div>
                    {selectedMethod === method.id && (
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    )}
                  </label>
                )
              })}
          </div>
        </div>

        {/* Security Badge */}
        {showSecurityBadge && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Lock className="h-4 w-4 mr-1" />
                <span>SSL-verschlüsselt</span>
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span>PCI DSS konform</span>
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <div>14 Tage Widerrufsrecht</div>
            </div>
          </div>
        )}

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={isProcessing || paymentStatus === 'processing'}
          className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {paymentStatus === 'processing' ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
              Zahlung wird verarbeitet...
            </div>
          ) : (
            <>Jetzt {formatAmount(amount)} {currency} bezahlen</>
          )}
        </button>

        {/* Additional Info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Mit dem Klick auf "Jetzt bezahlen" akzeptieren Sie unsere{' '}
            <a href="/agb" className="text-blue-600 hover:underline">AGB</a> und{' '}
            <a href="/datenschutz" className="text-blue-600 hover:underline">Datenschutzerklärung</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default PaymentModule
