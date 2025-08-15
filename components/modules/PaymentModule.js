// components/modules/PaymentModule.js - COMPLETE FIXED VERSION
// Vollständig überarbeitete Version mit funktionierender E-Mail-Integration

import { useState, useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon, ClockIcon, CreditCardIcon, MailIcon, DocumentIcon } from '@heroicons/react/24/outline'

export default function PaymentModule({ 
  amount, 
  currency = 'EUR',
  contractType = 'untermietvertrag',
  formData,
  selectedAddons = [],
  customerEmail,
  onPaymentSuccess,
  onPaymentError,
  onPaymentInitiated 
}) {
  const [selectedMethod, setSelectedMethod] = useState('card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [contractId, setContractId] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [emailStatus, setEmailStatus] = useState('idle') // idle, sending, sent, failed
  const [emailMessage, setEmailMessage] = useState('')

  const methods = [
    { 
      id: 'card', 
      name: 'Kreditkarte', 
      icon: '💳',
      description: 'Visa, Mastercard, American Express'
    },
    { 
      id: 'paypal', 
      name: 'PayPal', 
      icon: '🟦',
      description: 'Sicher mit PayPal bezahlen'
    },
    { 
      id: 'sofort', 
      name: 'Sofortüberweisung', 
      icon: '🏦',
      description: 'Direkt vom Bankkonto'
    },
    { 
      id: 'giropay', 
      name: 'Giropay', 
      icon: '🇩🇪',
      description: 'Deutsche Banken'
    }
  ]

  const contractTypeNames = {
    'untermietvertrag': 'Untermietvertrag',
    'garagenvertrag': 'Garagenmietvertrag',
    'wg-untermietvertrag': 'WG-Untermietvertrag'
  }

  const orderDescription = `${contractTypeNames[contractType] || contractType} mit ${selectedAddons?.length || 0} Addon(s)`

  // E-Mail mit PDF versenden - FIXED VERSION (funktioniert mit API)
  const sendContractEmail = async () => {
    if (!customerEmail) {
      console.warn('No customer email provided - skipping email send');
      setEmailMessage('⚠️ Keine E-Mail-Adresse angegeben');
      return false;
    }

    try {
      setEmailStatus('sending');
      setEmailMessage('E-Mail wird versendet...');

      console.log('🔄 Sending contract email to:', customerEmail);
      console.log('🔄 Contract type:', contractType);
      console.log('🔄 Form data:', formData);
      console.log('🔄 Selected addons:', selectedAddons);

      const response = await fetch('/api/send-contract-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: customerEmail,
          contractType: contractType,
          formData: formData,
          selectedAddons: selectedAddons || []
          // Kein pdfUrl oder contractId nötig - API generiert alles selbst!
        })
      });

      console.log('📧 Email API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('📧 Email API error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: 'Unknown error', details: errorText };
        }
        
        throw new Error(errorData.details || errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('📧 Email API success response:', result);

      if (result.success) {
        setEmailStatus('sent');
        setEmailMessage(`✅ E-Mail erfolgreich an ${customerEmail} versendet`);
        console.log('✅ Contract email sent successfully:', result.messageId);
        return true;
      } else {
        throw new Error(result.details || result.error || 'Unbekannter E-Mail-Fehler');
      }
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      setEmailStatus('failed');
      setEmailMessage(`❌ E-Mail-Versand fehlgeschlagen: ${error.message}`);
      return false;
    }
  };

  // PDF generieren und downloaden (optional - als Fallback)
  const generatePDF = async () => {
    try {
      console.log('🔄 Generating PDF for contract:', contractType);
      
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

      const pdfBlob = await response.blob();
      const url = window.URL.createObjectURL(pdfBlob);
      
      // Automatischer Download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${contractTypeNames[contractType] || contractType}_${new Date().toISOString().slice(0,10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setPdfUrl(url);
      console.log('✅ PDF generated and downloaded successfully');
      return url;
    } catch (error) {
      console.error('❌ PDF Generation Error:', error);
      throw error;
    }
  }

  // Demo Payment Processor
  const processPayment = async (paymentData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 95% Erfolgsrate für realistische Demo
        const success = Math.random() > 0.05;
        
        if (success) {
          resolve({
            success: true,
            paymentId: `demo_${Date.now()}`,
            transactionId: `txn_${Date.now()}`,
            method: paymentData.method,
            amount: paymentData.amount,
            currency: paymentData.currency
          });
        } else {
          resolve({
            success: false,
            error: 'Payment processing failed - demo mode'
          });
        }
      }, 2000); // 2 Sekunden Verarbeitungszeit
    });
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage('');
    setEmailStatus('idle');
    setEmailMessage('');

    if (onPaymentInitiated) {
      onPaymentInitiated(selectedMethod, amount);
    }

    try {
      console.log('🔄 Starting payment process...');
      console.log('🔄 Form data received:', formData);
      console.log('🔄 Selected addons:', selectedAddons);
      console.log('🔄 Customer email:', customerEmail);

      // 1. Payment verarbeiten (Demo)
      const paymentData = {
        method: selectedMethod,
        amount: amount,
        currency: currency,
        description: orderDescription,
        customerEmail: customerEmail
      };

      console.log('🔄 Processing payment...', paymentData);
      const paymentResponse = await processPayment(paymentData);
      
      if (paymentResponse.success) {
        console.log('✅ Payment successful:', paymentResponse);
        setPaymentStatus('succeeded');
        setContractId(paymentResponse.transactionId);
        
        // 2. PDF generieren (als Fallback)
        try {
          console.log('🔄 Generating PDF...');
          await generatePDF();
          console.log('✅ PDF generated successfully');
        } catch (pdfError) {
          console.error('❌ PDF generation failed:', pdfError);
          // PDF-Fehler loggen, aber E-Mail trotzdem versuchen
        }
        
        // 3. E-Mail automatisch versenden (Hauptfunktion!)
        let emailSent = false;
        if (customerEmail) {
          console.log('🔄 Sending email...');
          emailSent = await sendContractEmail();
        } else {
          console.warn('⚠️ No customer email - skipping email send');
          setEmailStatus('failed');
          setEmailMessage('⚠️ Keine E-Mail-Adresse angegeben');
        }

        // 4. Success Callback
        if (onPaymentSuccess) {
          onPaymentSuccess({
            paymentId: paymentResponse.paymentId,
            transactionId: paymentResponse.transactionId,
            amount: amount,
            method: selectedMethod,
            contractType: contractType,
            emailSent: emailSent
          });
        }

      } else {
        throw new Error(paymentResponse.error || 'Payment failed');
      }

    } catch (error) {
      console.error('❌ Payment process failed:', error);
      setPaymentStatus('failed');
      setErrorMessage(error.message);
      setEmailStatus('failed');
      setEmailMessage('Payment fehlgeschlagen - keine E-Mail versendet');
      
      if (onPaymentError) {
        onPaymentError(error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Status Icons
  const getStatusIcon = (status) => {
    switch(status) {
      case 'processing': return <ClockIcon className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'succeeded': return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'failed': return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  const getEmailStatusIcon = (status) => {
    switch(status) {
      case 'sending': return <ClockIcon className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'sent': return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircleIcon className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Zahlungsabwicklung</h3>
      
      {/* Bestellübersicht */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-2">Bestellübersicht</h4>
        <div className="text-sm text-gray-600">
          <div className="flex justify-between">
            <span>{orderDescription}</span>
            <span className="font-medium">{amount} {currency}</span>
          </div>
          {customerEmail && (
            <div className="mt-2 text-xs text-gray-500 flex items-center">
              <MailIcon className="w-4 h-4 mr-1" />
              E-Mail-Versand an: {customerEmail}
            </div>
          )}
          {selectedAddons && selectedAddons.length > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              <strong>Addons:</strong> {selectedAddons.map(addon => addon.name || addon.id).join(', ')}
            </div>
          )}
        </div>
      </div>

      {/* Zahlungsmethoden */}
      {paymentStatus === 'idle' && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">Zahlungsmethode wählen</h4>
          <div className="grid grid-cols-2 gap-3">
            {methods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                disabled={isProcessing}
                className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                  selectedMethod === method.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-lg">{method.icon}</span>
                  <span>{method.name}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">{method.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Payment Status */}
      {paymentStatus !== 'idle' && (
        <div className="mb-4 p-3 rounded-lg border">
          <div className="flex items-center space-x-2">
            {getStatusIcon(paymentStatus)}
            <span className="text-sm font-medium">
              {paymentStatus === 'processing' && 'Zahlung wird verarbeitet...'}
              {paymentStatus === 'succeeded' && 'Zahlung erfolgreich!'}
              {paymentStatus === 'failed' && 'Zahlung fehlgeschlagen'}
            </span>
          </div>
          {errorMessage && (
            <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
          )}
        </div>
      )}

      {/* E-Mail Status */}
      {emailStatus !== 'idle' && (
        <div className="mb-4 p-3 rounded-lg border border-blue-200 bg-blue-50">
          <div className="flex items-center space-x-2">
            {getEmailStatusIcon(emailStatus)}
            <span className="text-sm font-medium text-blue-800">
              {emailMessage}
            </span>
          </div>
          {emailStatus === 'sent' && (
            <div className="mt-2 text-xs text-blue-700">
              📧 Prüfen Sie auch Ihren Spam-Ordner!
            </div>
          )}
        </div>
      )}

      {/* Bezahlen Button */}
      {paymentStatus === 'idle' && (
        <button
          onClick={handlePayment}
          disabled={isProcessing || !customerEmail}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
            isProcessing || !customerEmail
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center space-x-2">
              <ClockIcon className="w-5 h-5 animate-spin" />
              <span>Verarbeitung läuft...</span>
            </div>
          ) : !customerEmail ? (
            'E-Mail-Adresse erforderlich'
          ) : (
            `Jetzt bezahlen - ${amount} ${currency}`
          )}
        </button>
      )}

      {/* PDF Download (Falls E-Mail fehlschlägt) */}
      {pdfUrl && emailStatus === 'failed' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm text-yellow-800 mb-2 flex items-center">
            <DocumentIcon className="w-4 h-4 mr-1" />
            E-Mail-Versand fehlgeschlagen, aber Ihr Vertrag steht zum Download bereit:
          </div>
          <a
            href={pdfUrl}
            download={`${contractTypeNames[contractType]}_${new Date().toISOString().slice(0,10)}.pdf`}
            className="inline-flex items-center px-3 py-2 bg-yellow-600 text-white text-sm font-medium rounded hover:bg-yellow-700 transition-colors"
          >
            📄 PDF herunterladen
          </a>
        </div>
      )}

      {/* Success State mit E-Mail-Info */}
      {paymentStatus === 'succeeded' && emailStatus === 'sent' && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 text-green-800">
            <CheckCircleIcon className="w-5 h-5" />
            <span className="font-medium">Alles erledigt!</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            Ihr {contractTypeNames[contractType]} wurde bezahlt und per E-Mail versendet.
          </p>
          <div className="mt-2 text-xs text-green-600">
            📧 Empfänger: {customerEmail}
          </div>
        </div>
      )}

      {/* Retry Button bei Fehlern */}
      {paymentStatus === 'failed' && (
        <button
          onClick={() => {
            setPaymentStatus('idle');
            setErrorMessage('');
            setEmailStatus('idle');
            setEmailMessage('');
          }}
          className="w-full mt-4 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Erneut versuchen
        </button>
      )}

      {/* Debug Info (nur in Development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
          <div><strong>Debug:</strong></div>
          <div>Status: {paymentStatus}</div>
          <div>Email: {emailStatus}</div>
          <div>Customer: {customerEmail || 'nicht gesetzt'}</div>
          <div>Contract: {contractType}</div>
          <div>Addons: {selectedAddons?.length || 0}</div>
        </div>
      )}
    </div>
  );
}
