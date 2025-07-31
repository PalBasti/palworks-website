// components/modules/PriceDisplay.js
import { useState, useEffect } from 'react'
import { Plus, Minus, Info, Check } from 'lucide-react'

const PriceDisplay = ({
  basePrice = 12.90,
  basePriceLabel = "Grundpreis",
  addons = [],
  selectedAddons = [],
  onAddonToggle,
  currency = "€",
  showFeatures = true,
  variant = "default", // default, compact, detailed
  className = ""
}) => {
  const [animatePrice, setAnimatePrice] = useState(false)

  const calculateTotal = () => {
    let total = basePrice
    selectedAddons.forEach(addonId => {
      const addon = addons.find(a => a.id === addonId)
      if (addon) total += addon.price
    })
    return total
  }

  const formatPrice = (price) => {
    return price.toFixed(2).replace('.', ',')
  }

  useEffect(() => {
    setAnimatePrice(true)
    const timer = setTimeout(() => setAnimatePrice(false), 300)
    return () => clearTimeout(timer)
  }, [selectedAddons])

  // Compact variant for small spaces
  if (variant === 'compact') {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900">Gesamtpreis</span>
          <span className={`text-xl font-bold text-blue-600 transition-all duration-300 ${
            animatePrice ? 'scale-110' : ''
          }`}>
            {formatPrice(calculateTotal())} {currency}
          </span>
        </div>
        {selectedAddons.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            inkl. {selectedAddons.length} Zusatzleistung{selectedAddons.length > 1 ? 'en' : ''}
          </div>
        )}
      </div>
    )
  }

  // Detailed variant with full breakdown
  if (variant === 'detailed') {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            💳 Preisübersicht
            <Info className="h-4 w-4 ml-2 text-gray-500" />
          </h3>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Base Price */}
          <div className="flex justify-between items-center pb-2">
            <span className="text-gray-700">{basePriceLabel}</span>
            <span className="font-medium">{formatPrice(basePrice)} {currency}</span>
          </div>

          {/* Addons */}
          {addons.map(addon => {
            const isSelected = selectedAddons.includes(addon.id)
            return (
              <div key={addon.id} className={`border rounded-lg p-4 transition-all duration-200 ${
                isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onAddonToggle(addon.id)}
                    className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{addon.name}</h4>
                      <span className={`font-medium ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>
                        +{formatPrice(addon.price)} {currency}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{addon.description}</p>
                    
                    {showFeatures && addon.features && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {addon.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <Check className="h-3 w-3 text-green-600 mr-2 flex-shrink-0" />
                            <span className={isSelected ? 'text-blue-700' : 'text-gray-600'}>
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span className="text-gray-900">Gesamtpreis</span>
              <span className={`text-blue-600 transition-all duration-300 ${
                animatePrice ? 'scale-110' : ''
              }`}>
                {formatPrice(calculateTotal())} {currency}
              </span>
            </div>
            {selectedAddons.length > 0 && (
              <div className="text-sm text-gray-600 mt-1">
                Grundpreis + {selectedAddons.length} Zusatzleistung{selectedAddons.length > 1 ? 'en' : ''}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">💳 Preisübersicht</h3>
      
      <div className="space-y-3">
        {/* Base Price */}
        <div className="flex justify-between items-center">
          <span className="text-gray-700">{basePriceLabel}</span>
          <span className="font-medium">{formatPrice(basePrice)} {currency}</span>
        </div>

        {/* Selected Addons */}
        {addons.filter(addon => selectedAddons.includes(addon.id)).map(addon => (
          <div key={addon.id} className="flex justify-between items-center text-blue-700">
            <span className="flex items-center">
              <Plus className="h-4 w-4 mr-1" />
              {addon.name}
            </span>
            <span className="font-medium">+{formatPrice(addon.price)} {currency}</span>
          </div>
        ))}

        {/* Total */}
        <div className="border-t pt-3 flex justify-between items-center text-lg font-bold">
          <span className="text-gray-900">Gesamtpreis</span>
          <span className={`text-blue-600 transition-all duration-300 ${
            animatePrice ? 'scale-110' : ''
          }`}>
            {formatPrice(calculateTotal())} {currency}
          </span>
        </div>
      </div>
    </div>
  )
}

export default PriceDisplay
