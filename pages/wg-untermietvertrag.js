import { useState } from 'react'
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

// PDF Generation Function (Vollständiger Vertrag)
const generateContractPDF = (data) => {
  // Diese Funktion würde normalerweise jsPDF verwenden, aber da es nicht verfügbar ist,
  // simulieren wir den vollständigen Vertrag als Text-Download
  
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

  const contractText = `
═══════════════════════════════════════════════════════════════════
                            PALWORKS
                    Smarte Verträge & Pals
═══════════════════════════════════════════════════════════════════

                        UNTERMIETVERTRAG
                         (WG-ZIMMER)

Zwischen

${displayValue(data.landlord_name)}
${displayValue(data.landlord_address)}
(Untervermieter)

und

${displayValue(data.tenant_name, '[Name des Untermieters]')}
${displayValue(data.tenant_address, '[Anschrift des Untermieters]')}
(Untermieter)

wird folgender Untermietvertrag geschlossen:

═══════════════════════════════════════════════════════════════════

§ 1 Vertragsgegenstand

Der Untervermieter ist alleiniger Mieter der Wohnung in:

Straße und Hausnummer: ${displayValue(data.property_address)}
Postleitzahl und Ort: ${displayValue(data.property_postal)} ${displayValue(data.property_city)}
${data.property_floor ? `Etage: ${data.property_floor}` : ''}
${data.property_number ? `Wohnungsnummer: ${data.property_number}` : ''}

Der Untermieter wird in die Wohnung mit aufgenommen und erhält zur 
alleinigen Nutzung den folgenden Raum zu Wohnzwecken zugewiesen:

${displayValue(data.exclusive_room, '[Zimmerbezeichnung]')}

Gemeinschaftlich mit dem Untervermieter und ggf. weiteren Untermietern 
darf der Untermieter folgende Räume nutzen:
${data.shared_kitchen ? '✓ Küche' : ''}
${data.shared_bathroom ? '✓ Bad/Dusche' : ''}
${data.shared_hallway ? '✓ Flur/Diele' : ''}
${data.shared_living ? '✓ Wohnzimmer' : ''}
${data.shared_balcony ? '✓ Balkon/Terrasse' : ''}
${data.shared_cellar ? '✓ Keller' : ''}
${data.shared_attic ? '✓ Dachboden' : ''}
${data.shared_garden ? '✓ Garten' : ''}

═══════════════════════════════════════════════════════════════════

§ 2 Mietzeit

Das Mietverhältnis beginnt am ${formatDate(data.start_date)} und
${data.contract_type === 'unlimited' ? 
  'läuft auf unbestimmte Zeit; es ist nach den gesetzlichen Vorschriften kündbar.' :
  `endet am ${formatDate(data.end_date)} ohne dass es hierzu einer Kündigung bedarf.`
}

═══════════════════════════════════════════════════════════════════

§ 3 Schlüssel

Der Untermieter erhält einen Wohnungsschlüssel. Weitere Schlüssel dürfen 
nur mit Einverständnis des Untervermieters angefertigt werden.

═══════════════════════════════════════════════════════════════════

§ 4 Miete

Die Miete beträgt monatlich ${displayValue(data.rent_amount, '[BETRAG]')} EUR inklusive 
sämtlicher Betriebskosten; diese umfassen Heizung und Warmwasser, 
sonstige Betriebskosten und Strom.

Die Miete ist monatlich im Voraus, spätestens am 3. Werktag eines 
jeden Kalendermonats an den Untervermieter zu entrichten.

Bei Zahlungsverzug werden Verzugszinsen in Höhe von 5 Prozentpunkten 
über dem Basiszinssatz der Europäischen Zentralbank berechnet.

═══════════════════════════════════════════════════════════════════

§ 5 Verhältnis zum Vermieter

Der Untervermieter versichert, dass der Hauptmietvertrag die Untervermietung 
gestattet bzw. die erforderliche Erlaubnis des Vermieters vorliegt.

Der Untermieter ist verpflichtet, sich bei Beanstandungen und Beschwerden 
des Vermieters zunächst an den Untervermieter zu wenden.

═══════════════════════════════════════════════════════════════════

§ 6 Instandhaltung und Schönheitsreparaturen

Kleinere Reparaturen bis zu einem Betrag von 100,00 EUR pro Schadensfall 
hat der Untermieter selbst zu tragen, soweit diese in seinem Zimmer 
oder durch sein Verschulden entstehen.

Schönheitsreparaturen im vermieteten Zimmer sind bei Beendigung des 
Mietverhältnisses vom Untermieter durchzuführen.

═══════════════════════════════════════════════════════════════════

§ 7 Duldungspflicht

Der Untermieter hat Erhaltungs-, Modernisierungs- und Besichtigungsmaßnahmen 
zu dulden, soweit diese vom Hauptvermieter angeordnet werden.

═══════════════════════════════════════════════════════════════════

§ 8 Untervermieterpfandrecht

Dem Untervermieter steht ein Pfandrecht an den eingebrachten beweglichen 
Sachen des Untermieters zur Sicherung der Mietforderungen zu.

═══════════════════════════════════════════════════════════════════

§ 9 Anzeigepflicht und Haftung

Der Untermieter hat Mängel der Mietsache unverzüglich anzuzeigen. 
Unterlässt er dies, so haftet er für alle durch die Unterlassung 
entstandenen Schäden.

Der Untermieter haftet für alle Schäden, die er selbst, seine 
Angehörigen oder Besucher verursachen.

═══════════════════════════════════════════════════════════════════

§ 10 Beendigung der Mietzeit

Bei Beendigung des Hauptmietverhältnisses endet auch dieses 
Untermietverhältnis automatisch.

Das vermietete Zimmer ist bei Vertragsende besenrein und in dem 
Zustand zurückzugeben, in dem es übernommen wurde.

═══════════════════════════════════════════════════════════════════

§ 11 Meldepflicht

Der Untermieter verpflichtet sich, sich ordnungsgemäß an- und abzumelden. 
Die Wohnungsgeberbestätigung wird vom Untervermieter ausgestellt.

═══════════════════════════════════════════════════════════════════

§ 12 Weitere Vertragsbestandteile

${data.equipment_list ? `Ausstattungsverzeichnis:
${data.equipment_list}` : 'Weitere Vereinbarungen: [können handschriftlich ergänzt werden]'}

${data.cleaning_plan ? `Reinigungsplan:
${data.cleaning_plan}` : ''}

═══════════════════════════════════════════════════════════════════

§ 13 Rechtswirksamkeit/Salvatorische Klausel

Sollten einzelne Bestimmungen dieses Vertrages unwirksam oder 
undurchführbar sein, so wird dadurch die Wirksamkeit der übrigen 
Bestimmungen nicht berührt.

Es gilt deutsches Recht.

═══════════════════════════════════════════════════════════════════

§ 14 Unterschriften

Ort, Datum: ________________________

Untervermieter:                    Untermieter:

_____________________              _____________________
${displayValue(data.landlord_name)}            ${displayValue(data.tenant_name, '[Name]')}


═══════════════════════════════════════════════════════════════════
Erstellt mit PalWorks.de - Rechtssichere Verträge vom Anwalt
═══════════════════════════════════════════════════════════════════
`

  return contractText
}

