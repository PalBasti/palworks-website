import { useState } from 'react'
import { HelpCircle } from 'lucide-react'

// Tooltip Komponente AUSSERHALB definiert
const Tooltip = ({ children, text }) => (
  <div className="group relative inline-block">
    {children}
    <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg z-10 w-64 text-center">
      {text}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
)

export default function ContractForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    // Mietobjekt (VERPFLICHTEND)
    garage_type: '',
    garage_lease_type: 'unbefristet',
    
    // Vermieter (VERPFLICHTEND)
    landlord_firstname: '',
    landlord_lastname: '',
    landlord_address: '',
    landlord_postal: '',
    landlord_city: '',
    
    // Mietobjekt Details (VERPFLICHTEND)
    garage_number: '',
    garage_address: '',
    garage_postal: '',
    garage_city: '',
    garage_keys: '1',
    garage_same_address: false,
    
    // Mieter (OPTIONAL)
    tenant_firstname: '',
    tenant_lastname: '',
    tenant_address: '',
    tenant_postal: '',
    tenant_city: '',
    
    // Mietzeit (OPTIONAL)
    lease_start: '',
    lease_end: '',
    
    // Finanzen (OPTIONAL)
    rent: '',
    utilities: '',
    deposit: '',
    has_utilities: false,
    has_deposit: false,
    
    // Bankdaten (OPTIONAL mit Beispielen)
    iban: '',
    bank: '',
    
    // NEUE OPTION: Rechtliche Erläuterungen
    include_explanations: false
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    
    // Auto-copy landlord address if same_address is checked
    if (name === 'garage_same_address' && checked) {
      setFormData(prev => ({
        ...prev,
        garage_address: prev.landlord_address,
        garage_postal: prev.landlord_postal,
        garage_city: prev.landlord_city
      }))
    }
    
    // Auto-calculate deposit (2x monthly rent)
    if (name === 'rent' && formData.has_deposit) {
      const rentValue = parseFloat(value) || 0
      if (rentValue > 0) {
        setFormData(prev => ({
          ...prev,
          deposit: (rentValue * 2).toFixed(2)
        }))
      }
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    // FIXED: Dynamische Validierung basierend auf aktueller Formular-Konfiguration
    const requiredFields = [
      // Immer verpflichtend: Art des Mietobjekts
      'garage_type',
      // Immer verpflichtend: Vermieter
      'landlord_firstname', 'landlord_lastname', 
      'landlord_address', 'landlord_postal', 'landlord_city'
    ]
    
    // Garage-Adresse nur verpflichtend wenn NICHT gleiche Adresse wie Vermieter
    if (!formData.garage_same_address) {
      requiredFields.push('garage_address', 'garage_postal', 'garage_city')
    }
    
    // Mietende nur verpflichtend wenn befristet UND Datum gesetzt
    if (formData.garage_lease_type === 'befristet' && formData.lease_start) {
      requiredFields.push('lease_end')
    }
    
    // Validierung der verpflichtenden Felder
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        newErrors[field] = 'Dieses Feld ist erforderlich'
      }
    })
    
    // Validierung PLZ (5 Ziffern) - nur wenn ausgefüllt
    if (formData.landlord_postal && !/^\d{5}$/.test(formData.landlord_postal)) {
      newErrors.landlord_postal = 'PLZ muss 5 Ziffern haben'
    }
    if (formData.tenant_postal && formData.tenant_postal && !/^\d{5}$/.test(formData.tenant_postal)) {
      newErrors.tenant_postal = 'PLZ muss 5 Ziffern haben'
    }
    if (!formData.garage_same_address && formData.garage_postal && !/^\d{5}$/.test(formData.garage_postal)) {
      newErrors.garage_postal = 'PLZ muss 5 Ziffern haben'
    }
    
    // Validierung Miete (positive Zahl) - nur wenn ausgefüllt
    if (formData.rent && (isNaN(formData.rent) || parseFloat(formData.rent) <= 0)) {
      newErrors.rent = 'Miete muss eine positive Zahl sein'
    }
    
    // Validierung IBAN (basic check) - nur wenn ausgefüllt
    if (formData.iban && formData.iban.length < 15) {
      newErrors.iban = 'IBAN scheint zu kurz zu sein'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    } else {
      // Scroll to first error
      const firstErrorField = document.querySelector('.border-red-500')
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }

  const resetForm = () => {
    if (confirm('Möchten Sie wirklich alle Eingaben zurücksetzen?')) {
      setFormData({
        garage_type: '', garage_lease_type: 'unbefristet',
        landlord_firstname: '', landlord_lastname: '', landlord_address: '', landlord_postal: '', landlord_city: '',
        tenant_firstname: '', tenant_lastname: '', tenant_address: '', tenant_postal: '', tenant_city: '',
        garage_number: '', garage_address: '', garage_postal: '', garage_city: '', garage_keys: '1', garage_same_address: false,
        lease_start: '', lease_end: '', rent: '', utilities: '', deposit: '', has_utilities: false, has_deposit: false,
        iban: '', bank: '', include_explanations: false
      })
      setErrors({})
    }
  }

  const getObjectTitle = () => {
    switch (formData.garage_type) {
      case 'garage': return '🚗 Garage'
      case 'stellplatz': return '🅿️ Stellplatz'
      default: return '🚗 Mietobjekt'
    }
  }

  const getSameAddressLabel = () => {
    switch (formData.garage_type) {
      case 'garage': return 'Garage an gleicher Adresse wie Vermieter'
      case 'stellplatz': return 'Stellplatz an gleicher Adresse wie Vermieter'
      default: return 'Mietobjekt an gleicher Adresse wie Vermieter'
    }
  }

  // Preisberechnung für Testzeitraum
  const getPrice = () => {
    const basePrice = 7.90
    const explanationsPrice = 4.90
    return formData.include_explanations ? basePrice + explanationsPrice : basePrice
  }

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Left Column */}
        <div className="space-y-8">
          
          {/* Mietobjekt - VERPFLICHTEND */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              🏗️ Art des Mietobjekts
              <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">Verpflichtend</span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mietobjekt <span className="text-red-500">*</span>
                </label>
                <select
                  name="garage_type"
                  value={formData.garage_type}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.garage_type ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Bitte wählen...</option>
                  <option value="garage">Garage</option>
                  <option value="stellplatz">Stellplatz</option>
                </select>
                {errors.garage_type && <p className="text-red-500 text-sm mt-1">{errors.garage_type}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Mietvertrag-Typ
                  <Tooltip text="Unbefristet = läuft bis zur Kündigung. Befristet = endet automatisch am vereinbarten Datum.">
                    <HelpCircle className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                  </Tooltip>
                </label>
                <select
                  name="garage_lease_type"
                  value={formData.garage_lease_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="unbefristet">Unbefristet</option>
                  <option value="befristet">Befristet</option>
                </select>
              </div>
            </div>
          </div>

          {/* Vermieter - VERPFLICHTEND */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              👤 Vermieter
              <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">Verpflichtend</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vorname <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="landlord_firstname"
                  value={formData.landlord_firstname}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.landlord_firstname ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.landlord_firstname && <p className="text-red-500 text-sm mt-1">{errors.landlord_firstname}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nachname <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="landlord_lastname"
                  value={formData.landlord_lastname}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.landlord_lastname ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.landlord_lastname && <p className="text-red-500 text-sm mt-1">{errors.landlord_lastname}</p>}
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Straße und Hausnummer <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="landlord_address"
                value={formData.landlord_address}
                onChange={handleChange}
                placeholder="z.B. Musterstraße 12"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.landlord_address ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.landlord_address && <p className="text-red-500 text-sm mt-1">{errors.landlord_address}</p>}
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PLZ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="landlord_postal"
                  value={formData.landlord_postal}
                  onChange={handleChange}
                  pattern="[0-9]{5}"
                  maxLength="5"
                  placeholder="12345"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.landlord_postal ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.landlord_postal && <p className="text-red-500 text-sm mt-1">{errors.landlord_postal}</p>}
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ort <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="landlord_city"
                  value={formData.landlord_city}
                  onChange={handleChange}
                  placeholder="z.B. München"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.landlord_city ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.landlord_city && <p className="text-red-500 text-sm mt-1">{errors.landlord_city}</p>}
              </div>
            </div>
          </div>

          {/* Mietobjekt Details - VERPFLICHTEND */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {getObjectTitle()}
              <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">Verpflichtend</span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Nummer/Bezeichnung
                  <Tooltip text="Eindeutige Bezeichnung des Stellplatzes oder der Garage, z.B. 'Nr. 15' oder 'Stellplatz A'">
                    <HelpCircle className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                  </Tooltip>
                </label>
                <input
                  type="text"
                  name="garage_number"
                  value={formData.garage_number}
                  onChange={handleChange}
                  placeholder="z.B. Nr. 15, Stellplatz A"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="garage_same_address"
                  checked={formData.garage_same_address}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  {getSameAddressLabel()}
                </label>
              </div>
              
              {!formData.garage_same_address && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Straße und Hausnummer <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="garage_address"
                      value={formData.garage_address}
                      onChange={handleChange}
                      placeholder="z.B. Garagenstraße 5"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.garage_address ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.garage_address && <p className="text-red-500 text-sm mt-1">{errors.garage_address}</p>}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PLZ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="garage_postal"
                        value={formData.garage_postal}
                        onChange={handleChange}
                        pattern="[0-9]{5}"
                        maxLength="5"
                        placeholder="12345"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.garage_postal ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.garage_postal && <p className="text-red-500 text-sm mt-1">{errors.garage_postal}</p>}
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ort <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="garage_city"
                        value={formData.garage_city}
                        onChange={handleChange}
                        placeholder="z.B. München"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.garage_city ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.garage_city && <p className="text-red-500 text-sm mt-1">{errors.garage_city}</p>}
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Anzahl Schlüssel/Toröffner
                  <Tooltip text="Anzahl der Schlüssel oder Toröffner, die dem Mieter übergeben werden">
                    <HelpCircle className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                  </Tooltip>
                </label>
                <input
                  type="number"
                  name="garage_keys"
                  value={formData.garage_keys}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* NEU: Zusatzprodukte */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              📋 Zusatzprodukte
              <span className="ml-2 text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Optional</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="include_explanations"
                  checked={formData.include_explanations}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                <div className="ml-3">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    Rechtliche Erläuterungen und Hinweise hinzufügen 
                    <span className="line-through text-gray-500 ml-1">(+4,90 €)</span>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded ml-2">KOSTENLOS im Testzeitraum</span>
                    <Tooltip text="Umfassende Erläuterungen zur rechtlichen Einordnung, Mieterhöhungen, E-Mobilität, Kautionsregelung und Umsatzsteuer">
                      <HelpCircle className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                    </Tooltip>
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    Detaillierte Erklärungen zu: Rechtlicher Einordnung • Mieterhöhungsverfahren • 
                    E-Fahrzeuge & Ladeinfrastruktur • Kautionsregelung • Umsatzsteuerliche Behandlung
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          
          {/* Mieter - OPTIONAL */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              👥 Mieter
              <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">Optional</span>
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              💡 <strong>Tipp:</strong> Felder können leer gelassen werden - im PDF erscheinen dann Blanks zum handschriftlichen Ausfüllen.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vorname
                </label>
                <input
                  type="text"
                  name="tenant_firstname"
                  value={formData.tenant_firstname}
                  onChange={handleChange}
                  placeholder="z.B. Max"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.tenant_firstname ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.tenant_firstname && <p className="text-red-500 text-sm mt-1">{errors.tenant_firstname}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nachname
                </label>
                <input
                  type="text"
                  name="tenant_lastname"
                  value={formData.tenant_lastname}
                  onChange={handleChange}
                  placeholder="z.B. Mustermann"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.tenant_lastname ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.tenant_lastname && <p className="text-red-500 text-sm mt-1">{errors.tenant_lastname}</p>}
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Straße und Hausnummer
              </label>
              <input
                type="text"
                name="tenant_address"
                value={formData.tenant_address}
                onChange={handleChange}
                placeholder="z.B. Beispielstraße 42"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.tenant_address ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.tenant_address && <p className="text-red-500 text-sm mt-1">{errors.tenant_address}</p>}
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PLZ
                </label>
                <input
                  type="text"
                  name="tenant_postal"
                  value={formData.tenant_postal}
                  onChange={handleChange}
                  pattern="[0-9]{5}"
                  maxLength="5"
                  placeholder="54321"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.tenant_postal ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.tenant_postal && <p className="text-red-500 text-sm mt-1">{errors.tenant_postal}</p>}
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ort
                </label>
                <input
                  type="text"
                  name="tenant_city"
                  value={formData.tenant_city}
                  onChange={handleChange}
                  placeholder="z.B. Berlin"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.tenant_city ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.tenant_city && <p className="text-red-500 text-sm mt-1">{errors.tenant_city}</p>}
              </div>
            </div>
          </div>

          {/* Mietzeit - OPTIONAL */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              📅 Mietzeit
              <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">Optional</span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mietbeginn
                </label>
                <input
                  type="date"
                  name="lease_start"
                  value={formData.lease_start}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.lease_start ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.lease_start && <p className="text-red-500 text-sm mt-1">{errors.lease_start}</p>}
              </div>
              
              {formData.garage_lease_type === 'befristet' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mietende
                  </label>
                  <input
                    type="date"
                    name="lease_end"
                    value={formData.lease_end}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.lease_end ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.lease_end && <p className="text-red-500 text-sm mt-1">{errors.lease_end}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Finanzen - OPTIONAL */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              💰 Miete & Finanzen
              <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">Optional</span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Grundmiete (€)
                  <Tooltip text="Die monatliche Grundmiete ohne Nebenkosten">
                    <HelpCircle className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                  </Tooltip>
                </label>
                <input
                  type="number"
                  name="rent"
                  value={formData.rent}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="z.B. 50.00"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.rent ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.rent && <p className="text-red-500 text-sm mt-1">{errors.rent}</p>}
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="has_utilities"
                  checked={formData.has_utilities}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700 flex items-center">
                  Betriebskosten getrennt ausweisen
                  <Tooltip text="z.B. Strom für Beleuchtung, Reinigung, Wartung der Garage">
                    <HelpCircle className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                  </Tooltip>
                </label>
              </div>
              
              {formData.has_utilities && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Betriebskosten-Vorauszahlung (€)
                  </label>
                  <input
                    type="number"
                    name="utilities"
                    value={formData.utilities}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="z.B. 15.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="has_deposit"
                  checked={formData.has_deposit}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700 flex items-center">
                  Kaution vereinbaren
                  <Tooltip text="Sicherheitsleistung, meist 1-3 Monatsmieten. Bei Garagen/Stellplätzen keine gesetzliche Begrenzung.">
                    <HelpCircle className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                  </Tooltip>
                </label>
              </div>
              
              {formData.has_deposit && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kautionsbetrag (€)
                  </label>
                  <input
                    type="number"
                    name="deposit"
                    value={formData.deposit}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="z.B. 100.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Bankdaten - OPTIONAL mit Beispielen */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              🏦 Bankdaten des Vermieters
              <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">Optional</span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  IBAN
                  <Tooltip text="Internationale Bankkontonummer für Mietzahlungen. Format: DE + 2 Prüfziffern + 8 Bankleitzahl + 10 Kontonummer">
                    <HelpCircle className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                  </Tooltip>
                </label>
                <input
                  type="text"
                  name="iban"
                  value={formData.iban}
                  onChange={handleChange}
                  placeholder="Beispiel: DE12 1234 5678 9012 3456 78"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 ${
                    errors.iban ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.iban && <p className="text-red-500 text-sm mt-1">{errors.iban}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank-Name
                </label>
                <input
                  type="text"
                  name="bank"
                  value={formData.bank}
                  onChange={handleChange}
                  placeholder="Beispiel: Muster Bank"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 ${
                    errors.bank ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.bank && <p className="text-red-500 text-sm mt-1">{errors.bank}</p>}
              </div>
            </div>
          </div>

          {/* NEU: Preisübersicht für Testzeitraum */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              🎉 Testzeitraum - Kostenlos!
              <span className="ml-2 text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded-full">Aktuelle Aktion</span>
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span>Garage/Stellplatz Mietvertrag:</span>
                <span className="line-through text-gray-500">7,90 €</span>
              </div>
              {formData.include_explanations && (
                <div className="flex justify-between items-center text-sm">
                  <span>Rechtliche Erläuterungen:</span>
                  <span className="line-through text-gray-500">4,90 €</span>
                </div>
              )}
              <hr className="border-orange-200" />
              <div className="flex justify-between items-center font-semibold text-lg">
                <span>Gesamtpreis (Testzeitraum):</span>
                <span className="text-green-600">0,00 € (KOSTENLOS)</span>
              </div>
              <p className="text-xs text-gray-600">
                * Regulärer Preis nach Testzeitraum: {getPrice().toFixed(2)} €
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 mt-8 pt-6 border-t">
        <button
          type="button"
          onClick={resetForm}
          className="px-8 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
        >
          Zurücksetzen
        </button>
        <button
          type="submit"
          className="px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium transition-colors flex items-center"
        >
          <span className="mr-2">🎉</span>
          Kostenlos erstellen & herunterladen
        </button>
      </div>
    </form>
  )
}
