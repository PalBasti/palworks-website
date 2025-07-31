import { useState, useEffect } from 'react'
import { HelpCircle, FileText, Check, Plus } from 'lucide-react'
// NEUE IMPORTS für die modularen Bausteine
import EmailCollection from './modules/EmailCollection'
import PriceDisplay from './modules/PriceDisplay'
import { subscribeToNewsletter, getContractAddons } from '../lib/api/contracts'

// Tooltip Komponente (unverändert)
const Tooltip = ({ children, text }) => (
  <div className="group relative inline-block">
    {children}
    <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg z-10 w-64 text-center">
      {text}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
)

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
    equipment_list: '',
    
    // Zusatzprodukt - WIRD JETZT DYNAMISCH
    include_protocol: false
  })

  const [errors, setErrors] = useState({})
  
  // NEUE STATE-Variablen für modulare Funktionen
  const [addons, setAddons] = useState([])
  const [selectedAddons, setSelectedAddons] = useState([])
  const [customerEmail, setCustomerEmail] = useState('')

  // Addons beim Laden der Komponente aus Supabase holen
  useEffect(() => {
    const loadAddons = async () => {
      try {
        const addonData = await getContractAddons('untermietvertrag')
        setAddons(addonData)
      } catch (error) {
        console.error('Fehler beim Laden der Addons:', error)
        // Fallback zu statischen Addons
        setAddons([
          {
            id: 'protocol',
            name: 'Übergabeprotokoll',
            price: 4.90,
            description: 'Professionelles Übergabeprotokoll für die Wohnungsübergabe',
            features: [
              'Vollständige Zustandsdokumentation',
              'Automatische Datenübernahme',
              'Schlüsselübergabe-Dokumentation',
              'Zählerstände & Ausstattung'
            ]
          }
        ])
      }
    }
    loadAddons()
  }, [])

  // Sync zwischen altem include_protocol und neuem selectedAddons System
  useEffect(() => {
    if (formData.include_protocol && !selectedAddons.includes('protocol')) {
      setSelectedAddons(['protocol'])
    } else if (!formData.include_protocol && selectedAddons.includes('protocol')) {
      setSelectedAddons([])
    }
  }, [formData.include_protocol])

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

  // NEUE Funktion für Addon-Verwaltung
  const handleAddonToggle = (addonId) => {
    setSelectedAddons(prev => {
      const newSelection = prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
      
      // Sync mit dem alten include_protocol für Rückwärtskompatibilität
      if (addonId === 'protocol') {
        setFormData(prevData => ({
          ...prevData,
          include_protocol: newSelection.includes('protocol')
        }))
      }
      
      return newSelection
    })
  }

  // NEUE Funktion für Newsletter-Anmeldung
  const handleEmailSubmit = async (email) => {
    try {
      await subscribeToNewsletter(email, 'contract_form', 'untermietvertrag')
      setCustomerEmail(email)
      return Promise.resolve()
    } catch (error) {
      console.error('Newsletter-Anmeldung fehlgeschlagen:', error)
      throw new Error('Newsletter-Anmeldung fehlgeschlagen')
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
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
      // Erweiterte Daten für das neue System
      const extendedData = {
        ...formData,
        selected_addons: selectedAddons,
        customer_email: customerEmail
      }
      onSubmit(extendedData)
    }
  }

  // ANGEPASSTE Preisfunktionen für Rückwärtskompatibilität
  const getBasePrice = () => 12.90
  const getProtocolPrice = () => 4.90
  const getTotalPrice = () => {
    let total = getBasePrice()
    selectedAddons.forEach(addonId => {
      const addon = addons.find(a => a.id === addonId)
      if (addon) total += addon.price
    })
    return total.toFixed(2)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8"> {/* Breiter für Sidebar */}
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Hauptformular */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Untermietvertrag erstellen</h1>
              <p className="text-gray-600">Rechtssicherer Untermietvertrag für ganze Wohnungen</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Newsletter-Anmeldung als optionales Element */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📧 Updates erhalten (optional)
                </h3>
                <EmailCollection
                  title=""
                  description="Erhalten Sie Informationen zu neuen Vertragsvorlagen"
                  onEmailSubmit={handleEmailSubmit}
                  variant="inline"
                  showPrivacyNote={false}
                />
              </div>
              
              {/* Vertragsparteien - UNVERÄNDERT */}
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

              {/* Mietobjekt - UNVERÄNDERT */}
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

              {/* Mietzeit & Miete - UNVERÄNDERT */}
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

              {/* Ausstattung - UNVERÄNDERT */}
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
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Vorschau erstellen ({getTotalPrice()} €)
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* NEUE Sidebar mit modularen Bausteinen */}
        <div className="lg:col-span-1 space-y-6">
          {/* Kompakte Preisanzeige */}
          <PriceDisplay
            basePrice={getBasePrice()}
            basePriceLabel="Untermietvertrag (ganze Wohnung)"
            addons={addons}
            selectedAddons={selectedAddons}
            onAddonToggle={handleAddonToggle}
            variant="detailed"
          />

          {/* Newsletter für bereits registrierte Benutzer */}
          {!customerEmail && (
            <EmailCollection
              title="Updates erhalten"
              description="Neue Vertragsvorlagen & rechtliche Updates"
              onEmailSubmit={handleEmailSubmit}
              variant="compact"
            />
          )}
        </div>
      </div>
    </div>
  )
}
