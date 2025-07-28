export default function UntermietvertragPreview({ data }) {
  const formatDate = (dateString) => {
    if (!dateString) return '[DATUM]'
    return new Date(dateString).toLocaleDateString('de-DE')
  }

  const getFurnishedText = () => {
    switch (data.furnished) {
      case 'furnished': return 'möbliert'
      case 'partially': return 'teilmöbliert'
      case 'unfurnished': return 'nicht möbliert'
      default: return 'nicht möbliert'
    }
  }

  const displayValue = (value, placeholder = '[___________]') => {
    return value && value.toString().trim() !== '' ? value : placeholder
  }

  return (
    <div className="bg-white border rounded-lg p-8 max-h-[600px] overflow-y-auto contract-preview">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">UNTERMIETVERTRAG</h2>
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
          
          <p className="mb-2">Die Wohnung ist <strong>{getFurnishedText()}</strong>.</p>
          
          {data.equipment_list && (
            <div className="mb-4">
              <p className="mb-2">Mitvermietet sind folgende Ausstattungsgegenstände:</p>
              <p className="ml-4 italic">{data.equipment_list}</p>
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
              <p>läuft auf unbestimmte Zeit. Für die Kündigung gelten die gesetzlichen Vorschriften.</p>
            ) : (
              <p>endet am {formatDate(data.end_date)} ohne dass es hierzu einer Kündigung bedarf.</p>
            )}
          </div>
          <p className="mb-2">
            Setzt der Untermieter nach Ablauf der Mietzeit den Gebrauch der Mietsache fort, 
            findet eine Verlängerung des Mietverhältnisses nach § 545 BGB nicht statt.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-3">§ 3 Miete und Nebenkosten</h3>
          <p className="mb-2">
            Die Monatsmiete beträgt <strong>{displayValue(data.rent_amount, '[BETRAG]')} EUR</strong> und ist 
            monatlich im Voraus bis zum 3. Werktag eines Monats an den Untervermieter zu bezahlen.
          </p>
          
          {data.heating_costs && (
            <p className="mb-2">
              Daneben wird eine Vorauszahlung für die Nebenkosten für Heizung und Warmwasser 
              von monatlich <strong>{data.heating_costs} EUR</strong> geschuldet.
            </p>
          )}
          
          {data.other_costs && (
            <p className="mb-2">
              Die Vorauszahlung für die übrigen Nebenkosten gemäß § 2 BetrkV in seiner jeweiligen Fassung 
              beträgt monatlich <strong>{data.other_costs} EUR</strong>.
            </p>
          )}
          
          {data.deposit && (
            <p className="mb-2">
              Der Untermieter leistet eine Kaution in Höhe von <strong>{data.deposit} EUR</strong>. 
              Die Zahlung kann in drei Monatsraten erfolgen.
            </p>
          )}
        </div>

        {/* Preview-Cutoff Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-lg p-6 text-center my-6">
          <div className="text-4xl mb-3">🔒</div>
          <h3 className="font-semibold text-lg mb-3 text-blue-900">Vollständiger Vertrag nach Kauf</h3>
          <p className="text-blue-800 mb-4">
            Der komplette Vertrag mit allen rechtlich relevanten Klauseln, 
            Bestimmungen zu Nutzung, Schönheitsreparaturen, Kündigungsfristen, Haftung und weiteren 
            wichtigen Punkten wird nach dem Kauf als PDF zur Verfügung gestellt.
          </p>
          
          <div className="bg-white/70 rounded-lg p-4 mb-4">
            <p className="font-semibold mb-2 text-blue-900">Ihr vollständiger Vertrag enthält:</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
              <div className="text-left">✓ § 4 Weitere Leistungen</div>
              <div className="text-left">✓ § 5 Nutzung der Mieträume</div>
              <div className="text-left">✓ § 6 Duldungspflichten</div>
              <div className="text-left">✓ § 7 Schönheitsreparaturen</div>
              <div className="text-left">✓ § 8 Untervermieterpfandrecht</div>
              <div className="text-left">✓ § 9 Anzeigepflicht</div>
              <div className="text-left">✓ § 10 Beendigung der Mietzeit</div>
              <div className="text-left">✓ § 11 Meldepflicht</div>
              <div className="text-left">✓ § 12 Weitere Vereinbarungen</div>
              <div className="text-left">✓ Unterschriftenfelder</div>
            </div>
          </div>
          
          <div className="bg-blue-600 text-white rounded-lg p-3">
            <p className="font-semibold text-lg mb-1">
              Nur {data.include_protocol ? '17,80' : '12,90'} € für Ihren rechtssicheren Untermietvertrag
              {data.include_protocol && ' + Übergabeprotokoll'}
            </p>
            <p className="text-sm opacity-90">✓ Sofortiger PDF-Download ✓ E-Mail-Versand ✓ Rechnung inklusive</p>
          </div>
        </div>

        {/* Übergabeprotokoll Info */}
        {data.include_protocol && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">📋 Zusätzlich enthalten: Übergabeprotokoll</h4>
            <p className="text-sm text-green-700">
              Sie erhalten ein professionelles Übergabeprotokoll mit allen Vertragsdaten bereits ausgefüllt. 
              Dokumentieren Sie einfach den Zustand der Wohnung bei Ein- oder Auszug.
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
