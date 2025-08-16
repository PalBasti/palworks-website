// components/shared/PricingSection.js - MINIMAL VERSION FÜR SOFORTIGE INTEGRATION
import React, { useState } from 'react';
import { Check, FileText, ClipboardList, AlertCircle } from 'lucide-react';

const PricingSection = ({ 
  contractType = 'untermietvertrag',
  basePrice = 12.90,
  selectedAddons = [],
  onAddonChange = () => {},
  showTitle = true 
}) => {
  // Addon-Konfiguration speziell für Untermietvertrag
  const untermietvertragAddons = [
    {
      id: 'explanation',
      addon_key: 'explanation',
      name: 'Vertragserläuterungen',
      description: 'Detaillierte schriftliche Erklärungen zu allen Vertragsklauseln (PDF)',
      price: 9.90,
      is_popular: false,
      icon: <FileText className="h-5 w-5" />,
      features: [
        'Rechtliche Erklärungen zu allen Klauseln',
        'Praktische Hinweise für Vermieter',
        'Fallstricke und Empfehlungen',
        'Separates 5-10 Seiten PDF'
      ]
    },
    {
      id: 'handover_protocol',
      addon_key: 'handover_protocol',
      name: 'Übergabeprotokoll',
      description: 'Professionelles Protokoll für Ein- und Auszug',
      price: 7.90,
      is_popular: true,
      icon: <ClipboardList className="h-5 w-5" />,
      features: [
        'Vorausgefüllte Vertragsdaten',
        'Checkliste für alle Räume',
        'Schäden und Zählerstände',
        'Separates 2-3 Seiten PDF'
      ]
    }
  ];

  // Addon auswählen/abwählen
  const toggleAddon = (addonKey) => {
    const newSelection = selectedAddons.includes(addonKey)
      ? selectedAddons.filter(key => key !== addonKey)
      : [...selectedAddons, addonKey];
    
    onAddonChange(newSelection);
  };

  // Gesamtpreis berechnen
  const calculateTotal = () => {
    const addonTotal = untermietvertragAddons
      .filter(addon => selectedAddons.includes(addon.addon_key))
      .reduce((sum, addon) => sum + addon.price, 0);
    
    return basePrice + addonTotal;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {showTitle && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
            📦 Zusatzleistungen
            <span className="ml-3 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Optional</span>
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
            <h4 className="font-medium text-blue-900 flex items-center">
              🏠 Untermietvertrag (Basis)
              <Check className="h-4 w-4 text-green-600 ml-2" />
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
      <div className="space-y-4 mb-6">
        {untermietvertragAddons.map((addon) => {
          const isSelected = selectedAddons.includes(addon.addon_key);
          
          return (
            <div
              key={addon.id}
              onClick={() => toggleAddon(addon.addon_key)}
              className={`relative border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {/* Checkbox */}
                  <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {addon.icon}
                      <h4 className={`font-medium ${
                        isSelected ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {addon.name}
                        {addon.is_popular && (
                          <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                            Beliebt
                          </span>
                        )}
                      </h4>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {addon.description}
                    </p>
                    
                    {/* Feature-Liste */}
                    <div className="grid md:grid-cols-2 gap-1">
                      {addon.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-xs text-gray-500">
                          <Check className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Preis */}
                <div className="text-right ml-4">
                  <span className={`text-lg font-bold ${
                    isSelected ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    +{addon.price.toFixed(2)} €
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gesamtpreis */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center text-lg font-bold">
          <span className="text-gray-900">Gesamtpreis:</span>
          <span className="text-blue-600 text-xl">
            {calculateTotal().toFixed(2)} €
          </span>
        </div>
        
        {selectedAddons.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Basisvertrag:</span>
              <span>{basePrice.toFixed(2)} €</span>
            </div>
            {untermietvertragAddons
              .filter(addon => selectedAddons.includes(addon.addon_key))
              .map(addon => (
                <div key={addon.id} className="flex justify-between">
                  <span>+ {addon.name}:</span>
                  <span>{addon.price.toFixed(2)} €</span>
                </div>
              ))
            }
          </div>
        )}
      </div>

      {/* Hinweis */}
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-amber-900 mb-1">
              📄 Separate PDF-Downloads
            </p>
            <p className="text-amber-800">
              Jede Zusatzleistung erhalten Sie als separates PDF-Dokument per E-Mail. 
              Alle Dokumente enthalten bereits Ihre eingegebenen Vertragsdaten.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
