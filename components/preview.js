export default function ContractPreview({ data }) {
  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('de-DE')
  }

  const getObjectType = () => {
    return data.garage_type === 'garage' ? 'Garage' : 'Stellplatz'
  }

  const getObjectArticle = () => {
    return data.garage_type === 'garage' ? 'die Garage' : 'den Stellplatz'
  }

  const getObjectAddress = () => {
    if (data.garage_same_address) {
      return `${data.landlord_address}, ${data.landlord_postal} ${data.landlord_city}`
    }
    return `${data.garage_address}, ${data.garage_postal} ${data.garage_city}`
  }

  const getMietzeit = () => {
    if (data.garage_lease_type === 'befristet' && data.lease_end) {
      return `Das Mietverhältnis wird für eine feste Laufzeit vom ${formatDate(data.lease_start)} bis zum ${formatDate(data.lease_end)} geschlossen.`
    }
    return `Das Mietverhältnis beginnt am ${formatDate(data.lease_start)}. Es läuft auf unbestimmte Zeit und kann von jedem Teil spätestens am 3. Werktag eines Kalendermonats zum Ablauf des übernächsten Kalendermonats gekündigt werden.`
  }

  return (
    <div className="bg-white border rounded-lg p-8 max-h-[600px] overflow-y-auto" style={{ fontFamily: 'Times New Roman, serif' }}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">MIETVERTRAG FÜR {getObjectType().toUpperCase()}</h2>
      </div>
      
      <div className="space-y-6">
        <div>
          <p className="font-semibold mb-2">Zwischen</p>
          <div className="ml-4 mb-4">
            <p>{data.landlord_firstname} {data.landlord_lastname}</p>
            <p>{data.landlord_address}</p>
            <p>{data.landlord_postal} {data.landlord_city}</p>
            <p className="italic">(Vermieter)</p>
          </div>
          
          <p className="font-semibold mb-2">und</p>
          <div className="ml-4 mb-4">
            <p>{data.tenant_firstname} {data.tenant_lastname}</p>
            <p>{data.tenant_address}</p>
            <p>{data.tenant_postal} {data.tenant_city}</p>
            <p className="italic">(Mieter)</p>
          </div>
          
          <p className="font-semibold">wird folgender Mietvertrag geschlossen:</p>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-3">§ 1 Mietgegenstand</h3>
          <p className="mb-2">
            Vermietet wird {getObjectArticle()}{data.garage_number ? ` ${data.garage_number}` : ''} in {getObjectAddress()}
          </p>
          <p>
            Dem Mieter werden für die Mietzeit folgende Schlüssel/Codeschlüssel/Toröffner ausgehändigt: <strong>{data.garage_keys || 1}</strong>
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-3">§ 2 Mietzeit</h3>
          <p className="mb-2">{getMietzeit()}</p>
          <p className="mb-2">Die Kündigung bedarf der Schriftform.</p>
          {data.garage_lease_type === 'unbefristet' && (
            <p>Setzt der Mieter den Gebrauch der Mietsache nach Ablauf der Mietzeit fort, so verlängert sich das Mietverhältnis nicht auf unbestimmte Zeit. § 545 BGB findet insoweit keine Anwendung.</p>
          )}
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-3">§ 3 Mietzins und Mietzahlung{data.has_deposit ? ', Kaution' : ''}</h3>
          <p className="mb-2">Die Miete beträgt monatlich <strong>{data.rent} EUR</strong></p>
          
          {data.has_utilities && data.utilities && (
            <div className="mb-4">
              <p className="mb-2">
                Daneben ist eine Betriebskostenvorauszahlung für die Betriebskosten im Sinne von § 2 BetrkV zu leisten in Höhe von <strong>{data.utilities} EUR</strong>
              </p>
              <p>Die Abschlagszahlungen auf Betriebskosten werden nach Ablauf des jährlichen Abrechnungszeitraumes abgerechnet.</p>
            </div>
          )}
          
          <p className="mb-2">
            Die Miete ist monatlich im Voraus, spätestens am 3. Werktag eines Monats an den Vermieter durch Überweisung auf folgendes Konto: {data.iban}, {data.bank} zu bezahlen.
          </p>
          
          {data.has_deposit && data.deposit && (
            <p>Der Mieter zahlt bei Übergabe der Schlüssel eine Kaution von <strong>{data.deposit} EUR</strong>. Die Kaution wird verzinslich angelegt.</p>
          )}
        </div>

        {/* Preview-Cutoff Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-lg p-6 text-center my-6">
          <div className="text-4xl mb-3">🔒</div>
          <h3 className="font-semibold text-lg mb-3 text-blue-900">Vollständiger Vertrag nach Kauf</h3>
          <p className="text-blue-800 mb-4">
            Der komplette Vertrag mit allen rechtlich relevanten Klauseln, 
            Bestimmungen zu Mietzahlung, Kündigungsfristen, Haftung und weiteren 
            wichtigen Punkten wird nach dem Kauf als PDF zur Verfügung gestellt.
          </p>
          
          <div className="bg-white/70 rounded-lg p-4 mb-4">
            <p className="font-semibold mb-2 text-blue-900">Ihr Vertrag enthält:</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
              <div className="text-left">✓ Mietzins & Zahlungsmodalitäten</div>
              <div className="text-left">✓ Kündigungsbestimmungen</div>
              <div className="text-left">✓ Nutzungszweck & Einschränkungen</div>
              <div className="text-left">✓ Haftung & Instandhaltung</div>
              <div className="text-left">✓ Kautions- & Nebenkostenregelung</div>
              <div className="text-left">✓ Unterschriftenfelder</div>
            </div>
          </div>
          
          <div className="bg-blue-600 text-white rounded-lg p-3">
            <p className="font-semibold text-lg mb-1">Nur 7,90 € für Ihren rechtssicheren {data.garage_type === 'garage' ? 'Garagen' : 'Stellplatz'}-Mietvertrag</p>
            <p className="text-sm opacity-90">✓ Sofortiger PDF-Download ✓ E-Mail-Versand ✓ Rechnung inklusive</p>
          </div>
        </div>
      </div>
    </div>
  )
}
