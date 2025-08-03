// components/UntermietvertragForm.js - KORRIGIERTE VERSION
import { useState, useEffect } from 'react'
import { Check, Mail } from 'lucide-react'

// ✅ ECHTE MODULE IMPORTS
import EmailCollection from './modules/EmailCollection'
import PriceDisplay from './modules/PriceDisplay'

// ✅ API SERVICES
const subscribeToNewsletter = async (email, source, contractType) => {
  try {
    const { subscribeToNewsletter: realService } = await import('../lib/supabase/newsletterService')
    return await realService(email, source, contractType)
  } catch (error) {
    console.log('Newsletter service fallback:', { email, source, contractType })
    return { success: true }
  }
}

const getContractAddons = async (contractType) => {
  try {
    const { getContractAddons: realService } = await import('../lib/api/contracts')
    return await realService(contractType)
  } catch (error) {
    console.log('Addons service fallback for:', contractType)
    // ✅ KORRIGIERT: Saubere Features ohne "Übergabeprotokoll" als Text
    return [
      {
        id: 'protocol',
        addon_key: 'protocol',
        name: 'Übergabeprotokoll',
        price: 4.90,
        description: 'Professionelles Übergabeprotokoll mit automatischer Datenübernahme',
        features: [
          'Vollständige Zustandsdokumentation',
          'Automatische Datenübernahme', 
          'Schlüsselübergabe-Dokumentation',
          'Zählerstände & Ausstattung'
        ]
      }
    ]
  }
}

