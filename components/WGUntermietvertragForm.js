import { useState } from 'react'
import { FileText, HelpCircle, Check, Plus } from 'lucide-react'

// Tooltip Komponente
const Tooltip = ({ children, text }) => (
  <div className="group relative inline-block">
    {children}
    <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg z-10 w-64 text-center">
      {text}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
)

// Formular Komponente
function WGUntermietvertragForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    // Parteien
    landlord_name: '',
    landlord_address: '',
    tenant_name: '',
    tenant_address: '',
    
    // Wohnung (gesamt)
    property_address: '',
    property_postal: '',
    property_city: '',
    property_floor: '',
    property_number: '',
    property_sqm: '',
    
    // Zimmer des Untermieters
    exclusive_room: '',
    
    // Gemeinschaftsräume
    shared_living: false,
    shared_kitchen: true,
    shared_bathroom: true,
    shared_hallway: true,
    shared_balcony: false,
    shared_cellar: false,
    shared_attic: false,
    shared_garden: false,
    
    // Gemeinschaftseinrichtungen
    shared_washroom: false,
    shared_dryroom: false,
    shared_other: '',
    
    // Vertrag
    contract_type: 'unlimited',
    start_date: '',
    end_date: '',
    
    // Miete
    rent_amount: '',
    telecom_costs: '',
    
    // Ausstattung
    equipment_list: '',
    
    // Reinigung
    cleaning_plan: '',
    
    // Zusatzprodukt
    include_protocol: false
  })

  const [errors, setErrors] = useState({})

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

  const validateForm = () => {
    const newErrors = {}
    
    // Verpflichtende Felder
    const requiredFields = [
      'landlord_name', 'landlord_address',
      'property_address', 'property_postal', 'property_city',
      'exclusive_room', 'contract_type', 'start_date', 'rent_amount'
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
    
    if (formData.rent_amount && (isNaN(formData.rent_amount) || parseFloat(formData.rent_amount) <= 0)) {
      newErrors.rent_amount = 'Miete muss eine positive Zahl sein'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    } else {
      const firstErrorField = document.querySelector('.border-red-500')
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }

  const getBasePrice = () => 9.90
  const getProtocolPrice = () => 3.90
  const getTotalPrice = () => {
    let total = getBasePrice()
    if (formData.include_protocol) {
      total += getProtocolPrice()
    }
    return total.toFixed(2)
  }

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="space-y-8">
        
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
              <h4 className="font-medium text-gray-800 mb-3">
                Untermieter
                <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">Optional</span>
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                💡 <strong>Tipp:</strong> Kann leer gelassen werden - im PDF erscheinen dann Blanks zum handschriftlichen Ausfüllen.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vollständiger Name
                  </label>
                  <input
                    type="text"
                    name="tenant_name"
                    value={formData.tenant_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Lisa Beispiel"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vollständige Anschrift
                  </label>
                  <textarea
                    name="tenant_address"
                    value={formData.tenant_address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Beispielweg 34&#10;54321 Beispielort"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wohnung */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            🏠 Wohnung (gesamt)
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
                  placeholder="WG-Straße 15"
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
                  placeholder="85"
                />
              </div>
            </div>


          </div>
        </div>

        {/* Zimmer des Untermieters */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            🚪 Zimmer des Untermieters
            <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">Verpflichtend</span>
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bezeichnung des Zimmers <span className="text-red-500">*</span>
              <Tooltip text="z.B. 'Zimmer 1', 'Südliches Zimmer', 'Zimmer links vom Eingang'">
                <HelpCircle className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
              </Tooltip>
            </label>
            <input
              type="text"
              name="exclusive_room"
              value={formData.exclusive_room}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.exclusive_room ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="z.B. Zimmer 1, Südliches Zimmer"
            />
            {errors.exclusive_room && <p className="text-red-500 text-sm mt-1">{errors.exclusive_room}</p>}
          </div>
        </div>

        {/* Gemeinschaftsräume */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🤝 Gemeinschaftsnutzung</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Gemeinschaftlich nutzbare Räume:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="shared_living"
                    checked={formData.shared_living}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Wohnzimmer</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="shared_kitchen"
                    checked={formData.shared_kitchen}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Küche</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="shared_bathroom"
                    checked={formData.shared_bathroom}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Bad mit Toilette</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="shared_hallway"
                    checked={formData.shared_hallway}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Flur/Diele</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="shared_balcony"
                    checked={formData.shared_balcony}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Balkon/Terrasse</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="shared_cellar"
                    checked={formData.shared_cellar}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Keller(anteil)</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="shared_attic"
                    checked={formData.shared_attic}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Dachboden</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="shared_garden"
                    checked={formData.shared_garden}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Gartenanteil</label>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-3">Gemeinschaftseinrichtungen:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="shared_washroom"
                    checked={formData.shared_washroom}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Waschraum</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="shared_dryroom"
                    checked={formData.shared_dryroom}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Trockenraum/-boden</label>
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sonstige Einrichtungen
                </label>
                <input
                  type="text"
                  name="shared_other"
                  value={formData.shared_other}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. Fahrradkeller, Gartenschuppen"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Vertragsdauer */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Vertragsdauer</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vertragsart</label>
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
            
            <div className="grid md:grid-cols-2 gap-4">
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
        </div>

        {/* Miete */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Miete</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monatsmiete inkl. Betriebskosten (€) <span className="text-red-500">*</span>
                <Tooltip text="All-inclusive Miete inkl. Heizung, Warmwasser, sonstige Betriebskosten und Strom">
                  <HelpCircle className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                </Tooltip>
              </label>
              <input
                type="number"
                name="rent_amount"
                value={formData.rent_amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.rent_amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="450.00"
              />
              {errors.rent_amount && <p className="text-red-500 text-sm mt-1">{errors.rent_amount}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telekommunikationskosten
              </label>
              <textarea
                name="telecom_costs"
                value={formData.telecom_costs}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. Internet anteilig 15€/Monat"
              />
            </div>
          </div>
        </div>

        {/* Ausstattung & Reinigung */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              🛋️ Ausstattung
              <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">Optional</span>
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ausstattungsgegenstände
              </label>
              <textarea
                name="equipment_list"
                value={formData.equipment_list}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. Bett, Schreibtisch, Schrank, Kühlschrank in der Küche..."
              />
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              🧹 Reinigungsplan
              <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">Optional</span>
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reinigungsvereinbarung
              </label>
              <textarea
                name="cleaning_plan"
                value={formData.cleaning_plan}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. Küche und Bad wöchentlich im Wechsel, Flur monatlich..."
              />
            </div>
          </div>
        </div>

        {/* Zusatzprodukt: Übergabeprotokoll */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-300 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              <input
                type="checkbox"
                name="include_protocol"
                checked={formData.include_protocol}
                onChange={handleChange}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex-grow">
              <div className="flex items-center mb-2">
                <FileText className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="text-lg font-semibold text-blue-900">
                  Übergabeprotokoll hinzufügen
                </h4>
                <span className="ml-auto bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  +{getProtocolPrice().toFixed(2)} €
                </span>
              </div>
              <p className="text-blue-800 mb-3">
                Spezielles Übergabeprotokoll für WG-Zimmer. Alle Daten werden automatisch 
                aus dem Vertrag übernommen - Sie müssen nur noch den Zustand bei der Übergabe dokumentieren.
              </p>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-blue-700">Zimmer-spezifische Dokumentation</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-blue-700">Automatische Datenübernahme</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-blue-700">Gemeinschaftsräume erfasst</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-blue-700">Schlüsselübergabe & Ausstattung</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preisübersicht */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💳 Preisübersicht</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">WG-Untermietvertrag (einzelnes Zimmer)</span>
              <span className="font-medium">{getBasePrice().toFixed(2)} €</span>
            </div>
            {formData.include_protocol && (
              <div className="flex justify-between items-center text-blue-700">
                <span className="flex items-center">
                  <Plus className="h-4 w-4 mr-1" />
                  Übergabeprotokoll
                </span>
                <span className="font-medium">{getProtocolPrice().toFixed(2)} €</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between items-center text-lg font-bold">
              <span>Gesamtpreis</span>
              <span className="text-blue-600">{getTotalPrice()} €</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Vorschau erstellen
          </button>
        </div>
      </div>
    </form>
  )
}

export default WGUntermietvertragForm
