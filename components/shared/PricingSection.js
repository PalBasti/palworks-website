// components/shared/PricingSection.js - KORRIGIERTE VERSION
import { useState, useEffect } from 'react';
import { Check, Plus, FileText, HelpCircle, Loader2 } from 'lucide-react';
import { getAddonsByContractType } from '../lib/supabase/addonService';

export default function PricingSection({ 
  contractType,
  basePrice, 
  selectedAddons = [], 
  onAddonChange,
  className = ""
}) {
  const [addons, setAddons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Addons laden
  useEffect(() => {
    const loadAddons = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await getAddonsByContractType(contractType);
        if (response.success) {
          setAddons(response.data || []);
        } else {
          throw new Error(response.error || 'Fehler beim Laden der Addons');
        }
      } catch (err) {
        console.error('Addon loading error:', err);
        setError(err.message);
        setAddons([]); // Fallback zu leerem Array
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
    if (!onAddonChange) return;
    
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

  if (isLoading) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600">Lade Preisoptionen...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="text-center py-4">
          <AlertCircle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-2">
            Optionale Services konnten nicht geladen werden.
          </p>
          <p className="text-xs text-gray-500">
            Basis-Vertrag ist voll funktionsfähig.
          </p>
        </div>
      </div>
    );
  }

  const total = calculateTotal();

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 rounded-t-lg">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          💰 Preisübersicht
        </h3>
      </div>

      <div className="p-6 space-y-6">
        {/* Basis-Vertrag */}
        <div className="space-y-3">
          <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <span className="font-medium text-gray-900">Basis-Vertrag</span>
              <p className="text-sm text-gray-600">Vollständiger rechtssicherer Vertrag</p>
            </div>
            <span className="font-bold text-lg text-gray-900">
              {basePrice.toFixed(2)}€
            </span>
          </div>
        </div>

        {/* Optionale Addons - nur wenn welche geladen wurden */}
        {addons.length > 0 && (
          <div>
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
                      cursor-pointer p-4 rounded-lg border transition-all duration-200
                      ${isSelected 
                        ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500 ring-opacity-20' 
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
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
                            : 'border-gray-300 hover:border-blue-400'
                          }
                        `}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">
                            {addon.name}
                          </h5>
                          {addon.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {addon.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={`
                        font-medium text-lg
                        ${isSelected ? 'text-blue-700' : 'text-gray-700'}
                      `}>
                        +{addon.price.toFixed(2)}€
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Gesamtpreis */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <span className="text-xl font-bold text-gray-900">Gesamtpreis</span>
            <span className="text-2xl font-bold text-blue-600">{total.toFixed(2)}€</span>
          </div>
          
          {/* Aufschlüsselung wenn Addons gewählt */}
          {selectedAddons.length > 0 && (
            <div className="mt-3 text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Basis-Vertrag:</span>
                <span>{basePrice.toFixed(2)}€</span>
              </div>
              {selectedAddons.map(key => {
                const addon = addons.find(a => a.addon_key === key);
                return addon ? (
                  <div key={key} className="flex justify-between text-blue-600">
                    <span className="flex items-center">
                      <Plus className="h-3 w-3 mr-1" />
                      {addon.name}
                    </span>
                    <span>+{addon.price.toFixed(2)}€</span>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* Hinweise */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 flex items-center">
            <span className="mr-2">💡</span>
            Alle Preise inkl. MwSt. • Sofortiger PDF-Download nach Bezahlung
          </p>
        </div>
      </div>
    </div>
  );
}
