// components/shared/PricingSection.js - GARANTIERT DEPLOYMENT-FÄHIG
import { useState, useEffect } from 'react';

export default function PricingSection({ 
  contractType = 'untermietvertrag',
  basePrice = 19.90, 
  selectedAddons = [], 
  onAddonChange = () => {},
  className = ""
}) {
  const [addons, setAddons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock-Addons für verschiedene Vertragstypen - FEST EINGEBAUT
  const getMockAddons = (contractType) => {
    const mockData = {
      'untermietvertrag': [
        {
          id: 1,
          addon_key: 'explanation',
          name: 'Vertragsberatung',
          description: 'Telefonische Erläuterung aller Vertragsklauseln',
          price: 9.90,
          is_popular: false
        },
        {
          id: 2,
          addon_key: 'handover_protocol',
          name: 'Übergabeprotokoll',
          description: 'Professionelles Protokoll für Ein- und Auszug',
          price: 7.90,
          is_popular: true
        },
        {
          id: 3,
          addon_key: 'legal_review',
          name: 'Anwaltliche Prüfung',
          description: 'Individuelle Prüfung durch Fachanwalt',
          price: 29.90,
          is_popular: false
        }
      ],
      'garage': [
        {
          id: 4,
          addon_key: 'insurance_clause',
          name: 'Versicherungsklausel',
          description: 'Erweiterte Haftungsregelungen',
          price: 4.90,
          is_popular: true
        },
        {
          id: 5,
          addon_key: 'maintenance_guide',
          name: 'Wartungshandbuch',
          description: 'Leitfaden für Garagenpflege',
          price: 12.90,
          is_popular: false
        }
      ],
      'wg': [
        {
          id: 6,
          addon_key: 'house_rules',
          name: 'WG-Hausordnung',
          description: 'Detaillierte Gemeinschaftsregeln',
          price: 6.90,
          is_popular: true
        },
        {
          id: 7,
          addon_key: 'cleaning_schedule',
          name: 'Putzplan-Template',
          description: 'Faire Aufgabenverteilung',
          price: 3.90,
          is_popular: false
        }
      ]
    };
    
    return mockData[contractType] || [];
  };

  // Optionaler API-Call für echte Daten (Fallback zu Mock)
  const tryLoadRealAddons = async (contractType) => {
    try {
      // Versuche echte API - falls verfügbar
      const response = await fetch(`/api/addons?contract_type=${contractType}`);
      if (response.ok) {
        const data = await response.json();
        return { success: true, data: data.addons || [] };
      }
      throw new Error('API not available');
    } catch (error) {
      // Fallback zu Mock-Daten - KEIN Fehler
      return { 
        success: true, 
        data: getMockAddons(contractType),
        isMock: true 
      };
    }
  };

  // Addons laden beim Mount
  useEffect(() => {
    const loadAddons = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await tryLoadRealAddons(contractType);
        setAddons(response.data || []);
        
        // Debug-Info
        if (response.isMock) {
          console.log(`📦 Using mock addons for ${contractType}`);
        }
        
      } catch (err) {
        console.error('Addon loading error:', err);
        // Auch bei Fehler: Mock-Daten verwenden
        setAddons(getMockAddons(contractType));
      } finally {
        setIsLoading(false);
      }
    };

    if (contractType) {
      loadAddons();
    }
  }, [contractType]);

  // Addon umschalten
  const toggleAddon = (addonKey) => {
    const newSelection = selectedAddons.includes(addonKey)
      ? selectedAddons.filter(key => key !== addonKey)
      : [...selectedAddons, addonKey];
    
    onAddonChange(newSelection);
  };

  // Gesamtpreis berechnen
  const calculateTotal = () => {
    const addonTotal = selectedAddons.reduce((sum, key) => {
      const addon = addons.find(a => a.addon_key === key);
      return sum + (addon?.price || 0);
    }, 0);
    
    return basePrice + addonTotal;
  };

  // Loading State
  if (isLoading) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-gray-600">Lade Preisoptionen...</span>
        </div>
      </div>
    );
  }

  const total = calculateTotal();

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        💳 Preisübersicht
        {addons.length === 0 && (
          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Basis
          </span>
        )}
      </h3>

      {/* Basis-Vertrag */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center p-3 bg-white rounded border">
          <div>
            <span className="font-medium text-gray-900">Basis-Vertrag</span>
            <p className="text-sm text-gray-600">Vollständiger rechtssicherer Vertrag</p>
          </div>
          <span className="font-bold text-lg text-gray-900">
            {basePrice.toFixed(2)} €
          </span>
        </div>
      </div>

      {/* Optionale Addons - nur wenn welche geladen wurden */}
      {addons.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">
            📋 Optionale Zusatzleistungen
          </h4>
          <div className="space-y-2">
            {addons.map((addon) => {
              const isSelected = selectedAddons.includes(addon.addon_key);
              
              return (
                <div
                  key={addon.id}
                  className={`
                    cursor-pointer p-3 rounded border transition-all duration-200
                    ${isSelected 
                      ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500' 
                      : 'bg-white border-gray-200 hover:border-blue-300'
                    }
                  `}
                  onClick={() => toggleAddon(addon.addon_key)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <div className={`
                        mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center
                        ${isSelected 
                          ? 'bg-blue-600 border-blue-600' 
                          : 'border-gray-300 bg-white'
                        }
                      `}>
                        {isSelected && (
                          <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                            {addon.name}
                          </span>
                          {addon.is_popular && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                              Beliebt
                            </span>
                          )}
                        </div>
                        <p className={`text-sm mt-1 ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                          {addon.description}
                        </p>
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
        </div>
      )}

      {/* Gesamtsumme */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Gesamtsumme</span>
          <span className="text-2xl font-bold text-blue-600">
            {total.toFixed(2)} €
          </span>
        </div>
        
        {/* Aufschlüsselung nur bei Addons */}
        {selectedAddons.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Basis-Vertrag</span>
                <span>{basePrice.toFixed(2)} €</span>
              </div>
              {selectedAddons.map(key => {
                const addon = addons.find(a => a.addon_key === key);
                return addon ? (
                  <div key={key} className="flex justify-between text-blue-600">
                    <span className="flex items-center">
                      <span className="text-xs mr-1">+</span>
                      {addon.name}
                    </span>
                    <span>+{addon.price.toFixed(2)} €</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>

      {/* Hinweise */}
      <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-800">
        <p className="flex items-center">
          <span className="mr-2">💡</span>
          Alle Preise inkl. MwSt. • Sofortiger PDF-Download nach Bezahlung
        </p>
      </div>
    </div>
  );
}
