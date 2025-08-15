// hooks/useContractForm.js
import { useState, useEffect, useCallback } from 'react';

/**
 * SSR-Safe Contract Form Hook mit robuster Fehlerbehandlung
 */
export function useContractForm(contractType, basePrice) {
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState({
    contract_type: contractType,
    customer_email: '',
    customerEmail: '', // Backup field
    billing_email: '', // Support für beide Formate
  });
  const [selectedAddons, setSelectedAddons] = useState([]);

  // 🔧 FIX: Client-Side-Only Rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Preisberechnung mit robuster Addon-Handling
  const calculateAddonTotal = useCallback(() => {
    const addonPrices = {
      'explanation': 9.90,
      'handover_protocol': 7.90,
      'legal_review': 29.90,
      'insurance_clause': 4.90,
      'maintenance_guide': 12.90,
      'house_rules': 6.90,
      'cleaning_schedule': 3.90
    };
    
    return selectedAddons.reduce((total, addonKey) => {
      return total + (addonPrices[addonKey] || 0);
    }, 0);
  }, [selectedAddons]);

  const totalPrice = basePrice + calculateAddonTotal();

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // 🔧 FIX: E-Mail-Synchronisation
      ...(field === 'billing_email' && {
        customer_email: value,
        customerEmail: value
      })
    }));
  }, []);

  const handleAddonChange = useCallback((newAddons) => {
    setSelectedAddons(Array.isArray(newAddons) ? newAddons : []);
  }, []);

  const updateFormData = useCallback((updates) => {
    setFormData(prev => {
      const newData = { ...prev, ...updates };
      
      // 🔧 FIX: E-Mail-Mapping bei Updates
      if (updates.billing_email && !updates.customer_email) {
        newData.customer_email = updates.billing_email;
        newData.customerEmail = updates.billing_email;
      }
      
      return newData;
    });
  }, []);

  // Debug-Funktion für Entwicklung
  const getDebugInfo = useCallback(() => {
    if (!isClient) return { mode: 'ssr' };
    
    return {
      contractType,
      basePrice,
      selectedAddons,
      totalPrice,
      formData,
      mode: 'client',
      hasEmail: !!(formData.customer_email || formData.billing_email),
      timestamp: new Date().toISOString()
    };
  }, [contractType, basePrice, selectedAddons, totalPrice, formData, isClient]);

  // SSR-Fallback während Client-Hydration
  if (!isClient) {
    return {
      formData: { contract_type: contractType },
      selectedAddons: [],
      totalPrice: basePrice,
      handleInputChange: () => {},
      handleAddonChange: () => {},
      updateFormData: () => {},
      getDebugInfo: () => ({ mode: 'ssr' })
    };
  }

  return {
    formData,
    selectedAddons,
    totalPrice,
    handleInputChange,
    handleAddonChange,
    updateFormData,
    getDebugInfo
  };
}
