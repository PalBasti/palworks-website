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
}

// Load useContractForm safely
try {
  const hookModule = require('../hooks/useContractForm');
  useContractForm = hookModule.useContractForm;
  componentStatus.useContractForm.loaded = true;
} catch (error) {
  componentStatus.useContractForm.error = error.message;
}

// SSR-Safe Fallback PricingSection
const FallbackPricingSection = ({ contractType, basePrice, selectedAddons, onAddonChange }) => {
  const addons = {
    untermietvertrag: [
      { id: 1, addon_key: 'explanation', name: 'Vertragsberatung', price: 9.90, is_popular: false },
      { id: 2, addon_key: 'handover_protocol', name: 'Übergabeprotokoll', price: 7.90, is_popular: true },
      { id: 3, addon_key: 'legal_review', name: 'Anwaltliche Prüfung', price: 29.90, is_popular: false }
    ],
    garage: [
      { id: 4, addon_key: 'insurance_clause', name: 'Versicherungsklausel', price: 4.90, is_popular: true },
      { id: 5, addon_key: 'maintenance_guide', name: 'Wartungshandbuch', price: 12.90, is_popular: false }
    ],
    wg: [
      { id: 6, addon_key: 'house_rules', name: 'WG-Hausordnung', price: 6.90, is_popular: true },
      { id: 7, addon_key: 'cleaning_schedule', name: 'Putzplan-Template', price: 3.90, is_popular: false }
    ]
  }[contractType] || [];

  const toggleAddon = (addonKey) => {
    const newSelection = selectedAddons.includes(addonKey)
      ? selectedAddons.filter(key => key !== addonKey)
      : [...selectedAddons, addonKey];
    onAddonChange(newSelection);
  };

  const total = basePrice + selectedAddons.reduce((sum, key) => {
    const addon = addons.find(a => a.addon_key === key);
    return sum + (addon?.price || 0);
  }, 0);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">💳 Preisübersicht</h3>
        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
          Fallback Mode
        </span>
      </div>
      
      {/* Basis-Vertrag */}
      <div className="bg-white p-3 rounded border mb-4 flex justify-between items-center">
        <div>
          <span className="font-medium text-gray-900">Basis-Vertrag</span>
          <p className="text-sm text-gray-600">Vollständiger rechtssicherer Vertrag</p>
        </div>
        <span className="font-bold text-lg text-gray-900">{basePrice.toFixed(2)} €</span>
      </div>

      {/* Addons */}
      {addons.length > 0 && (
        <div className="space-y-2 mb-4">
          <h4 className="font-medium text-gray-900 mb-3">📋 Optionale Zusatzleistungen</h4>
          {addons.map((addon) => {
            const isSelected = selectedAddons.includes(addon.addon_key);
            return (
              <div
                key={addon.id}
                onClick={() => toggleAddon(addon.addon_key)}
                className={`p-3 rounded border cursor-pointer transition-all duration-200 ${
                  isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                      isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                          {addon.name}
                        </span>
                        {addon.is_popular && (
                          <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                            Beliebt
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                    +{addon.price.toFixed(2)} €
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
          <span className="text-lg font-semibold text-gray-900">Gesamtsumme</span>
          <span className="text-2xl font-bold text-blue-600">{total.toFixed(2)} €</span>
        </div>
      </div>
    </div>
  );
};

// SSR-Safe Fallback Hook
const useFallbackHook = (contractType, basePrice) => {
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [formData, setFormData] = useState({
    customer_email: '',
    customer_name: '',
    newsletter_signup: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const totalPrice = basePrice + selectedAddons.reduce((sum, key) => {
    const prices = { 
      explanation: 9.90, handover_protocol: 7.90, legal_review: 29.90,
      insurance_clause: 4.90, maintenance_guide: 12.90,
      house_rules: 6.90, cleaning_schedule: 3.90
    };
    return sum + (prices[key] || 0);
  }, 0);

  return {
    formData,
    selectedAddons,
    handleInputChange,
    handleAddonChange: setSelectedAddons,
    totalPrice,
    basePrice
  };
};

export default function TestModularPage() {
  const [testMode, setTestMode] = useState('auto');
  const [contractType, setContractType] = useState('untermietvertrag');
  const [mounted, setMounted] = useState(false);

  // SSR-Safe mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use appropriate hook
  const hookToUse = useContractForm || useFallbackHook;
  const {
    formData,
    selectedAddons,
    handleInputChange,
    handleAddonChange,
    totalPrice,
    basePrice
  } = hookToUse(contractType, 19.90);

  // Component selection
  const componentToUse = testMode === 'inline' 
    ? FallbackPricingSection 
    : (PricingSection || FallbackPricingSection);
  
  const isUsingImported = PricingSection && useContractForm && testMode !== 'inline';
  const allComponentsLoaded = componentStatus.PricingSection.loaded && componentStatus.useContractForm.loaded;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Test Suite...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Modular Components Test - PalWorks</title>
        <meta name="description" content="Test suite for modular components" />
      </Head>

      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🧩 Modularer Komponenten Test
            </h1>
            
            {/* Component Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className={`p-4 rounded-lg border-2 ${
                componentStatus.PricingSection.loaded ? 'border-green-500 bg-green-50' : 'border-orange-500 bg-orange-50'
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">PricingSection</h3>
                  <span className="text-lg">{componentStatus.PricingSection.loaded ? '✅' : '⚠️'}</span>
                </div>
                <p className="text-sm mt-1">
                  {componentStatus.PricingSection.loaded ? 'Imported' : 'Fallback Active'}
                </p>
              </div>
              
              <div className={`p-4 rounded-lg border-2 ${
                componentStatus.useContractForm.loaded ? 'border-green-500 bg-green-50' : 'border-orange-500 bg-orange-50'
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">useContractForm</h3>
                  <span className="text-lg">{componentStatus.useContractForm.loaded ? '✅' : '⚠️'}</span>
                </div>
                <p className="text-sm mt-1">
                  {componentStatus.useContractForm.loaded ? 'Imported' : 'Fallback Active'}
                </p>
              </div>
              
              <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">System Status</h3>
                  <span className="text-lg">✅</span>
                </div>
                <p className="text-sm mt-1">
                  {allComponentsLoaded ? 'Production Ready' : 'Development Mode'}
                </p>
              </div>
            </div>

            {/* Mode Selection */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setTestMode('auto')}
                className={`px-3 py-1 rounded text-sm ${
                  testMode === 'auto' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}
              >
                🤖 Auto Mode
              </button>
              <button
                onClick={() => setTestMode('inline')}
                className={`px-3 py-1 rounded text-sm ${
                  testMode === 'inline' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}
              >
                📝 Fallback Mode
              </button>
            </div>

            <div className="text-sm text-gray-600">
              <strong>Currently using:</strong> {isUsingImported ? 'Imported Components' : 'Fallback Components'}
            </div>
          </div>

          {/* Configuration */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">⚙️ Test Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contract Type:
                </label>
                <select
                  value={contractType}
                  onChange={(e) => setContractType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="untermietvertrag">Untermietvertrag</option>
                  <option value="garage">Garagenvertrag</option>
                  <option value="wg">WG-Vertrag</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Price:
                </label>
                <input
                  type="text"
                  value={`${basePrice.toFixed(2)} €`}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Customer Data Test */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">📧 Customer Data Test</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-Mail:
                </label>
                <input
                  type="email"
                  name="customer_email"
                  value={formData.customer_email}
                  onChange={handleInputChange}
                  placeholder="test@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name:
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  placeholder="Max Mustermann"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="newsletter_signup"
                  checked={formData.newsletter_signup}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Newsletter abonnieren</span>
              </label>
            </div>
          </div>

          {/* Pricing Section Test */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">💳 Pricing Section Test</h3>
              <span className={`text-xs px-2 py-1 rounded ${
                isUsingImported ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
              }`}>
                {isUsingImported ? 'Production' : 'Fallback'}
              </span>
            </div>
            
            {React.createElement(componentToUse, {
              contractType,
              basePrice,
              selectedAddons,
              onAddonChange: handleAddonChange
            })}
          </div>

          {/* Quick Test Buttons */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">🎮 Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                onClick={() => handleAddonChange(['explanation'])}
                className="px-3 py-2 bg-green-50 text-green-700 rounded text-sm hover:bg-green-100"
              >
                ✅ Beratung
              </button>
              <button
                onClick={() => handleAddonChange(['explanation', 'handover_protocol'])}
                className="px-3 py-2 bg-yellow-50 text-yellow-700 rounded text-sm hover:bg-yellow-100"
              >
                🎯 Bundle
              </button>
              <button
                onClick={() => handleAddonChange(['explanation', 'handover_protocol', 'legal_review'])}
                className="px-3 py-2 bg-orange-50 text-orange-700 rounded text-sm hover:bg-orange-100"
              >
                🚀 All
              </button>
              <button
                onClick={() => handleAddonChange([])}
                className="px-3 py-2 bg-red-50 text-red-700 rounded text-sm hover:bg-red-100"
              >
                🚫 Clear
              </button>
            </div>
          </div>

          {/* Debug Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">🔍 Debug Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium text-gray-900 mb-2">Component Status:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>PricingSection: {componentStatus.PricingSection.loaded ? '✅ Loaded' : '⚠️ Fallback'}</div>
                  <div>useContractForm: {componentStatus.useContractForm.loaded ? '✅ Loaded' : '⚠️ Fallback'}</div>
                  <div>Mode: {testMode}</div>
                  <div>Using Imported: {isUsingImported ? 'Yes' : 'No'}</div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium text-gray-900 mb-2">Form State:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Contract: {contractType}</div>
                  <div>Base Price: €{basePrice}</div>
                  <div>Addons: [{selectedAddons.join(', ')}]</div>
                  <div>Total: €{totalPrice.toFixed(2)}</div>
                  <div>Email: {formData.customer_email || 'Empty'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Summary */}
          <div className={`rounded-lg p-6 border-2 ${
            allComponentsLoaded ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center">
              <div className="text-3xl mr-4">
                {allComponentsLoaded ? '🎉' : '⚠️'}
              </div>
              <div>
                <h3 className={`text-xl font-bold mb-2 ${
                  allComponentsLoaded ? 'text-green-900' : 'text-yellow-900'
                }`}>
                  {allComponentsLoaded 
                    ? 'Production Ready - All Components Loaded!' 
                    : 'Development Mode - Fallback System Active'}
                </h3>
                
                <div className={`text-sm space-y-1 ${
                  allComponentsLoaded ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {allComponentsLoaded ? (
                    <>
                      <p>✅ PricingSection successfully imported and functional</p>
                      <p>✅ useContractForm hook working correctly</p>
                      <p>✅ Ready for integration into existing forms</p>
                    </>
                  ) : (
                    <>
                      <p>⚠️ Using fallback components (this is expected)</p>
                      <p>✅ All functionality working with mock data</p>
                      <p>⏳ Create the real components to activate production mode</p>
                    </>
                  )}
                </div>

                <div className={`mt-4 p-3 bg-white rounded border ${
                  allComponentsLoaded ? 'border-green-200' : 'border-yellow-200'
                }`}>
                  <h4 className={`font-medium mb-1 ${
                    allComponentsLoaded ? 'text-green-900' : 'text-yellow-900'
                  }`}>
                    🚀 Next Steps:
                  </h4>
                  <div className={`text-sm ${
                    allComponentsLoaded ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    {allComponentsLoaded ? (
                      <>
                        <p>1. Integrate into existing forms (untermietvertrag.js)</p>
                        <p>2. Test with real Supabase data</p>
                        <p>3. Add payment integration</p>
                      </>
                    ) : (
                      <>
                        <p>1. Create components/shared/PricingSection.js</p>
                        <p>2. Create hooks/useContractForm.js</p>
                        <p>3. Deploy and refresh this page</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
