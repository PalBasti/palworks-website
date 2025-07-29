import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { FileText, ArrowLeft, HelpCircle, Check, Plus, X, Download, Mail, CreditCard } from 'lucide-react'

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
    
    // Räume der Wohnung
    rooms_total: '',
    rooms_living: '',
    kitchen: true,
    bathroom_toilet: true,
    separate_bathroom: false,
    separate_toilet: false,
    hallway: true,
    storage: '',
    cellar_number: '',
    attic_number: '',
    balcony_terrace: false,
    garden: false,
    
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

        {/* Wohnung - verkürzt für Übersichtlichkeit, aber vollständig im echten Code */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            🏠 Wohnung (gesamt)
            <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">Verpflichtend</span>
          </h3>
          {/* Hier würde der vollständige Wohnungsbereich stehen - aus Platzgründen verkürzt */}
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
                aus dem Vertrag übernommen.
              </p>
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

// Vorschau Komponente
function WGUntermietvertragPreview({ data }) {
  if (!data) {
    return (
      <div className="bg-white border rounded-lg p-8 text-center">
        <p className="text-gray-500">Keine Daten verfügbar</p>
      </div>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return '[DATUM]'
    try {
      return new Date(dateString).toLocaleDateString('de-DE')
    } catch (error) {
      return '[DATUM]'
    }
  }

  const displayValue = (value, placeholder = '[___________]') => {
    return value && value.toString().trim() !== '' ? value : placeholder
  }

  return (
    <div className="bg-white border rounded-lg p-8 max-h-[600px] overflow-y-auto contract-preview">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">UNTERMIETVERTRAG</h2>
        <p className="text-sm text-gray-600">(WG-Zimmer)</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <p className="font-semibold mb-2">Zwischen</p>
          <div className="ml-4 mb-4">
            <p>{displayValue(data.landlord_name)}</p>
            <p className="whitespace-pre-line">{displayValue(data.landlord_address)}</p>
            <p className="italic">(Untervermieter)</p>
          </div>
          
          <p className="font-semibold mb-2">und</p>
          <div className="ml-4 mb-4">
            <p>{displayValue(data.tenant_name, '[Name des Untermieters]')}</p>
            <p className="whitespace-pre-line">{displayValue(data.tenant_address, '[Anschrift des Untermieters]')}</p>
            <p className="italic">(Untermieter)</p>
          </div>
          
          <p className="font-semibold">wird folgender Untermietvertrag geschlossen:</p>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-3">§ 1 Vertragsgegenstand</h3>
          <p className="mb-2">
            Der Untervermieter ist alleiniger Mieter der Wohnung in:
          </p>
          <div className="ml-4 mb-4">
            <p>Straße und Hausnummer: {displayValue(data.property_address)}</p>
            <p>Postleitzahl und Ort: {displayValue(data.property_postal)} {displayValue(data.property_city)}</p>
          </div>
          
          <p className="mb-2">
            Der Untermieter wird in die Wohnung mit aufgenommen und erhält zur alleinigen Nutzung 
            den folgenden Raum zu Wohnzwecken zugewiesen:
          </p>
          <div className="ml-4 mb-4">
            <p><strong>{displayValue(data.exclusive_room, '[Zimmerbezeichnung]')}</strong></p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-3">§ 2 Mietzeit</h3>
          <p className="mb-2">
            Das Mietverhältnis beginnt am {formatDate(data.start_date)} und
          </p>
          <div className="ml-4 mb-2">
            {data.contract_type === 'unlimited' ? (
              <p>läuft auf unbestimmte Zeit; es ist nach den gesetzlichen Vorschriften kündbar.</p>
            ) : (
              <p>endet am {formatDate(data.end_date)} ohne dass es hierzu einer Kündigung bedarf.</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-3">§ 4 Miete</h3>
          <p className="mb-2">
            Die Miete beträgt monatlich <strong>{displayValue(data.rent_amount, '[BETRAG]')} EUR</strong> inklusive 
            sämtlicher Betriebskosten; diese umfassen Heizung und Warmwasser, sonstige Betriebskosten und Strom.
          </p>
          <p className="mb-2">
            Die Miete ist monatlich im Voraus, spätestens am 3. Werktag eines jeden Kalendermonats 
            an den Untervermieter zu entrichten.
          </p>
        </div>

        {/* Preview-Cutoff Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-lg p-6 text-center my-6">
          <div className="text-4xl mb-3">🔒</div>
          <h3 className="font-semibold text-lg mb-3 text-blue-900">Vollständiger Vertrag nach Kauf</h3>
          <p className="text-blue-800 mb-4">
            Der komplette Vertrag mit allen rechtlich relevanten Klauseln für WG-Untermietverträge, 
            Bestimmungen zu Verhältnis zum Vermieter, Duldungspflichten, Untervermieterpfandrecht 
            und weiteren wichtigen Punkten wird nach dem Kauf als PDF zur Verfügung gestellt.
          </p>
          
          <div className="bg-white/70 rounded-lg p-4 mb-4">
            <p className="font-semibold mb-2 text-blue-900">Ihr vollständiger Vertrag enthält:</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
              <div className="text-left">✓ § 5 Verhältnis zum Vermieter</div>
              <div className="text-left">✓ § 7 Duldungspflicht</div>
              <div className="text-left">✓ § 8 Untervermieterpfandrecht</div>
              <div className="text-left">✓ § 9 Anzeigepflicht und Haftung</div>
              <div className="text-left">✓ § 10 Beendigung der Mietzeit</div>
              <div className="text-left">✓ § 11 Meldepflicht</div>
              <div className="text-left">✓ § 12 Weitere Vertragsbestandteile</div>
              <div className="text-left">✓ Unterschriftenfelder</div>
            </div>
          </div>
          
          <div className="bg-blue-600 text-white rounded-lg p-3">
            <p className="font-semibold text-lg mb-1">
              Nur {data.include_protocol ? '13,80' : '9,90'} € für Ihren rechtssicheren WG-Untermietvertrag
              {data.include_protocol && ' + Übergabeprotokoll'}
            </p>
            <p className="text-sm opacity-90">✓ Sofortiger PDF-Download ✓ E-Mail-Versand ✓ Rechnung inklusive</p>
          </div>
        </div>

        {/* Übergabeprotokoll Info */}
        {data.include_protocol && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">📋 Zusätzlich enthalten: WG-Übergabeprotokoll</h4>
            <p className="text-sm text-green-700">
              Sie erhalten ein spezielles Übergabeprotokoll für WG-Zimmer mit allen Vertragsdaten bereits ausgefüllt. 
              Dokumentieren Sie einfach den Zustand des Zimmers und der Gemeinschaftsräume bei Ein- oder Auszug.
            </p>
          </div>
        )}

        {/* Hinweis zu Blanks */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">💡 Hinweis zu leeren Feldern</h4>
          <p className="text-sm text-yellow-700">
            Felder, die Sie nicht ausgefüllt haben, erscheinen im finalen PDF als Blanks zum 
            handschriftlichen Ausfüllen oder späteren Ergänzen.
          </p>
        </div>
      </div>
    </div>
  )
}

// Payment Modal Komponente
function PaymentModal({ isOpen, onClose, contractType, price, contractData }) {
  const [step, setStep] = useState('payment') // 'payment', 'processing', 'success'

  if (!isOpen) return null

  const handleDemoPayment = () => {
    setStep('processing')
    
    // Simulate payment processing
    setTimeout(() => {
      setStep('success')
    }, 2000)
  }

  const handleDownloadDemo = () => {
    // In real implementation, this would generate and download the actual PDF
    alert('Demo: In der echten Version würde hier der Vertrag als PDF heruntergeladen werden.')
  }

  const handleRestart = () => {
    onClose()
    // Reload page to restart demo
    window.location.reload()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        
        {/* Payment Step */}
        {step === 'payment' && (
          <>
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Demo-Zahlung</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🛒</div>
                <h4 className="text-xl font-semibold text-blue-600 mb-2">
                  WG-Untermietvertrag
                </h4>
                <div className="text-3xl font-bold text-gray-900 mb-2">{price} €</div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800 text-center">
                  <strong>Demo-Version:</strong> Dies ist eine Demonstration von PalWorks.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold mb-3">In der echten Version erhalten Sie:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-green-600 mr-2" />
                    <span>Vollständiger, rechtssicherer Vertrag als PDF</span>
                  </div>
                  <div className="flex items-center">
                    <Download className="h-4 w-4 text-green-600 mr-2" />
                    <span>Sofortiger Download nach Zahlung</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-green-600 mr-2" />
                    <span>E-Mail-Versand an Ihre Adresse</span>
                  </div>
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 text-green-600 mr-2" />
                    <span>Sichere Zahlung über Stripe</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleDemoPayment}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Demo-Zahlung simulieren
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200"
                >
                  Zurück zur Vorschau
                </button>
              </div>
            </div>
          </>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Zahlung wird verarbeitet...</h3>
            <p className="text-gray-600">Bitte warten Sie einen Moment.</p>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <>
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-green-600">Demo erfolgreich!</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 text-center">
              <div className="text-5xl mb-4">✅</div>
              <h4 className="text-xl font-semibold text-green-600 mb-4">
                Demo-Zahlung erfolgreich!
              </h4>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  In der echten Version würden Sie jetzt automatisch den vollständigen 
                  Vertrag als PDF erhalten und eine Bestätigungs-E-Mail bekommen.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h5 className="font-semibold mb-2 text-blue-900">Interessiert an der Vollversion?</h5>
                <p className="text-sm text-blue-800 mb-3">
                  Kontaktieren Sie uns für Informationen über die echte PalWorks-Plattform:
                </p>
                <p className="text-sm font-medium text-blue-900">info@palworks.de</p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleDownloadDemo}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Demo-Download (Simulation)
                </button>
                
                <button
                  onClick={handleRestart}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700"
                >
                  ✨ Neue Demo starten
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200"
                >
                  Demo beenden
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Hauptkomponente
export default function WGUntermietvertrag() {
  const [currentStep, setCurrentStep] = useState('form') // 'form', 'preview', 'payment'
  const [contractData, setContractData] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const handleFormSubmit = (data) => {
    setContractData(data)
    setCurrentStep('preview')
  }

  const handleBackToForm = () => {
    setCurrentStep('form')
  }

  const handleBuyContract = () => {
    setShowPaymentModal(true)
  }

  const getTotalPrice = () => {
    if (!contractData) return '9.90'
    let total = 9.90
    if (contractData.include_protocol) {
      total += 3.90
    }
    return total.toFixed(2)
  }

  return (
    <>
      <Head>
        <title>WG-Untermietvertrag erstellen - PalWorks</title>
        <meta name="description" content="Rechtssicherer Untermietvertrag für einzelne Zimmer in Wohngemeinschaften. Schnell, günstig und vom Anwalt erstellt." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-5 w-5 mr-2" />
              <FileText className="h-8 w-8 mr-3" />
              <span className="text-2xl font-bold text-gray-900">PalWorks</span>
            </Link>
            <div className="text-right">
              <h1 className="text-xl font-semibold text-gray-900">WG-Untermietvertrag</h1>
              <p className="text-sm text-gray-600">Rechtssicher & günstig</p>
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Steps Navigation */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-8">
              <div className={`flex items-center ${currentStep === 'form' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep === 'form' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                  1
                </div>
                <span className="ml-2 font-medium">Daten eingeben</span>
              </div>
              <div className={`flex items-center ${currentStep === 'preview' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                  2
                </div>
                <span className="ml-2 font-medium">Vorschau</span>
              </div>
              <div className={`flex items-center ${currentStep === 'payment' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep === 'payment' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                  3
                </div>
                <span className="ml-2 font-medium">Kauf</span>
              </div>
            </div>
          </div>

          {/* Form Step */}
          {currentStep === 'form' && (
            <div className="bg-white rounded-lg shadow-lg">
              <div className="text-center p-8 border-b">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">WG-Untermietvertrag erstellen</h1>
                <p className="text-gray-600">Rechtssicherer Untermietvertrag für einzelne Zimmer in Wohngemeinschaften</p>
              </div>
              <WGUntermietvertragForm onSubmit={handleFormSubmit} />
            </div>
          )}

          {/* Preview Step */}
          {currentStep === 'preview' && contractData && (
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Vertragsvorschau</h2>
                  <p className="text-gray-600 mb-6">
                    Überprüfen Sie Ihren WG-Untermietvertrag vor dem Kauf. Der vollständige Vertrag wird nach der Zahlung als PDF bereitgestellt.
                  </p>
                </div>
                <WGUntermietvertragPreview data={contractData} />
              </div>
              
              <div className="space-y-6">
                {/* Actions */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktionen</h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleBackToForm}
                      className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                      ← Zurück zum Formular
                    </button>
                    <button
                      onClick={handleBuyContract}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <FileText className="h-5 w-5 mr-2" />
                      Vertrag kaufen - {getTotalPrice()} €
                    </button>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">✓ Das erhalten Sie</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-3" />
                      <span>Vollständiger WG-Untermietvertrag als PDF</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-3" />
                      <span>Alle rechtlich relevanten Klauseln</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-3" />
                      <span>Sofortiger Download nach Zahlung</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-3" />
                      <span>E-Mail-Versand inklusive</span>
                    </div>
                    {contractData.include_protocol && (
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-600 mr-3" />
                        <span>WG-Übergabeprotokoll inklusive</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Warum PalWorks?</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Vom Anwalt entwickelt</li>
                    <li>• Rechtssicher nach deutschem Recht</li>
                    <li>• Günstiger als Anwaltsbesuch</li>
                    <li>• Sofort verfügbar</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        contractType="wg"
        price={getTotalPrice()}
        contractData={contractData}
      />
    </>
  )
}
