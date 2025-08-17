// components/GaragenvertragForm.js - VOLLSTÄNDIGE KORRIGIERTE VERSION
import { useState, useEffect } from 'react'
import { Check, Mail, Info, FileText, CreditCard, ArrowLeft } from 'lucide-react'

// ✅ MODULARE KOMPONENTEN IMPORTIEREN
import EmailCollection from './modules/EmailCollection'
import PriceDisplay from './modules/PriceDisplay'
import PaymentModule from './modules/PaymentModule'

// ✅ API SERVICES mit Fallbacks - ORIGINAL PATH BEIBEHALTEN
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
    // ✅ ORIGINAL PATH BEIBEHALTEN - das war nicht das Problem!
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
    // ✅ GARAGE-SPEZIFISCHE FALLBACK-ADDONS - NUR ENCODING KORRIGIERT
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
    garage_same_address: false,
    garage_size: '',
    garage_keys: '1',
    garage_lease_type: 'unbefristet',
    
    // Vertragsdaten
    start_date: '',
    end_date: '',
    rent: '',
    deposit_amount: '',
    additional_costs: '',
    payment_method: 'bank_transfer',
    bank_details: '',
    access_times: '',
    
    // Erweiterte Felder
    special_agreements: ''
  })

  // ✅ WEITERE STATE-VARIABLEN
  const [errors, setErrors] = useState({})
  const [selectedAddons, setSelectedAddons] = useState([])
  const [addons, setAddons] = useState([])
  const [customerEmail, setCustomerEmail] = useState('')
  const [newsletterSignup, setNewsletterSignup] = useState(false)

  // ✅ ADDONS LADEN beim Component Mount
  useEffect(() => {
    const loadAddons = async () => {
      try {
        const addonData = await getContractAddons('garagenvertrag')
        setAddons(addonData)
      } catch (error) {
        console.warn('Fehler beim Laden der Addons:', error)
      }
    }
    
    loadAddons()
  }, [])

  // ✅ FORMULAR-HANDLER
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
            <div className="text-center mb-8 relative">
              {/* 🔙 ZURÜCK-BUTTON (links oben) */}
              <div className="absolute left-0 top-0">
                <button
                  type="button"
                  onClick={() => window.location.href = '/'}
                  className="flex items-center text-gray-600 hover:text-gray-800 transition-colors group"
                >
                  <ArrowLeft className="h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" />
                  <span className="text-sm font-medium">Zur Hauptseite</span>
                </button>
              </div>

              {/* Header-Inhalt (zentriert) */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {formData.garage_type === 'garage' ? 
                  '🚗 Garagenmietvertrag erstellen' : 
                  '🅿️ Stellplatzmietvertrag erstellen'
                }
                <span className="ml-3 text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  DIY
                </span>
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Erstellen Sie rechtssicher Ihren {formData.garage_type === 'garage' ? 'Garagen' : 'Stellplatz'}mietvertrag. 
                Alle wichtigen Klauseln sind bereits enthalten - Sie müssen nur noch Ihre Daten eingeben.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* ✅ 1. E-MAIL-SEKTION - ZUERST */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <Mail className="h-5 w-5 text-blue-600 mr-2" />
                  📧 Rechnungsempfänger & Vertragszustellung
                </h3>
                <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">Erforderlich</span>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail-Adresse für Rechnung und Vertragszustellung <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="bastian.aurich@gmail.com"
                    />
                    {errors.customer_email && <p className="text-red-500 text-sm mt-1">{errors.customer_email}</p>}
                  </div>
                </div>
              </div>

              {/* ✅ GARAGE-TYP AUSWAHL */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">🏠 Art des Mietobjekts</h3>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    formData.garage_type === 'garage' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="garage_type"
                      value="garage"
                      checked={formData.garage_type === 'garage'}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="text-3xl mb-2">🚗</div>
                      <div className="font-medium">Garage</div>
                      <div className="text-sm text-gray-600">Verschließbarer Raum</div>
                    </div>
                  </label>
                  
                  <label className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    formData.garage_type === 'stellplatz' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="garage_type"
                      value="stellplatz"
                      checked={formData.garage_type === 'stellplatz'}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="text-3xl mb-2">🅿️</div>
                      <div className="font-medium">Stellplatz</div>
                      <div className="text-sm text-gray-600">Markierte Parkfläche</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* ✅ VERTRAGSPARTEIEN */}
              <div className="grid md:grid-cols-2 gap-8">
                
                {/* Vermieter */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">👤 Vermieter</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="landlord_name"
                      value={formData.landlord_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="Max Mustermann"
                    />
                    {errors.landlord_name && <p className="text-red-500 text-sm mt-1">{errors.landlord_name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vollständige Anschrift <span className="text-red-500">*</span></label>
                    <textarea
                      name="landlord_address"
                      value={formData.landlord_address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="Musterstraße 1&#10;12345 Berlin"
                    />
                    {errors.landlord_address && <p className="text-red-500 text-sm mt-1">{errors.landlord_address}</p>}
                  </div>
                </div>

                {/* Mieter */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">👥 Mieter</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="tenant_name"
                      value={formData.tenant_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="Anna Beispiel"
                    />
                    {errors.tenant_name && <p className="text-red-500 text-sm mt-1">{errors.tenant_name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vollständige Anschrift <span className="text-red-500">*</span></label>
                    <textarea
                      name="tenant_address"
                      value={formData.tenant_address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="Beispielweg 2&#10;12345 Berlin"
                    />
                    {errors.tenant_address && <p className="text-red-500 text-sm mt-1">{errors.tenant_address}</p>}
                  </div>
                </div>
              </div>

              {/* ✅ GARAGE-DETAILS */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {formData.garage_type === 'garage' ? '🚗' : '🅿️'} {formData.garage_type === 'garage' ? 'Garage' : 'Stellplatz'}-Details
                </h3>
                
                {/* Adresse-Checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="garage_same_address"
                    checked={formData.garage_same_address}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    {formData.garage_type === 'garage' ? 'Garage' : 'Stellplatz'} befindet sich an derselben Adresse wie Vermieter
                  </label>
                </div>

                {/* Adresse (nur wenn nicht gleiche Adresse) */}
                {!formData.garage_same_address && (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Straße und Hausnummer <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="garage_address"
                        value={formData.garage_address}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="Garagenstraße 15"
                      />
                      {errors.garage_address && <p className="text-red-500 text-sm mt-1">{errors.garage_address}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PLZ <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="garage_postal"
                        value={formData.garage_postal}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="12345"
                      />
                      {errors.garage_postal && <p className="text-red-500 text-sm mt-1">{errors.garage_postal}</p>}
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stadt <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="garage_city"
                        value={formData.garage_city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="Berlin"
                      />
                      {errors.garage_city && <p className="text-red-500 text-sm mt-1">{errors.garage_city}</p>}
                    </div>
                  </div>
                )}

                {/* Weitere Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{formData.garage_type === 'garage' ? 'Garage' : 'Stellplatz'}-Nummer</label>
                    <input
                      type="text"
                      name="garage_number"
                      value={formData.garage_number}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="Nr. 15"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Größe (optional)</label>
                    <input
                      type="text"
                      name="garage_size"
                      value={formData.garage_size}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="ca. 15 qm"
                    />
                  </div>
                </div>

                {formData.garage_type === 'garage' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Anzahl Schlüssel/Toröffner</label>
                    <input
                      type="number"
                      name="garage_keys"
                      value={formData.garage_keys}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* ✅ VERTRAGSDATEN */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">📅 Vertragsdaten</h3>
                
                {/* Vertragsart */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vertragsart</label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      formData.garage_lease_type === 'unbefristet' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="garage_lease_type"
                        value="unbefristet"
                        checked={formData.garage_lease_type === 'unbefristet'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className="font-medium">Unbefristet</div>
                      <div className="text-sm text-gray-600">Keine automatische Beendigung</div>
                    </label>
                    
                    <label className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      formData.garage_lease_type === 'befristet' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="garage_lease_type"
                        value="befristet"
                        checked={formData.garage_lease_type === 'befristet'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className="font-medium">Befristet</div>
                      <div className="text-sm text-gray-600">Mit festem Enddatum</div>
                    </label>
                  </div>
                </div>

                {/* Datum-Felder */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mietbeginn <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
                  </div>
                  {formData.garage_lease_type === 'befristet' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mietende <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
                    </div>
                  )}
                </div>

                {/* Miete */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monatliche Miete <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        type="number"
                        name="rent"
                        value={formData.rent}
                        onChange={handleInputChange}
                        step="0.01"
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="50.00"
                      />
                      <span className="absolute right-3 top-2 text-gray-500">€</span>
                    </div>
                    {errors.rent && <p className="text-red-500 text-sm mt-1">{errors.rent}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kaution (optional)</label>
                    <div className="relative">
                      <input
                        type="number"
                        name="deposit_amount"
                        value={formData.deposit_amount}
                        onChange={handleInputChange}
                        step="0.01"
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="100.00"
                      />
                      <span className="absolute right-3 top-2 text-gray-500">€</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nebenkosten (optional)</label>
                    <div className="relative">
                      <input
                        type="number"
                        name="additional_costs"
                        value={formData.additional_costs}
                        onChange={handleInputChange}
                        step="0.01"
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="10.00"
                      />
                      <span className="absolute right-3 top-2 text-gray-500">€</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ✅ ZUSÄTZLICHE VEREINBARUNGEN */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">📝 Zusätzliche Vereinbarungen (optional)</h3>
                <textarea
                  name="special_agreements"
                  value={formData.special_agreements}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="Hier können Sie besondere Vereinbarungen eintragen..."
                />
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
                      <label className="flex items-start cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedAddons.includes(addon.id) || selectedAddons.includes(addon.addon_key)}
                          onChange={() => handleAddonToggle(addon.addon_key || addon.id)}
                          className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between items-start">
                            <div className="font-medium text-gray-900 text-sm">{addon.name}</div>
                            <span className="text-blue-600 font-medium text-sm">+{addon.price.toFixed(2)}€</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{addon.description}</p>
                          {addon.features && (
                            <ul className="text-xs text-gray-500 mt-2 list-disc list-inside">
                              {addon.features.slice(0, 2).map((feature, idx) => (
                                <li key={idx}>{feature}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Lade verfügbare Services...</p>
                </div>
              )}
            </div>

            {/* ✅ GESAMTPREIS */}
            <div className="border-t border-gray-300 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Gesamtpreis:</span>
                <span className="text-xl font-bold text-blue-600">{getTotalPrice()}€</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">inkl. 19% MwSt.</p>
            </div>

            {/* ✅ INFO-BOX */}
            <div className="bg-blue-50 rounded-lg p-4 mt-6">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">✅ Sofortiger Download</p>
                  <p>Nach der Zahlung erhalten Sie Ihren Vertrag sofort als PDF per E-Mail.</p>
                </div>
              </div>
            </div>

            {/* ✅ VORTEILE */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Anwaltlich geprüft
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Rechtssicher
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Sofort verwendbar
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Kundenservice
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
