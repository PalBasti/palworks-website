// ============================================================================
// 🎯 VOLLSTÄNDIG KORRIGIERTE MODULE - ALLE VERTRAGSTYPEN KONSISTENT
// ============================================================================

// ✅ 1. PRICING SECTION - ALLE VERTRAGSTYPEN KORRIGIERT
// File: components/shared/PricingSection.js
import React, { useState, useEffect } from 'react';
import { Check, Star, Info } from 'lucide-react';

const PricingSection = ({ 
  contractType = 'untermietvertrag',
  basePrice = 12.90,
  selectedAddons = [],
  onAddonChange = () => {},
  showTitle = true,
  compact = false,
  enabledAddons = null
}) => {
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ KORRIGIERTE Addon-Konfiguration - KONSISTENTE BEGRIFFE
  const staticAddons = {
    untermietvertrag: [
      {
        id: 1,
        addon_key: 'explanation',
        name: 'Vertragserläuterungen', // ✅ KONSISTENT
        description: 'Detaillierte schriftliche Erklärungen zu allen Vertragsklauseln (PDF)',
        price: 9.90,
        is_popular: false,
        icon: '📝'
      },
      {
        id: 2,
        addon_key: 'handover_protocol',
        name: 'Übergabeprotokoll', // ✅ KONSISTENT
        description: 'Professionelles Protokoll für Ein- und Auszug',
        price: 7.90,
        is_popular: true,
        icon: '📋'
      },
      {
        id: 3,
        addon_key: 'legal_review',
        name: 'Anwaltliche Prüfung', // ✅ KONSISTENT
        description: 'Überprüfung durch qualifizierte Rechtsanwälte',
        price: 29.90,
        is_popular: false,
        icon: '⚖️'
      }
    ],
    garage: [
      {
        id: 4,
        addon_key: 'explanation',
        name: 'Vertragserläuterungen', // ✅ KORRIGIERT - war teilweise anders
        description: 'Detaillierte schriftliche Erklärungen zu allen Vertragsklauseln (PDF)',
        price: 9.90,
        is_popular: false,
        icon: '📝'
      },
      {
        id: 5,
        addon_key: 'insurance_clause',
        name: 'Versicherungsklauseln', // ✅ KORRIGIERT - vereinheitlicht
        description: 'Zusätzliche Absicherung bei Schäden und Haftung',
        price: 4.90,
        is_popular: true,
        icon: '🛡️'
      },
      {
        id: 6,
        addon_key: 'maintenance_guide',
        name: 'Wartungshandbuch', // ✅ KONSISTENT
        description: 'Anleitung zur ordnungsgemäßen Nutzung und Pflege',
        price: 12.90,
        is_popular: false,
        icon: '🔧'
      }
    ],
    wg: [
      {
        id: 7,
        addon_key: 'explanation',
        name: 'Vertragserläuterungen', // ✅ KORRIGIERT - war teilweise anders
        description: 'Detaillierte schriftliche Erklärungen zu allen Vertragsklauseln (PDF)',
        price: 9.90,
        is_popular: false,
        icon: '📝'
      },
      {
        id: 8,
        addon_key: 'handover_protocol',
        name: 'Übergabeprotokoll', // ✅ KONSISTENT
        description: 'Speziell für WG-Zimmer angepasstes Übergabeprotokoll',
        price: 7.90,
        is_popular: true,
        icon: '📋'
      },
      {
        id: 9,
        addon_key: 'house_rules',
        name: 'WG-Hausordnung', // ✅ KONSISTENT
        description: 'Vorlage für harmonisches Zusammenleben in der WG',
        price: 6.90,
        is_popular: true,
        icon: '🏠'
      },
      {
        id: 10,
        addon_key: 'cleaning_schedule',
        name: 'Putzplan-Template', // ✅ KONSISTENT
        description: 'Faire Aufteilung der Reinigungsarbeiten',
        price: 3.90,
        is_popular: false,
        icon: '🧹'
      }
    ]
  };

  // Addons laden - mit Fallback auf Static-Daten
  useEffect(() => {
    const loadAddons = async () => {
      try {
        setLoading(true);
        
        // Versuche echte Supabase-Daten zu laden
        // TODO: Implementiere supabaseAddonService.getAddonsByContractType(contractType)
        
        // Fallback auf statische Daten
        const contractAddons = staticAddons[contractType] || [];
        
        // Filtere Addons wenn enabledAddons gesetzt ist (für schrittweise Integration)
        const filteredAddons = enabledAddons 
          ? contractAddons.filter(addon => enabledAddons.includes(addon.addon_key))
          : contractAddons;
          
        setAddons(filteredAddons);
        setError(null);
      } catch (err) {
        console.error('Fehler beim Laden der Addons:', err);
        setError('Addons konnten nicht geladen werden');
        setAddons([]);
      } finally {
        setLoading(false);
      }
    };

    loadAddons();
  }, [contractType, enabledAddons]);

  // Addon umschalten
  const toggleAddon = (addonKey) => {
    const newSelection = selectedAddons.includes(addonKey)
      ? selectedAddons.filter(key => key !== addonKey)
      : [...selectedAddons, addonKey];
    onAddonChange(newSelection);
  };

  // Preisberechnung
  const calculateTotal = () => {
    const addonTotal = addons.reduce((total, addon) => {
      return selectedAddons.includes(addon.addon_key) ? total + addon.price : total;
    }, 0);
    return basePrice + addonTotal;
  };

  // Gewählte Addon-Details
  const selectedDetails = addons.filter(addon => selectedAddons.includes(addon.addon_key));
  const totalPrice = calculateTotal();

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg h-32 flex items-center justify-center">
        <span className="text-gray-500">Lade Zusatzleistungen...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <span className="text-red-700">⚠️ {error}</span>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${compact ? 'p-4' : 'p-6'}`}>
      {showTitle && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            📦 Zusatzleistungen
          </h3>
          <p className="text-sm text-gray-600">
            Erweitern Sie Ihren Vertrag mit professionellen Zusatzdokumenten
          </p>
        </div>
      )}

      {/* Basis-Vertrag */}
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-medium text-blue-900">
              🏠 {contractType === 'untermietvertrag' ? 'Untermietvertrag' : 
                   contractType === 'garage' ? 'Garagenvertrag' : 
                   contractType === 'wg' ? 'WG-Untermietvertrag' : 'Vertrag'}
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              Rechtssicherer Basisvertrag inkl. PDF-Download und E-Mail-Versand
            </p>
          </div>
          <span className="text-lg font-bold text-blue-900">
            {basePrice.toFixed(2)} €
          </span>
        </div>
      </div>

      {/* Addon-Liste */}
      {addons.length > 0 && (
        <div className="space-y-3 mb-4">
          {addons.map((addon) => {
            const isSelected = selectedAddons.includes(addon.addon_key);
            
            return (
              <div
                key={addon.id}
                onClick={() => toggleAddon(addon.addon_key)}
                className={`relative border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-300'
                    }`}>
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{addon.icon}</span>
                        <h4 className={`font-medium ${
                          isSelected ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {addon.name}
                        </h4>
                        {addon.is_popular && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <Star className="h-3 w-3 mr-1" />
                            Beliebt
                          </span>
                        )}
                      </div>
                      
                      {addon.description && (
                        <p className={`text-sm mt-1 ${
                          isSelected ? 'text-blue-700' : 'text-gray-600'
                        }`}>
                          {addon.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <span className={`font-semibold ${
                    isSelected ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    +{parseFloat(addon.price).toFixed(2)} €
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Keine Addons verfügbar */}
      {addons.length === 0 && !loading && (
        <div className="text-center py-6 text-gray-500">
          <Info className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">
            Für diesen Vertragstyp sind derzeit keine Zusatzleistungen verfügbar.
          </p>
        </div>
      )}

      {/* Ausgewählte Addons Summary (Compact Mode) */}
      {compact && selectedDetails.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <h5 className="font-medium text-gray-900 mb-2">Gewählte Zusatzleistungen:</h5>
          <div className="space-y-1">
            {selectedDetails.map((addon) => (
              <div key={addon.addon_key} className="flex justify-between text-sm">
                <span className="flex items-center">
                  <span className="mr-2">{addon.icon}</span>
                  {addon.name}
                </span>
                <span className="text-blue-600 font-medium">
                  +{parseFloat(addon.price).toFixed(2)} €
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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
        
        {/* Hinweis */}
        <div className="mt-3 flex items-center justify-center">
          <div className="text-xs text-gray-500 flex items-center">
            <Info className="h-3 w-3 mr-1" />
            Alle Preise inkl. MwSt. • Sofortiger Download nach Zahlung
          </div>
        </div>
      </div>

      {/* Entwicklungshinweis */}
      {enabledAddons && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm">
          <div className="flex items-center">
            <Info className="h-4 w-4 text-amber-600 mr-2" />
            <span className="text-amber-800">
              Schrittweise Integration: Nur {enabledAddons.join(', ')} aktiviert
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingSection;

// ============================================================================

// ✅ 2. USE CONTRACT FORM HOOK - ALLE VERTRAGSTYPEN KORRIGIERT  
// File: hooks/useContractForm.js
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
    e.preventDefault();
    
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

// ============================================================================

// ✅ 3. TEST-MODULAR FALLBACK - ALLE VERTRAGSTYPEN KORRIGIERT
// File: pages/test-modular.js
const FallbackPricingSection = ({ contractType, basePrice, selectedAddons, onAddonChange }) => {
  // ✅ KORRIGIERTE Fallback-Addons - KONSISTENTE BEGRIFFE
  const addons = {
    untermietvertrag: [
      { 
        id: 1, 
        addon_key: 'explanation', 
        name: 'Vertragserläuterungen', // ✅ KORRIGIERT: War "Vertragsberatung"
        price: 9.90, 
        is_popular: false 
      },
      { 
        id: 2, 
        addon_key: 'handover_protocol', 
        name: 'Übergabeprotokoll', // ✅ KONSISTENT
        price: 7.90, 
        is_popular: true 
      },
      { 
        id: 3, 
        addon_key: 'legal_review', 
        name: 'Anwaltliche Prüfung', // ✅ KONSISTENT
        price: 29.90, 
        is_popular: false 
      }
    ],
    garage: [
      { 
        id: 4, 
        addon_key: 'explanation', 
        name: 'Vertragserläuterungen', // ✅ KORRIGIERT: Jetzt konsistent
        price: 9.90, 
        is_popular: false 
      },
      { 
        id: 5, 
        addon_key: 'insurance_clause', 
        name: 'Versicherungsklauseln', // ✅ KORRIGIERT: Vereinheitlicht
        price: 4.90, 
        is_popular: true 
      },
      { 
        id: 6, 
        addon_key: 'maintenance_guide', 
        name: 'Wartungshandbuch', // ✅ KONSISTENT
        price: 12.90, 
        is_popular: false 
      }
    ],
    wg: [
      { 
        id: 7, 
        addon_key: 'explanation', 
        name: 'Vertragserläuterungen', // ✅ KORRIGIERT: Jetzt konsistent
        price: 9.90, 
        is_popular: false 
      },
      { 
        id: 8, 
        addon_key: 'handover_protocol', 
        name: 'Übergabeprotokoll', // ✅ KONSISTENT
        price: 7.90, 
        is_popular: true 
      },
      { 
        id: 9, 
        addon_key: 'house_rules', 
        name: 'WG-Hausordnung', // ✅ KONSISTENT
        price: 6.90, 
        is_popular: true 
      },
      { 
        id: 10, 
        addon_key: 'cleaning_schedule', 
        name: 'Putzplan-Template', // ✅ KONSISTENT
        price: 3.90, 
        is_popular: false 
      }
    ]
  }[contractType] || [];

  const toggleAddon = (addonKey) => {
    const newSelection = selectedAddons.includes(addonKey)
      ? selectedAddons.filter(key => key !== addonKey)
      : [...selectedAddons, addonKey];
    onAddonChange(newSelection);
  };

  const calculateTotal = () => {
    const addonTotal = addons.reduce((total, addon) => {
      return selectedAddons.includes(addon.addon_key) ? total + addon.price : total;
    }, 0);
    return basePrice + addonTotal;
  };

  // [Rest der Fallback-Komponente bleibt gleich...]
  // Hier würde der vollständige JSX-Code stehen
};

// ============================================================================

// ✅ 4. KONSISTENZ-VALIDIERUNG
const validateTerminologyConsistency = () => {
  const moduleNames = {
    PricingSection: {
      explanation: 'Vertragserläuterungen',
      handover_protocol: 'Übergabeprotokoll',
      legal_review: 'Anwaltliche Prüfung',
      insurance_clause: 'Versicherungsklauseln',
      maintenance_guide: 'Wartungshandbuch',
      house_rules: 'WG-Hausordnung',
      cleaning_schedule: 'Putzplan-Template'
    },
    testModular: {
      explanation: 'Vertragserläuterungen',
      handover_protocol: 'Übergabeprotokoll',
      legal_review: 'Anwaltliche Prüfung',
      insurance_clause: 'Versicherungsklauseln',
      maintenance_guide: 'Wartungshandbuch',
      house_rules: 'WG-Hausordnung',
      cleaning_schedule: 'Putzplan-Template'
    }
  };

  // Prüfe Konsistenz zwischen allen Modulen
  const addonKeys = Object.keys(moduleNames.PricingSection);
  const inconsistencies = [];

  addonKeys.forEach(key => {
    const pricingName = moduleNames.PricingSection[key];
    const hookName = moduleNames.useContractForm[key];
    const testName = moduleNames.testModular[key];

    if (pricingName !== hookName || pricingName !== testName) {
      inconsistencies.push({
        addon_key: key,
        PricingSection: pricingName,
        useContractForm: hookName,
        testModular: testName
      });
    }
  });

  if (inconsistencies.length === 0) {
    console.log('✅ TERMINOLOGIE-KONSISTENZ: Alle Module verwenden identische Begriffe!');
    return true;
  } else {
    console.error('🚨 TERMINOLOGIE-INKONSISTENZEN gefunden:', inconsistencies);
    return false;
  }
};

// ============================================================================

// ✅ 5. SUPABASE-DATENBANK UPDATE SKRIPT
const supabaseUpdateQueries = `
-- ✅ UPDATE: Korrigiere alle Addon-Namen in der Datenbank
-- File: supabase_terminology_update.sql

-- 1. Korrigiere explanation addon für alle Vertragstypen
UPDATE contract_addons 
SET name = 'Vertragserläuterungen',
    description = 'Detaillierte schriftliche Erklärungen zu allen Vertragsklauseln (PDF)'
WHERE addon_key = 'explanation';

-- 2. Korrigiere insurance_clause addon (falls vorhanden)
UPDATE contract_addons 
SET name = 'Versicherungsklauseln',
    description = 'Zusätzliche Absicherung bei Schäden und Haftung'
WHERE addon_key = 'insurance_clause';

-- 3. Stelle sicher, dass handover_protocol konsistent ist
UPDATE contract_addons 
SET name = 'Übergabeprotokoll'
WHERE addon_key = 'handover_protocol';

-- 4. Korrigiere WG-spezifische Addons
UPDATE contract_addons 
SET name = 'WG-Hausordnung',
    description = 'Vorlage für harmonisches Zusammenleben in der WG'
WHERE addon_key = 'house_rules';

UPDATE contract_addons 
SET name = 'Putzplan-Template',
    description = 'Faire Aufteilung der Reinigungsarbeiten'
WHERE addon_key = 'cleaning_schedule';

UPDATE contract_addons 
SET name = 'Wartungshandbuch',
    description = 'Anleitung zur ordnungsgemäßen Nutzung und Pflege'
WHERE addon_key = 'maintenance_guide';

-- 5. Prüfung: Zeige alle Addon-Namen nach Update
SELECT contract_type, addon_key, name, price, is_popular 
FROM contract_addons 
ORDER BY contract_type, sort_order;

-- 6. Prüfung: Suche nach Inkonsistenzen
SELECT addon_key, COUNT(DISTINCT name) as name_variations, 
       STRING_AGG(DISTINCT name, ' | ') as all_names
FROM contract_addons 
GROUP BY addon_key 
HAVING COUNT(DISTINCT name) > 1;
`;

// ============================================================================

// ✅ 6. CUSTOMER DATA SECTION - KONSISTENT MIT PRICING
// File: components/shared/CustomerDataSection.js
import React, { useState } from 'react';
import { Mail, User, CheckCircle } from 'lucide-react';

const CustomerDataSection = ({
  formData = {},
  handleChange = () => {},
  errors = {},
  showNewsletter = true,
  compact = false
}) => {
  const [emailFocused, setEmailFocused] = useState(false);

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${compact ? 'p-4' : 'p-6'}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
          <User className="h-5 w-5 mr-2" />
          Ihre Kontaktdaten
        </h3>
        <p className="text-sm text-gray-600">
          Für die Vertragszustellung und weitere Kommunikation
        </p>
      </div>

      {/* E-Mail Eingabe */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          E-Mail-Adresse *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className={`h-5 w-5 ${emailFocused ? 'text-blue-500' : 'text-gray-400'}`} />
          </div>
          <input
            type="email"
            name="customer_email"
            value={formData.customer_email || ''}
            onChange={handleChange}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            className={`
              block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${errors.customer_email 
                ? 'border-red-300 text-red-900 placeholder-red-300' 
                : 'border-gray-300'
              }
            `}
            placeholder="ihre@email.de"
          />
        </div>
        {errors.customer_email && (
          <p className="mt-1 text-sm text-red-600">{errors.customer_email}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Ihr Vertrag wird als PDF an diese Adresse gesendet
        </p>
      </div>

      {/* Newsletter Anmeldung */}
      {showNewsletter && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <label className="flex items-start">
            <input
              type="checkbox"
              name="newsletter_signup"
              checked={formData.newsletter_signup || false}
              onChange={handleChange}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-700">
                Newsletter abonnieren
              </span>
              <p className="text-xs text-gray-500 mt-1">
                Erhalten Sie Tipps zu Mietrecht und neue Vertragsvorlagen. 
                Jederzeit abbestellbar.
              </p>
            </div>
          </label>
        </div>
      )}
    </div>
  );
};

export default CustomerDataSection;