export default function UntermietvertragForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    landlord_name: '', landlord_address: '', tenant_name: '', tenant_address: '',
    property_address: '', property_postal: '', property_city: '', property_floor: '',
    property_number: '', property_sqm: '', contract_type: 'unlimited', start_date: '',
    end_date: '', rent_amount: '', heating_costs: '', other_costs: '', deposit: '',
    furnished: 'unfurnished', equipment_list: ''
  })

  const [errors, setErrors] = useState({})
  const [addons, setAddons] = useState([])
  const [selectedAddons, setSelectedAddons] = useState([])
  const [customerEmail, setCustomerEmail] = useState('')
  const [newsletterSignup, setNewsletterSignup] = useState(false)

  // ✅ Addons laden mit Debug-Logging
  useEffect(() => {
    const loadAddons = async () => {
      try {
        console.log('🔍 Loading addons for untermietvertrag...')
        const addonData = await getContractAddons('untermietvertrag')
        console.log('🔍 Loaded addons:', addonData)
        console.log('🔍 Features in first addon:', addonData[0]?.features)
        setAddons(addonData)
      } catch (error) {
        console.error('🔍 Error loading addons:', error)
        setAddons([])
      }
    }
    loadAddons()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleAddonToggle = (addonId) => {
    console.log('🔍 Toggling addon:', addonId)
    setSelectedAddons(prev => {
      const newSelection = prev.includes(addonId) 
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
      console.log('🔍 New selected addons:', newSelection)
      return newSelection
    })
  }

  const validateForm = () => {
    const newErrors = {}
    if (!customerEmail) {
      newErrors.customer_email = 'E-Mail-Adresse ist für die Vertragszustellung erforderlich'
    }
    const requiredFields = [
      'landlord_name', 'landlord_address', 'tenant_name', 'tenant_address',
      'property_address', 'property_postal', 'property_city',
      'contract_type', 'start_date', 'rent_amount'
    ]
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = 'Dieses Feld ist erforderlich'
      }
    })
    if (formData.contract_type === 'fixed_term' && !formData.end_date) {
      newErrors.end_date = 'Bei befristetem Vertrag ist das Enddatum erforderlich'
    }
    if (formData.property_postal && !/^\d{5}$/.test(formData.property_postal)) {
      newErrors.property_postal = 'PLZ muss 5 Ziffern haben'
    }
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
        newsletter_signup: newsletterSignup,
        include_protocol: selectedAddons.includes('protocol')
      }
      console.log('🔍 Submitting form data:', extendedData)
      onSubmit(extendedData)
    }
  }

  const getBasePrice = () => 12.90
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
        {/* ✅ HAUPTFORMULAR (3 Spalten) */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Untermietvertrag erstellen
                <span className="ml-3 text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  DIY
                </span>
              </h1>
              <p className="text-gray-600">Rechtssicherer DIY-Untermietvertrag für ganze Wohnungen</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* ✅ E-MAIL-SEKTION */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-blue-600" />
                  📧 E-Mail für Vertragszustellung
                </h3>
                <p className="text-gray-600 mb-4">Ihr fertiger Vertrag wird an diese Adresse gesendet</p>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-Mail-Adresse <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="ihre@email.de"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="newsletter"
                      checked={newsletterSignup}
                      onChange={(e) => setNewsletterSignup(e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="newsletter" className="ml-2 text-sm text-gray-700">
                      Newsletter abonnieren (optional) - Updates zu neuen Vertragsvorlagen
                    </label>
                  </div>
                  
                  {customerEmail && (
                    <div className="flex items-center text-green-600 text-sm">
                      <Check className="h-4 w-4 mr-2" />
                      E-Mail gespeichert: {customerEmail}
                    </div>
                  )}
                </div>
              </div>
              
              {/* ✅ ALLE BESTEHENDEN FORM-SEKTIONEN (gekürzt für Übersicht) */}
              
              {/* Vertragsparteien */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Vertragsparteien</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">Untervermieter</h4>
                    <input
                      type="text"
                      name="landlord_name"
                      value={formData.landlord_name}
                      onChange={handleChange}
                      placeholder="Vollständiger Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                    />
                    <textarea
                      name="landlord_address"
                      value={formData.landlord_address}
                      onChange={handleChange}
                      placeholder="Vollständige Anschrift"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">Untermieter</h4>
                    <input
                      type="text"
                      name="tenant_name"
                      value={formData.tenant_name}
                      onChange={handleChange}
                      placeholder="Vollständiger Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                    />
                    <textarea
                      name="tenant_address"
                      value={formData.tenant_address}
                      onChange={handleChange}
                      placeholder="Vollständige Anschrift"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Mietobjekt */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🏠 Mietobjekt</h3>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <input
                    type="text"
                    name="property_address"
                    value={formData.property_address}
                    onChange={handleChange}
                    placeholder="Straße und Hausnummer"
                    className="md:col-span-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="property_floor"
                    value={formData.property_floor}
                    onChange={handleChange}
                    placeholder="Geschoss"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    name="property_postal"
                    value={formData.property_postal}
                    onChange={handleChange}
                    placeholder="PLZ"
                    maxLength="5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="property_city"
                    value={formData.property_city}
                    onChange={handleChange}
                    placeholder="Ort"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="property_number"
                    value={formData.property_number}
                    onChange={handleChange}
                    placeholder="Whg-Nr."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    name="property_sqm"
                    value={formData.property_sqm}
                    onChange={handleChange}
                    placeholder="m²"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Mietzeit & Miete */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Mietzeit</h3>
                  <div className="space-y-4">
                    <select
                      name="contract_type"
                      value={formData.contract_type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="unlimited">Unbefristet</option>
                      <option value="fixed_term">Befristet</option>
                    </select>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {formData.contract_type === 'fixed_term' && (
                      <input
                        type="date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Miete</h3>
                  <div className="space-y-4">
                    <input
                      type="number"
                      name="rent_amount"
                      value={formData.rent_amount}
                      onChange={handleChange}
                      placeholder="Monatsmiete (€)"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      name="heating_costs"
                      value={formData.heating_costs}
                      onChange={handleChange}
                      placeholder="Heizkosten (€)"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      name="other_costs"
                      value={formData.other_costs}
                      onChange={handleChange}
                      placeholder="Sonstige Kosten (€)"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      name="deposit"
                      value={formData.deposit}
                      onChange={handleChange}
                      placeholder="Kaution (€)"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Ausstattung */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🛋️ Ausstattung</h3>
                <div className="space-y-4">
                  <select
                    name="furnished"
                    value={formData.furnished}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="furnished">Möbliert</option>
                    <option value="partially">Teilmöbliert</option>
                    <option value="unfurnished">Nicht möbliert</option>
                  </select>
                  <textarea
                    name="equipment_list"
                    value={formData.equipment_list}
                    onChange={handleChange}
                    placeholder="Ausstattungsgegenstände (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={!customerEmail}
                  className={`
                    px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200
                    ${!customerEmail 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-[1.02] shadow-lg'
                    }
                  `}
                >
                  {!customerEmail 
                    ? '📧 E-Mail eingeben zum Fortfahren' 
                    : `🔍 Vorschau erstellen (${getTotalPrice()} €)`
                  }
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ✅ SIDEBAR mit korrigierter PriceDisplay */}
        <div className="lg:col-span-1 space-y-6">
          <PriceDisplay
            basePrice={getBasePrice()}
            basePriceLabel="Untermietvertrag (ganze Wohnung)"
            addons={addons}
            selectedAddons={selectedAddons}
            onAddonToggle={handleAddonToggle}
            variant="detailed"
          />

          {/* E-Mail-Status */}
          {customerEmail ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-green-900">E-Mail erfasst</p>
                  <p className="text-sm text-green-700">{customerEmail}</p>
                  {newsletterSignup && (
                    <p className="text-xs text-green-600 mt-1">✅ Newsletter abonniert</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <p className="font-medium text-yellow-900">E-Mail erforderlich</p>
                  <p className="text-sm text-yellow-700">Für Vertragszustellung</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
