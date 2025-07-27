export default function ContractPreview({ data }) {
  const formatDate = (dateString) => {
    if (!dateString) return '[DATUM]'
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
    return `${data.garage_address || '[ADRESSE]'}, ${data.garage_postal || '[PLZ]'} ${data.garage_city || '[ORT]'}`
  }

  const getMietzeit = () => {
    const startDate = data.lease_start ? formatDate(data.lease_start) : '[MIETBEGINN]'
    
    if (data.garage_lease_type === 'befristet') {
      const endDate = data.lease_end ? formatDate(data.lease_end) : '[MIETENDE]'
      return `Das Mietverhältnis wird für eine feste Laufzeit vom ${startDate} bis zum ${endDate} geschlossen.`
    }
    return `Das Mietverhältnis beginnt am ${startDate}. Es läuft auf unbestimmte Zeit und kann von jedem Teil spätestens am 3. Werktag eines Kalendermonats zum Ablauf des übernächsten Kalendermonats gekündigt werden.`
  }

  // Helper function to display value or blank field
  const displayValue = (value, placeholder = '[_____________]') => {
    return value && value.trim() !== '' ? value : placeholder
  }

  return (
    <div className="bg-white border rounded-lg p-8 max-h-[600px] overflow-y-auto contract-preview">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">MIETVERTRAG FÜR {getObjectType().toUpperCase()}</h2>
      </div>
      
      <div className="space-y-6">
        <div>
          <p className="font-semibold mb-2">Zwischen</p>
          <div className="ml-4 mb-4">
            <p>{displayValue(data.landlord_firstname)} {displayValue(data.landlord_lastname)}</p>
            <p>{displayValue(data.landlord_address)}</p>
            <p>{displayValue(data.landlord_postal)} {displayValue(data.landlord_city)}</p>
            <p className="italic">(Vermieter)</p>
          </div>
          
          <p className="font-semibold mb-2">und</p>
          <div className="ml-4 mb-4">
            <p>{displayValue(data.tenant_firstname, '[VORNAME]')} {displayValue(data.tenant_lastname, '[NACHNAME]')}</p>
            <p>{displayValue(data.tenant_address, '[STRASSE UND HAUSNUMMER]')}</p>
            <p>{displayValue(data.tenant_postal, '[PLZ]')} {displayValue(data.tenant_city, '[ORT]')}</p>
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
          <p className="mb-2">Die Miete beträgt monatlich <strong>{displayValue(data.rent, '[BETRAG]')} EUR</strong></p>
          
          {data.has_utilities && (
            <div className="mb-4">
              <p className="mb-2">
                Daneben ist eine Betriebskostenvorauszahlung für die Betriebskosten im Sinne von § 2 BetrkV zu leisten in Höhe von <strong>{displayValue(data.utilities, '[BETRAG]')} EUR</strong>
              </p>
              <p>Die Abschlagszahlungen auf Betriebskosten werden nach Ablauf des jährlichen Abrechnungszeitraumes abgerechnet.</p>
            </div>
          )}
          
          <p className="mb-2">
            Die Miete ist monatlich im Voraus, spätestens am 3. Werktag eines Monats an den Vermieter durch Überweisung auf folgendes Konto: {displayValue(data.iban, '[IBAN]')}, {displayValue(data.bank, '[BANK]')} zu bezahlen.
          </p>
          
          {data.has_deposit && (
            <p>Der Mieter zahlt bei Übergabe der Schlüssel eine Kaution von <strong>{displayValue(data.deposit, '[BETRAG]')} EUR</strong>. Die Kaution wird verzinslich angelegt.</p>
          )}
        </div>

        {/* Preview-Cutoff Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-lg p-6 text-center my-6">
          <div className="text-4xl mb-3">🔒</div>
          <h3 className="font-semibold text-lg mb-3 text-blue-900">Vollständiger Vertrag nach Kauf</h3>
          <p className="text-blue-800 mb-4">
            Der komplette Vertrag mit allen rechtlich relevanten Klauseln, 
            Bestimmungen zu Mieterhöhung, Kündigungsfristen, Haftung, E-Auto-Regelungen und weiteren 
            wichtigen Punkten wird nach dem Kauf als PDF zur Verfügung gestellt.
          </p>
          
          <div className="bg-white/70 rounded-lg p-4 mb-4">
            <p className="font-semibold mb-2 text-blue-900">Ihr vollständiger Vertrag enthält:</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
              <div className="text-left">✓ § 4 Mieterhöhung</div>
              <div className="text-left">✓ § 5 Nutzungszweck</div>
              <div className="text-left">✓ § 6 E-Autos & Ladestation</div>
              <div className="text-left">✓ § 7 Instandhaltung & Haftung</div>
              <div className="text-left">✓ § 8 Untervermietung</div>
              <div className="text-left">✓ § 9 Beendigung der Mietzeit</div>
              <div className="text-left">✓ § 10 Selbständigkeitsklausel</div>
              <div className="text-left">✓ § 11 Personenmehrheit</div>
              <div className="text-left">✓ § 12 Vertragsänderungen</div>
              <div className="text-left">✓ Unterschriftenfelder</div>
            </div>
          </div>
          
          <div className="bg-blue-600 text-white rounded-lg p-3">
            <p className="font-semibold text-lg mb-1">Nur 7,90 € für Ihren rechtssicheren {data.garage_type === 'garage' ? 'Garagen' : 'Stellplatz'}-Mietvertrag</p>
            <p className="text-sm opacity-90">✓ Sofortiger PDF-Download ✓ E-Mail-Versand ✓ Rechnung inklusive</p>
          </div>
        </div>

        {/* Hinweis zu Blanks */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">💡 Hinweis zu leeren Feldern</h4>
          <p className="text-sm text-yellow-700">
            Felder, die Sie nicht ausgefüllt haben, erscheinen im finalen PDF als Blanks (z.B. [VORNAME]). 
            Diese können Sie handschriftlich ergänzen oder bei einem späteren Vertragsabschluss ausfüllen.
          </p>
        </div>
      </div>
    </div>
  )
}
