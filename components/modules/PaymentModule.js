// components/modules/PaymentModule.js - KORRIGIERTE VERSION OHNE SYNTAX-FEHLER
import { useState } from 'react'
import { CreditCard, Smartphone, Lock, CheckCircle, AlertCircle, Download, Mail } from 'lucide-react'

const PaymentModule = ({
  amount,
  currency = "€",
  orderDescription = "PalWorks Vertragserstellung",
  customerEmail = "",
  formData = {},
  selectedAddons = [],
  contractType = "untermietvertrag",
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
  const [pdfUrl, setPdfUrl] = useState(null)
  const [contractId, setContractId] = useState(null)

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
    }
  ]

  const formatAmount = (amount) => {
    return parseFloat(amount).toFixed(2).replace('.', ',')
  }

  const handlePayment = async () => {
    if (isProcessing) return

    setIsProcessing(true)
    setPaymentStatus('processing')
    setErrorMessage('')

    if (onPaymentInitiated) {
      onPaymentInitiated({
        method: selectedMethod,
        amount: amount,
        formData: formData,
        selectedAddons: selectedAddons
      })
    }

    try {
      // Demo payment - simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate success
      const paymentResult = {
        success: true,
        paymentId: `demo_${Date.now()}`,
        method: selectedMethod,
        amount: amount,
        pdfUrl: `/api/generate-pdf?type=${contractType}&demo=true`,
        contractId: `contract_${Date.now()}`
      }

      setPaymentStatus('success')
      setPdfUrl(paymentResult.pdfUrl)
      setContractId(paymentResult.contractId)

      if (onPaymentSuccess) {
        onPaymentSuccess(paymentResult)
      }

    } catch (error) {
      setPaymentStatus('error')
      setErrorMessage(error.message || 'Ein unerwarteter Fehler ist aufgetreten')
      
      if (onPaymentError) {
        onPaymentError(error)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  if (paymentStatus === 'success') {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Zahlung erfolgreich!
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Ihr Vertrag wird erstellt und per E-Mail gesendet.
          </p>
          
          {pdfUrl && (
            <button
              onClick={() => window.open(pdfUrl, '_blank')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              PDF herunterladen
            </button>
          )}
        </div>
      </div>
    )
  }

  if (paymentStatus === 'error') {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Zahlung fehlgeschlagen
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {errorMessage || 'Bitte versuchen Sie es erneut.'}
          </p>
          <button
            onClick={() => {
              setPaymentStatus('idle')
              setErrorMessage('')
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Zahlung abschließen
        </h3>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">Gesamtbetrag:</span>
          <span className="text-xl font-bold text-gray-900">
            {formatAmount(amount)} {currency}
          </span>
        </div>
      </div>

      {customerEmail && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Mail className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="font-medium text-blue-900">PDF-Versand an:</p>
              <p className="text-blue-700 text-sm">{customerEmail}</p>
            </div>
          </div>
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

      {/* Was Sie erhalten */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-green-900 mb-2">✅ Das erhalten Sie:</h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Rechtssicherer {contractType} als PDF</li>
          <li>• Sofortiger Download nach Zahlung</li>
          <li>• E-Mail-Versand an {customerEmail || 'Ihre E-Mail'}</li>
          {selectedAddons.length > 0 && (
            <li>• {selectedAddons.length} zusätzliche(r) Service(s)</li>
          )}
        </ul>
      </div>

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
      >
        {isProcessing ? (
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

      {/* Process Steps Info */}
      <div className="mt-6 border-t pt-4">
        <div className="flex justify-between items-center text-xs text-gray-600">
          <div className="text-center flex-1">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
              <span className="text-blue-600 font-semibold text-xs">1</span>
            </div>
            <span>Bezahlen</span>
          </div>
          <div className="w-4 h-px bg-gray-300 mx-1"></div>
          <div className="text-center flex-1">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
              <span className="text-blue-600 font-semibold text-xs">2</span>
            </div>
            <span>PDF-Download</span>
          </div>
          <div className="w-4 h-px bg-gray-300 mx-1"></div>
          <div className="text-center flex-1">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
              <span className="text-blue-600 font-semibold text-xs">3</span>
            </div>
            <span>E-Mail-Versand</span>
          </div>
        </div>
      </div>

      {showSecurityBadge && (
        <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
          <Lock className="h-3 w-3 mr-1" />
          <span>256-Bit SSL verschlüsselt</span>
        </div>
      )}
    </div>
  )
}

export default PaymentModule
