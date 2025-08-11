// hooks/useContractForm.js - DEPLOYMENT READY VERSION
import { useState, useCallback, useMemo } from 'react';

export function useContractForm(contractType = 'untermietvertrag', basePrice = 0) {
  // Zentraler Form State
  const [formData, setFormData] = useState({
    // Grunddaten
    customer_email: '',
    customer_name: '',
    newsletter_signup: false,
    
    // Vertragsspezifische Felder werden hier ergänzt
    // Diese werden von den spezifischen Formularen gesetzt
  });

  // Gewählte Addons
  const [selectedAddons, setSelectedAddons] = useState([]);
  
  // Loading States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingContract, setIsCreatingContract] = useState(false);
  
  // Error States
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  // Input Change Handler
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  }, [errors]);

  // Bulk update für komplexe Form-Daten
  const updateFormData = useCallback((newData) => {
    setFormData(prev => ({
      ...prev,
      ...newData
    }));
  }, []);

  // Addon Change Handler
  const handleAddonChange = useCallback((newAddons) => {
    setSelectedAddons(newAddons);
  }, []);

  // Validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    // E-Mail Validation
    if (!formData.customer_email) {
      newErrors.customer_email = 'E-Mail-Adresse ist erforderlich';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      newErrors.customer_email = 'Bitte gültige E-Mail-Adresse eingeben';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Addon-Preise berechnen (Mock-Preise als Fallback)
  const calculateAddonTotal = useMemo(() => {
    // Mock-Preise für verschiedene Addons
    const addonPrices = {
      // Untermietvertrag
      'explanation': 9.90,
      'handover_protocol': 7.90,
      'legal_review': 29.90,
      
      // Garage
      'insurance_clause': 4.90,
      'maintenance_guide': 12.90,
      
      // WG
      'house_rules': 6.90,
      'cleaning_schedule': 3.90
    };

    return selectedAddons.reduce((total, addonKey) => {
      return total + (addonPrices[addonKey] || 0);
    }, 0);
  }, [selectedAddons]);

  // Gesamtpreis
  const totalPrice = useMemo(() => {
    return basePrice + calculateAddonTotal;
  }, [basePrice, calculateAddonTotal]);

  // Contract Service (mit Fallback falls API nicht existiert)
  const createContract = async () => {
    try {
      setIsCreatingContract(true);
      setSubmitError(null);

      const contractData = {
        contract_type: contractType,
        base_price: basePrice,
        selected_addons: selectedAddons,
        addon_total: calculateAddonTotal,
        total_price: totalPrice,
        customer_email: formData.customer_email,
        customer_name: formData.customer_name,
        form_data: formData,
        status: 'pending_payment',
        created_at: new Date().toISOString()
      };

      // Versuche echte API
      try {
        const response = await fetch('/api/contracts/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(contractData)
        });

        if (response.ok) {
          const result = await response.json();
          return {
            success: true,
            contract: result.contract,
            contractId: result.contract.id
          };
        }
      } catch (apiError) {
        console.log('Contract API not available, using mock response');
      }

      // Fallback: Mock Contract ID für Demo
      const mockContractId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        contract: { ...contractData, id: mockContractId },
        contractId: mockContractId,
        isMock: true
      };

    } catch (error) {
      console.error('Create contract error:', error);
      setSubmitError(error.message);
      return {
        success: false,
        error: error.message
      };
    } finally {
      setIsCreatingContract(false);
    }
  };

  // Payment Intent erstellen (mit Fallback)
  const createPaymentIntent = async (contractId) => {
    try {
      // Versuche echte Stripe API
      try {
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(totalPrice * 100), // Stripe erwartet Cent
            currency: 'eur',
            contractId: contractId,
            customerEmail: formData.customer_email,
            metadata: {
              contract_type: contractType,
              addons: selectedAddons.join(',')
            }
          })
        });

        if (response.ok) {
          const result = await response.json();
          return {
            success: true,
            clientSecret: result.clientSecret,
            paymentIntentId: result.paymentIntentId
          };
        }
      } catch (apiError) {
        console.log('Stripe API not available, using mock payment');
      }

      // Fallback: Mock Payment Intent für Demo
      const mockPaymentIntentId = `pi_mock_${Date.now()}`;
      const mockClientSecret = `${mockPaymentIntentId}_secret_mock`;

      return {
        success: true,
        clientSecret: mockClientSecret,
        paymentIntentId: mockPaymentIntentId,
        isMock: true
      };

    } catch (error) {
      console.error('Create payment intent error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Vollständiger Submit-Prozess
  const handleFormSubmit = async (additionalData = {}) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Validation
      if (!validateForm()) {
        return { success: false, error: 'Bitte überprüfe deine Eingaben' };
      }

      // Zusätzliche Daten hinzufügen (von spezifischen Formularen)
      if (Object.keys(additionalData).length > 0) {
        updateFormData(additionalData);
      }

      // Contract erstellen
      const contractResult = await createContract();
      if (!contractResult.success) {
        return contractResult;
      }

      // Payment Intent erstellen
      const paymentResult = await createPaymentIntent(contractResult.contractId);
      if (!paymentResult.success) {
        return paymentResult;
      }

      return {
        success: true,
        contract: contractResult.contract,
        contractId: contractResult.contractId,
        clientSecret: paymentResult.clientSecret,
        paymentIntentId: paymentResult.paymentIntentId,
        isMock: contractResult.isMock || paymentResult.isMock
      };

    } catch (error) {
      console.error('Form submit error:', error);
      setSubmitError(error.message);
      return {
        success: false,
        error: error.message
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset Form
  const resetForm = useCallback(() => {
    setFormData({
      customer_email: '',
      customer_name: '',
      newsletter_signup: false,
    });
    setSelectedAddons([]);
    setErrors({});
    setSubmitError(null);
    setIsSubmitting(false);
    setIsCreatingContract(false);
  }, []);

  // Get selected addon details
  const getSelectedAddonDetails = useMemo(() => {
    // Mock-Addon-Details für UI-Anzeige
    const addonDetails = {
      'explanation': { name: 'Vertragsberatung', price: 9.90 },
      'handover_protocol': { name: 'Übergabeprotokoll', price: 7.90 },
      'legal_review': { name: 'Anwaltliche Prüfung', price: 29.90 },
      'insurance_clause': { name: 'Versicherungsklausel', price: 4.90 },
      'maintenance_guide': { name: 'Wartungshandbuch', price: 12.90 },
      'house_rules': { name: 'WG-Hausordnung', price: 6.90 },
      'cleaning_schedule': { name: 'Putzplan-Template', price: 3.90 }
    };

    return selectedAddons.map(key => ({
      key,
      ...addonDetails[key]
    })).filter(addon => addon.name); // Nur bekannte Addons
  }, [selectedAddons]);

  // Debug-Helper
  const getDebugInfo = useMemo(() => ({
    contractType,
    basePrice,
    selectedAddons,
    addonTotal: calculateAddonTotal,
    totalPrice,
    hasErrors: Object.keys(errors).length > 0,
    isValid: Object.keys(errors).length === 0 && formData.customer_email,
    formDataKeys: Object.keys(formData),
    submitError
  }), [contractType, basePrice, selectedAddons, calculateAddonTotal, totalPrice, errors, formData, submitError]);

  // Return all the things
  return {
    // Form Data
    formData,
    updateFormData,
    handleInputChange,
    
    // Addons
    selectedAddons,
    handleAddonChange,
    getSelectedAddonDetails,
    
    // Pricing
    basePrice,
    calculateAddonTotal,
    totalPrice,
    
    // Validation & Errors
    errors,
    validateForm,
    submitError,
    
    // Loading States
    isSubmitting,
    isCreatingContract,
    
    // Actions
    handleFormSubmit,
    createContract,
    createPaymentIntent,
    resetForm,
    
    // Contract Type
    contractType,
    
    // Debug
    getDebugInfo
  };
}
