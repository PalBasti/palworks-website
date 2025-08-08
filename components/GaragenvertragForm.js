// components/GaragenvertragForm.js - ÜBERARBEITET MIT E-MAIL + ADDONS
import { useState, useEffect } from 'react'
import { Check, Mail, Info, FileText, CreditCard } from 'lucide-react'

// ✅ MODULARE KOMPONENTEN IMPORTIEREN
import EmailCollection from './modules/EmailCollection'
import PriceDisplay from './modules/PriceDisplay'
import PaymentModule from './modules/PaymentModule'

// ✅ API SERVICES mit Fallbacks
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
    const data = await realService(contractType)
    
    // ✅ DUPLIKAT-FILTER
    const uniqueAddons = data.filter((addon, index, array) => {
      return array.findIndex(a => a.name === addon.name) === index
    })
    
    console.log('🔍 Garage addons loaded:', uniqueAddons.length)
    return uniqueAddons
    
  } catch (error) {
    console.log('Addons service fallback for garage contract')
    // ✅ GARAGE-SPEZIFISCHE FALLBACK-ADDONS
    return [
      {
        id: 'explanations',
        addon_key: 'explanations',
        name: 'Rechtliche Erläuterungen',
        price: 9.90,
        description: 'Detaillierte Erklärungen zu allen Vertragsklauseln',
        features: [
          'Verständliche Rechtstexte',
          'Praktische Beispiele',
          'Vermieter- und Mieterrechte',
          'Kündigung und Fristen'
        ]
      },
      {
        id: 'handover_protocol',
        addon_key: 'handover_protocol', 
        name: 'Übergabeprotokoll für Garage',
        price: 7.90,
        description: 'Spezielles Protokoll für Garagenübergabe',
        features: [
          'Zustandsdokumentation',
          'Schlüsselübergabe',
          'Ausstattung erfassen',
          'Mängel dokumentieren'
        ]
      }
    ]
  }
}

