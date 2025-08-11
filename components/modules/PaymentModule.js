// components/modules/PaymentModule.js - KORRIGIERTE VERSION mit dynamischer Preisberechnung

import { useState, useEffect, useMemo } from 'react'
import { CreditCard, Smartphone, Lock, CheckCircle, AlertCircle, Download, Mail, Loader2 } from 'lucide-react'
import { getAddonsByContractType } from '@/lib/supabase/addonService'

const PaymentModule = ({
  amount: propAmount, // Prop amount als Fallback
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
  const [paymentStatus, setPaymentStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [pdfUrl, setPdfUrl] = useState(null)
  const [contractId, setContractId] = useState(null)
  const [addons, setAddons] = useState([])
  const [addonsLoaded, setAddonsLoaded] = useState(false)

  // Basispreise für verschiedene Vertragstypen
  const basePrices = {
    untermietvertrag: 12.90,
    mietvertrag: 15.90,
    garagenvertrag: 7.90,
    stellplatzvertrag: 7.90,
    gewerbemietvertrag: 24.90
  }

  const basePrice = basePrices[contractType] || 12.90

  // Addons laden beim Mount oder wenn contractType ändert
  useEffect(() => {
    const loadAddons = async () => {
      try {
        const response = await getAddonsByContractType(contractType)
        if (response.success) {
          setAddons(response.data || [])
        } else {
          console.warn('Addon loading failed:', response.error)
          setAddons([])
        }
      } catch (error) {
        console.error('Error loading addons:', error)
        setAddons([])
      } finally {
        setAddonsLoaded(true)
      }
    }

    if (contractType) {
      loadAddons()
    }
  }, [contractType])

  // Dynamische Preisberechnung basierend auf aktuellen Addons
  const calculatedAmount = useMemo(() => {
    if (!addonsLoaded) {
      return propAmount || basePrice // Fallback während Laden
    }

    const addonTotal = selectedAddons.reduce((sum, addonKey) => {
      const addon = addons.find(a => a.addon_key === addonKey)
      return sum + (addon?.price || 0)
    }, 0)

    return basePrice + addonTotal
  }, [basePrice, selectedAddons, addons, addonsLoaded, propAmount])

  // Amount für Display formatieren
  const displayAmount = calculatedAmount.toFixed(2)

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

  const handlePaymentSubmit = async () => {
    if (!customerEmail?.trim()) {
      setErrorMessage('Bitte geben Sie eine gültige E-Mail-Adresse ein')
      return
    }

    try {
      setIsProcessing(true)
      setPaymentStatus('processing')
      setErrorMessage('')

      if (onPaymentInitiated) {
        onPaymentInitiated({ 
          method: selectedMethod, 
          amount: displayAmount,
          contractType,
          selectedAddons
        })
      }

      // 1. Contract in Database erstellen
      console.log('Creating contract with data:', {
        formData,
        selectedAddons,
        totalAmount: displayAmount,
        contractType
      })

      // 2. Payment verarbeiten (simuliert)
      const paymentData = {
        method: selectedMethod,
        amount: displayAmount,
        currency: currency,
        description: orderDescription,
        customerEmail: customerEmail,
        contractType: contractType,
        selectedAddons: selectedAddons
      }

      const paymentResponse = await processPayment(paymentData)
      
      if (paymentResponse.success) {
        // 3. PDF generieren
        console.log('Payment successful, generating PDF...')
        const pdfUrl = await generatePDF()
        
        // 4. E-Mail versenden
        if (customerEmail) {
          await sendContractEmail(pdfUrl)
        }
        
        // 5. Success State setzen
        setPaymentStatus('success')
        setContractId(paymentResponse.transactionId)
        
        if (onPaymentSuccess) {
          onPaymentSuccess({
            ...paymentResponse,
            pdfUrl,
            contractId: paymentResponse.transactionId,
            finalAmount: displayAmount,
            selectedAddons
          })
        }
      } else {
        throw new Error(paymentResponse.error || 'Zahlung fehlgeschlagen')
      }
    } catch (error) {
      console.error('Payment/PDF Error:', error)
      setPaymentStatus('error')
      setErrorMessage(error.message)
      if (onPaymentError) {
        onPaymentError(error)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  // Simulierte Payment-Funktion (durch echte Stripe-Integration ersetzen)
  const processPayment = async (paymentData) => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    if (Math.random() > 0.05) {
      return {
        success: true,
        transactionId: 'txn_' + Date.now(),
        paymentMethod: paymentData.method,
        amount: paymentData.amount
      }
    } else {
      return {
        success: false,
        error: 'Zahlung wurde von der Bank abgelehnt'
      }
    }
  }

  const generatePDF = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return `/api/pdf/contract_${Date.now()}.pdf`
  }

  const sendContractEmail = async (pdfUrl) => {
    console.log(`Sending contract email to ${customerEmail} with PDF: ${pdfUrl}`)
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  if (paymentStatus === 'success') {
    return (
      <div className={`bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center ${className}`}>
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-green-800 mb-2">Zahlung erfolgreich!</h3>
        <p className="text-green-700 mb-4">
          Ihre Zahlung über {formatAmount(displayAmount)} {currency} wurde erfolgreich verarbeitet.
        </p>
        {pdfUrl && (
          <div className="space-y-3">
            <button
              onClick={() => window.open(pdfUrl, '_blank')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center mx-auto transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              PDF herunterladen
            </button>
            {customerEmail && (
              <p className="text-sm text-green-600 flex items-center justify-center">
                <Mail className="h-4 w-4 mr-2" />
                Kopie wurde an {customerEmail} gesendet
              </p>
            )}
          </div>
        )}
      </div>
    )
  }

  if (paymentStatus === 'error') {
    return (
      <div className={`bg-red-50 border-2 border-red-200 rounded-lg p-6 ${className}`}>
        <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Zahlung fehlgeschlagen</h3>
        <p className="text-red-700 mb-4">{errorMessage}</p>
        <button
          onClick={() => {
            setPaymentStatus('idle')
            setErrorMessage('')
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Erneut versuchen
        </button>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
      {/* Header mit dynamischem Preis */}
      <div className="bg-blue-50 px-6 py-4 border-b border-gray-200 rounded-t-lg">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-between">
          <span>💳 Bezahlung</span>
          {!addonsLoaded ? (
            <div className="flex items-center text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Berechne...
            </div>
          ) : (
            <span className="text-xl font-bold text-blue-600">
              {formatAmount(displayAmount)} {currency}
            </span>
          )}
        </h3>
      </div>

      <div className="p-6 space-y-6">
        {/* Preisaufschlüsselung */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Bestellübersicht</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Basis-Vertrag ({contractType}):</span>
              <span>{formatAmount(basePrice)} {currency}</span>
            </div>
            
            {selectedAddons.length > 0 && addons.length > 0 && selectedAddons.map(addonKey => {
              const addon = addons.find(a => a.addon_key === addonKey)
              return addon ? (
                <div key={addonKey} className="flex justify-between text-blue-600">
                  <span>+ {addon.name}:</span>
                  <span>+{formatAmount(addon.price)} {currency}</span>
                </div>
              ) : null
            })}
            
            <div className="border-t border-gray-300 pt-2 flex justify-between font-semibold text-base">
              <span>Gesamtpreis:</span>
              <span>{formatAmount(displayAmount)} {currency}</span>
            </div>
            <div className="text-xs text-gray-600">inkl. 19% MwSt.</div>
          </div>
        </div>

        {/* E-Mail Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            E-Mail für Vertragszustellung *
          </label>
          <input
            type="email"
            value={customerEmail}
            onChange={(e) => {
              // Update über parent component
              if (formData && typeof formData === 'object') {
                formData.customer_email = e.target.value
              }
            }}
            placeholder="ihre@email.de"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-600 mt-1">
            Ihr fertiger Vertrag wird an diese Adresse gesendet
          </p>
        </div>

        {/* Payment Method Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Zahlungsart wählen
          </label>
          <div className="space-y-2">
            {paymentMethods
              .filter(method => enabledMethods.includes(method.id))
              .map((method) => {
                const IconComponent = method.icon
                return (
                  <div
                    key={method.id}
                    className={`
                      cursor-pointer p-4 rounded-lg border-2 transition-all duration-200
                      ${selectedMethod === method.id
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        <IconComponent className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{method.name}</h4>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                      <div className={`
                        h-4 w-4 rounded-full border-2 flex items-center justify-center
                        ${selectedMethod === method.id
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                        }
                      `}>
                        {selectedMethod === method.id && (
                          <div className="h-2 w-2 bg-white rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Security Badge */}
        {showSecurityBadge && (
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <Lock className="h-4 w-4" />
            <span>SSL-verschlüsselt & sicher</span>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
              <span className="text-sm text-red-700">{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Payment Button */}
        <button
          onClick={handlePaymentSubmit}
          disabled={isProcessing || !customerEmail?.trim() || !addonsLoaded}
          className={`
            w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200
            ${isProcessing || !customerEmail?.trim() || !addonsLoaded
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
            }
          `}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Verarbeite Zahlung...
            </div>
          ) : (
            `Jetzt ${formatAmount(displayAmount)} ${currency} bezahlen`
          )}
        </button>

        {/* Legal Text */}
        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>
            Mit dem Klick auf "Bezahlen" akzeptieren Sie unsere{' '}
            <a href="/agb" className="text-blue-600 hover:underline">AGB</a>{' '}
            und{' '}
            <a href="/datenschutz" className="text-blue-600 hover:underline">Datenschutzerklärung</a>
          </p>
          <p>
            Ihr Vertrag wird nach erfolgreicher Zahlung automatisch generiert und per E-Mail zugestellt.
          </p>
        </div>
      </div>
    </div>
  )
}
