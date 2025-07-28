export default function WGUntermietvertragPreview({ data }) {
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

  const getRoomsList = () => {
    const rooms = []
    if (data.rooms_total) rooms.push(`${data.rooms_total} Zimmer`)
    if (data.rooms_living) rooms.push(`${data.rooms_living} Wohnzimmer`)
    if (data.kitchen) rooms.push('Küche')
    if (data.bathroom_toilet) rooms.push('Bad mit Toilette')
    if (data.separate_bathroom) rooms.push('separates Bad')
    if (data.separate_toilet) rooms.push('separate Toilette')
    if (data.hallway) rooms.push('Diele')
    if (data.storage) rooms.push(`${data.storage} Abstellkammer(n)`)
    if (data.cellar_number) rooms.push(`Keller(anteil) Nr.: ${data.cellar_number}`)
    if (data.attic_number) rooms.push(`Speicher(anteil) Nr.: ${data.attic_number}`)
    if (data.balcony_terrace) rooms.push('Balkon/Terrasse')
    if (data.garden) rooms.push('Gartenanteil')
    
    return rooms.length > 0 ? rooms.join(', ') : '[Raumaufteilung]'
  }

  const getSharedRooms = () => {
    const shared = []
    if (data.shared_living) shared.push('Wohnzimmer')
    if (data.shared_kitchen) shared.push('Küche')
    if (data.shared_bathroom) shared.push('Bad mit Toilette')
    if (data.shared_hallway) shared.push('Diele')
    if (data.shared_balcony) shared.push('Balkon/Terrasse')
    if (data.shared_cellar) shared.push('Keller(anteil)')
    if (data.shared_garden) shared.push('Gartenanteil')
    
    return shared.length > 0 ? shared.join(', ') : 'keine'
  }

  const getSharedFacilities = () => {
    const facilities = []
    if (data.shared_washroom) facilities.push('Waschraum')
    if (data.shared_dryroom) facilities.push('Trockenraum/-boden')
    if (data.shared_other) facilities.push(data.shared_other)
    
    return facilities.length > 0 ? facilities.join(', ') : 'keine'
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
            {data.property_floor && <p>Geschoss: {data.property_floor}</p>}
            {data.property_number && <p>Whg-Nr.: {data.property_number}</p>}
            {data.property_sqm && <p>Quadratmeter: {data.property_sqm}</p>}
          </div>
          
          <p className="mb-2">bestehend aus den folgenden Räumen und Flächen:</p>
          <div className="ml-4 mb-4">
            <p>{getRoomsList()}</p>
          </div>
          
          <p className="mb-2">
            Der Untermieter wird in die Wohnung mit aufgenommen und erhält zur alleinigen Nutzung 
            den folgenden Raum zu Wohnzwecken zugewiesen:
          </p>
          <div className="ml-4 mb-4">
            <p><strong>{displayValue(data.exclusive_room, '[Zimmerbezeichnung]')}</strong></p>
          </div>
          
          <p className="mb-2">
            Der Untermieter ist berechtigt, die folgenden Räume und Flächen gemeinschaftlich 
            mit dem Untervermieter zu Wohnzwecken zu benutzen:
          </p>
          <div className="ml-4 mb-4">
            <p>{getSharedRooms()}</p>
          </div>
          
          <p className="mb-2">
            Der Untermieter ist berechtigt, folgende Gemeinschaftseinrichtungen gemäß den 
            Vorschriften der Hausordnung mit zu benutzen:
          </p>
          <div className="ml-4 mb-4">
            <p>{getSharedFacilities()}</p>
          </div>
          
          {data.equipment_list && (
            <div className="mb-4">
              <p className="mb-2">Mitvermietet sind folgende Ausstattungsgegenstände:</p>
              <p className="ml-4 italic">{data.equipment_list}</p>
              <p className="ml-4 text-sm">diese sind bei Auszug vollständig und in ordnungsgemäßem Zustand zurückzulassen.</p>
            </div>
          )}
          
          <p className="mb-2">
            Dem Untermieter ist bekannt, dass der Untervermieter selbst Mieter ist und er gegenüber 
            dem Eigentümer der Wohnung keinen Kündigungsschutz genießt.
          </p>
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
          
          {data.telecom_costs && data.telecom_costs.trim() !== '' && (
            <p className="mb-2">
              Telekommunikationskosten trägt der Untermieter nach folgender Maßgabe: {data.telecom_costs}
            </p>
          )}
          
          <p className="mb-2">
            Die Miete ist monatlich im Voraus, spätestens am 3. Werktag eines jeden Kalendermonats 
            an den Untervermieter zu entrichten.
          </p>
        </div>

        {data.cleaning_plan && data.cleaning_plan.trim() !== '' && (
          <div>
            <h3 className="font-semibold text-lg mb-3">§ 6 Nutzung und Behandlung der Mieträume</h3>
            <p className="mb-2">
              Der Untermieter hat sich an der regelmäßigen Reinigung der gemeinschaftlich benutzten 
              Räume, Flächen und Einrichtungen nach Maßgabe des folgenden Reinigungsplans zu beteiligen:
            </p>
            <div className="ml-4 mb-4 bg-gray-50 p-3 rounded">
              <p className="text-sm italic">{data.cleaning_plan}</p>
            </div>
          </div>
        )}

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