export default function GaragenvertragForm({ onSubmit }) {
  // ✅ BEWÄHRTE STATE-STRUKTUR beibehalten
  const [formData, setFormData] = useState({
    // Parteien
    landlord_name: '',
    landlord_address: '',
    tenant_name: '',
    tenant_address: '',
    
    // Garage-spezifische Felder
    garage_type: 'garage', // 'garage' oder 'stellplatz'
    garage_number: '',
    garage_address: '',
    garage_postal: '',
    garage_city: '',
    garage_same_address: true,
    
    // Vertragsdaten
    garage_lease_type: 'unbefristet', // 'unbefristet' oder 'befristet'
    start_date: '',
    end_date: '',
    rent: '',
    has_utilities: false,
    utilities: '',
    has_deposit: false,
    deposit: '',
    garage_keys: '1',
    iban: '',
    bank: ''
  })

  // ✅ NEUE E-MAIL & ADDON-STATES
  const [customerEmail, setCustomerEmail] = useState('')
  const [newsletterSignup, setNewsletterSignup] = useState(false)
  const [selectedAddons, setSelectedAddons] = useState([])
  const [addons, setAddons] = useState([])
  const [errors, setErrors] = useState({})

  // ✅ ADDONS LADEN beim Mount
  useEffect(() => {
    const loadAddons = async () => {
      try {
        const contractAddons = await getContractAddons('garagenvertrag')
        setAddons(contractAddons)
        console.log('🔍 Garage addons loaded:', contractAddons)
      } catch (error) {
        console.error('Failed to load garage addons:', error)
      }
    }
    loadAddons()
  }, [])

  // ✅ FORM HANDLERS
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
    console.log('🔍 Toggling garage addon:', addonId)
    setSelectedAddons(prev => {
      const newSelection = prev.includes(addonId) 
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
      console.log('🔍 New selected garage addons:', newSelection)
      return newSelection
    })
  }

  // ✅ VALIDIERUNG
  const validateForm = () => {
    const newErrors = {}
    
    // E-Mail ist Pflicht für neue Version
    if (!customerEmail) {
      newErrors.customer_email = 'E-Mail-Adresse ist für die Vertragszustellung erforderlich'
    }
    
    const requiredFields = [
      'landlord_name', 'landlord_address', 'tenant_name', 'tenant_address',
      'start_date', 'rent'
    ]
    
    // Garage-Adresse nur prüfen wenn nicht gleiche Adresse
    if (!formData.garage_same_address) {
      requiredFields.push('garage_address', 'garage_postal', 'garage_city')
    }
    
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = 'Dieses Feld ist erforderlich'
      }
    })
    
    if (formData.garage_lease_type === 'befristet' && !formData.end_date) {
      newErrors.end_date = 'Bei befristetem Vertrag ist das Enddatum erforderlich'
    }
    
    if (formData.garage_postal && !/^\d{5}$/.test(formData.garage_postal)) {
      newErrors.garage_postal = 'PLZ muss 5 Ziffern haben'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ✅ SUBMIT HANDLER mit erweiterten Daten
  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      const extendedData = {
        ...formData,
        selected_addons: selectedAddons,
        customer_email: customerEmail,
        newsletter_signup: newsletterSignup,
        // Rückwärtskompatibilität
        include_explanations: selectedAddons.includes('explanations'),
        include_protocol: selectedAddons.includes('handover_protocol')
      }
      console.log('🔍 Submitting garage form with data:', extendedData)
      onSubmit(extendedData)
    }
  }

  // ✅ PREISFUNKTIONEN
  const getBasePrice = () => 7.90 // Garage-Basispreis
  
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
                {formData.garage_type === 'garage' ? 'Garagenmietvertrag' : 'Stellplatzmietvertrag'} erstellen
                <span className="ml-3 text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  DIY
                </span>
              </h1>
              <p className="text-gray-600">
                Rechtssicherer DIY-{formData.garage_type === 'garage' ? 'Garagen' : 'Stellplatz'}mietvertrag
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* ✅ E-MAIL-SEKTION */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <Mail className="h-5 w-5 text-blue-600 mr-2" />
                  Kontaktdaten für Vertragszustellung
                  <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">Verpflichtend</span>
                </h3>
                
                <EmailCollection
                  email={customerEmail}
                  onEmailChange={setCustomerEmail}
                  newsletterSignup={newsletterSignup}
                  onNewsletterChange={setNewsletterSignup}
                  error={errors.customer_email}
                />
              </div>

              {/* ✅ OBJEKTART-AUSWAHL */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Art des Mietobjekts</h3>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="garage_type"
                      value="garage"
                      checked={formData.garage_type === 'garage'}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">🚗 Garage</div>
                      <div className="text-sm text-gray-600">Geschlossener Stellplatz</div>
                    </div>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="garage_type"
                      value="stellplatz"
                      checked={formData.garage_type === 'stellplatz'}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">🅿️ Stellplatz</div>
                      <div className="text-sm text-gray-600">Offener Parkplatz</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* ✅ PARTEIEN */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Vermieter */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">👤 Vermieter</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="landlord_name"
                        value={formData.landlord_name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 ${errors.landlord_name ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Max Mustermann"
                      />
                      {errors.landlord_name && <p className="text-red-500 text-sm mt-1">{errors.landlord_name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adresse <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="landlord_address"
                        value={formData.landlord_address}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 ${errors.landlord_address ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Musterstraße 1, 12345 Berlin"
                      />
                      {errors.landlord_address && <p className="text-red-500 text-sm mt-1">{errors.landlord_address}</p>}
                    </div>
                  </div>
                </div>

                {/* Mieter */}
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">👥 Mieter</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="tenant_name"
                        value={formData.tenant_name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 ${errors.tenant_name ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Anna Beispiel"
                      />
                      {errors.tenant_name && <p className="text-red-500 text-sm mt-1">{errors.tenant_name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adresse <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="tenant_address"
                        value={formData.tenant_address}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 ${errors.tenant_address ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Beispielweg 2, 54321 München"
                      />
                      {errors.tenant_address && <p className="text-red-500 text-sm mt-1">{errors.tenant_address}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* ✅ MIETOBJEKT */}
              <div className="bg-yellow-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  🚗 {formData.garage_type === 'garage' ? 'Garage' : 'Stellplatz'}
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.garage_type === 'garage' ? 'Garagen' : 'Stellplatz'}-Nummer
                    </label>
                    <input
                      type="text"
                      name="garage_number"
                      value={formData.garage_number}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="z.B. 15, A3, oder leer lassen"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Anzahl Schlüssel/Codes
                    </label>
                    <input
                      type="number"
                      name="garage_keys"
                      value={formData.garage_keys}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="garage_same_address"
                      checked={formData.garage_same_address}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700">
                      {formData.garage_type === 'garage' ? 'Garage' : 'Stellplatz'} befindet sich an gleicher Adresse wie Vermieter
                    </span>
                  </label>
                </div>

                {!formData.garage_same_address && (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adresse <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="garage_address"
                        value={formData.garage_address}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 ${errors.garage_address ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Garagenstraße 10"
                      />
                      {errors.garage_address && <p className="text-red-500 text-sm mt-1">{errors.garage_address}</p>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          PLZ <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="garage_postal"
                          value={formData.garage_postal}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 ${errors.garage_postal ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="12345"
                        />
                        {errors.garage_postal && <p className="text-red-500 text-sm mt-1">{errors.garage_postal}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stadt <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="garage_city"
                          value={formData.garage_city}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 ${errors.garage_city ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="Berlin"
                        />
                        {errors.garage_city && <p className="text-red-500 text-sm mt-1">{errors.garage_city}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ✅ VERTRAGSDATEN */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">📋 Vertragsdaten</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vertragslaufzeit</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="garage_lease_type"
                          value="unbefristet"
                          checked={formData.garage_lease_type === 'unbefristet'}
                          onChange={handleInputChange}
                          className="mr-3"
                        />
                        Unbefristet
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="garage_lease_type"
                          value="befristet"
                          checked={formData.garage_lease_type === 'befristet'}
                          onChange={handleInputChange}
                          className="mr-3"
                        />
                        Befristet
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mietbeginn <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 ${errors.start_date ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
                    </div>

                    {formData.garage_lease_type === 'befristet' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mietende <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="end_date"
                          value={formData.end_date}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 ${errors.end_date ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ✅ FINANZIELLE DATEN */}
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">💰 Miete und Kosten</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monatliche Miete (EUR) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="rent"
                      value={formData.rent}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 ${errors.rent ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="50.00"
                    />
                    {errors.rent && <p className="text-red-500 text-sm mt-1">{errors.rent}</p>}
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="has_utilities"
                        checked={formData.has_utilities}
                        onChange={handleInputChange}
                        className="mr-3"
                      />
                      <span className="text-sm text-gray-700">Betriebskosten separat</span>
                    </label>

                    {formData.has_utilities && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Betriebskosten (EUR/Monat)
                        </label>
                        <input
                          type="number"
                          name="utilities"
                          value={formData.utilities}
                          onChange={handleInputChange}
                          step="0.01"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="15.00"
                        />
                      </div>
                    )}

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="has_deposit"
                        checked={formData.has_deposit}
                        onChange={handleInputChange}
                        className="mr-3"
                      />
                      <span className="text-sm text-gray-700">Kaution erforderlich</span>
                    </label>

                    {formData.has_deposit && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Kaution (EUR)
                        </label>
                        <input
                          type="number"
                          name="deposit"
                          value={formData.deposit}
                          onChange={handleInputChange}
                          step="0.01"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="150.00"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Bankdaten */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Bankverbindung für Mietzahlungen</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
                      <input
                        type="text"
                        name="iban"
                        value={formData.iban}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="DE89 3704 0044 0532 0130 00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bank</label>
                      <input
                        type="text"
                        name="bank"
                        value={formData.bank}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="Sparkasse Berlin"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ✅ SUBMIT BUTTON */}
              <div className="flex justify-center pt-6">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors flex items-center"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Vertrag erstellen und zur Zahlung
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ✅ SIDEBAR (1 Spalte) - Preisanzeige */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">💰 Preis-Übersicht</h3>
            
            {/* Basispreis */}
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
              <span className="text-gray-700">
                {formData.garage_type === 'garage' ? 'Garagenmietvertrag' : 'Stellplatzmietvertrag'}
              </span>
              <span className="font-medium">{getBasePrice().toFixed(2)}€</span>
            </div>

            {/* ✅ ADDONS-SEKTION */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">📋 Zusätzliche Services</h4>
              
              {addons.length > 0 ? (
                <div className="space-y-3">
                  {addons.map((addon) => (
                    <div key={addon.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedAddons.includes(addon.id) || selectedAddons.includes(addon.addon_key)}
                            onChange={() => handleAddonToggle(addon.id)}
                            className="mr-3 h-4 w-4 text-blue-600 rounded"
                          />
                          <div>
                            <div className="font-medium text-sm text-gray-900">{addon.name}</div>
                            <div className="text-xs text-gray-600">{addon.description}</div>
                          </div>
                        </label>
                        <span className="text-sm font-medium text-blue-600">+{addon.price.toFixed(2)}€</span>
                      </div>
                      
                      {(selectedAddons.includes(addon.id) || selectedAddons.includes(addon.addon_key)) && addon.features && (
                        <div className="mt-2 pl-7">
                          <div className="text-xs text-gray-600">
                            {addon.features.slice(0, 2).map((feature, index) => (
                              <div key={index} className="flex items-center">
                                <Check className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                                {feature}
                              </div>
                            ))}
                            {addon.features.length > 2 && (
                              <div className="text-xs text-gray-500 italic">
                                +{addon.features.length - 2} weitere Features
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">Addons werden geladen...</div>
              )}
            </div>

            {/* Gesamtpreis */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Zwischensumme:</span>
                <span className="font-medium">{getTotalPrice()}€</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold text-blue-600">
                <span>Gesamtpreis:</span>
                <span>{getTotalPrice()}€</span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                inkl. 19% MwSt., sofortiger PDF-Download + E-Mail-Versand
              </div>
            </div>

            {/* Service-Features */}
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h4 className="text-sm font-medium text-green-800 mb-2">✅ Inklusive Services</h4>
              <div className="text-xs text-green-700 space-y-1">
                <div className="flex items-center">
                  <Check className="h-3 w-3 mr-1" />
                  Sofortiger PDF-Download
                </div>
                <div className="flex items-center">
                  <Check className="h-3 w-3 mr-1" />
                  Automatischer E-Mail-Versand
                </div>
                <div className="flex items-center">
                  <Check className="h-3 w-3 mr-1" />
                  Rechtssichere Klauseln
                </div>
                <div className="flex items-center">
                  <Check className="h-3 w-3 mr-1" />
                  Professionelle Gestaltung
                </div>
              </div>
            </div>

            {/* Hinweis */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <Info className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-700">
                  <div className="font-medium mb-1">💡 Hinweis</div>
                  Nach der Zahlung erhalten Sie Ihren {formData.garage_type === 'garage' ? 'Garagen' : 'Stellplatz'}mietvertrag 
                  sofort als PDF zum Download und per E-Mail zugesendet.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
