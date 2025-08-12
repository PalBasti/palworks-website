// components/shared/PricingSection.js - PRODUCTION READY
import React, { useState, useEffect } from 'react';
import { Check, Star, Info } from 'lucide-react';

const PricingSection = ({ 
  contractType = 'untermietvertrag',
  basePrice = 12.90,
  selectedAddons = [],
  onAddonChange = () => {},
  showTitle = true,
  compact = false,
  enabledAddons = null // Für schrittweise Integration: ['handover_protocol']
}) => {
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Addon-Konfiguration - wird später aus Supabase geladen
  const staticAddons = {
    untermietvertrag: [
      {
        id: 1,
        addon_key: 'explanation',
        name: 'Vertragserläuterungen',
        description: 'Detaillierte Erklärungen zu allen Vertragsklauseln',
        price: 9.90,
        is_popular: false,
        icon: '📝'
      },
      {
        id: 2,
        addon_key: 'handover_protocol',
        name: 'Übergabeprotokoll',
        description: 'Professionelles Protokoll für Ein- und Auszug',
        price: 7.90,
        is_popular: true,
        icon: '📋'
      }
      // ✅ ENTFERNT: legal_review für Phase 1
    ],
    garage: [
      {
        id: 4,
        addon_key: 'insurance_clause',
        name: 'Versicherungsklauseln',
        description: 'Zusätzliche Absicherung bei Schäden',
        price: 4.90,
        is_popular: true,
        icon: '🛡️'
      },
      {
        id: 5,
        addon_key: 'maintenance_guide',
        name: 'Wartungshandbuch',
        description: 'Anleitung zur ordnungsgemäßen Nutzung',
        price: 12.90,
        is_popular: false,
        icon: '🔧'
      }
    ],
    wg: [
      {
        id: 6,
        addon_key: 'house_rules',
        name: 'WG-Hausordnung',
        description: 'Vorlage für harmonisches Zusammenleben',
        price: 6.90,
        is_popular: true,
        icon: '🏠'
      },
      {
        id: 7,
        addon_key: 'cleaning_schedule',
        name: 'Putzplan-Template',
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
        try {
          const { getAddonsForContract } = await import('../../lib/supabase/addonService');
          const data = await getAddonsForContract(contractType);
          setAddons(data);
        } catch (serviceError) {
          console.log('Using static addon data for development');
          // Fallback auf statische Daten
          let availableAddons = staticAddons[contractType] || [];
          
          // Filtere Addons basierend auf enabledAddons (für schrittweise Integration)
          if (enabledAddons && Array.isArray(enabledAddons)) {
            availableAddons = availableAddons.filter(addon => 
              enabledAddons.includes(addon.addon_key)
            );
          }
          
          setAddons(availableAddons);
        }
      } catch (error) {
        console.error('Error loading addons:', error);
        setError('Fehler beim Laden der Zusatzleistungen');
        setAddons([]);
      } finally {
        setLoading(false);
      }
    };

    loadAddons();
  }, [contractType, enabledAddons]);

  // Addon-Auswahl Toggle
  const toggleAddon = (addonKey) => {
    const newSelection = selectedAddons.includes(addonKey)
      ? selectedAddons.filter(key => key !== addonKey)
      : [...selectedAddons, addonKey];
    
    onAddonChange(newSelection);
  };

  // Gesamtpreis berechnen
  const calculateTotal = () => {
    const addonTotal = selectedAddons.reduce((sum, addonKey) => {
      const addon = addons.find(a => a.addon_key === addonKey);
      return sum + (addon ? parseFloat(addon.price) : 0);
    }, 0);
    
    return basePrice + addonTotal;
  };

  // Addon-Details abrufen
  const getSelectedAddonDetails = () => {
    return selectedAddons.map(addonKey => {
      const addon = addons.find(a => a.addon_key === addonKey);
      return addon ? { key: addonKey, ...addon } : null;
    }).filter(Boolean);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <Info className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-800 text-sm">{error}</span>
        </div>
      </div>
    );
  }

  const totalPrice = calculateTotal();
  const selectedDetails = getSelectedAddonDetails();

  return (
    <div className={`bg-white rounded-lg border ${compact ? 'p-4' : 'p-6'}`}>
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
              <div key={addon.key} className="flex justify-between text-sm">
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
