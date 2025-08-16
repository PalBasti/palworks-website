// components/GaragenvertragForm.js - KORRIGIERT: Syntax-Fehler behoben
import { useState, useEffect } from 'react'
import { Check, Mail, Info, FileText, CreditCard, User, Building } from 'lucide-react'

export default function GaragenvertragForm({ onSubmit }) {
  // ✅ STATE MANAGEMENT
  const [formData, setFormData] = useState({
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
    
    // Optional: Parteien (werden nur bei Bedarf ausgefüllt)
    landlord_name: '',
    landlord_address: '',
    tenant_name: '',
    tenant_address: '',
    
    // Bankdaten
    iban: '',
    bank: ''
  })

  // ✅ E-MAIL & ADDON-STATES
  const [customerEmail, setCustomerEmail] = useState('')
  const [newsletterSignup, setNewsletterSignup] = useState(false)
  const [selectedAddons, setSelectedAddons] = useState([])
  const [errors, setErrors] = useState({})
  const [showOptionalFields, setShowOptionalFields] = useState(false)

  // ✅ FALLBACK ADDONS (damit sofort etwas angezeigt wird)
  const fallbackAddons = [
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
    },
    {
      id: 'legal_review',
      addon_key: 'legal_review', 
      name: 'Anwaltliche Prüfung',
      price: 29.90,
      description: 'Professionelle juristische Überprüfung',
      features: [
        'Anwaltliche Durchsicht',
        'Rechtssicherheit',
        'Individuelle Anpassungen',
        '48h Bearbeitungszeit'
      ]
    }
  ]

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
    
    // E-Mail ist Pflicht
    if (!customerEmail || !customerEmail.includes('@')) {
      newErrors.customer_email = 'Gültige E-Mail-Adresse für Vertragszustellung erforderlich'
    }
    
    // Basis-Pflichtfelder
    const requiredFields = ['start_date', 'rent']
    
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

  // ✅ SUBMIT HANDLER
  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      const extendedData = {
        ...formData,
        // E-Mail für Integration
        customer_email: customerEmail,
        billing_email: customerEmail, // Kompatibilität
        newsletter_signup: newsletterSignup,
        // Addons
        selected_addons: selectedAddons,
        // Rückwärtskompatibilität
        include_explanations: selectedAddons.includes('explanations'),
        include_protocol: selectedAddons.includes('handover_protocol')
      }
      console.log('🔍 Submitting garage form with data:', extendedData)
      onSubmit(extendedData)
    }
  }

  // ✅ PREISFUNKTIONEN
  const getBasePrice = () => 7.90
  
  const getTotalPrice = () => {
    let total = getBasePrice()
    
    selectedAddons.forEach(addonId => {
      const addon = fallbackAddons.find(a => a.id === addonId || a.addon_key === addonId)
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
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Erstellen Sie rechtssicher Ihren {formData.garage_type === 'garage' ? 'Garagen' : 'Stellplatz'}mietvertrag. 
                Alle wichtigen Klauseln sind bereits enthalten - Sie müssen nur noch Ihre Daten eingeben.
              </p>
            </div>
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
              
              {/* ✅ 1. E-MAIL-SEKTION - ZUERST */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <Mail className="h-5 w-5 text-blue-600 mr-2" />
                  📧 Rechnungsempfänger & Vertragszustellung
                  <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">Erforderlich</span>
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-Mail-Adresse für Rechnung und Vertragszustellung <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.customer_email ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="ihre@email.de"
                      required
                    />
                    {errors.customer_email && <p className="text-red-500 text-sm mt-1">{errors.customer_email}</p>}
                    <p className="text-sm text-gray-600 mt-2">
                      📱 Sie erhalten Rechnung und fertigen Vertrag automatisch per E-Mail
                    </p>
                  </div>

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="newsletter"
                      checked={newsletterSignup}
                      onChange={(e) => setNewsletterSignup(e.target.checked)}
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="newsletter" className="ml-3 text-sm text-gray-700">
                      📬 <strong>Newsletter abonnieren (optional)</strong><br/>
                      Erhalten Sie Updates zu neuen Vertragsvorlagen, Rechtstipps und besonderen Angeboten. 
                      Abmeldung jederzeit möglich.
                    </label>
                  </div>
                </div>
              </div>

              {/* ✅ 2. OBJEKTART-AUSWAHL */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">🚗 Art des Mietobjekts</h3>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-white transition-colors">
                    <input
                      type="radio"
                      name="garage_type"
                      value="garage"
                      checked={formData.garage_type === 'garage'}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium text-lg">🏠 Garage</div>
                      <div className="text-sm text-gray-600">Geschlossener Stellplatz mit Tor</div>
                    </div>
                  </label>
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-white transition-colors">
                    <input
                      type="radio"
                      name="garage_type"
                      value="stellplatz"
                      checked={formData.garage_type === 'stellplatz'}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium text-lg">🅿️ Stellplatz</div>
                      <div className="text-sm text-gray-600">Offener Parkplatz</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* ✅ 3. MIETOBJEKT-DETAILS */}
              <div className="bg-yellow-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Building className="h-5 w-5 text-yellow-600 mr-2" />
                  🏠 {formData.garage_type === 'garage' ? 'Garage' : 'Stellplatz'}-Details
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.garage_type === 'garage' ? 'Garagen' : 'Stellplatz'}-Nummer (optional)
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
                      📍 {formData.garage_type === 'garage' ? 'Garage' : 'Stellplatz'} befindet sich an gleicher Adresse wie Vermieter
                    </span>
                  </label>
                </div>

                {!formData.garage_same_address && (
                  <div className="grid md:grid-cols-3 gap-4 p-4 bg-white rounded border">
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

              {/* ✅ 4. VERTRAGSDATEN */}
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
                        ♾️ Unbefristet (Standard)
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
                        📅 Befristet
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

              {/* ✅ 5. FINANZIELLE DATEN */}
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
                    <p className="text-xs text-gray-600 mt-1">Ohne Betriebskosten</p>
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
                      <span className="text-sm text-gray-700">📊 Zusätzliche Betriebskosten</span>
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
                        <p className="text-xs text-gray-600 mt-1">Strom, Reinigung, etc.</p>
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
                      <span className="text-sm text-gray-700">🔒 Kaution erforderlich</span>
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
              </div>

              {/* ✅ 6. OPTIONALE PARTEIEN-DATEN */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <User className="h-5 w-5 text-blue-600 mr-2" />
                    👥 Vermieter- & Mieterangaben (optional)
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowOptionalFields(!showOptionalFields)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {showOptionalFields ? 'Ausblenden' : 'Eingeben'}
                  </button>
                </div>
                
                {!showOptionalFields ? (
                  <p className="text-sm text-gray-600">
                    💡 Diese Angaben können auch später im PDF eingetragen werden. 
                    Klicken Sie auf "Eingeben" falls Sie die Namen bereits kennen.
                  </p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Vermieter */}
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">👤 Vermieter</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <input
                            type="text"
                            name="landlord_name"
                            value={formData.landlord_name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            placeholder="Max Mustermann"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                          <input
                            type="text"
                            name="landlord_address"
                            value={formData.landlord_address}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            placeholder="Musterstraße 1, 12345 Berlin"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mieter */}
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">👥 Mieter</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <input
                            type="text"
                            name="tenant_name"
                            value={formData.tenant_name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            placeholder="Anna Beispiel"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                          <input
                            type="text"
                            name="tenant_address"
                            value={formData.tenant_address}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            placeholder="Beispielweg 2, 54321 München"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ✅ SUBMIT BUTTON */}
              <div className="flex justify-center pt-6">
                <button
                  type="submit"
                  disabled={!customerEmail}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-4 px-8 rounded-lg transition-colors flex items-center text-lg"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Vertrag erstellen für {getTotalPrice()}€
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

            {/* ✅ ADDONS-SEKTION - FUNKTIONAL */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">📋 Zusätzliche Services</h4>
              
              <div className="space-y-3">
                {fallbackAddons.map((addon) => (
                  <div key={addon.id} className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <label className="flex items-center cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={selectedAddons.includes(addon.id) || selectedAddons.includes(addon.addon_key)}
                          onChange={() => handleAddonToggle(addon.id)}
                          className="mr-3 h-4 w-4 text-blue-600 rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">{addon.name}</div>
                          <div className="text-xs text-gray-600 mt-1">{addon.description}</div>
                        </div>
                      </label>
                      <span className="text-sm font-medium text-blue-600 ml-2">+{addon.price.toFixed(2)}€</span>
                    </div>
                    
                    {(selectedAddons.includes(addon.id) || selectedAddons.includes(addon.addon_key)) && addon.features && (
                      <div className="mt-2 pl-7">
                        <div className="text-xs text-gray-600">
                          {addon.features.slice(0, 2).map((feature, index) => (
                            <div key={index} className="flex items-center mb-1">
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
                <div className="flex items-center">
                  <Check className="h-3 w-3 mr-1" />
                  Sofortige Verfügbarkeit
                </div>
              </div>
            </div>

            {/* Hinweis */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <Info className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-700">
                  <div className="font-medium mb-1">💡 Automatische Zustellung</div>
                  Nach der Zahlung erhalten Sie Ihren {formData.garage_type === 'garage' ? 'Garagen' : 'Stellplatz'}mietvertrag 
                  sofort als PDF zum Download und per E-Mail an <strong>{customerEmail || '[E-Mail eingeben]'}</strong>.
                </div>
              </div>
            </div>

            {/* E-Mail-Status */}
            {customerEmail && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                <div className="flex items-center text-sm text-green-700">
                  <Check className="h-4 w-4 mr-2" />
                  📧 <strong>Bereit für Versand an:</strong><br/>
                  {customerEmail}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
