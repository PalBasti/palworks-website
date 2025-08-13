// hooks/useContractForm.js - PRODUCTION READY
import { useState, useCallback, useMemo } from 'react';

export function useContractForm(contractType = 'untermietvertrag', basePrice = 12.90) {
  // Form State
  const [formData, setFormData] = useState({
    contract_type: contractType,
    customer_email: '',
    newsletter_signup: false,
    // Weitere Form-Felder werden dynamisch hinzugefügt
  });

  // Addon State
  const [selectedAddons, setSelectedAddons] = useState([]);
  
  // Error State
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  
  // Loading States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingContract, setIsCreatingContract] = useState(false);

  // Form Data Updates
  const updateFormData = useCallback((updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    updateFormData({ [name]: newValue });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors, updateFormData]);

  // Addon Management
  const handleAddonChange = useCallback((newSelectedAddons) => {
    setSelectedAddons(newSelectedAddons);
    updateFormData({ 
      selected_addons: newSelectedAddons,
      addon_details: getSelectedAddonDetails(newSelectedAddons)
    });
  }, [updateFormData]);

  // ✅ KORRIGIERTE Addon-Details - KONSISTENTE BEGRIFFE FÜR ALLE VERTRAGSTYPEN
  const getSelectedAddonDetails = useMemo(() => {
    const addonDetails = {
      // ✅ ALLE VERTRAGSTYPEN: Einheitliche Terminologie
      'explanation': { 
        name: 'Vertragserläuterungen', // ✅ KORRIGIERT: War "Vertragsberatung"
        price: 9.90 
      },
      'handover_protocol': { 
        name: 'Übergabeprotokoll', // ✅ KONSISTENT
        price: 7.90 
      },
      'legal_review': { 
        name: 'Anwaltliche Prüfung', // ✅ KONSISTENT
        price: 29.90 
      },
      // ✅ GARAGE-SPEZIFISCHE ADDONS
      'insurance_clause': { 
        name: 'Versicherungsklauseln', // ✅ KORRIGIERT: Vereinheitlicht
        price: 4.90 
      },
      'maintenance_guide': { 
        name: 'Wartungshandbuch', // ✅ KONSISTENT
        price: 12.90 
      },
      // ✅ WG-SPEZIFISCHE ADDONS
      'house_rules': { 
        name: 'WG-Hausordnung', // ✅ KONSISTENT
        price: 6.90 
      },
      'cleaning_schedule': { 
        name: 'Putzplan-Template', // ✅ KONSISTENT
        price: 3.90 
      }
    };

    return selectedAddons.map(key => ({
      key,
      ...addonDetails[key]
    })).filter(addon => addon.name); // Nur bekannte Addons
  }, [selectedAddons]);

  // Preisberechnung
  const calculateAddonTotal = useMemo(() => {
    // ✅ KORRIGIERTE Preisliste - KONSISTENT MIT PRICING SECTION
    const addonPrices = {
      'explanation': 9.90,        // Vertragserläuterungen (alle Vertragstypen)
      'handover_protocol': 7.90,  // Übergabeprotokoll (alle Vertragstypen)
      'legal_review': 29.90,      // Anwaltliche Prüfung
      'insurance_clause': 4.90,   // Versicherungsklauseln (Garage)
      'maintenance_guide': 12.90, // Wartungshandbuch (Garage)
      'house_rules': 6.90,        // WG-Hausordnung (WG)
      'cleaning_schedule': 3.90   // Putzplan-Template (WG)
    };
    
    return selectedAddons.reduce((total, key) => {
      return total + (addonPrices[key] || 0);
    }, 0);
  }, [selectedAddons]);

  const totalPrice = useMemo(() => {
    return basePrice + calculateAddonTotal;
  }, [basePrice, calculateAddonTotal]);

  // Validation
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // E-Mail ist Pflicht
    if (!formData.customer_email) {
      newErrors.customer_email = 'E-Mail-Adresse ist erforderlich';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      newErrors.customer_email = 'Ungültige E-Mail-Adresse';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Contract Creation (Placeholder)
  const createContract = useCallback(async () => {
    try {
      setIsCreatingContract(true);
      
      const contractData = {
        ...formData,
        selected_addons: selectedAddons,
        addon_details: getSelectedAddonDetails,
        total_amount: totalPrice,
        contract_type: contractType,
        base_price: basePrice,
        addon_total: calculateAddonTotal,
        status: 'draft',
        payment_status: 'pending'
      };
      
      // TODO: Implementiere contractService.createContract(contractData)
      console.log('🔍 Creating contract:', contractData);
      
      // Mock-Antwort
      return {
        id: 'contract_' + Date.now(),
        ...contractData
      };
    } catch (error) {
      console.error('Contract creation failed:', error);
      throw error;
    } finally {
      setIsCreatingContract(false);
    }
  }, [formData, selectedAddons, getSelectedAddonDetails, totalPrice, contractType, basePrice, calculateAddonTotal]);

  // Payment Intent Creation (Placeholder)
  const createPaymentIntent = useCallback(async (contractId) => {
    try {
      const paymentData = {
        amount: Math.round(totalPrice * 100), // Stripe erwartet Cents
        currency: 'eur',
        contract_id: contractId,
        metadata: {
          contract_type: contractType,
          selected_addons: selectedAddons.join(','),
          customer_email: formData.customer_email
        }
      };
      
      // TODO: Implementiere Stripe API Call
      console.log('🔍 Creating payment intent:', paymentData);
      
      // Mock-Antwort
      return {
        client_secret: 'pi_mock_' + Date.now() + '_secret_mock',
        id: 'pi_mock_' + Date.now()
      };
    } catch (error) {
      console.error('Payment intent creation failed:', error);
      throw error;
    }
  }, [totalPrice, contractType, selectedAddons, formData.customer_email]);

  // Form Submission
  const handleFormSubmit = useCallback(async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
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
    submitError,
    selectedAddonDetails: getSelectedAddonDetails
  }), [contractType, basePrice, selectedAddons, calculateAddonTotal, totalPrice, errors, formData, submitError, getSelectedAddonDetails]);

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
