// components/shared/PricingSection.js
import React, { useState, useEffect } from 'react';
import { Plus, Info, Check, Euro, ShoppingCart } from 'lucide-react';
import { getAddonsForContract, calculateAddonPrices } from '@/lib/supabase/addonService';

export default function PricingSection({ 
  contractType, 
  basePrice = 19.90, 
  selectedAddons = [], 
  onAddonChange,
  onTotalChange,
  className = "",
  showCheckout = true 
}) {
  const [availableAddons, setAvailableAddons] = useState([]);
  const [addonData, setAddonData] = useState({ addons: [], totalPrice: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load available addons for contract type
  useEffect(() => {
    async function loadAddons() {
      if (!contractType) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const addons = await getAddonsForContract(contractType);
        setAvailableAddons(addons);
        
        // Calculate prices for currently selected addons
        if (selectedAddons.length > 0) {
          const priceData = await calculateAddonPrices(contractType, selectedAddons);
          setAddonData(priceData);
        } else {
          setAddonData({ addons: [], totalPrice: 0 });
        }
        
      } catch (err) {
        console.error('Error loading addons:', err);
        setError('Fehler beim Laden der Zusatzleistungen');
      } finally {
        setLoading(false);
      }
    }

    loadAddons();
  }, [contractType]);

  // Recalculate prices when selected addons change
  useEffect(() => {
    async function recalculatePrices() {
      if (!contractType) return;
      
      try {
        const priceData = await calculateAddonPrices(contractType, selectedAddons);
        setAddonData(priceData);
        
        // Notify parent component of total change
        if (onTotalChange) {
          onTotalChange(basePrice + priceData.totalPrice);
        }
        
      } catch (err) {
        console.error('Error recalculating prices:', err);
      }
    }

    recalculatePrices();
  }, [selectedAddons, contractType, basePrice, onTotalChange]);

  // Handle addon selection
  const handleAddonToggle = (addonKey) => {
    const newSelection = selectedAddons.includes(addonKey)
      ? selectedAddons.filter(key => key !== addonKey)
      : [...selectedAddons, addonKey];
    
    if (onAddonChange) {
      onAddonChange(newSelection);
    }
  };

  // Format price for German locale
  const formatPrice = (price) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(price);
  };

  const totalPrice = basePrice + addonData.totalPrice;

  if (loading) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center text-red-700">
          <Info className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <ShoppingCart className="h-5 w-5 mr-2 text-blue-600" />
          Preisübersicht
        </h3>
      </div>

      <div className="p-6">
        {/* Base Price */}
        <div className="space-y-3">
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <div>
              <span className="text-gray-900 font-medium">Grundvertrag</span>
              <p className="text-sm text-gray-600">Vollständiger, rechtssicherer Vertrag</p>
            </div>
            <span className="font-semibold text-gray-900 text-lg">{formatPrice(basePrice)}</span>
          </div>

          {/* Available Addons */}
          {availableAddons.length > 0 && (
            <div className="space-y-4">
              <div className="pt-2">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Plus className="h-4 w-4 mr-1" />
                  Zusatzleistungen (optional)
                </h4>
                
                <div className="space-y-3">
                  {availableAddons.map((addon) => {
                    const isSelected = selectedAddons.includes(addon.addon_key);
                    
                    return (
                      <div
                        key={addon.addon_key}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                        onClick={() => handleAddonToggle(addon.addon_key)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            {/* Checkbox */}
                            <div className={`mt-1 h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected 
                                ? 'border-blue-500 bg-blue-500' 
                                : 'border-gray-300'
                            }`}>
                              {isSelected && <Check className="h-3 w-3 text-white" />}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 mb-1">{addon.name}</h5>
                              <p className="text-sm text-gray-600 leading-relaxed">{addon.description}</p>
                              
                              {/* Features */}
                              {addon.features && addon.features.length > 0 && (
                                <ul className="text-xs text-gray-500 mt-2 space-y-1">
                                  {addon.features.map((feature, index) => (
                                    <li key={index} className="flex items-center">
                                      <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                                      {feature}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                          
                          {/* Price */}
                          <div className="ml-4 text-right flex-shrink-0">
                            <span className={`font-semibold ${
                              isSelected ? 'text-blue-700' : 'text-gray-700'
                            }`}>
                              + {formatPrice(parseFloat(addon.price))}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Selected Addons Summary */}
          {addonData.addons.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Gewählte Zusatzleistungen:</h5>
              <div className="space-y-2">
                {addonData.addons.map((addon) => (
                  <div key={addon.addon_key} className="flex justify-between items-center text-sm">
                    <span className="text-blue-700 flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      {addon.name}
                    </span>
                    <span className="font-medium text-blue-700">
                      + {formatPrice(parseFloat(addon.price))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total Price */}
          <div className="pt-4 border-t-2 border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-lg font-semibold text-gray-900">Gesamtpreis</span>
                <p className="text-sm text-gray-600">inkl. MwSt.</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-blue-600">
                  {formatPrice(totalPrice)}
                </span>
                {addonData.totalPrice > 0 && (
                  <p className="text-sm text-gray-600">
                    ({formatPrice(basePrice)} + {formatPrice(addonData.totalPrice)})
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Checkout Section */}
          {showCheckout && (
            <div className="pt-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Bereit zum Kauf?</p>
                    <p className="text-xs text-blue-700">Sofortiger Download nach Zahlung</p>
                  </div>
                  <Euro className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