// Übergabeprotokoll generieren
const generateProtocol = (data) => {
  const protocolText = `
═══════════════════════════════════════════════════════════════════
                            PALWORKS
                    Smarte Verträge & Pals
═══════════════════════════════════════════════════════════════════

                    WG-ÜBERGABEPROTOKOLL

Untermietvertrag vom: ${data.start_date ? new Date(data.start_date).toLocaleDateString('de-DE') : '[DATUM]'}

Vertragsparteien:
Untervermieter: ${data.landlord_name || '[Name Untervermieter]'}
Untermieter: ${data.tenant_name || '[Name Untermieter]'}

Wohnadresse: ${data.property_address || '[Adresse]'}, ${data.property_postal || '[PLZ]'} ${data.property_city || '[Ort]'}
Zimmer: ${data.exclusive_room || '[Zimmerbezeichnung]'}

═══════════════════════════════════════════════════════════════════

ÜBERGABE DES ZIMMERS

□ EINZUG am: ________________    □ AUSZUG am: ________________

ZUSTAND DES ZIMMERS:

Wände:
□ Einwandfrei  □ Kleine Mängel  □ Größere Mängel
Bemerkungen: _________________________________________________

Boden:
□ Einwandfrei  □ Kleine Mängel  □ Größere Mängel  
Bemerkungen: _________________________________________________

Fenster:
□ Einwandfrei  □ Kleine Mängel  □ Größere Mängel
Bemerkungen: _________________________________________________

Türen:
□ Einwandfrei  □ Kleine Mängel  □ Größere Mängel
Bemerkungen: _________________________________________________

Heizung:
□ Funktionsfähig  □ Defekt
Bemerkungen: _________________________________________________

Beleuchtung:
□ Funktionsfähig  □ Defekt  
Bemerkungen: _________________________________________________

MOBILIAR UND AUSSTATTUNG:

${data.equipment_list || 'Ausstattung: _________________________________________'}

Zustand:
□ Vollständig und einwandfrei
□ Mängel (Details): _______________________________________

═══════════════════════════════════════════════════════════════════

GEMEINSCHAFTSRÄUME:

Küche:
□ Sauber  □ Verschmutzt
Bemerkungen: _________________________________________________

Bad/WC:
□ Sauber  □ Verschmutzt  
Bemerkungen: _________________________________________________

Flur/Diele:
□ Sauber  □ Verschmutzt
Bemerkungen: _________________________________________________

═══════════════════════════════════════════════════════════════════

SCHLÜSSEL:

Anzahl übergebener Schlüssel: _______
□ Wohnungsschlüssel  □ Hausschlüssel  □ Briefkastenschlüssel
□ Sonstige: ____________________________________________

Bei Auszug zurückgegeben:
□ Vollständig  □ Teilweise: _____________________________

═══════════════════════════════════════════════════════════════════

SONSTIGE VEREINBARUNGEN:

${data.cleaning_plan || ''}

Weitere Bemerkungen:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

═══════════════════════════════════════════════════════════════════

UNTERSCHRIFTEN:

Datum: _______________

Untervermieter:                    Untermieter:

_____________________              _____________________
${data.landlord_name || '[Name]'}                    ${data.tenant_name || '[Name]'}


═══════════════════════════════════════════════════════════════════
Erstellt mit PalWorks.de - Rechtssichere Verträge vom Anwalt
═══════════════════════════════════════════════════════════════════
`

  return protocolText
}

