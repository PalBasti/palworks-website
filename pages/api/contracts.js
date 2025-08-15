// 🔧 FIX 1: pages/api/contracts.js - Missing Contract API Endpoint
// Erstelle diese Datei: pages/api/contracts.js

import { createContract } from '../../lib/supabase/contractService';

export default async function handler(req, res) {
  // CORS Headers hinzufügen
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS Request für CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Nur POST-Requests erlauben
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are allowed'
    });
  }

  try {
    console.log('📋 Contract API called with body:', req.body);

    const { 
      contractType, 
      contract_type,
      customerEmail, 
      customer_email,
      formData, 
      form_data,
      selectedAddons = [], 
      selected_addons = [],
      totalAmount,
      total_amount,
      basePrice,
      base_price
    } = req.body;

    // 🔧 FIX: Flexible Field-Mapping für verschiedene Naming-Konventionen
    const mappedData = {
      contractType: contractType || contract_type,
      customerEmail: customerEmail || customer_email,
      formData: formData || form_data,
      selectedAddons: selectedAddons.length > 0 ? selectedAddons : selected_addons,
      totalAmount: totalAmount || total_amount,
      basePrice: basePrice || base_price
    };

    console.log('📊 Mapped contract data:', mappedData);

    // Input-Validierung
    if (!mappedData.contractType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: contractType or contract_type'
      });
    }

    if (!mappedData.customerEmail) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: customerEmail or customer_email'
      });
    }

    if (!mappedData.formData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: formData or form_data'
      });
    }

    if (!mappedData.totalAmount || mappedData.totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid totalAmount/total_amount'
      });
    }

    console.log('✅ Validation passed, creating contract...');

    // Contract über Service erstellen
    const result = await createContract(mappedData);

    if (!result.success) {
      console.error('❌ Contract creation failed:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Contract creation failed',
        message: result.error
      });
    }

    console.log('✅ Contract created successfully:', result.contract.id);

    // Erfolgreiche Response
    return res.status(201).json({
      success: true,
      contract_id: result.contract.id,
      contract: result.contract,
      message: 'Contract created successfully'
    });

  } catch (error) {
    console.error('❌ Contract API error:', error.message, error.stack);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// ==============================================
// 🔧 FIX 2: hooks/useContractForm.js - SSR-Safe Hook
// Erstelle diese Datei: hooks/useContractForm.js

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

// ==============================================
// 🔧 FIX 3: Fallback für fehlende Komponenten
// Erstelle diese Datei: components/shared/PricingSection.js

import { useState } from 'react';
import { Check, Plus } from 'lucide-react';

export default function PricingSection({
  contractType = 'untermietvertrag',
  basePrice = 12.90,
  selectedAddons = [],
  onAddonChange = () => {},
  totalPrice = 12.90
}) {
  const availableAddons = [
    {
      id: 'explanation',
      name: 'Vertragserläuterungen',
      description: 'Detaillierte Erklärungen zu allen Klauseln',
      price: 9.90,
      popular: true
    },
    {
      id: 'handover_protocol',
      name: 'Übergabeprotokoll',
      description: 'Professionelles Protokoll für die Wohnungsübergabe',
      price: 7.90,
      popular: false
    }
  ];

  const handleAddonToggle = (addonId) => {
    const newAddons = selectedAddons.includes(addonId)
      ? selectedAddons.filter(id => id !== addonId)
      : [...selectedAddons, addonId];
    
    onAddonChange(newAddons);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Preisübersicht
      </h3>

      {/* Basis-Preis */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-gray-700">Untermietvertrag</span>
        <span className="font-medium">{basePrice.toFixed(2)} €</span>
      </div>

      {/* Addons */}
      <div className="space-y-3 mb-4">
        <h4 className="text-sm font-medium text-gray-700">Zusätzliche Services:</h4>
        
        {availableAddons.map(addon => (
          <div key={addon.id} className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <h5 className="text-sm font-medium text-gray-900">{addon.name}</h5>
                  {addon.popular && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Beliebt
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1">{addon.description}</p>
                <p className="text-sm font-medium text-blue-600 mt-1">
                  +{addon.price.toFixed(2)} €
                </p>
              </div>
              
              <button
                onClick={() => handleAddonToggle(addon.id)}
                className={`ml-3 w-6 h-6 rounded border-2 flex items-center justify-center ${
                  selectedAddons.includes(addon.id)
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 hover:border-blue-600'
                }`}
              >
                {selectedAddons.includes(addon.id) && (
                  <Check className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Gesamtsumme */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">
            Gesamtsumme
          </span>
          <span className="text-2xl font-bold text-blue-600">
            {totalPrice.toFixed(2)} €
          </span>
        </div>
      </div>
    </div>
  );
}
