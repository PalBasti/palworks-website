// components/shared/CheckoutSection.js
import React, { useState } from 'react';
import { CreditCard, Lock, CheckCircle, AlertCircle, Loader, ShoppingCart, FileText } from 'lucide-react';
import { createContract } from '@/lib/supabase/contractService';
import PaymentModule from '@/components/modules/PaymentModule';

export default function CheckoutSection({ 
  contractType,
  formData,
  selectedAddons = [],
  totalPrice,
  onPaymentSuccess,
  onPaymentError,
  className = "",
  disabled = false 
}) {
  const [isCreatingContract, setIsCreatingContract] = useState(false);
  const [contractId, setContractId] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  // Validate form data before proceeding
  const validateFormData = () => {
    const errors = [];
    
    if (!formData.customer_email) {
      errors.push('E-Mail-Adresse ist erforderlich');
    } else if (!/\S+@\S+\.\S+/.test(formData.customer_email)) {
      errors.push('Gültige E-Mail-Adresse erforderlich');
    }

    // Contract-specific validations
    switch (contractType) {
      case 'untermietvertrag':
        if (!formData.hauptmieter_name) errors.push('Name des Hauptmieters ist erforderlich');
        if (!formData.untermieter_name) errors.push('Name des Untermieters ist erforderlich');
        if (!formData.objekt_adresse) errors.push('Objektadresse ist erforderlich');
        break;
      case 'garage':
        if (!formData.vermieter_name) errors.push('Name des Vermieters ist erforderlich');
        if (!formData.mieter_name) errors.push('Name des Mieters ist erforderlich');
        if (!formData.garage_adresse) errors.push('Garage-Adresse ist erforderlich');
        break;
      case 'wg_untermietvertrag':
        if (!formData.hauptmieter_name) errors.push('Name des Hauptmieters ist erforderlich');
        if (!formData.untermieter_name) errors.push('Name des Untermieters ist erforderlich');
        if (!formData.wg_adresse) errors.push('WG-Adresse ist erforderlich');
        break;
    }

    return errors;
  };

  // Create contract in database before payment
  const handleCreateContract = async () => {
    setError(null);
    setValidationErrors([]);

    // Validate form data
    const errors = validateFormData();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsCreatingContract(true);

    try {
      // Prepare contract data
      const contractData = {
        contract_type: contractType,
        form_data: formData,
        selected_addons: selectedAddons,
        total_amount: totalPrice,
        customer_email: formData.customer_email,
        status: 'draft',
        payment_status: 'pending'
      };

      const newContract = await createContract(contractData);
      setContractId(newContract.id);
      setShowPayment(true);

    } catch (err) {
      console.error('Error creating contract:', err);
      setError('Fehler beim Erstellen des Vertrags. Bitte versuchen Sie es erneut.');
    } finally {
      setIsCreatingContract(false);
    }
  };

  // Handle successful payment
  const handlePaymentSuccess = (paymentData) => {
    if (onPaymentSuccess) {
      onPaymentSuccess({
        contractId,
        paymentData,
        totalPrice,
        contractType
      });
    }
  };

  // Handle payment error
  const handlePaymentError = (error) => {
    if (onPaymentError) {
      onPaymentError({
        contractId,
        error,
        totalPrice,
        contractType
      });
    }
  };

  // Format price for display
  const formatPrice = (price) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(price);
  };

  // Get contract type display name
  const getContractDisplayName = () => {
    switch (contractType) {
      case 'untermietvertrag': return 'Untermietvertrag';
      case 'garage': return 'Garage/Stellplatz-Mietvertrag';
      case 'wg_untermietvertrag': return 'WG-Untermietvertrag';
      default: return 'Vertrag';
    }
  };

  if (showPayment && contractId) {
    return (
      <div className={className}>
        <PaymentModule
          amount={totalPrice}
          currency="€"
          orderDescription={`${getContractDisplayName()} - PalWorks`}
          customerEmail={formData.customer_email}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
          enabledMethods={['card', 'paypal', 'sofort']}
          showSecurityBadge={true}
          className="w-full"
        />
        
        {/* Back to editing option */}
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setShowPayment(false);
              setContractId(null);
            }}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            ← Zurück zur Bearbeitung
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2 text-blue-600" />
            Vertrag erstellen
          </h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {formatPrice(totalPrice)}
            </div>
            <div className="text-sm text-gray-600">{getContractDisplayName()}</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-800 mb-2">Bitte korrigieren Sie folgende Fehler:</h4>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* General Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Ihre Bestellung
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">{getContractDisplayName()}</span>
              <span className="font-medium">Grundpreis</span>
            </div>
            
            {selectedAddons.length > 0 && (
              <div className="pl-4 space-y-1">
                {selectedAddons.map((addonKey) => (
                  <div key={addonKey} className="flex justify-between text-blue-700">
                    <span>+ {addonKey}</span>
                    <span>Zusatzleistung</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
              <span>Gesamtpreis (inkl. MwSt.)</span>
              <span className="text-blue-600">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* What you get */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-green-900 mb-3">Das erhalten Sie:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-800">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Vollständiger, rechtssicherer Vertrag
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Sofortiger PDF-Download
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              E-Mail-Versand an Ihre Adresse
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Professionelles Layout
            </div>
            {selectedAddons.includes('explanation') && (
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                Verständliche Erläuterungen
              </div>
            )}
            {selectedAddons.includes('protocol') && (
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                Übergabeprotokoll
              </div>
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center space-x-4 text-sm text-blue-800">
            <div className="flex items-center">
              <Lock className="h-4 w-4 mr-1" />
              <span>256-bit SSL-Verschlüsselung</span>
            </div>
            <div className="w-px h-4 bg-blue-300"></div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span>DSGVO-konform</span>
            </div>
            <div className="w-px h-4 bg-blue-300"></div>
            <div>14 Tage Widerrufsrecht</div>
          </div>
        </div>

        {/* Main Action Button */}
        <button
          onClick={handleCreateContract}
          disabled={disabled || isCreatingContract}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
        >
          {isCreatingContract ? (
            <div className="flex items-center justify-center">
              <Loader className="animate-spin h-5 w-5 mr-2" />
              Vertrag wird erstellt...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Jetzt {formatPrice(totalPrice)} bezahlen
            </div>
          )}
        </button>

        {/* Additional Info */}
        <div className="mt-4 text-center space-y-2">
          <p className="text-sm text-gray-600">
            Nach dem Klick werden Sie zur sicheren Zahlungsseite weitergeleitet
          </p>
          <p className="text-xs text-gray-500">
            Mit dem Kauf akzeptieren Sie unsere{' '}
            <a href="/agb" className="text-blue-600 hover:underline">AGB</a> und{' '}
            <a href="/datenschutz" className="text-blue-600 hover:underline">Datenschutzerklärung</a>
          </p>
        </div>

        {/* Process Steps */}
        <div className="mt-6 border-t pt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3 text-center">So funktioniert's:</h4>
          <div className="flex justify-between items-center text-xs text-gray-600">
            <div className="text-center flex-1">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                <span className="text-blue-600 font-semibold">1</span>
              </div>
              <span>Vertrag erstellen</span>
            </div>
            <div className="w-8 h-px bg-gray-300 mx-2"></div>
            <div className="text-center flex-1">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                <span className="text-blue-600 font-semibold">2</span>
              </div>
              <span>Sicher bezahlen</span>
            </div>
            <div className="w-8 h-px bg-gray-300 mx-2"></div>
            <div className="text-center flex-1">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                <span className="text-blue-600 font-semibold">3</span>
              </div>
              <span>PDF erhalten</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