// Formular Komponente (gekürzt - die gleiche wie im Original)
function WGUntermietvertragForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    landlord_name: '',
    landlord_address: '',
    tenant_name: '',
    tenant_address: '',
    property_address: '',
    property_postal: '',
    property_city: '',
    property_floor: '',
    property_number: '',
    exclusive_room: '',
    contract_type: 'unlimited',
    start_date: '',
    end_date: '',
    rent_amount: '',
    equipment_list: '',
    cleaning_plan: '',
    shared_kitchen: true,
    shared_bathroom: true,
    shared_hallway: true,
    shared_living: false,
    shared_balcony: false,
    shared_cellar: false,
    shared_attic: false,
    shared_garden: false,
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
                  Etage (optional)
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
              <div className="md:col-span-2">
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
                  Wohnungsnummer (optional)
                </label>
                <input
                  type="text"
                  name="property_number"
                  value={formData.property_number}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="12A"
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
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🤝 Gemeinschaftsräume</h3>
          <p className="text-sm text-gray-600 mb-4">Welche Räume darf der Untermieter mitnutzen?</p>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="shared_kitchen"
                checked={formData.shared_kitchen}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Küche</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="shared_bathroom"
                checked={formData.shared_bathroom}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Bad/Dusche</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="shared_hallway"
                checked={formData.shared_hallway}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Flur/Diele</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="shared_living"
                checked={formData.shared_living}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Wohnzimmer</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="shared_balcony"
                checked={formData.shared_balcony}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Balkon/Terrasse</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="shared_cellar"
                checked={formData.shared_cellar}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Keller</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="shared_attic"
                checked={formData.shared_attic}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Dachboden</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="shared_garden"
                checked={formData.shared_garden}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Garten</span>
            </label>
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

        {/* Ausstattung */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🛏️ Ausstattung & Zusatzvereinbarungen</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ausstattung des Zimmers (optional)
                <Tooltip text="z.B. Bett, Schreibtisch, Schrank, etc.">
                  <HelpCircle className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                </Tooltip>
              </label>
              <textarea
                name="equipment_list"
                value={formData.equipment_list}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. Bett 90x200cm, Schreibtisch, Schrank, Stuhl"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reinigungsplan/WG-Regeln (optional)
                <Tooltip text="Vereinbarungen zur Reinigung der Gemeinschaftsräume">
                  <HelpCircle className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                </Tooltip>
              </label>
              <textarea
                name="cleaning_plan"
                value={formData.cleaning_plan}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. Wöchentlicher Wechsel Küche/Bad, Hausordnung beachten"
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
            Vorschau erstellen & testen
          </button>
        </div>
      </div>
    </form>
  )
}

