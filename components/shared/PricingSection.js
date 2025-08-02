// components/shared/PricingSection.js
import { useState, useEffect } from 'react';
import { Check, Plus, Loader2 } from 'lucide-react';

export default function PricingSection({ 
  contractType, 
  basePrice, 
  selectedAddons = [], 
  onAddonChange 
}) {
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Addons aus Supabase laden
  useEffect(() => {
    loadAddons();
  }, [contractType]);

  const loadAddons = async () => {
    try {
      setLoading(true);
      setError(null);

      // Import Supabase client - korrigierter Pfad
      const { supabase } = await import('../../lib/supabase/supabase');
      
      const { data, error } = await supabase
        .from('contract_addons')
        .select('*')
        .eq('contract_type', contractType)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      
      setAddons(data || []);
    } catch (err) {
      console.error('Error loading addons:', err);
      setError('Addons konnten nicht geladen werden');
      
      // Fallback: Mock-Daten für Testing
      const mockAddons = [
        {
          id: 1,
          addon_key: 'explanation',
          name: 'Rechtliche Erläuterung',
          description: 'Detaillierte Erklärung aller Vertragsklauseln',
          price: 9.90,
          contract_type: contractType,
          features: {
            'Umfang': '5-10 Seiten',
            'Format': 'PDF',
            'Sprache': 'Deutsch'
          }
        },
        {
          id: 2,
          addon_key: 'handover_protocol',
          name: 'Übergabeprotokoll',
          description: 'Professionelles Protokoll für die Wohnungsübergabe',
          price: 7.90,
          contract_type: contractType,
          features: {
            'Umfang': '2-3 Seiten',
            'Checkliste': 'Enthalten',
            'Format': 'PDF + Word'
          }
        },
        {
          id: 3,
          addon_key: 'legal_review',
          name: 'Juristische Prüfung',
          description: 'Überprüfung durch qualifizierte Anwälte',
          price: 29.90,
          contract_type: contractType,
          features: {
            'Bearbeitungszeit': '2-3 Werktage',
            'Anpassungen': 'Inklusive',
            'Garantie': '12 Monate'
          }
        }
      ];
      
      setAddons(mockAddons);
      console.log('Using mock addons for testing');
    } finally {
      setLoading(false);
    }
  };

  // Addon-Auswahl umschalten
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

  if (loading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Optionen werden geladen...</span>
        </div>
      </div>
    );
  }

  if (error && addons.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="text-center py-4">
          <p className="text-red-600 font-medium">⚠️ {error}</p>
          <button 
            onClick={loadAddons}
            className="mt-2 text-blue-600 hover:text-blue-800 underline"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  const total = calculateTotal();

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        💳 Preisübersicht
        {error && addons.length > 0 && (
          <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            Demo-Modus
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

      {/* Optionale Addons */}
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
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">
                          {addon.name}
                        </h5>
                        {addon.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {addon.description}
                          </p>
                        )}
                        {addon.features && Object.keys(addon.features).length > 0 && (
                          <div className="mt-2">
                            <ul className="text-xs text-gray-500 space-y-1">
                              {Object.entries(addon.features).map(([key, value]) => (
                                <li key={key} className="flex items-center">
                                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                                  {key}: {value}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`
                        font-semibold text-lg
                        ${isSelected ? 'text-blue-700' : 'text-gray-700'}
                      `}>
                        +{addon.price.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Gesamtpreis */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center text-xl font-bold">
          <span className="text-gray-900">Gesamtpreis</span>
          <span className="text-blue-600">{total.toFixed(2)} €</span>
        </div>
        
        {selectedAddons.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Basis-Vertrag:</span>
              <span>{basePrice.toFixed(2)} €</span>
            </div>
            {selectedAddons.map(key => {
              const addon = addons.find(a => a.addon_key === key);
              return addon ? (
                <div key={key} className="flex justify-between text-blue-600">
                  <span className="flex items-center">
                    <Plus className="h-3 w-3 mr-1" />
                    {addon.name}
                  </span>
                  <span>+{addon.price.toFixed(2)} €</span>
                </div>
              ) : null;
            })}
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

  // Addon-Auswahl umschalten
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

  if (loading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Optionen werden geladen...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="text-center py-4">
          <p className="text-red-600 font-medium">⚠️ {error}</p>
          <button 
            onClick={loadAddons}
            className="mt-2 text-blue-600 hover:text-blue-800 underline"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  const total = calculateTotal();

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        💳 Preisübersicht
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

      {/* Optionale Addons */}
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
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">
                          {addon.name}
                        </h5>
                        {addon.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {addon.description}
                          </p>
                        )}
                        {addon.features && Object.keys(addon.features).length > 0 && (
                          <div className="mt-2">
                            <ul className="text-xs text-gray-500 space-y-1">
                              {Object.entries(addon.features).map(([key, value]) => (
                                <li key={key} className="flex items-center">
                                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                                  {typeof value === 'string' ? value : `${key}: ${value}`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`
                        font-semibold text-lg
                        ${isSelected ? 'text-blue-700' : 'text-gray-700'}
                      `}>
                        +{addon.price.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Gesamtpreis */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center text-xl font-bold">
          <span className="text-gray-900">Gesamtpreis</span>
          <span className="text-blue-600">{total.toFixed(2)} €</span>
        </div>
        
        {selectedAddons.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Basis-Vertrag:</span>
              <span>{basePrice.toFixed(2)} €</span>
            </div>
            {selectedAddons.map(key => {
              const addon = addons.find(a => a.addon_key === key);
              return addon ? (
                <div key={key} className="flex justify-between text-blue-600">
                  <span className="flex items-center">
                    <Plus className="h-3 w-3 mr-1" />
                    {addon.name}
                  </span>
                  <span>+{addon.price.toFixed(2)} €</span>
                </div>
              ) : null;
            })}
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
