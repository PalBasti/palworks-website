// hooks/useContractForm.js
import { useState, useEffect, useCallback } from 'react';
import { getAddonsForContract, calculateAddonPrices } from '@/lib/supabase/addonService';
import { createContract, updateContractPaymentStatus } from '@/lib/supabase/contractService';

export const useContractForm = (contractType, basePrice = 19.90) => {
  // Form state
  const [formData, setFormData] = useState({
    customer_email: '',
    newsletter_signup: false
  });
  
  // Addon state
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [availableAddons, setAvailableAddons] = useState([]);
  const [addonPrices, setAddonPrices] = useState({ addons: [], totalPrice: 0 });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [totalPrice, setTotalPrice] = useState(basePrice);
  
  // Contract state
  const [contractId, setContractId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, creating, payment, success, error

  // Load available addons when contract type changes
  useEffect(() => {
    const loadAddons = async () => {
      if (!contractType) return;
      
      try {
        setLoading(true);
        const addons = await getAddonsForContract(contractType);
        setAvailableAddons(addons);
      } catch (error) {
        console.error('Error loading addons:', error);
        setErrors(prev => ({ ...prev, addons: 'Fehler beim Laden der Zusatzleistungen' }));
      } finally {
        setLoading(false);
      }
    };

    loadAddons();
  }, [contractType]);

  // Recalculate prices when addons change
  useEffect(() => {
    const calculatePrices = async () => {
      if (!contractType) return;
      
      try {
        const priceData = await calculateAddonPrices(contractType, selectedAddons);
        setAddonPrices(priceData);
        setTotalPrice(basePrice + priceData.totalPrice);
      } catch (error) {
        console.error('Error calculating prices:', error);
      }
    };

    calculatePrices();
  }, [selectedAddons, contractType, basePrice]);

  // Handle form field changes
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  }, [errors]);

  // Handle addon selection changes
  const handleAddonChange = useCallback((newSelectedAddons) => {
    setSelectedAddons(newSelectedAddons);
  }, []);

  // Validate form data
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Email validation
    if (!formData.customer_email) {
      newErrors.customer_email = 'E-Mail-Adresse ist erforderlich';
    } else if (!/\S+@\S+\.\S+/.test(formData.customer_email)) {
      newErrors.customer_email = 'Gültige E-Mail-Adresse erforderlich';
    }

    // Contract-specific validations
    switch (contractType) {
      case 'untermietvertrag':
        if (!formData.hauptmieter_name) newErrors.hauptmieter_name = 'Name des Hauptmieters ist erforderlich';
        if (!formData.untermieter_name) newErrors.untermieter_name = 'Name des Untermieters ist erforderlich';
        if (!formData.objekt_adresse) newErrors.objekt_adresse = 'Objektadresse ist erforderlich';
        if (!formData.miete_betrag) newErrors.miete_betrag = 'Mietbetrag ist erforderlich';
        break;
        
      case 'garage':
        if (!formData.vermieter_name) newErrors.vermieter_name = 'Name des Vermieters ist erforderlich';
        if (!formData.mieter_name) newErrors.mieter_name = 'Name des Mieters ist erforderlich';
        if (!formData.garage_adresse) newErrors.garage_adresse = 'Garage-Adresse ist erforderlich';
        if (!formData.miete_betrag) newErrors.miete_betrag = 'Mietbetrag ist erforderlich';
        break;
        
      case 'wg_untermietvertrag':
        if (!formData.hauptmieter_name) newErrors.hauptmieter_name = 'Name des Hauptmieters ist erforderlich';
        if (!formData.untermieter_name) newErrors.untermieter_name = 'Name des Untermieters ist erforderlich';
        if (!formData.wg_adresse) newErrors.wg_adresse = 'WG-Adresse ist erforderlich';
        if (!formData.zimmer_groesse) newErrors.zimmer_groesse = 'Zimmergröße ist erforderlich';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, contractType]);

  // Create contract and initiate payment
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return { success: false, errors };
    }

    setPaymentStatus('creating');
    setLoading(true);

    try {
      // Prepare contract data
      const contractData = {
        contract_type: contractType,
        form_data: formData,
        selected_addons: selectedAddons,
        addon_prices: addonPrices,
        total_amount: totalPrice,
        customer_email: formData.customer_email,
        status: 'draft',
        payment_status: 'pending'
      };

      const contract = await createContract(contractData);
      setContractId(contract.id);
      setPaymentStatus('payment');
      
      return { 
        success: true, 
        contractId: contract.id,
        contract 
      };

    } catch (error) {
      console.error('Error creating contract:', error);
      setPaymentStatus('error');
      setErrors(prev => ({ 
        ...prev, 
        submit: 'Fehler beim Erstellen des Vertrags. Bitte versuchen Sie es erneut.' 
      }));
      
      return { 
        success: false, 
        error: error.message 
      };
    } finally {
      setLoading(false);
    }
  }, [formData, selectedAddons, addonPrices, totalPrice, contractType, validateForm, errors]);

  // Handle successful payment
  const handlePaymentSuccess = useCallback(async (paymentData) => {
    if (!contractId) return;

    try {
      setPaymentStatus('success');
      
      // Update contract with payment information
      await updateContractPaymentStatus(contractId, {
        payment_status: 'paid',
        status: 'paid',
        payment_intent_id: paymentData.transactionId,
        paid_at: new Date().toISOString()
      });

      return { success: true, contractId, paymentData };
      
    } catch (error) {
      console.error('Error updating payment status:', error);
      setPaymentStatus('error');
      return { success: false, error: error.message };
    }
  }, [contractId]);

  // Handle payment error
  const handlePaymentError = useCallback(async (error) => {
    if (!contractId) return;

    try {
      setPaymentStatus('error');
      
      // Update contract with error information
      await updateContractPaymentStatus(contractId, {
        payment_status: 'failed',
        payment_error: error.message
      });

      setErrors(prev => ({ 
        ...prev, 
        payment: error.message || 'Zahlung fehlgeschlagen' 
      }));

      return { success: false, error: error.message };
      
    } catch (updateError) {
      console.error('Error updating payment error:', updateError);
      return { success: false, error: updateError.message };
    }
  }, [contractId]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      customer_email: '',
      newsletter_signup: false
    });
    setSelectedAddons([]);
    setErrors({});
    setContractId(null);
    setPaymentStatus('idle');
    setTotalPrice(basePrice);
  }, [basePrice]);

  // Get form state summary
  const getFormSummary = useCallback(() => {
    return {
      isValid: Object.keys(errors).length === 0,
      isComplete: validateForm(),
      hasChanges: Object.keys(formData).some(key => 
        formData[key] !== '' && formData[key] !== false
      ) || selectedAddons.length > 0,
      contractType,
      totalPrice,
      selectedAddons: selectedAddons.length,
      paymentStatus
    };
  }, [errors, formData, selectedAddons, contractType, totalPrice, paymentStatus, validateForm]);

  return {
    // Form data
    formData,
    handleInputChange,
    
    // Addons
    selectedAddons,
    availableAddons,
    addonPrices,
    handleAddonChange,
    
    // Pricing
    totalPrice,
    basePrice,
    
    // State
    loading,
    errors,
    paymentStatus,
    contractId,
    
    // Actions
    handleSubmit,
    handlePaymentSuccess,
    handlePaymentError,
    validateForm,
    resetForm,
    
    // Computed
    getFormSummary
  };
};
