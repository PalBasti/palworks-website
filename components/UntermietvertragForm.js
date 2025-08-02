// components/UntermietvertragForm.js - KORRIGIERTE VERSION OHNE DUPLIKATE
import { useState, useEffect } from 'react'
import { Check, Mail } from 'lucide-react'

// ✅ EINFACHE FALLBACK-KOMPONENTEN (falls Module fehlen)
const EmailCollection = ({ title, description, onEmailSubmit, showNewsletterOption }) => {
  const [email, setEmail] = useState('')
  const [newsletter, setNewsletter] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (email && onEmailSubmit) {
      await onEmailSubmit(email, newsletter)
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="flex items-center text-green-600">
        <Check className="h-5 w-5 mr-2" />
        <span>E-Mail gespeichert: {email}</span>
      </div>
    )
  }

  return (
    <div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <div className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ihre@email.de"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        {showNewsletterOption && (
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={newsletter}
              onChange={(e) => setNewsletter(e.target.checked)}
              className="mr-2"
            />
            Newsletter abonnieren (optional)
          </label>
        )}
        <button
          onClick={handleSubmit}
          disabled={!email}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300"
        >
          E-Mail speichern
        </button>
      </div>
    </div>
  )
}

const PriceDisplay = ({ basePrice, basePriceLabel, addons, selectedAddons, onAddonToggle }) => {
  const getTotalPrice = () => {
    let total = basePrice || 0
    if (selectedAddons && addons) {
      selectedAddons.forEach(addonId => {
        const addon = addons.find(a => a.id === addonId || a.addon_key === addonId)
        if (addon) total += addon.price
      })
    }
    return total.toFixed(2)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">💳 Preisübersicht</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">{basePriceLabel || 'Basis-Vertrag'}</span>
          <span className="font-medium">{(basePrice || 0).toFixed(2)} €</span>
        </div>

        {addons && addons.length > 0 && (
          <div className="border-t pt-3">
            <h4 className="font-medium text-gray-900 mb-2">Zusatzleistungen:</h4>
            {addons.map(addon => (
              <div key={addon.id} className="mb-3">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedAddons?.includes(addon.id) || false}
                    onChange={() => onAddonToggle && onAddonToggle(addon.id)}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">{addon.name}</span>
                      <span className="text-blue-600 font-medium">+{addon.price.toFixed(2)} €</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{addon.description}</p>
                  </div>
                </label>
              </div>
            ))}
          </div>
        )}

        <div className="border-t pt-3 flex justify-between items-center text-lg font-bold">
          <span>Gesamtpreis</span>
          <span className="text-blue-600">{getTotalPrice()} €</span>
        </div>
      </div>
    </div>
  )
}

// ✅ EINFACHE API-FALLBACKS
const subscribeToNewsletter = async (email, source, contractType) => {
  console.log('Newsletter signup:', { email, source, contractType })
  return Promise.resolve({ success: true })
}

const getContractAddons = async (contractType) => {
  console.log('Loading addons for:', contractType)
  // Fallback-Addons ohne Duplikate
  return Promise.resolve([
    {
      id: 'explanation',
      addon_key: 'explanation',
      name: 'Vertrags-Erläuterungen',
      price: 9.99,
      description: 'Detaillierte Erklärungen zu allen Vertragsklauseln in verständlicher Sprache'
    },
    {
      id: 'protocol',
      addon_key: 'protocol',
      name: 'Übergabeprotokoll',
      price: 4.90,
      description: 'Professionelles Übergabeprotokoll mit automatischer Datenübernahme'
    }
  ])
}

