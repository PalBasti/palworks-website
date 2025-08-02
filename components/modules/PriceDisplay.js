// components/modules/PriceDisplay.js - KORRIGIERTE LANGFRISTIGE VERSION
import { useState, useEffect } from 'react';
import { Check, Plus, FileText, HelpCircle } from 'lucide-react';

export default function PriceDisplay({ 
  basePrice, 
  basePriceLabel = "Basis-Vertrag",
  addons = [], 
  selectedAddons = [], 
  onAddonToggle,
  variant = "detailed" // "detailed" oder "compact"
}) {
  const [isLoading, setIsLoading] = useState(false);

  // ✅ KORRIGIERT: Flexiblere Addon-Filterung für alle Vertragstypen
  const availableAddons = addons.filter(addon => {
    // Nur aktive Addons anzeigen (falls is_active Feld vorhanden)
    if (addon.hasOwnProperty('is_active') && !addon.is_active) {
      return false;
    }
    
    // Explizit ausgeschlossene Addons (optional, für spezielle Cases)
    const excludeKeys = ['hidden', 'disabled', 'admin_only'];
    const addonKey = addon.addon_key || addon.id;
    
    return !excludeKeys.includes(addonKey);
  });

  // Gesamtpreis berechnen
  const calculateTotal = () => {
    const addonTotal = selectedAddons.reduce((sum, addonId) => {
      const addon = availableAddons.find(a => a.id === addonId || a.addon_key === addonId);
      return sum + (addon?.price || 0);
    }, 0);
    
    return basePrice + addonTotal;
  };

  const totalPrice = calculateTotal();

  // Addon umschalten
  const handleAddonToggle = (addonId) => {
    if (onAddonToggle) {
      onAddonToggle(addonId);
    }
  };

  // Kompakte Version für Sidebar
  if (variant === "compact") {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          💰 Preisübersicht
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>{basePriceLabel}</span>
            <span className="font-medium">{basePrice.toFixed(2)} €</span>
          </div>
          
          {selectedAddons.length > 0 && selectedAddons.map(addonId => {
            const addon = availableAddons.find(a => a.id === addonId || a.addon_key === addonId);
            return addon ? (
              <div key={addonId} className="flex justify-between text-blue-600">
                <span className="flex items-center">
                  <Plus className="h-3 w-3 mr-1" />
                  {addon.name}
                </span>
                <span>+{addon.price.toFixed(2)} €</span>
              </div>
            ) : null;
          })}
          
          <div className="border-t pt-2 flex justify-between font-bold text-base">
            <span>Gesamt:</span>
            <span className="text-blue-600">{totalPrice.toFixed(2)} €</span>
          </div>
        </div>
      </div>
    );
  }

  // Detaillierte Version
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          💳 Preisübersicht
          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
            DIY-Paket
          </span>
        </h3>

        {/* Basis-Vertrag */}
        <div className="mb-6">
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
            <div>
              <span className="font-medium text-gray-900">{basePriceLabel}</span>
              <p className="text-sm text-gray-600">Vollständiger rechtssicherer Vertrag</p>
            </div>
            <span className="font-bold text-lg text-gray-900">
              {basePrice.toFixed(2)} €
            </span>
          </div>
        </div>

        {/* ✅ KORRIGIERT: Verfügbare Addons (nicht mehr "DIY-Addons") */}
        {availableAddons.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              📋 Zusatzleistungen
              <HelpCircle className="h-4 w-4 ml-2 text-gray-400" title="Optionale Erweiterungen für Ihren Vertrag" />
            </h4>
            
            <div className="space-y-3">
              {availableAddons.map((addon) => {
                const addonId = addon.id || addon.addon_key;
                const isSelected = selectedAddons.includes(addonId);
                
                return (
                  <div
                    key={addonId}
                    className={`
                      cursor-pointer p-4 rounded-lg border transition-all duration-200
                      ${isSelected 
                        ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500' 
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                      }
                    `}
                    onClick={() => handleAddonToggle(addonId)}
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
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 flex items-center">
                            {addon.name}
                            {/* ✅ KORRIGIERT: Flexiblere Icon-Zuordnung */}
                            {(addon.addon_key === 'protocol' || addon.id === 'protocol' || 
                              addon.name.toLowerCase().includes('protokoll')) && (
                              <FileText className="h-4 w-4 ml-2 text-blue-600" />
                            )}
                          </h5>
                          {addon.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {addon.description}
                            </p>
                          )}
                          
                          {/* ✅ KORRIGIERT: Flexiblere Features-Darstellung */}
                          {addon.features && (
                            <div className="mt-2">
                              <ul className="text-xs text-gray-500 space-y-1">
                                {Array.isArray(addon.features) 
                                  ? addon.features.map((feature, index) => (
                                      <li key={index} className="flex items-center">
                                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                                        {feature}
                                      </li>
                                    ))
                                  : typeof addon.features === 'object'
                                  ? Object.entries(addon.features).map(([key, value], index) => (
                                      <li key={index} className="flex items-center">
                                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                                        {key}: {value}
                                      </li>
                                    ))
                                  : (
                                      <li className="flex items-center">
                                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                                        {addon.features}
                                      </li>
                                    )
                                }
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
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
            <span className="text-blue-600">{totalPrice.toFixed(2)} €</span>
          </div>
          
          {selectedAddons.length > 0 && (
            <div className="mt-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>{basePriceLabel}:</span>
                <span>{basePrice.toFixed(2)} €</span>
              </div>
              {selectedAddons.map(addonId => {
                const addon = availableAddons.find(a => a.id === addonId || a.addon_key === addonId);
                return addon ? (
                  <div key={addonId} className="flex justify-between text-blue-600">
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

        {/* ✅ KORRIGIERT: Allgemeinerer Hinweis */}
        <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm text-green-800">
          <p className="flex items-center">
            <span className="mr-2">🎯</span>
            Alle Preise inkl. MwSt. • Sofortiger PDF-Download • Rechtssicher
          </p>
        </div>
      </div>
    </div>
  );
}
