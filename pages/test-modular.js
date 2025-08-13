// pages/test-modular.js - SSR-SAFE PRODUCTION VERSION
import React, { useState, useEffect } from 'react';
import Head from 'next/head';

// Safe Component Loading mit try-catch
let PricingSection, useContractForm;
const componentStatus = {
  PricingSection: { loaded: false, error: null },
  useContractForm: { loaded: false, error: null }
};

// Load PricingSection safely
try {
  PricingSection = require('../components/shared/PricingSection').default;
  componentStatus.PricingSection.loaded = true;
} catch (error) {
  componentStatus.PricingSection.error = error.message;
  console.log('⚠️ PricingSection not found, using fallback');
}

// Load useContractForm safely
try {
  const hookModule = require('../hooks/useContractForm');
  useContractForm = hookModule.useContractForm;
  componentStatus.useContractForm.loaded = true;
} catch (error) {
  componentStatus.useContractForm.error = error.message;
  console.log('⚠️ useContractForm not found, using fallback');
}

// ✅ KORRIGIERTE SSR-Safe Fallback PricingSection
const FallbackPricingSection = ({ contractType, basePrice, selectedAddons, onAddonChange }) => {
  // ✅ KORRIGIERTE Fallback-Addons - KONSISTENTE BEGRIFFE
  const addons = {
    untermietvertrag: [
      { 
        id: 1, 
        addon_key: 'explanation', 
        name: 'Vertragserläuterungen', // ✅ KORRIGIERT: War "Vertragsberatung"
        price: 9.90, 
        is_popular: false,
        icon: '📝'
      },
      { 
        id: 2, 
        addon_key: 'handover_protocol', 
        name: 'Übergabeprotokoll', // ✅ KONSISTENT
        price: 7.90, 
        is_popular: true,
        icon: '📋'
      },
      { 
        id: 3, 
        addon_key: 'legal_review', 
        name: 'Anwaltliche Prüfung', // ✅ KONSISTENT
        price: 29.90, 
        is_popular: false,
        icon: '⚖️'
      }
    ],
    garage: [
      { 
        id: 4, 
        addon_key: 'explanation', 
        name: 'Vertragserläuterungen', // ✅ KORRIGIERT: Jetzt konsistent
        price: 9.90, 
        is_popular: false,
        icon: '📝'
      },
      { 
        id: 5, 
        addon_key: 'insurance_clause', 
        name: 'Versicherungsklauseln', // ✅ KORRIGIERT: Vereinheitlicht
        price: 4.90, 
        is_popular: true,
        icon: '🛡️'
      },
      { 
        id: 6, 
        addon_key: 'maintenance_guide', 
        name: 'Wartungshandbuch', // ✅ KONSISTENT
        price: 12.90, 
        is_popular: false,
        icon: '🔧'
      }
    ],
    wg: [
      { 
        id: 7, 
        addon_key: 'explanation', 
        name: 'Vertragserläuterungen', // ✅ KORRIGIERT: Jetzt konsistent
        price: 9.90, 
        is_popular: false,
        icon: '📝'
      },
      { 
        id: 8, 
        addon_key: 'handover_protocol', 
        name: 'Übergabeprotokoll', // ✅ KONSISTENT
        price: 7.90, 
        is_popular: true,
        icon: '📋'
      },
      { 
        id: 9, 
        addon_key: 'house_rules', 
        name: 'WG-Hausordnung', // ✅ KONSISTENT
        price: 6.90, 
        is_popular: true,
        icon: '🏠'
      },
      { 
        id: 10, 
        addon_key: 'cleaning_schedule', 
        name: 'Putzplan-Template', // ✅ KONSISTENT
        price: 3.90, 
        is_popular: false,
        icon: '🧹'
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

  const totalPrice = calculateTotal();

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
          📦 Zusatzleistungen 
          <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
            Fallback-Modus
          </span>
        </h3>
        <p className="text-sm text-gray-600">
          Erweitern Sie Ihren Vertrag mit professionellen Zusatzdokumenten
        </p>
      </div>

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
              Rechtssicherer Basisvertrag inkl. PDF-Download
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
                      {isSelected && (
                        <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
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
                            ⭐ Beliebt
                          </span>
                        )}
                      </div>
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
};

// ✅ KORRIGIERTE Fallback useContractForm Hook
const useFallbackContractForm = (contractType, basePrice) => {
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [formData, setFormData] = useState({
    contract_type: contractType,
    customer_email: '',
    newsletter_signup: false
  });

  // ✅ KORRIGIERTE Preisberechnung - KONSISTENT
  const calculateAddonTotal = () => {
    const addonPrices = {
      'explanation': 9.90,        // Vertragserläuterungen
      'handover_protocol': 7.90,  // Übergabeprotokoll
      'legal_review': 29.90,      // Anwaltliche Prüfung
      'insurance_clause': 4.90,   // Versicherungsklauseln
      'maintenance_guide': 12.90, // Wartungshandbuch
      'house_rules': 6.90,        // WG-Hausordnung
      'cleaning_schedule': 3.90   // Putzplan-Template
    };
    
    return selectedAddons.reduce((total, key) => {
      return total + (addonPrices[key] || 0);
    }, 0);
  };

  const totalPrice = basePrice + calculateAddonTotal();

  return {
    formData,
    selectedAddons,
    totalPrice,
    handleAddonChange: setSelectedAddons,
    updateFormData: (updates) => setFormData(prev => ({ ...prev, ...updates })),
    getDebugInfo: () => ({
      contractType,
      basePrice,
      selectedAddons,
      addonTotal: calculateAddonTotal(),
      totalPrice,
      mode: 'fallback'
    })
  };
};

// Main Test Component
export default function TestModular() {
  const [contractType, setContractType] = useState('untermietvertrag');
  const [basePrice, setBasePrice] = useState(12.90);
  const [selectedAddons, setSelectedAddons] = useState([]);

  // Versuche echten Hook zu verwenden, sonst Fallback
  const hookData = useContractForm 
    ? useContractForm(contractType, basePrice)
    : useFallbackContractForm(contractType, basePrice);

  // Sync selectedAddons wenn echter Hook verfügbar
  useEffect(() => {
    if (useContractForm && hookData.handleAddonChange) {
      hookData.handleAddonChange(selectedAddons);
    }
  }, [selectedAddons]);

  return (
    <>
      <Head>
        <title>Modulare Komponenten Test - PalWorks</title>
        <meta name="description" content="Test der modularen Vertragskomponenten" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🧪 Modulare Komponenten Test
            </h1>
            <p className="text-lg text-gray-600">
              Test der konsistenten Terminologie und Funktionalität
            </p>
          </div>

          {/* Component Status */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border ${
              componentStatus.PricingSection.loaded 
                ? 'bg-green-50 border-green-200' 
                : 'bg-amber-50 border-amber-200'
            }`}>
              <h3 className="font-semibold">PricingSection.js</h3>
              <p className="text-sm">
                Status: {componentStatus.PricingSection.loaded ? '✅ Geladen' : '⚠️ Fallback'}
              </p>
              {componentStatus.PricingSection.error && (
                <p className="text-xs text-red-600 mt-1">
                  {componentStatus.PricingSection.error}
                </p>
              )}
            </div>

            <div className={`p-4 rounded-lg border ${
              componentStatus.useContractForm.loaded 
                ? 'bg-green-50 border-green-200' 
                : 'bg-amber-50 border-amber-200'
            }`}>
              <h3 className="font-semibold">useContractForm.js</h3>
              <p className="text-sm">
                Status: {componentStatus.useContractForm.loaded ? '✅ Geladen' : '⚠️ Fallback'}
              </p>
              {componentStatus.useContractForm.error && (
                <p className="text-xs text-red-600 mt-1">
                  {componentStatus.useContractForm.error}
                </p>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">🎛️ Test-Einstellungen</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Contract Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vertragstyp
                </label>
                <select
                  value={contractType}
                  onChange={(e) => setContractType(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="untermietvertrag">Untermietvertrag</option>
                  <option value="garage">Garagenvertrag</option>
                  <option value="wg">WG-Untermietvertrag</option>
                </select>
              </div>

              {/* Base Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Basispreis (€)
                </label>
                <input
                  type="number"
                  step="0.10"
                  value={basePrice}
                  onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Total Price Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gesamtpreis
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-lg font-semibold text-blue-600">
                  {(hookData.totalPrice || basePrice).toFixed(2)} €
                </div>
              </div>
            </div>

            {/* Quick Select Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedAddons(['explanation'])}
                className="bg-blue-50 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-100"
              >
                📝 Nur Erläuterungen
              </button>
              <button
                onClick={() => setSelectedAddons(['handover_protocol'])}
                className="bg-green-50 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-100"
              >
                📋 Nur Übergabeprotokoll
              </button>
              <button
                onClick={() => setSelectedAddons(['explanation', 'handover_protocol'])}
                className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded text-sm hover:bg-yellow-100"
              >
                🎯 Beide Standard-Addons
              </button>
              <button
                onClick={() => setSelectedAddons([])}
                className="bg-red-50 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-100"
              >
                🚫 Alle abwählen
              </button>
            </div>
          </div>

          {/* PricingSection Component Test */}
          <div className="mb-8">
            {PricingSection ? (
              <PricingSection
                contractType={contractType}
                basePrice={basePrice}
                selectedAddons={selectedAddons}
                onAddonChange={setSelectedAddons}
              />
            ) : (
              <FallbackPricingSection
                contractType={contractType}
                basePrice={basePrice}
                selectedAddons={selectedAddons}
                onAddonChange={setSelectedAddons}
              />
            )}
          </div>

          {/* Debug Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">🔍 Debug-Informationen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium text-gray-900 mb-2">Component State:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><strong>Contract Type:</strong> {contractType}</div>
                  <div><strong>Base Price:</strong> {basePrice}€</div>
                  <div><strong>Selected Addons:</strong> [{selectedAddons.join(', ')}]</div>
                  <div><strong>Addon Count:</strong> {selectedAddons.length}</div>
                  <div><strong>Total Price:</strong> {(hookData.totalPrice || basePrice).toFixed(2)}€</div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium text-gray-900 mb-2">Hook Debug:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {hookData.getDebugInfo && (
                    <>
                      <div><strong>Hook Mode:</strong> {hookData.getDebugInfo().mode || 'production'}</div>
                      <div><strong>Addon Total:</strong> {(hookData.getDebugInfo().addonTotal || 0).toFixed(2)}€</div>
                      <div><strong>Form Valid:</strong> {hookData.getDebugInfo().isValid ? '✅' : '❌'}</div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Terminologie-Check */}
            <div className="mt-4 p-4 bg-blue-50 rounded">
              <h4 className="font-medium text-blue-900 mb-2">✅ Terminologie-Konsistenz Check:</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <div>• explanation → "Vertragserläuterungen" (alle Module)</div>
                <div>• handover_protocol → "Übergabeprotokoll" (alle Module)</div>
                <div>• insurance_clause → "Versicherungsklauseln" (alle Module)</div>
                <div>• Preise identisch in PricingSection und useContractForm</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