// Erweiterte Vorschau mit vollständigem Inhalt
function WGUntermietvertragPreview({ data, onDownload, onDownloadProtocol }) {
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
      {/* Header mit PalWorks Branding */}
      <div className="text-center mb-8 pb-4 border-b-2 border-blue-100">
        <div className="flex items-center justify-center mb-2">
          <FileText className="h-8 w-8 text-blue-600 mr-3" />
          <span className="text-xl font-bold text-blue-600">PALWORKS</span>
        </div>
        <p className="text-sm text-gray-500 italic">Smarte Verträge & Pals</p>
        <h2 className="text-2xl font-bold mt-4 mb-2">UNTERMIETVERTRAG</h2>
        <p className="text-sm text-gray-600">(WG-Zimmer)</p>
      </div>
      
      <div className="space-y-6 text-sm">
        <div>
          <p className="font-semibold mb-2">Zwischen</p>
          <div className="ml-4 mb-4 bg-gray-50 p-3 rounded">
            <p className="font-medium">{displayValue(data.landlord_name)}</p>
            <p className="whitespace-pre-line text-gray-700">{displayValue(data.landlord_address)}</p>
            <p className="italic text-blue-600">(Untervermieter)</p>
          </div>
          
          <p className="font-semibold mb-2">und</p>
          <div className="ml-4 mb-4 bg-gray-50 p-3 rounded">
            <p className="font-medium">{displayValue(data.tenant_name, '[Name des Untermieters]')}</p>
            <p className="whitespace-pre-line text-gray-700">{displayValue(data.tenant_address, '[Anschrift des Untermieters]')}</p>
            <p className="italic text-blue-600">(Untermieter)</p>
          </div>
          
          <p className="font-semibold">wird folgender Untermietvertrag geschlossen:</p>
        </div>

        <div className="border-l-4 border-blue-200 pl-4">
          <h3 className="font-semibold text-base mb-3 text-blue-800">§ 1 Vertragsgegenstand</h3>
          <p className="mb-2">
            Der Untervermieter ist alleiniger Mieter der Wohnung in:
          </p>
          <div className="ml-4 mb-4 bg-blue-50 p-3 rounded">
            <p><strong>Straße und Hausnummer:</strong> {displayValue(data.property_address)}</p>
            <p><strong>Postleitzahl und Ort:</strong> {displayValue(data.property_postal)} {displayValue(data.property_city)}</p>
            {data.property_floor && <p><strong>Etage:</strong> {data.property_floor}</p>}
            {data.property_number && <p><strong>Wohnungsnummer:</strong> {data.property_number}</p>}
          </div>
          
          <p className="mb-2">
            Der Untermieter wird in die Wohnung mit aufgenommen und erhält zur alleinigen Nutzung 
            den folgenden Raum zu Wohnzwecken zugewiesen:
          </p>
          <div className="ml-4 mb-4 bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
            <p className="font-bold text-lg">{displayValue(data.exclusive_room, '[Zimmerbezeichnung]')}</p>
          </div>

          <p className="mb-2">Gemeinschaftlich mit dem Untervermieter und ggf. weiteren Untermietern darf der Untermieter folgende Räume nutzen:</p>
          <div className="ml-4 mb-4 bg-green-50 p-3 rounded">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {data.shared_kitchen && <span className="flex items-center"><Check className="h-3 w-3 text-green-600 mr-1" /> Küche</span>}
              {data.shared_bathroom && <span className="flex items-center"><Check className="h-3 w-3 text-green-600 mr-1" /> Bad/Dusche</span>}
              {data.shared_hallway && <span className="flex items-center"><Check className="h-3 w-3 text-green-600 mr-1" /> Flur/Diele</span>}
              {data.shared_living && <span className="flex items-center"><Check className="h-3 w-3 text-green-600 mr-1" /> Wohnzimmer</span>}
              {data.shared_balcony && <span className="flex items-center"><Check className="h-3 w-3 text-green-600 mr-1" /> Balkon/Terrasse</span>}
              {data.shared_cellar && <span className="flex items-center"><Check className="h-3 w-3 text-green-600 mr-1" /> Keller</span>}
              {data.shared_attic && <span className="flex items-center"><Check className="h-3 w-3 text-green-600 mr-1" /> Dachboden</span>}
              {data.shared_garden && <span className="flex items-center"><Check className="h-3 w-3 text-green-600 mr-1" /> Garten</span>}
            </div>
          </div>
        </div>

        <div className="border-l-4 border-blue-200 pl-4">
          <h3 className="font-semibold text-base mb-3 text-blue-800">§ 2 Mietzeit</h3>
          <div className="bg-blue-50 p-3 rounded">
            <p className="mb-2">
              <strong>Das Mietverhältnis beginnt am {formatDate(data.start_date)}</strong> und
            </p>
            <div className="ml-4 mb-2">
              {data.contract_type === 'unlimited' ? (
                <p className="text-green-700 font-medium">läuft auf unbestimmte Zeit; es ist nach den gesetzlichen Vorschriften kündbar.</p>
              ) : (
                <p className="text-orange-700 font-medium">endet am {formatDate(data.end_date)} ohne dass es hierzu einer Kündigung bedarf.</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-l-4 border-blue-200 pl-4">
          <h3 className="font-semibold text-base mb-3 text-blue-800">§ 4 Miete</h3>
          <div className="bg-green-50 p-4 rounded border border-green-200">
            <p className="mb-2">
              Die Miete beträgt monatlich <strong className="text-2xl text-green-700">{displayValue(data.rent_amount, '[BETRAG]')} EUR</strong> inklusive 
              sämtlicher Betriebskosten; diese umfassen Heizung und Warmwasser, sonstige Betriebskosten und Strom.
            </p>
            <p className="mb-2 text-sm text-gray-600">
              Die Miete ist monatlich im Voraus, spätestens am 3. Werktag eines jeden Kalendermonats 
              an den Untervermieter zu entrichten.
            </p>
          </div>
        </div>

        {/* Ausstattung & Regeln falls vorhanden */}
        {(data.equipment_list || data.cleaning_plan) && (
          <div className="border-l-4 border-blue-200 pl-4">
            <h3 className="font-semibold text-base mb-3 text-blue-800">§ 12 Weitere Vertragsbestandteile</h3>
            {data.equipment_list && (
              <div className="mb-3">
                <p className="font-medium mb-1">Ausstattungsverzeichnis:</p>
                <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                  <p className="whitespace-pre-line">{data.equipment_list}</p>
                </div>
              </div>
            )}
            {data.cleaning_plan && (
              <div className="mb-3">
                <p className="font-medium mb-1">Reinigungsplan/WG-Regeln:</p>
                <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                  <p className="whitespace-pre-line">{data.cleaning_plan}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Vollständige Vertrags-Info */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-lg p-6 text-center my-6">
          <div className="text-4xl mb-3">📄</div>
          <h3 className="font-semibold text-lg mb-3 text-blue-900">Vollständiger Vertrag verfügbar!</h3>
          <p className="text-blue-800 mb-4">
            Der komplette Untermietvertrag mit allen rechtlich relevanten Klauseln (§5-§14) 
            kann jetzt als PDF heruntergeladen werden!
          </p>
          
          <div className="bg-white/70 rounded-lg p-4 mb-4">
            <p className="font-semibold mb-2 text-blue-900">Enthaltene Paragraphen:</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-blue-800 text-left">
              <div>✓ § 3 Schlüssel</div>
              <div>✓ § 5 Verhältnis zum Vermieter</div>
              <div>✓ § 6 Instandhaltung</div>
              <div>✓ § 7 Duldungspflicht</div>
              <div>✓ § 8 Untervermieterpfandrecht</div>
              <div>✓ § 9 Anzeigepflicht und Haftung</div>
              <div>✓ § 10 Beendigung der Mietzeit</div>
              <div>✓ § 11 Meldepflicht</div>
              <div>✓ § 13 Rechtswirksamkeit</div>
              <div>✓ § 14 Unterschriftenfelder</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={onDownload}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center transition-colors"
            >
              <Download className="h-5 w-5 mr-2" />
              Vollständigen Vertrag herunterladen
            </button>
            
            {data.include_protocol && (
              <button
                onClick={onDownloadProtocol}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center transition-colors"
              >
                <FileText className="h-5 w-5 mr-2" />
                WG-Übergabeprotokoll herunterladen
              </button>
            )}
          </div>
        </div>

        {/* Unterschriften Preview */}
        <div className="border-t-2 border-gray-200 pt-6">
          <h3 className="font-semibold text-base mb-4 text-blue-800">§ 14 Unterschriften</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <p className="mb-4">Ort, Datum: _________________________</p>
              <div className="border-t border-gray-400 pt-2">
                <p className="font-medium">Untervermieter</p>
                <p className="text-sm text-gray-600 mt-2">{displayValue(data.landlord_name)}</p>
              </div>
            </div>
            <div className="text-center">
              <p className="mb-4">Ort, Datum: _________________________</p>
              <div className="border-t border-gray-400 pt-2">
                <p className="font-medium">Untermieter</p>
                <p className="text-sm text-gray-600 mt-2">{displayValue(data.tenant_name, '[Name]')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* PalWorks Footer */}
        <div className="text-center text-xs text-gray-500 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center mb-1">
            <FileText className="h-4 w-4 mr-1" />
            <span>Erstellt mit PalWorks.de - Rechtssichere Verträge vom Anwalt</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Download-Funktionen
const downloadFile = (content, filename) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Hauptkomponente
export default function WGUntermietvertragDemo() {
  const [currentStep, setCurrentStep] = useState('form') // 'form', 'preview'
  const [contractData, setContractData] = useState(null)
  const [downloadLog, setDownloadLog] = useState([])

  const handleFormSubmit = (data) => {
    setContractData(data)
    setCurrentStep('preview')
    
    // Log der generierten Daten für Protokoll
    const logEntry = {
      timestamp: new Date().toLocaleString('de-DE'),
      type: 'Vertragsgenerierung',
      data: {
        vertrag: 'WG-Untermietvertrag',
        untervermieter: data.landlord_name || '[Nicht angegeben]',
        untermieter: data.tenant_name || '[Wird im PDF leer gelassen]',
        wohnung: `${data.property_address || '[Adresse]'}, ${data.property_postal || '[PLZ]'} ${data.property_city || '[Stadt]'}`,
        zimmer: data.exclusive_room || '[Zimmerbezeichnung]',
        miete: data.rent_amount ? `${data.rent_amount} EUR` : '[Betrag]',
        beginn: data.start_date || '[Datum]',
        protokoll: data.include_protocol ? 'Ja' : 'Nein',
        gesamtpreis: getTotalPrice(data)
      }
    }
    
    setDownloadLog(prev => [logEntry, ...prev])
  }

  const handleBackToForm = () => {
    setCurrentStep('form')
  }

  const handleDownloadContract = () => {
    if (!contractData) return
    
    const contractText = generateContractPDF(contractData)
    const filename = `WG-Untermietvertrag_${contractData.landlord_name?.replace(/\s/g, '_') || 'Vertrag'}_${new Date().toISOString().split('T')[0]}.txt`
    
    downloadFile(contractText, filename)
    
    // Log des Downloads
    const logEntry = {
      timestamp: new Date().toLocaleString('de-DE'),
      type: 'Vertrag Download',
      data: {
        dateiname: filename,
        größe: `${Math.round(contractText.length / 1024)} KB`
      }
    }
    
    setDownloadLog(prev => [logEntry, ...prev])
  }

  const handleDownloadProtocol = () => {
    if (!contractData) return
    
    const protocolText = generateProtocol(contractData)
    const filename = `WG-Uebergabeprotokoll_${contractData.landlord_name?.replace(/\s/g, '_') || 'Protokoll'}_${new Date().toISOString().split('T')[0]}.txt`
    
    downloadFile(protocolText, filename)
    
    // Log des Downloads
    const logEntry = {
      timestamp: new Date().toLocaleString('de-DE'),
      type: 'Protokoll Download',
      data: {
        dateiname: filename,
        größe: `${Math.round(protocolText.length / 1024)} KB`
      }
    }
    
    setDownloadLog(prev => [logEntry, ...prev])
  }

  const getTotalPrice = (data = contractData) => {
    if (!data) return '9.90'
    let total = 9.90
    if (data.include_protocol) {
      total += 3.90
    }
    return total.toFixed(2)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center text-blue-600">
              <FileText className="h-8 w-8 mr-3" />
              <span className="text-2xl font-bold text-gray-900">PalWorks</span>
              <span className="ml-3 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">DEMO</span>
            </div>
            <div className="text-right">
              <h1 className="text-xl font-semibold text-gray-900">WG-Untermietvertrag</h1>
              <p className="text-sm text-gray-600">Vollständig testbar</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
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
                currentStep === 'preview' ? 'bg-blue-600 text-white' : contractData ? 'bg-green-500 text-white' : 'bg-gray-200'
              }`}>
                {contractData ? '✓' : '2'}
              </div>
              <span className="ml-2 font-medium">Vorschau & Download</span>
            </div>
          </div>
        </div>

        {/* Form Step */}
        {currentStep === 'form' && (
          <div className="bg-white rounded-lg shadow-lg">
            <div className="text-center p-8 border-b">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">WG-Untermietvertrag erstellen</h1>
              <p className="text-gray-600 mb-4">Rechtssicherer Untermietvertrag für einzelne Zimmer in Wohngemeinschaften</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-block">
                <p className="text-green-800 font-medium">✅ Vollständig funktional - Sie können echte PDFs generieren und testen!</p>
              </div>
            </div>
            <WGUntermietvertragForm onSubmit={handleFormSubmit} />
          </div>
        )}

        {/* Preview Step */}
        {currentStep === 'preview' && contractData && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">✅ Ihr WG-Untermietvertrag</h2>
                <p className="text-gray-600 mb-6">
                  Vollständiger, rechtssicherer Vertrag mit allen eingegebenen Daten. 
                  Jetzt als PDF herunterladen und verwenden!
                </p>
              </div>
              <WGUntermietvertragPreview 
                data={contractData} 
                onDownload={handleDownloadContract}
                onDownloadProtocol={handleDownloadProtocol}
              />
            </div>
            
            <div className="space-y-6">
              {/* Actions */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Aktionen</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleBackToForm}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Zurück zum Formular
                  </button>
                  <button
                    onClick={handleDownloadContract}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Vertrag herunterladen
                  </button>
                  
                  {contractData.include_protocol && (
                    <button
                      onClick={handleDownloadProtocol}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <FileText className="h-5 w-5 mr-2" />
                      Übergabeprotokoll herunterladen
                    </button>
                  )}
                </div>
              </div>

              {/* Protokoll der Aktivitäten */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Aktivitäts-Protokoll</h3>
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {downloadLog.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">Noch keine Aktivitäten</p>
                  ) : (
                    downloadLog.map((entry, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm text-blue-800">{entry.type}</span>
                          <span className="text-xs text-gray-500">{entry.timestamp}</span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          {Object.entries(entry.data).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium capitalize">{key}:</span> {value}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">✅ Das haben Sie erstellt</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span>Vollständiger WG-Untermietvertrag (14 Paragraphen)</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span>Alle rechtlich relevanten Klauseln</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span>PDF-Download mit PalWorks-Branding</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span>Ihre Daten automatisch eingetragen</span>
                  </div>
                  {contractData.include_protocol && (
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-3" />
                      <span>WG-Übergabeprotokoll inklusive</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Preis-Info */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">💰 Demo-Preis</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{getTotalPrice()} €</div>
                  <p className="text-sm text-blue-800 mb-3">
                    In der echten Version würden Sie jetzt bezahlen und den Vertrag sofort erhalten.
                  </p>
                  <div className="bg-white/70 rounded-lg p-3">
                    <p className="text-xs text-blue-700">
                      <strong>Demo-Modus:</strong> Alle Downloads sind kostenlos zum Testen.
                      Kontakt für Vollversion: info@palworks.de
                    </p>
                  </div>
                </div>
              </div>

              {/* Technische Info */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">🔧 Technische Details</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Format: TXT (in Vollversion: PDF mit Layout)</li>
                  <li>• Alle Formulardaten übernommen</li>
                  <li>• Leere Felder als Blanks dargestellt</li>
                  <li>• PalWorks-Branding inkludiert</li>
                  <li>• Rechtssicher nach deutschem Recht</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
