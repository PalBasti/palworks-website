// components/modules/PaymentModule.js - COMPLETE FIXED VERSION mit selectedAddons Fix
import { useState, useEffect } from 'react'

export default function PaymentModule({ 
  amount, 
  currency = 'EUR',
  contractType = 'untermietvertrag',
  contractData, // ✅ WICHTIG: Verwende contractData statt formData
  selectedAddons = [],
  totalAmount,
  onSuccess,
  onError,
  onPaymentInitiated 
}) {
  const [selectedMethod, setSelectedMethod] = useState('card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [emailStatus, setEmailStatus] = useState('idle')
  const [emailMessage, setEmailMessage] = useState('')

  // 🔧 FIX: Robuste selectedAddons Extraktion mit Debug-Logs
  const getSelectedAddons = () => {
    console.log('🔍 PaymentModule selectedAddons Debug:', {
      selectedAddonsProp: selectedAddons,
      selectedAddonsType: typeof selectedAddons,
      selectedAddonsArray: Array.isArray(selectedAddons),
      selectedAddonsLength: selectedAddons?.length,
      contractDataSelectedAddons: contractData?.selectedAddons,
      contractDataSelected_addons: contractData?.selected_addons
    });

    // Priorität: selectedAddons prop > contractData.selectedAddons > contractData.selected_addons
    if (selectedAddons && Array.isArray(selectedAddons) && selectedAddons.length > 0) {
      console.log('✅ Using selectedAddons prop:', selectedAddons);
      return selectedAddons;
    }
    
    if (contractData?.selectedAddons && Array.isArray(contractData.selectedAddons) && contractData.selectedAddons.length > 0) {
      console.log('✅ Using contractData.selectedAddons:', contractData.selectedAddons);
      return contractData.selectedAddons;
    }
    
    if (contractData?.selected_addons && Array.isArray(contractData.selected_addons) && contractData.selected_addons.length > 0) {
      console.log('✅ Using contractData.selected_addons:', contractData.selected_addons);
      return contractData.selected_addons;
    }
    
    console.warn('⚠️ No selectedAddons found, using empty array');
    return [];
  };

  // 🔧 FIX: Robuste E-Mail-Extraktion mit mehreren Fallbacks
  const extractCustomerEmail = () => {
    if (!contractData) return null;
    
    // Priorität: billing_email > customer_email > customerEmail
    const email = contractData.billing_email || 
                  contractData.customer_email || 
                  contractData.customerEmail ||
                  null;
    
    console.log('📧 PaymentModule - E-Mail-Extraktion:', {
      contractData: !!contractData,
      billing_email: contractData.billing_email,
      customer_email: contractData.customer_email,
      customerEmail: contractData.customerEmail,
      extracted: email
    });
    
    return email;
  };

  // 🔧 FIX: Sichere Form-Data-Extraktion für alle Vertragstypen
  const getFormDataForEmail = () => {
    if (!contractData) return {};
    
    // Kopiere alle relevanten Felder für E-Mail-Versand
    return {
      // Billing-Informationen
      billing_name: contractData.billing_name,
      billing_address: contractData.billing_address,
      billing_postal: contractData.billing_postal,
      billing_city: contractData.billing_city,
      billing_email: contractData.billing_email,
      
      // Untermietvertrag-Felder
      property_address: contractData.property_address,
      property_postal: contractData.property_postal,
      property_city: contractData.property_city,
      rent_amount: contractData.rent_amount,
      start_date: contractData.start_date,
      end_date: contractData.end_date,
      
      // Garage-Felder
      garage_type: contractData.garage_type,
      garage_address: contractData.garage_address,
      garage_postal: contractData.garage_postal,
      garage_city: contractData.garage_city,
      garage_number: contractData.garage_number,
      garage_size: contractData.garage_size,
      garage_keys: contractData.garage_keys,
      garage_same_address: contractData.garage_same_address,
      garage_lease_type: contractData.garage_lease_type,
      garage_rent: contractData.garage_rent,
      deposit_amount: contractData.deposit_amount,
      additional_costs: contractData.additional_costs,
      payment_method: contractData.payment_method,
      bank_details: contractData.bank_details,
      access_times: contractData.access_times,
      
      // Vertragsparteien
      landlord_name: contractData.landlord_name,
      landlord_address: contractData.landlord_address,
      landlord_phone: contractData.landlord_phone,
      tenant_name: contractData.tenant_name,
      tenant_address: contractData.tenant_address,
      tenant_phone: contractData.tenant_phone,
      
      // Weitere Felder
      special_agreements: contractData.special_agreements,
      pets_allowed: contractData.pets_allowed,
      smoking_allowed: contractData.smoking_allowed,
      
      // Für andere Vertragstypen - spread alle anderen Felder
      ...contractData
    };
  };

  const customerEmail = extractCustomerEmail();
  const formDataForEmail = getFormDataForEmail();
  const finalSelectedAddons = getSelectedAddons(); // ✅ FIXED

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
    }
  ];

  const contractTypeNames = {
    'untermietvertrag': 'Untermietvertrag',
    'garagenvertrag': 'Garagenmietvertrag',
    'wg-untermietvertrag': 'WG-Untermietvertrag'
  };

  // Contract in Database erstellen
  const createContract = async () => {
    try {
      console.log('📝 Creating contract with data:', {
        contractType,
        customerEmail,
        formData: formDataForEmail,
        selectedAddons: finalSelectedAddons, // ✅ FIXED
        totalAmount: totalAmount || amount
      });

      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractType,
          customerEmail, // ✅ Verwende extrahierte E-Mail
          formData: formDataForEmail, // ✅ Verwende komplette Form-Data
          selectedAddons: finalSelectedAddons, // ✅ FIXED
          totalAmount: totalAmount || amount
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Contract creation failed');
      }

      const result = await response.json();
      console.log('✅ Contract created successfully:', result.contract_id);
      return result.contract_id;

    } catch (error) {
      console.error('❌ Contract creation failed:', error);
      throw error;
    }
  };

  // E-Mail mit PDF versenden
  const sendContractEmail = async () => {
    if (!customerEmail) {
      console.warn('❌ No customer email - skipping email');
      setEmailMessage('⚠️ Keine E-Mail-Adresse verfügbar');
      return false;
    }

    try {
      setEmailStatus('sending');
      setEmailMessage(`📧 E-Mail wird an ${customerEmail} gesendet...`);

      console.log('📧 Sending contract email:', {
        email: customerEmail,
        contractType,
        formData: formDataForEmail,
        selectedAddons: finalSelectedAddons // ✅ FIXED
      });

      const response = await fetch('/api/send-contract-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: customerEmail,
          contractType: contractType,
          formData: formDataForEmail, // ✅ Vollständige Form-Data
          selectedAddons: finalSelectedAddons // ✅ FIXED
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'E-Mail-Versand fehlgeschlagen');
      }

      const result = await response.json();
      console.log('✅ E-Mail sent successfully:', result);
      
      setEmailStatus('sent');
      const documentCountText = result.documentCount > 1 ? ` mit ${result.documentCount} PDFs` : '';
      setEmailMessage(`✅ E-Mail erfolgreich an ${customerEmail} gesendet${documentCountText}!`);
      return true;

    } catch (error) {
      console.error('❌ E-Mail send failed:', error);
      setEmailStatus('failed');
      setEmailMessage(`❌ E-Mail-Versand fehlgeschlagen: ${error.message}`);
      return false;
    }
  };

  // Payment verarbeiten (Demo-Implementation)
  const processPayment = async () => {
    if (!customerEmail) {
      setErrorMessage('E-Mail-Adresse ist erforderlich für den Payment-Prozess');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      console.log('💳 Processing payment...');
      
      // 1. Contract erstellen
      const contractId = await createContract();
      
      // 2. Demo Payment (95% Erfolgsrate)
      const paymentSuccess = Math.random() > 0.05;
      
      if (!paymentSuccess) {
        throw new Error('Demo Payment fehlgeschlagen (5% Fehlerrate)');
      }

      // 3. Payment erfolgreich
      await new Promise(resolve => setTimeout(resolve, 2000)); // Demo-Delay
      setPaymentStatus('success');

      // 4. E-Mail senden
      const emailSent = await sendContractEmail();

      // 5. Success-Callback
      if (onSuccess) {
        onSuccess({
          contractId,
          paymentMethod: selectedMethod,
          amount: totalAmount || amount,
          customerEmail,
          emailSent: emailSent
        });
      }

    } catch (error) {
      console.error('❌ Payment failed:', error);
      setPaymentStatus('error');
      setErrorMessage(error.message);
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Debug Effect
  useEffect(() => {
    console.log('🔍 PaymentModule Props Update:', {
      contractType,
      selectedAddons,
      contractData: !!contractData,
      finalSelectedAddons: finalSelectedAddons,
      customerEmail
    });
  }, [contractType, selectedAddons, contractData, finalSelectedAddons, customerEmail]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          💳 Payment & Download
        </h3>
        
        {/* E-Mail-Status anzeigen */}
        <div className={`p-3 rounded-lg mb-4 ${
          customerEmail 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            <span className="mr-2">
              {customerEmail ? '📧' : '⚠️'}
            </span>
            <div className="flex-1">
              {customerEmail ? (
                <>
                  <p className="text-sm font-medium text-green-900">
                    E-Mail-Versand an: {customerEmail}
                  </p>
                  <p className="text-xs text-green-700">
                    Ihr Vertrag wird automatisch nach dem Payment gesendet
                    {finalSelectedAddons.length > 0 && ` (${finalSelectedAddons.length + 1} PDFs)`}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-red-900">
                    Keine E-Mail-Adresse verfügbar
                  </p>
                  <p className="text-xs text-red-700">
                    Bitte füllen Sie das Formular vollständig aus
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Zahlungsmethode wählen:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {methods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`p-4 border rounded-lg text-left transition-all ${
                selectedMethod === method.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">{method.icon}</span>
                <div>
                  <div className="font-medium text-gray-900">{method.name}</div>
                  <div className="text-sm text-gray-600">{method.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Bestellübersicht:</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>{contractTypeNames[contractType] || contractType}</span>
            <span>{(totalAmount || amount).toFixed(2)} €</span>
          </div>
          {finalSelectedAddons && finalSelectedAddons.length > 0 && (
            <div className="text-gray-600">
              + {finalSelectedAddons.length} zusätzliche(s) Dokument(e)
            </div>
          )}
          {finalSelectedAddons.length > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              📎 Es werden {finalSelectedAddons.length + 1} separate PDFs generiert
            </div>
          )}
        </div>
      </div>

      {/* Payment Button */}
      <button
        onClick={processPayment}
        disabled={isProcessing || !customerEmail}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
          isProcessing || !customerEmail
            ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Verarbeitung...
          </span>
        ) : (
          `Jetzt kaufen - ${(totalAmount || amount).toFixed(2)} €`
        )}
      </button>

      {/* Status Messages */}
      {errorMessage && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      {emailMessage && (
        <div className={`mt-4 p-3 rounded-lg ${
          emailStatus === 'sent' 
            ? 'bg-green-50 border border-green-200' 
            : emailStatus === 'failed'
            ? 'bg-red-50 border border-red-200'
            : 'bg-blue-50 border border-blue-200'
        }`}>
          <p className={`text-sm ${
            emailStatus === 'sent' 
              ? 'text-green-700' 
              : emailStatus === 'failed'
              ? 'text-red-700'
              : 'text-blue-700'
          }`}>
            {emailMessage}
          </p>
        </div>
      )}

      {/* Debug Info (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4">
          <summary className="text-xs text-gray-500 cursor-pointer">Debug Info anzeigen</summary>
          <pre className="text-xs text-gray-600 bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
            {JSON.stringify({
              hasContractData: !!contractData,
              extractedEmail: customerEmail,
              hasFormData: Object.keys(formDataForEmail).length,
              selectedAddonsProp: selectedAddons,
              finalSelectedAddons: finalSelectedAddons,
              addonsLength: finalSelectedAddons.length,
              totalAmount: totalAmount || amount
            }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
