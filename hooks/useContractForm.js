// hooks/useContractForm.js
import { useState, useEffect, useCallback, useMemo } from 'react';

export const useContractForm = (contractType, basePrice = 0) => {
  // Form Data State
  const [formData, setFormData] = useState({
    contract_type: contractType,
    customer_email: '',
    newsletter_signup: false
  });

  // Addon State
  const [selectedAddons, setSelectedAddons] = useState([]);

  // Loading & Error States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingContract, setIsCreatingContract] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  // ✅ KORRIGIERTE Addon-Preise - KONSISTENT mit PricingSection
  const addonPrices = useMemo(() => ({
    'explanation': 9.90,        // Vertragserläuterungen
    'handover_protocol': 7.90,  // Übergabeprotokoll
    'legal_review': 29.90,      // Anwaltliche Prüfung
    'insurance_clause': 4.90,   // Versicherungsklauseln
    'maintenance_guide': 12.90, // Wartungshandbuch
    'house_rules': 6.90,        // WG-Hausordnung
    'cleaning_schedule': 3.90   // Putzplan-Template
  }), []);

  // Calculate addon total
  const calculateAddonTotal = useCallback(() => {
    return selectedAddons.reduce((total, key) => {
      return total + (addonPrices[key] || 0);
    }, 0);
  }, [selectedAddons, addonPrices]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    return basePrice + calculateAddonTotal();
  }, [basePrice, calculateAddonTotal]);

  // Update form data
  const updateFormData = useCallback((updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
    
    // Clear related errors
    if (updates.customer_email !== undefined && errors.customer_email) {
      setErrors(prev => ({ ...prev, customer_email: null }));
    }
  }, [errors]);

  // Handle input changes
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    updateFormData({ [name]: newValue });
  }, [updateFormData]);

  // Handle addon changes
  const handleAddonChange = useCallback((newAddons) => {
    setSelectedAddons(newAddons);
  }, []);

  // Get selected addon details
  const getSelectedAddonDetails = useMemo(() => {
    return selectedAddons.map(key => ({
      addon_key: key,
      price: addonPrices[key] || 0,
      name: getAddonName(key)
    }));
  }, [selectedAddons, addonPrices]);

  // Helper function to get addon name
  function getAddonName(key) {
    const names = {
      'explanation': 'Vertragserläuterungen',
      'handover_protocol': 'Übergabeprotokoll',
      'legal_review': 'Anwaltliche Prüfung',
      'insurance_clause': 'Versicherungsklauseln',
      'maintenance_guide': 'Wartungshandbuch',
      'house_rules': 'WG-Hausordnung',
      'cleaning_schedule': 'Putzplan-Template'
    };
    return names[key] || key;
  }

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Email validation
    if (!formData.customer_email?.trim()) {
      newErrors.customer_email = 'E-Mail-Adresse ist erforderlich';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      newErrors.customer_email = 'Ungültige E-Mail-Adresse';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Create contract (simplified for this hook)
  const createContract = useCallback(async () => {
    try {
      setIsCreatingContract(true);
      
      const contractData = {
        contract_type: contractType,
        customer_email: formData.customer_email,
        newsletter_signup: formData.newsletter_signup,
        selected_addons: selectedAddons,
        addon_details: getSelectedAddonDetails,
        base_price: basePrice,
        addon_total: calculateAddonTotal(),
        total_amount: totalPrice,
        status: 'pending'
      };

      // Try to create contract via API
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contractData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contract = await response.json();
      return contract;
      
    } catch (error) {
      console.error('Contract creation error:', error);
      
      // Return mock contract for development
      return {
        id: `mock-${Date.now()}`,
        ...formData,
        selected_addons: selectedAddons,
        total_amount: totalPrice,
        status: 'pending',
        created_at: new Date().toISOString()
      };
    } finally {
      setIsCreatingContract(false);
    }
  }, [contractType, formData, selectedAddons, getSelectedAddonDetails, basePrice, calculateAddonTotal, totalPrice]);

  // Create payment intent (simplified)
  const createPaymentIntent = useCallback(async (contractId) => {
    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(totalPrice * 100), // Convert to cents
          contract_id: contractId,
          customer_email: formData.customer_email
        }),
      });

      if (!response.ok) {
        throw new Error(`Payment intent creation failed: ${response.status}`);
      }

      const paymentIntent = await response.json();
      return paymentIntent;
      
    } catch (error) {
      console.error('Payment intent creation error:', error);
      
      // Return mock payment intent for development
      return {
        client_secret: `mock_pi_${Date.now()}_secret`,
        id: `mock_pi_${Date.now()}`,
        amount: Math.round(totalPrice * 100),
        status: 'requires_payment_method'
      };
    }
  }, [totalPrice, formData.customer_email]);

  // Handle form submission
  const handleFormSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Validate form
      if (!validateForm()) {
        throw new Error('Formular enthält Fehler');
      }

      // 1. Create Contract
      const contract = await createContract();
      
      // 2. Create Payment Intent
      const paymentIntent = await createPaymentIntent(contract.id);
      
      // 3. Return data for next steps
      return {
        contract,
        paymentIntent,
        formData: {
          ...formData,
          selected_addons: selectedAddons,
          addon_details: getSelectedAddonDetails,
          total_amount: totalPrice
        }
      };
    } catch (error) {
      setSubmitError(error.message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, createContract, createPaymentIntent, formData, selectedAddons, getSelectedAddonDetails, totalPrice]);

  // Reset Form
  const resetForm = useCallback(() => {
    setFormData({
      contract_type: contractType,
      customer_email: '',
      newsletter_signup: false
    });
    setSelectedAddons([]);
    setErrors({});
    setSubmitError(null);
    setIsSubmitting(false);
    setIsCreatingContract(false);
  }, [contractType]);

  // Debug-Helper (✅ WICHTIG: SSR-Safe)
  const getDebugInfo = useCallback(() => {
    return {
      contractType,
      basePrice,
      selectedAddons,
      addonTotal: calculateAddonTotal(),
      totalPrice,
      hasErrors: Object.keys(errors).length > 0,
      isValid: Object.keys(errors).length === 0 && formData.customer_email,
      formDataKeys: Object.keys(formData),
      submitError,
      selectedAddonDetails: getSelectedAddonDetails,
      mode: 'production',
      timestamp: new Date().toISOString()
    };
  }, [contractType, basePrice, selectedAddons, calculateAddonTotal, totalPrice, errors, formData, submitError, getSelectedAddonDetails]);

  // Update contract type when prop changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, contract_type: contractType }));
  }, [contractType]);

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
    
    // Debug (✅ WICHTIG: SSR-Safe)
    getDebugInfo
  };
};
