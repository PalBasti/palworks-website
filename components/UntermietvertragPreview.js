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
            {data.property_number && <p>Whg-Nr.: {data.property_