export default function UntermietvertragForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    // Parteien
    landlord_name: '',
    landlord_address: '',
    tenant_name: '',
    tenant_address: '',
    
    // Objekt
    property_address: '',
    property_postal: '',
    property_city: '',
    property_floor: '',
    property_number: '',
    property_sqm: '',
    
    // Vertrag
    contract_type: 'unlimited',
    start_date: '',
    end_date: '',
    
    // Miete
    rent_amount: '',
    heating_costs: '',
    other_costs: '',
    deposit: '',
    
    // Ausstattung
    furnished: 'unfurnished',
    equipment_list: ''
  })

  const [errors, setErrors] = useState({})
  const [addons, setAddons] = useState([])
  const [selectedAddons, setSelectedAddons] = useState([])
  const [customerEmail, setCustomerEmail] = useState('')
  const [newsletterSignup, setNewsletterSignup] = useState(false)

  // ✅ Addons nur einmal laden
  useEffect(() => {
    const loadAddons = async () => {
      try {
        const addonData = await getContractAddons('untermietvertrag')
        setAddons(addonData)
      } catch (error) {
        console.error('Fehler beim Laden der Addons:', error)
        setAddons([])
      }
    }
    loadAddons()
  }, [])

  const handleChange = (e) => {
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
      if (prev.includes(addonId)) {
        return prev.filter(id => id !== addonId)
      } else {
        return [...prev, addonId]
      }
    })
  }

  const handleEmailSubmit = async (email, wantsNewsletter = false) => {
    try {
      setCustomerEmail(email)
      setNewsletterSignup(wantsNewsletter)
      
      if (wantsNewsletter) {
        await subscribeToNewsletter(email, 'contract_form', 'untermietvertrag')
      }
      
      return Promise.resolve()
    } catch (error) {
      console.error('E-Mail-Verarbeitung fehlgeschlagen:', error)
      throw new Error('E-Mail konnte nicht verarbeitet werden')
    }
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
        newsletter_signup: newsletterSignup
      }
      onSubmit(extendedData)
    }
  }

  const getBasePrice = () => 12.90

  const getTotalPrice = () => {
    let total = getBasePrice()
    selectedAddons.forEach(addonId => {
      const addon = addons.find(a => a.id === addonId || a.addon_key === addonId)
      if (addon) total += addon.price
    })
    return total.toFixed(2)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Hauptformular (3 Spalten) */}
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
              
              {/* E-Mail-Erfassung */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <EmailCollection
                  title="📧 E-Mail für Vertragszustellung"
                  description="Ihr fertiger Vertrag wird an diese Adresse gesendet"
                  onEmailSubmit={handleEmailSubmit}
                  showNewsletterOption={true}
                />
              </div>
              
              {/* Vertragsparteien */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  👥 Vertragsparteien
                  <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">Verpflichtend</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">Untervermieter (Hauptmieter)</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Vollständiger Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="landlord_name"
                          value={formData.landlord_name}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.landlord_name ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Max Mustermann"
                        />
                        {errors.landlord_name && <p className="text-red-500 text-sm mt-1">{errors.landlord_name}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Vollständige Anschrift <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="landlord_address"
                          value={formData.landlord_address}
                          onChange={handleChange}
                          rows={3}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.landlord_address ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Musterstraße 12&#10;12345 Musterstadt"
                        />
                        {errors.landlord_address && <p className="text-red-500 text-sm mt-1">{errors.landlord_address}</p>}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">Untermieter</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Vollständiger Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="tenant_name"
                          value={formData.tenant_name}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.tenant_name ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Lisa Beispiel"
                        />
                        {errors.tenant_name && <p className="text-red-500 text-sm mt-1">{errors.tenant_name}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Vollständige Anschrift <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="tenant_address"
                          value={formData.tenant_address}
                          onChange={handleChange}
                          rows={3}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.tenant_address ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Beispielweg 34&#10;54321 Beispielort"
                        />
                        {errors.tenant_address && <p className="text-red-500 text-sm mt-1">{errors.tenant_address}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mietobjekt */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  🏠 Mietobjekt
                  <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">Verpflichtend</span>
                </h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Straße und Hausnummer <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="property_address"
                        value={formData.property_address}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.property_address ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Wohnstraße 15"
                      />
                      {errors.property_address && <p className="text-red-500 text-sm mt-1">{errors.property_address}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Geschoss
                      </label>
                      <input
                        type="text"
                        name="property_floor"
                        value={formData.property_floor}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="2. OG"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PLZ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="property_postal"
                        value={formData.property_postal}
                        onChange={handleChange}
                        maxLength="5"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.property_postal ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="12345"
                      />
                      {errors.property_postal && <p className="text-red-500 text-sm mt-1">{errors.property_postal}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ort <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="property_city"
                        value={formData.property_city}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.property_city ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Musterort"
                      />
                      {errors.property_city && <p className="text-red-500 text-sm mt-1">{errors.property_city}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Whg-Nr.
                      </label>
                      <input
                        type="text"
                        name="property_number"
                        value={formData.property_number}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="15a"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quadratmeter
                      </label>
                      <input
                        type="number"
                        name="property_sqm"
                        value={formData.property_sqm}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="65"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mietzeit & Miete */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Mietzeit</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vertragsart <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="contract_type"
                        value={formData.contract_type}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="unlimited">Unbefristet</option>
                        <option value="fixed_term">Befristet</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mietbeginn <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.start_date ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
                    </div>
                    
                    {formData.contract_type === 'fixed_term' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mietende <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="end_date"
                          value={formData.end_date}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.end_date ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Miete</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monatsmiete (€) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="rent_amount"
                        value={formData.rent_amount}
                        onChange={handleChange}
                        step="0.01"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.rent_amount ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="650.00"
                      />
                      {errors.rent_amount && <p className="text-red-500 text-sm mt-1">{errors.rent_amount}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Heiz-/Warmwasserkosten (€)
                      </label>
                      <input
                        type="number"
                        name="heating_costs"
                        value={formData.heating_costs}
                        onChange={handleChange}
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="120.00"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sonstige Nebenkosten (€)
                      </label>
                      <input
                        type="number"
                        name="other_costs"
                        value={formData.other_costs}
                        onChange={handleChange}
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="80.00"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kaution (€)
                      </label>
                      <input
                        type="number"
                        name="deposit"
                        value={formData.deposit}
                        onChange={handleChange}
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="1300.00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Ausstattung */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  🛋️ Ausstattung
                  <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">Optional</span>
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Möblierung
                    </label>
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
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ausstattungsgegenstände (falls vorhanden)
                    </label>
                    <textarea
                      name="equipment_list"
                      value={formData.equipment_list}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="z.B. Kühlschrank, Waschmaschine, Bett, Schreibtisch..."
                    />
                  </div>
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
                
                {!customerEmail && (
                  <p className="text-sm text-gray-600 mt-3 flex items-center justify-center">
                    <Mail className="h-4 w-4 mr-2" />
                    E-Mail-Adresse wird für die Vertragszustellung benötigt
                  </p>
                )}
                
                {customerEmail && (
                  <p className="text-sm text-green-600 mt-3 flex items-center justify-center">
                    <Check className="h-4 w-4 mr-2" />
                    Vertrag wird an {customerEmail} gesendet
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar mit Preisanzeige */}
        <div className="lg:col-span-1 space-y-6">
          <PriceDisplay
            basePrice={getBasePrice()}
            basePriceLabel="Untermietvertrag (ganze Wohnung)"
            addons={addons}
            selectedAddons={selectedAddons}
            onAddonToggle={handleAddonToggle}
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

          {/* DIY-Vorteile */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">
              🎯 DIY-Vorteile:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Keine Anwaltskosten (spart 200-500€)</li>
              <li>• Sofort verfügbar</li>
              <li>• Rechtssicher</li>
              <li>• Mehrfach verwendbar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
