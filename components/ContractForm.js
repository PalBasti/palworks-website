import { useState } from 'react'
import { HelpCircle } from 'lucide-react'

export default function ContractForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    // Mietobjekt
    garage_type: '',
    garage_lease_type: 'unbefristet',
    
    // Vermieter
    landlord_firstname: '',
    landlord_lastname: '',
    landlord_address: '',
    landlord_postal: '',
    landlord_city: '',
    
    // Mieter
    tenant_firstname: '',
    tenant_lastname: '',
    tenant_address: '',
    tenant_postal: '',
    tenant_city: '',
    
    // Objekt
    garage_number: '',
    garage_address: '',
    garage_postal: '',
    garage_city: '',
    garage_keys: '1',
    garage_same_address: false,
    
    // Mietzeit
    lease_start: '',
    lease_end: '',
    
    // Finanzen
    rent: '',
    utilities: '',
    deposit: '',
    has_utilities: false,
    has_deposit: false,
    
    // Bankdaten
    iban: '',
    bank: ''
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
    
    // Required fields
    const requiredFields = [
      'garage_type', 'landlord_firstname', 'landlord_lastname', 
      'landlord_address', 'landlord_postal', 'landlord_city',
      'tenant_firstname', 'tenant_lastname', 'tenant_address', 
      'tenant_postal', 'tenant_city', 'lease_start', 'rent', 'iban', 'bank'
    ]
    
    // Add garage address fields if not same as landlord
    if (!formData.garage_same_address) {
      requiredFields.push('garage_address', 'garage_postal', 'garage_city')
    }
    
    // Add lease end if fixed term
    if (formData.garage_lease_type === 'befristet') {
      requiredFields.push('lease_end')
    }
    
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        newErrors[field] = 'Dieses Feld ist erforderlich'
      }
    })
    
    // Validate postal codes (5 digits)
    if (formData.landlord_postal && !/^\d{5}$/.test(formData.landlord_postal)) {
      newErrors.landlord_postal = 'PLZ muss 5 Ziffern haben'
    }
    if (formData.tenant_postal && !/^\d{5}$/.test(formData.tenant_postal)) {
      newErrors.tenant_postal = 'PLZ muss 5 Ziffern haben'
    }
    if (!formData.garage_same_address && formData.garage_postal && !/^\d{5}$/.test(formData.garage_postal)) {
      newErrors.garage_postal = 'PLZ muss 5 Ziffern haben'
    }
    
    // Validate rent (positive number)
    if (formData.rent && (isNaN(formData.rent) || parseFloat(formData.rent) <= 0)) {
      newErrors.rent = 'Miete muss eine positive Zahl sein'
    }
    
    // Validate IBAN (basic check)
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
        iban: '', bank: ''
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

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Left Column */}
        <div className="space-y-8">
          
          {/* Mietobjekt */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              🏗️ Art des Mietobjekts
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mietvertrag-Typ <span className="text-red-500">*</span>
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

          {/* Vermieter */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              👤 Vermieter
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.landlord_city ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.landlord_city && <p className="text-red-500 text-sm mt-1">{errors.landlord_city}</p>}
              </div>
            </div>
          </div>

          {/* Mietobjekt Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {getObjectTitle()}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nummer/Bezeichnung
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Anzahl Schlüssel/Toröffner
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
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          
          {/* Mieter */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              👥 Mieter
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vorname <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="tenant_firstname"
                  value={formData.tenant_firstname}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.tenant_firstname ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.tenant_firstname && <p className="text-red-500 text-sm mt-1">{errors.tenant_firstname}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nachname <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="tenant_lastname"
                  value={formData.tenant_lastname}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.tenant_lastname ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.tenant_lastname && <p className="text-red-500 text-sm mt-1">{errors.tenant_lastname}</p>}
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Straße und Hausnummer <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="tenant_address"
                value={formData.tenant_address}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.tenant_address ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.tenant_address && <p className="text-red-500 text-sm mt-1">{errors.tenant_address}</p>}
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PLZ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="tenant_postal"
                  value={formData.tenant_postal}
                  onChange={handleChange}
                  pattern="[0-9]{5}"
                  maxLength="5"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.tenant_postal ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.tenant_postal && <p className="text-red-500 text-sm mt-1">{errors.tenant_postal}</p>}
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ort <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="tenant_city"
                  value={formData.tenant_city}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.tenant_city ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.tenant_city && <p className="text-red-500 text-sm mt-1">{errors.tenant_city}</p>}
              </div>
            </div>
          </div>

          {/* Mietzeit */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              📅 Mietzeit
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mietbeginn <span className="text-red-500">*</span>
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
                    Mietende <span className="text-red-500">*</span>
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

          {/* Finanzen */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              💰 Miete & Finanzen
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grundmiete (€) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="rent"
                  value={formData.rent}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
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
                  <HelpCircle className="h-4 w-4 ml-1 text-gray-400" title="z.B. Strom für Beleuchtung, Reinigung, Wartung" />
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
                  <HelpCircle className="h-4 w-4 ml-1 text-gray-400" title="Meist 1-3 Monatsmieten üblich" />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Bankdaten */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              🏦 Bankdaten des Vermieters
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IBAN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="iban"
                  value={formData.iban}
                  onChange={handleChange}
                  placeholder="DE89 3704 0044 0532 0130 00"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.iban ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.iban && <p className="text-red-500 text-sm mt-1">{errors.iban}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank-Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="bank"
                  value={formData.bank}
                  onChange={handleChange}
                  placeholder="Sparkasse München"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.bank ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.bank && <p className="text-red-500 text-sm mt-1">{errors.bank}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 mt-8 pt-6 border-t">
        <button
          type="button"
          onClick={resetForm}
          className="px-8 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
        >
          Zurücksetzen
        </button>
        <button
          type="submit"
          className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          Vorschau erstellen
        </button>
      </div>
    </form>
  )
}
