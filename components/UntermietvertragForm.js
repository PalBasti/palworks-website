// components/UntermietvertragForm.js - ERWEITERTE VERSION
import { useState } from 'react'
import { Check, AlertCircle, User, Home, Euro, Mail, Building } from 'lucide-react'

export default function UntermietvertragForm({ onSubmit, isSubmitting = false, initialData = {} }) {
  const [formData, setFormData] = useState({
    // ✅ NEU: Rechnungsempfänger (VERPFLICHTEND)
    billing_name: '',
    billing_address: '',
    billing_postal: '',
    billing_city: '',
    billing_email: '',
    newsletter_signup: false,
    
    // ✅ GEÄNDERT: Vertragsparteien (OPTIONAL - können leer bleiben)
    landlord_name: '',
    landlord_address: '',
    tenant_name: '',
    tenant_address: '',
    
    // ✅ UNVERÄNDERT: Mietobjekt (VERPFLICHTEND)
    property_address: '',
    property_postal: '',
    property_city: '',
    property_rooms: '',
    property_size: '',
    
    // ✅ UNVERÄNDERT: Mietdetails (VERPFLICHTEND)  
    rent_amount: '',
    utilities_included: false,
    deposit_amount: '',
    contract_type: 'unlimited',
    start_date: '',
    end_date: '',
    
    // Weitere Details
    special_agreements: '',
    pets_allowed: false,
    smoking_allowed: false,
    
    ...initialData
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
  }

  // ✅ AKTUALISIERTE Validierung
  const validateForm = () => {
    const newErrors = {}
    
    // ✅ NEU: Rechnungsempfänger VERPFLICHTEND
    const requiredBillingFields = [
      'billing_name', 'billing_address', 'billing_postal', 
      'billing_city', 'billing_email'
    ]
    
    requiredBillingFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        const fieldNames = {
          'billing_name': 'Name des Rechnungsempfängers',
          'billing_address': 'Rechnungsadresse',
          'billing_postal': 'PLZ der Rechnungsadresse',
          'billing_city': 'Ort der Rechnungsadresse',
          'billing_email': 'E-Mail-Adresse für Rechnung und Vertragszustellung'
        }
        newErrors[field] = `${fieldNames[field]} ist erforderlich`
      }
    })
    
    // E-Mail Validierung
    if (formData.billing_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.billing_email)) {
      newErrors.billing_email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
    }
    
    // ✅ UNVERÄNDERT: Mietobjekt VERPFLICHTEND
    const requiredPropertyFields = [
      'property_address', 'property_postal', 'property_city', 'rent_amount'
    ]
    
    requiredPropertyFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        const fieldNames = {
          'property_address': 'Adresse des Mietobjekts',
          'property_postal': 'PLZ des Mietobjekts',
          'property_city': 'Ort des Mietobjekts', 
          'rent_amount': 'Mietbetrag'
        }
        newErrors[field] = `${fieldNames[field]} ist erforderlich`
      }
    })
    
    // PLZ Validierung
    if (formData.property_postal && !/^\d{5}$/.test(formData.property_postal)) {
      newErrors.property_postal = 'PLZ muss 5 Ziffern haben'
    }
    if (formData.billing_postal && !/^\d{5}$/.test(formData.billing_postal)) {
      newErrors.billing_postal = 'PLZ muss 5 Ziffern haben'
    }
    
    // Mietbetrag Validierung
    if (formData.rent_amount && (isNaN(formData.rent_amount) || parseFloat(formData.rent_amount) <= 0)) {
      newErrors.rent_amount = 'Mietbetrag muss eine gültige Zahl größer 0 sein'
    }
    
    // Befristeter Vertrag braucht Enddatum
    if (formData.contract_type === 'fixed_term' && !formData.end_date) {
      newErrors.end_date = 'Bei befristetem Vertrag ist das Enddatum erforderlich'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  // Helper-Funktion für gleiche Adresse
  const copyBillingToLandlord = () => {
    setFormData(prev => ({
      ...prev,
      landlord_name: prev.billing_name,
      landlord_address: `${prev.billing_address}, ${prev.billing_postal} ${prev.billing_city}`
    }))
  }

  const copyBillingToTenant = () => {
    setFormData(prev => ({
      ...prev,
      tenant_name: prev.billing_name,
      tenant_address: `${prev.billing_address}, ${prev.billing_postal} ${prev.billing_city}`
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      
      {/* ✅ NEU: Rechnungsempfänger (VERPFLICHTEND) */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Mail className="h-5 w-5 text-blue-600 mr-2" />
          Rechnungsempfänger & Vertragszustellung
          <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">Verpflichtend</span>
        </h3>
        <p className="text-sm text-blue-700 mb-4">
          An diese Adresse wird die Rechnung gestellt und der fertige Vertrag per E-Mail gesendet.
        </p>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vollständiger Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="billing_name"
              value={formData.billing_name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.billing_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Max Mustermann"
            />
            {errors.billing_name && <p className="text-red-500 text-sm mt-1">{errors.billing_name}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-Mail-Adresse <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="billing_email"
              value={formData.billing_email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.billing_email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="max@example.com"
            />
            {errors.billing_email && <p className="text-red-500 text-sm mt-1">{errors.billing_email}</p>}
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rechnungsadresse <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="billing_address"
            value={formData.billing_address}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.billing_address ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Musterstraße 123"
          />
          {errors.billing_address && <p className="text-red-500 text-sm mt-1">{errors.billing_address}</p>}
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PLZ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="billing_postal"
              value={formData.billing_postal}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.billing_postal ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="12345"
              maxLength="5"
            />
            {errors.billing_postal && <p className="text-red-500 text-sm mt-1">{errors.billing_postal}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ort <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="billing_city"
              value={formData.billing_city}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.billing_city ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="München"
            />
            {errors.billing_city && <p className="text-red-500 text-sm mt-1">{errors.billing_city}</p>}
          </div>
        </div>
        
        {/* Newsletter Checkbox */}
        <div className="mt-4 flex items-center">
          <input
            type="checkbox"
            id="newsletter"
            name="newsletter_signup"
            checked={formData.newsletter_signup}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="newsletter" className="ml-2 text-sm text-gray-700">
            Newsletter abonnieren (optional) - Rechtliche Updates und neue Vertragsvorlagen
          </label>
        </div>
      </div>

      {/* ✅ GEÄNDERT: Vertragsparteien (OPTIONAL) */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User className="h-5 w-5 text-gray-600 mr-2" />
          Vertragsparteien
          <span className="ml-2 text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-full">Optional</span>
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Diese Felder können leer gelassen werden und später handschriftlich oder digital ergänzt werden.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Hauptmieter (Untervermieter)</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vollständiger Name
                </label>
                <input
                  type="text"
                  name="landlord_name"
                  value={formData.landlord_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Leer lassen für spätere Eingabe"
                />
                <button
                  type="button"
                  onClick={copyBillingToLandlord}
                  className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                >
                  ↑ Daten vom Rechnungsempfänger übernehmen
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vollständige Anschrift
                </label>
                <textarea
                  name="landlord_address"
                  value={formData.landlord_address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Leer lassen für spätere Eingabe"
                />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Untermieter</h4>
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
                  placeholder="Leer lassen für spätere Eingabe"
                />
                <button
                  type="button"
                  onClick={copyBillingToTenant}
                  className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                >
                  ↑ Daten vom Rechnungsempfänger übernehmen
                </button>
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
                  placeholder="Leer lassen für spätere Eingabe"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ UNVERÄNDERT: Mietobjekt (VERPFLICHTEND) */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Home className="h-5 w-5 text-green-600 mr-2" />
          Mietobjekt
          <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">Verpflichtend</span>
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vollständige Adresse <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="property_address"
              value={formData.property_address}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.property_address ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Musterstraße 123"
            />
            {errors.property_address && <p className="text-red-500 text-sm mt-1">{errors.property_address}</p>}
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PLZ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="property_postal"
                value={formData.property_postal}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.property_postal ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="12345"
                maxLength="5"
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.property_city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="München"
              />
              {errors.property_city && <p className="text-red-500 text-sm mt-1">{errors.property_city}</p>}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Anzahl Zimmer
              </label>
              <input
                type="text"
                name="property_rooms"
                value={formData.property_rooms}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="z.B. 3"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wohnfläche (m²)
              </label>
              <input
                type="text"
                name="property_size"
                value={formData.property_size}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="z.B. 75"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ✅ UNVERÄNDERT: Mietdetails (VERPFLICHTEND) */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Euro className="h-5 w-5 text-purple-600 mr-2" />
          Mietkonditionen
          <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">Verpflichtend</span>
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monatliche Miete (€) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              name="rent_amount"
              value={formData.rent_amount}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.rent_amount ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="850.00"
            />
            {errors.rent_amount && <p className="text-red-500 text-sm mt-1">{errors.rent_amount}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kaution (€)
            </label>
            <input
              type="number"
              step="0.01"
              name="deposit_amount"
              value={formData.deposit_amount}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="1700.00"
            />
          </div>
        </div>
        
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="utilities"
            name="utilities_included"
            checked={formData.utilities_included}
            onChange={handleChange}
            className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <label htmlFor="utilities" className="ml-2 text-sm text-gray-700">
            Nebenkosten in der Miete enthalten
          </label>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vertragstyp <span className="text-red-500">*</span>
            </label>
            <select
              name="contract_type"
              value={formData.contract_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
        
        {formData.contract_type === 'fixed_term' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mietende <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.end_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
          </div>
        )}
      </div>

      {/* Zusätzliche Vereinbarungen */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Building className="h-5 w-5 text-yellow-600 mr-2" />
          Zusätzliche Vereinbarungen
          <span className="ml-2 text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-full">Optional</span>
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Besondere Vereinbarungen
            </label>
            <textarea
              name="special_agreements"
              value={formData.special_agreements}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="z.B. Haustierhaltung, Nutzung von Garten, etc."
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="pets"
                name="pets_allowed"
                checked={formData.pets_allowed}
                onChange={handleChange}
                className="h-4 w-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
              />
              <label htmlFor="pets" className="ml-2 text-sm text-gray-700">
                Haustierhaltung erlaubt
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="smoking"
                name="smoking_allowed"
                checked={formData.smoking_allowed}
                onChange={handleChange}
                className="h-4 w-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
              />
              <label htmlFor="smoking" className="ml-2 text-sm text-gray-700">
                Rauchen erlaubt
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Hinweis zu leeren Feldern */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-amber-900 mb-2">💡 Hinweis zu optionalen Feldern</h4>
            <p className="text-sm text-amber-800">
              Felder, die Sie nicht ausfüllen, erscheinen im PDF als Blanks zum späteren handschriftlichen 
              oder digitalen Ausfüllen. Dies ist völlig normal und rechtlich unbedenklich.
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg flex items-center"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Wird verarbeitet...
            </>
          ) : (
            <>
              <Check className="h-5 w-5 mr-2" />
              Weiter zur Vorschau
            </>
          )}
        </button>
      </div>

      {/* Validation Summary */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-red-900 mb-2">Bitte korrigieren Sie folgende Fehler:</h4>
              <ul className="text-sm text-red-800 space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
