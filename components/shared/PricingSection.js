// components/shared/PricingSection.js
import { useState } from 'react';
import { Check, Plus } from 'lucide-react';

export default function PricingSection({
  contractType = 'untermietvertrag',
  basePrice = 12.90,
  selectedAddons = [],
  onAddonChange = () => {},
  totalPrice = 12.90
}) {
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
    }
  ];

  const handleAddonToggle = (addonId) => {
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
        <span className="text-gray-700">Untermietvertrag</span>
        <span className="font-medium">{basePrice.toFixed(2)} €</span>
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
                  selectedAddons.includes(addon.id)
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 hover:border-blue-600'
                }`}
              >
                {selectedAddons.includes(addon.id) && (
                  <Check className="w-4 h-4" />
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
}
