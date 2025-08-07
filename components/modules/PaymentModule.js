// components/modules/PaymentModule.js - ERWEITERTE VERSION MIT PDF-INTEGRATION
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

  // PDF generieren und downloaden
  const generatePDF = async () => {
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          selectedAddons,
          contractType
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'PDF-Generierung fehlgeschlagen');
      }

      // PDF als Blob herunterladen
      const pdfBlob = await response.blob();
      const url = window.URL.createObjectURL(pdfBlob);
      
      // Automatischer Download
      const link = document.createElement('a');
      link.href = url;
      link.download = `untermietvertrag_${new Date().toISOString().slice(0,10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // URL für späteren Download speichern
      setPdfUrl(url);
      
      return url;
    } catch (error) {
      console.error('PDF Generation Error:', error);
      throw error;
    }
  }

  // E-Mail mit PDF versenden
  const sendContractEmail = async (pdfUrl) => {
    try {
      // Hier würdest du deinen E-Mail-Service aufrufen
      const response = await fetch('/api/send-contract-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: customerEmail,
          contractType,
          formData,
          pdfUrl, // Oder PDF als Base64
          contractId
        })
      });

      if (response.ok) {
        console.log('Contract email sent successfully');
      } else {
        console.warn('Contract email failed, but payment was successful');
      }
    } catch (error) {
      console.warn('Email sending failed:', error);
      // E-Mail-Fehler sollen Payment-Erfolg nicht beeinträchtigen
    }
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    setPaymentStatus('processing')
    setErrorMessage('')

    if (onPaymentInitiated) {
      onPaymentInitiated(selectedMethod, amount)
    }

    try {
      // 1. Vertrag in DB erstellen (falls noch nicht geschehen)
      const contractData = {
        contract_type: contractType,
        customer_email: customerEmail,
        form_data: formData,
        selected_addons: selectedAddons,
        total_amount: parseFloat(amount),
        status: 'draft',
        payment_status: 'pending'
      }

      // 2. Payment verarbeiten (simuliert)
      const paymentData = {
        method: selectedMethod,
        amount: amount,
        currency: currency,
        description: orderDescription,
        customerEmail: customerEmail
      }

      const paymentResponse = await processPayment(paymentData)
      
      if (paymentResponse.success) {
        // 3. PDF generieren
        console.log('Payment successful, generating PDF...');
        const pdfUrl = await generatePDF();
        
        // 4. E-Mail versenden
        if (customerEmail) {
          await sendContractEmail(pdfUrl);
        }
        
        // 5. Success State setzen
        setPaymentStatus('success')
        setContractId(paymentResponse.transactionId)
        
        if (onPaymentSuccess) {
          onPaymentSuccess({
            ...paymentResponse,
            pdfUrl,
            contractId: paymentResponse.transactionId
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

  // Simulierte Payment-Funktion (ersetzen durch echte Stripe-Integration)
  const processPayment = async (paymentData) => {
    // Simuliere API-Aufruf
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simuliere 95% Erfolgsrate
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

  if (paymentStatus === 'success') {
    return (
      <div className={`bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center ${className}`}>
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-green-800 mb-2">Zahlung erfolgreich!</h3>
        <p className="text-green-700 mb-4">
          Ihre Zahlung über {formatAmount(amount)} {currency} wurde erfolgreich verarbeitet.
        </p>
        
        {/* PDF Download Button */}
        <div className="space-y-3 mb-4">
          <button
            onClick={() => pdfUrl && generatePDF()}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <Download className="h-5 w-5 mr-2" />
            PDF erneut herunterladen
          </button>
          
          {customerEmail && (
            <div className="flex items-center justify-center text-sm text-green-600">
              <Mail className="h-4 w-4 mr-1" />
              Eine Kopie wurde an {customerEmail} gesendet
            </div>
          )}
        </div>
        
        <div className="text-sm text-green-600 space-y-1">
          <p>✓ PDF wurde automatisch heruntergeladen</p>
          {customerEmail && <p>✓ E-Mail-Kopie versendet</p>}
          <p>✓ Rechnung wird separat zugestellt</p>
        </div>
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

        {/* Customer Email Display */}
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
          <h4 className="font-medium text-green-900 mb-3">✓ Das erhalten Sie sofort:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-800">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Rechtssicherer Untermietvertrag
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Automatischer PDF-Download
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              E-Mail-Versand an Ihre Adresse
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Professionelles Layout
            </div>
            {selectedAddons.includes('protocol') && (
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                Übergabeprotokoll inklusive
              </div>
            )}
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
                <span>DSGVO-konform</span>
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
      </div>
    </div>
  )
}

export default PaymentModule
