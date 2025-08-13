// components/shared/PricingSection.js
import React, { useState, useEffect } from 'react';

const PricingSection = ({ 
  contractType, 
  basePrice, 
  selectedAddons = [], 
  onAddonChange,
  enabledAddons = null // Optional: Array of addon_keys to show only specific addons
}) => {
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ KORRIGIERTE Addon-Definitionen - KONSISTENTE BEGRIFFE
  const fallbackAddons = {
    untermietvertrag: [
      { 
        id: 1, 
        addon_key: 'explanation', 
        name: 'Vertragserläuterungen', 
        description: 'Detaillierte Erklärung aller Vertragsklauseln',
        price: 9.90, 
        is_popular: false,
        icon: '📝'
      },
      { 
        id: 2, 
        addon_key: 'handover_protocol', 
        name: 'Übergabeprotokoll', 
        description: 'Professionelle Dokumentation der Wohnungsübergabe',
        price: 7.90, 
        is_popular: true,
        icon: '📋'
      },
      { 
        id: 3, 
        addon_key: 'legal_review', 
        name: 'Anwaltliche Prüfung', 
        description: 'Rechtliche Überprüfung durch Fachanwalt',
        price: 29.90, 
        is_popular: false,
        icon: '⚖️'
      }
    ],
    garage: [
      { 
        id: 4, 
        addon_key: 'explanation', 
        name: 'Vertragserläuterungen', 
        description: 'Erklärung der Garage-spezifischen Klauseln',
        price: 9.90, 
        is_popular: false,
        icon: '📝'
      },
      { 
        id: 5, 
        addon_key: 'insurance_clause', 
        name: 'Versicherungsklauseln', 
        description: 'Spezielle Versicherungsregelungen für Garagen',
        price: 4.90, 
        is_popular: true,
        icon: '🛡️'
      }
    ],
    wg: [
      { 
        id: 6, 
        addon_key: 'explanation', 
        name: 'Vertragserläuterungen', 
        description: 'WG-spezifische Vertragsberatung',
        price: 9.90, 
        is_popular: false,
        icon: '📝'
      },
      { 
        id: 7, 
        addon_key: 'house_rules', 
        name: 'WG-Hausordnung', 
        description: 'Template für WG-interne Regelungen',
        price: 6.90, 
        is_popular: true,
        icon: '📋'
      }
    ]
  };

  // Load Addons (try from API, fallback to static data)
  useEffect(() => {
    const loadAddons = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from Supabase API
        const response = await fetch(`/api/contract-addons?contract_type=${contractType}`);
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setAddons(data);
            setLoading(false);
            return;
          }
        }
        
        // Fallback to static data
        const staticAddons = fallbackAddons[contractType] || [];
        setAddons(staticAddons);
        
      } catch (err) {
        console.log('📥 Using fallback addons:', err.message);
        // Fallback to static data
        const staticAddons = fallbackAddons[contractType] || [];
        setAddons(staticAddons);
      } finally {
        setLoading(false);
      }
    };

    loadAddons();
  }, [contractType]);

  // Filter addons if enabledAddons is specified
  const displayAddons = enabledAddons 
    ? addons.filter(addon => enabledAddons.includes(addon.addon_key))
    : addons;

  // Calculate total price
  const totalPrice = basePrice + selectedAddons.reduce((sum, addonKey) => {
    const addon = addons.find(a => a.addon_key === addonKey);
    return sum + (addon?.price || 0);
  }, 0);

  // Handle addon selection
  const toggleAddon = (addonKey) => {
    const newSelection = selectedAddons.includes(addonKey)
      ? selectedAddons.filter(key => key !== addonKey)
      : [...selectedAddons, addonKey];
    
    onAddonChange(newSelection);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center text-red-600">
          <p>⚠️ Fehler beim Laden der Zusatzleistungen</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">
        📋 Zusatzleistungen
        {enabledAddons && (
          <span className="text-sm text-gray-500 ml-2">
            ({enabledAddons.length} verfügbar)
          </span>
        )}
      </h3>
      
      {displayAddons.length > 0 ? (
        <div className="space-y-3 mb-6">
          {displayAddons.map((addon) => {
            const isSelected = selectedAddons.includes(addon.addon_key);
            return (
              <div
                key={addon.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => toggleAddon(addon.addon_key)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3 flex-1">
                    <span className="text-2xl">{addon.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{addon.name}</h4>
                        {addon.is_popular && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Beliebt
                          </span>
                        )}
                      </div>
                      {addon.description && (
                        <p className="text-sm text-gray-600 mt-1">{addon.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <span className={`text-lg font-semibold ${
                      isSelected ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      +{parseFloat(addon.price).toFixed(2)} €
                    </span>
                    <div className="mt-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleAddon(addon.addon_key)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>Keine Zusatzleistungen verfügbar für {contractType}</p>
        </div>
      )}

      {/* Preissummary */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Basispreis ({contractType})</span>
          <span className="font-medium">{basePrice.toFixed(2)} €</span>
        </div>
        
        {selectedAddons.length > 0 && (
          <div className="space-y-1 mb-2">
            {selectedAddons.map(addonKey => {
              const addon = addons.find(a => a.addon_key === addonKey);
              return addon ? (
                <div key={addonKey} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">+ {addon.name}</span>
                  <span className="text-gray-600">{addon.price.toFixed(2)} €</span>
                </div>
              ) : null;
            })}
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-lg font-semibold text-gray-900">
            Gesamtsumme
          </span>
          <span className="text-2xl font-bold text-blue-600">
            {totalPrice.toFixed(2)} €
          </span>
        </div>
      </div>

      {/* Selection Summary */}
      {selectedAddons.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded">
          <p className="text-sm text-blue-800">
            <strong>{selectedAddons.length}</strong> Zusatzleistung{selectedAddons.length !== 1 ? 'en' : ''} ausgewählt
          </p>
        </div>
      )}
    </div>
  );
};

export default PricingSection;
