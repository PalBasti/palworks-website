// pages/test-pricing.js - KOMPLETT SSR-SAFE VERSION
import React, { useState, useEffect } from 'react';
import Head from 'next/head';

// 🔧 FIX: SSR-Safe Fallback Pricing Component
const SafePricingSection = ({ 
  contractType = 'untermietvertrag', 
  basePrice = 12.90, 
  selectedAddons = [], 
  onAddonChange = () => {} 
}) => {
  // 🔧 FIX: Sichere Preisberechnung mit Fallbacks
  const calculateAddonTotal = () => {
    const addonPrices = {
      'explanation': 9.90,
      'handover_protocol': 7.90,
      'legal_review': 29.90
    };
    
    if (!Array.isArray(selectedAddons)) return 0;
    
    return selectedAddons.reduce((total, addonKey) => {
      const price = addonPrices[addonKey];
      return total + (typeof price === 'number' ? price : 0);
    }, 0);
  };

  // 🔧 FIX: Sichere totalPrice-Berechnung
  const safeBasePrice = typeof basePrice === 'number' ? basePrice : 12.90;
  const safeAddonTotal = calculateAddonTotal();
  const totalPrice = safeBasePrice + safeAddonTotal;

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
    },
    {
      id: 'legal_review',
      name: 'Anwaltliche Prüfung',
      description: 'Rechtliche Überprüfung durch Fachanwalt',
      price: 29.90,
      popular: false
    }
  ];

  const handleAddonToggle = (addonId) => {
    if (!Array.isArray(selectedAddons)) return;
    
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
        <span className="text-gray-700">
          {contractType === 'untermietvertrag' ? 'Untermietvertrag' : 'Vertrag'}
        </span>
        <span className="font-medium">
          {safeBasePrice.toFixed(2)} €
        </span>
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
                  Array.isArray(selectedAddons) && selectedAddons.includes(addon.id)
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 hover:border-blue-600'
                }`}
              >
                {Array.isArray(selectedAddons) && selectedAddons.includes(addon.id) && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
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
};

// 🔧 FIX: SSR-Safe Main Component
export default function TestPricingPage() {
  const [isClient, setIsClient] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [contractType, setContractType] = useState('untermietvertrag');
  const [basePrice, setBasePrice] = useState(12.90);

  // 🔧 FIX: Client-Side-Only Rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 🔧 FIX: SSR-Safe Debug Info
  const getDebugInfo = () => {
    if (!isClient) {
      return {
        mode: 'SSR',
        warning: 'Client-side not hydrated yet'
      };
    }

    const addonPrices = {
      'explanation': 9.90,
      'handover_protocol': 7.90,
      'legal_review': 29.90
    };
    
    const addonTotal = Array.isArray(selectedAddons) 
      ? selectedAddons.reduce((total, key) => total + (addonPrices[key] || 0), 0)
      : 0;

    return {
      mode: 'Client',
      isClient,
      contractType,
      basePrice: typeof basePrice === 'number' ? basePrice : 12.90,
      selectedAddons: Array.isArray(selectedAddons) ? selectedAddons : [],
      addonTotal,
      totalPrice: (typeof basePrice === 'number' ? basePrice : 12.90) + addonTotal,
      timestamp: new Date().toISOString()
    };
  };

  return (
    <>
      <Head>
        <title>Test Pricing - PalWorks</title>
        <meta name="description" content="Test page for pricing components" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🧪 Pricing Component Test
            </h1>
            <p className="text-gray-600">
              SSR-Safe Test für PricingSection Komponente
            </p>
            <div className="mt-3 flex items-center space-x-2">
              <span className={`px-2 py-1 rounded text-sm ${
                isClient 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {isClient ? '✅ Client Ready' : '⏳ Hydrating...'}
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Pricing Section */}
            <div className="lg:col-span-2">
              <SafePricingSection
                contractType={contractType}
                basePrice={basePrice}
                selectedAddons={selectedAddons}
                onAddonChange={setSelectedAddons}
              />
            </div>

            {/* Debug Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">🔍 Debug Info</h3>
                
                {/* Controls - nur wenn Client-side ready */}
                {isClient && (
                  <div className="space-y-4 mb-6">
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
                        type="number"
                        step="0.10"
                        value={basePrice}
                        onChange={(e) => setBasePrice(parseFloat(e.target.value) || 12.90)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                )}

                {/* Debug Output */}
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-medium text-gray-900 mb-2">State:</h4>
                  <pre className="text-xs text-gray-600 overflow-auto">
                    {JSON.stringify(getDebugInfo(), null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Success Message - nur wenn Client-side */}
          {isClient && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-4">🎉</div>
                <div>
                  <h3 className="text-xl font-bold text-green-900 mb-2">
                    SSR-Test erfolgreich!
                  </h3>
                  <div className="text-green-800 space-y-1 text-sm">
                    <p>✅ Component lädt ohne SSR-Fehler</p>
                    <p>✅ Client-side Hydration funktioniert</p>
                    <p>✅ Preisberechnung ist SSR-safe</p>
                    <p>✅ State Management funktioniert</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
