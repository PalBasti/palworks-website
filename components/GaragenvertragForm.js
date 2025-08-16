// components/GaragenvertragForm.js - MINIMALE VERSION OHNE SYNTAX-FEHLER
import { useState, useEffect } from 'react'
import { Check, Mail, Info, Car, Building2 } from 'lucide-react'

// ✅ KORRIGIERTER STATIC IMPORT
import { getContractAddons } from '../../lib/api/contracts'

export default function GaragenvertragForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    landlord_name: '',
    landlord_address: '',
    tenant_name: '',
    tenant_address: '',
    garage_type: 'garage',
    garage_number: '',
    garage_address: '',
    garage_postal: '',
    garage_city: '',
    garage_same_address: true,
    garage_lease_type: 'unbefristet',
    start_date: '',
    end_date: '',
    rent: ''
  })

  const [customerEmail, setCustomerEmail] = useState('')
  const [newsletterSignup, setNewsletterSignup] = useState(false)
  const [selectedAddons, setSelectedAddons] = useState([])
  const [addons, setAddons] = useState([])
  const [errors, setErrors] = useState({})
  const [loadingAddons, setLoadingAddons] = useState(true)

  // ✅ ADDONS LADEN
  useEffect(() => {
    const loadAddons = async () => {
      try {
        setLoadingAddons(true)
        console.log('🔍 Loading garage addons...')
        
        const contractAddons = await getContractAddons('garagenvertrag')
        setAddons(contractAddons)
        console.log('✅ Garage addons loaded:', contractAddons.length)
        
      } catch (error) {
        console.error('❌ Failed to load garage addons:', error)
        
        const fallbackAddons = [
          {
            id: 'explanations',
            addon_key: 'explanations',
            name: 'Rechtliche Erläuterungen',
            price: 9.90,
            description: 'Detaillierte Erklärungen zu allen Vertragsklauseln'
          },
          {
            id: 'handover_protocol',
            addon_key: 'handover_protocol',
            name: 'Übergabeprotokoll für Garage',
            price: 7.90,
            description: 'Spezielles Protokoll für Garagenübergabe'
          }
        ]
        
        setAddons(fallbackAddons)
        console.log('✅ Fallback garage addons loaded')
        
      } finally {
        setLoadingAddons(false)
      }
    }
    
    loadAddons()
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleAddonToggle = (addonId) => {
    setSelectedAddons(prev => {
      const newSelection = prev.includes(addonId) 
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
      console.log('🔍 New selected garage addons:', newSelection)
      return newSelection
    })
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!customerEmail.trim()) {
      newErrors.customer_email = 'E-Mail-Adresse ist erforderlich'
    }
    
    const requiredFields = ['landlord_name', 'landlord_address', 'tenant_name', 'tenant_address', 'start_date', 'rent']
    
    if (!formData.garage_same_address) {
      requiredFields.push('garage_address', 'garage_postal', 'garage_city')
    }
    
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = 'Dieses Feld ist erforderlich'
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      const extendedData = {
        ...formData,
        selected_addons: selectedAddons,
        customer_email: customerEmail,
        newsletter_signup: newsletterSignup
      }
      
      console.log('🔍 Submitting garage form:', extendedData)
      onSubmit(extendedData)
    }
  }

  const getBasePrice = () => 7.90
  
  const getTotalPrice = () => {
    let total = getBasePrice()
    selectedAddons.forEach(addonId => {
      const addon = addons.find(a => a.id === addonId || a.addon_key === addonId)
      if (addon) {
        total += addon.price
      }
    })
    return total.toFixed(2)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        
        {/* HAUPTFORMULAR */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                {formData.garage_type === 'garage' ? (
                  <Car className="h-12 w-12 text-blue-600" />
                ) : (
                  <Building2 className="h-12 w-12 text-blue-600" />
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {formData.garage_type === 'garage' ? 
                  '🚗 Garagenmietvertrag erstellen' : 
                  '🅿️ Stellplatzmietvertrag erstellen'
                }
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* E-MAIL */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Mail className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">E-Mail für Vertragszustellung</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-Mail-Adresse *
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ihre.email@beispiel.de"
                      required
                    />
                    {errors.customer_email && (
                      <p className="text-red-500 text-sm mt-1">{errors.customer_email}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center pt-6">
                    <input
                      type="checkbox"
                      id="newsletter"
                      checked={newsletterSignup}
                      onChange={(e) => setNewsletterSignup(e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                    <label htmlFor="newsletter" className="ml-2 text-sm text-gray-700">
                      Newsletter erhalten (optional)
                    </label>
                  </div>
                </div>
              </div>

              {/* GARAGE TYP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Art des Mietobjekts
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, garage_type: 'garage' }))}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      formData.garage_type === 'garage' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Car className="h-8 w-8 mx-auto mb-2" />
                    <div className="font-medium">Garage</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, garage_type: 'stellplatz' }))}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      formData.garage_type === 'stellplatz' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Building2 className="h-8 w-8 mx-auto mb-2" />
                    <div className="font-medium">Stellplatz</div>
                  </button>
                </div>
              </div>

              {/* VERTRAGSPARTEIEN */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vertragsparteien</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Vermieter */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">👤 Vermieter</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        name="landlord_name"
                        value={formData.landlord_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Max Mustermann"
                      />
                      {errors.landlord_name && (
                        <p className="text-red-500 text-sm mt-1">{errors.landlord_name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
                      <textarea
                        name="landlord_address"
                        value={formData.landlord_address}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Musterstraße 1, 12345 Musterstadt"
                      />
                      {errors.landlord_address && (
                        <p className="text-red-500 text-sm mt-1">{errors.landlord_address}</p>
                      )}
                    </div>
                  </div>

                  {/* Mieter */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">👥 Mieter</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        name="tenant_name"
                        value={formData.tenant_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Anna Musterfrau"
                      />
                      {errors.tenant_name && (
                        <p className="text-red-500 text-sm mt-1">{errors.tenant_name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
                      <textarea
                        name="tenant_address"
                        value={formData.tenant_address}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Beispielweg 2, 54321 Beispielort"
                      />
                      {errors.tenant_address && (
                        <p className="text-red-500 text-sm mt-1">{errors.tenant_address}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* VERTRAGSDATEN */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vertragsdaten</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monatliche Miete (€) *
                    </label>
                    <input
                      type="number"
                      name="rent"
                      value={formData.rent}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="50.00"
                    />
                    {errors.rent && (
                      <p className="text-red-500 text-sm mt-1">{errors.rent}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mietbeginn *
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.start_date && (
                      <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Vertrag erstellen für {getTotalPrice()}€
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Zusätzliche Services
            </h3>

            {loadingAddons ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600 text-sm">Lade verfügbare Services...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {addons.map((addon) => (
                  <div
                    key={addon.id || addon.addon_key}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedAddons.includes(addon.id || addon.addon_key)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleAddonToggle(addon.id || addon.addon_key)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            checked={selectedAddons.includes(addon.id || addon.addon_key)}
                            onChange={() => handleAddonToggle(addon.id || addon.addon_key)}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 mr-2"
                          />
                          <h4 className="font-medium text-gray-900 text-sm">
                            {addon.name}
                          </h4>
                        </div>
                        <p className="text-gray-600 text-sm">
                          {addon.description}
                        </p>
                      </div>
                      <div className="ml-3 text-right">
                        <span className="text-lg font-bold text-blue-600">
                          +{addon.price.toFixed(2)}€
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PREISÜBERSICHT */}
            <div className="border-t pt-4 mt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {formData.garage_type === 'garage' ? 'Garagenmietvertrag' : 'Stellplatzmietvertrag'}
                  </span>
                  <span className="font-medium">{getBasePrice().toFixed(2)}€</span>
                </div>

                {selectedAddons.length > 0 && (
                  selectedAddons.map(addonId => {
                    const addon = addons.find(a => a.id === addonId || a.addon_key === addonId)
                    if (!addon) return null
                    return (
                      <div key={addonId} className="flex justify-between text-sm">
                        <span className="text-gray-600">{addon.name}</span>
                        <span className="font-medium">+{addon.price.toFixed(2)}€</span>
                      </div>
                    )
                  })
                )}

                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Gesamtsumme</span>
                    <span className="text-2xl font-bold text-blue-600">{getTotalPrice()}€</span>
                  </div>
                </div>
              </div>
            </div>

            {/* INFO BOX */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-green-800 font-medium mb-1">
                    ✅ Rechtssicher & sofort nutzbar
                  </p>
                  <ul className="text-green-700 space-y-1">
                    <li>• Vom Anwalt erstellt</li>
                    <li>• Sofortiger PDF-Download</li>
                    <li>• E-Mail-Zustellung inklusive</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
