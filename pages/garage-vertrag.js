import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { FileText, ArrowLeft, Download, CheckCircle, Info, AlertTriangle } from 'lucide-react'
import ContractForm from '../components/ContractForm'
import ContractPreview from '../components/ContractPreview'

export default function GarageVertrag() {
  const [currentStep, setCurrentStep] = useState('form') // 'form', 'preview', 'download'
  const [contractData, setContractData] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleFormSubmit = (data) => {
    console.log('Form submitted with data:', data)
    setContractData(data)
    setCurrentStep('preview')
  }

  const handleBackToForm = () => {
    setCurrentStep('form')
  }

  const handleGenerateContract = async () => {
    setIsGenerating(true)
    
    // Simulation der PDF-Generierung für Testzeitraum
    setTimeout(() => {
      // Hier würde normalerweise die echte PDF-Generierung mit Backend stattfinden
      const downloadData = {
        formData: contractData,
        includeExplanations: contractData.include_explanations,
        timestamp: new Date().toISOString(),
        version: 'test-period',
        regularPrice: contractData.include_explanations ? 12.80 : 7.90,
        actualPrice: 0.00, // Testzeitraum
        contractType: 'garage-stellplatz'
      }
      
      // Simulation des PDF-Downloads (in Produktion wäre das eine echte PDF)
      const jsonBlob = new Blob([JSON.stringify(downloadData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(jsonBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `garage-mietvertrag-${contractData.include_explanations ? 'mit-erlaeuterungen-' : ''}${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setIsGenerating(false)
      setCurrentStep('download')
    }, 2000)
  }

  const formatAddress = (data, prefix) => {
    const address = data[`${prefix}_address`]
    const postal = data[`${prefix}_postal`]
    const city = data[`${prefix}_city`]
    
    if (!address && !postal && !city) return 'Nicht angegeben'
    return `${address || ''}, ${postal || ''} ${city || ''}`.replace(/^,\s*|\s*,$/g, '')
  }

  const formatName = (data, prefix) => {
    const firstName = data[`${prefix}_firstname`] || ''
    const lastName = data[`${prefix}_lastname`] || ''
    
    if (!firstName && !lastName) return 'Nicht angegeben'
    return `${firstName} ${lastName}`.trim()
  }

  const getPrice = () => {
    const basePrice = 7.90
    const explanationsPrice = 4.90
    return contractData?.include_explanations ? basePrice + explanationsPrice : basePrice
  }

  return (
    <>
      <Head>
        <title>Garage/Stellplatz-Mietvertrag erstellen - PalWorks</title>
        <meta name="description" content="Erstellen Sie einen rechtssicheren Garage- oder Stellplatz-Mietvertrag in wenigen Minuten. Vom Anwalt entwickelt." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Header mit Navigation */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center text-blue-600 hover:text-blue-700 transition-colors">
              <ArrowLeft className="h-5 w-5 mr-2" />
              <FileText className="h-8 w-8 mr-3" />
              <span className="text-2xl font-bold text-gray-900">PalWorks</span>
            </Link>
            <div className="text-right">
              <h1 className="text-xl font-semibold text-gray-900">Garage/Stellplatz-Mietvertrag</h1>
              <p className="text-sm text-gray-600">Rechtssicher und professionell</p>
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header Bereich */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🚗 Garage/Stellplatz-Mietvertrag erstellen
            </h2>
            
            {/* Testzeitraum Banner */}
            <div className="bg-green-100 border border-green-400 rounded-lg p-4 mb-6 inline-block">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800 font-semibold">
                  🎉 Testzeitraum aktiv - Komplett kostenlos!
                </span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Inklusive optionaler rechtlicher Erläuterungen - normalerweise bis zu 12,80 €
              </p>
            </div>

            {/* Progress Steps */}
            <div className="flex justify-center items-center space-x-4 mb-8">
              <div className={`flex items-center ${currentStep === 'form' ? 'text-blue-600' : currentStep === 'preview' || currentStep === 'download' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep === 'form' ? 'bg-blue-600 text-white' : currentStep === 'preview' || currentStep === 'download' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                  1
                </div>
                <span className="ml-2 font-medium">Daten eingeben</span>
              </div>
              
              <div className={`w-8 h-0.5 ${currentStep === 'preview' || currentStep === 'download' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
              
              <div className={`flex items-center ${currentStep === 'preview' ? 'text-blue-600' : currentStep === 'download' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep === 'preview' ? 'bg-blue-600 text-white' : currentStep === 'download' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                  2
                </div>
                <span className="ml-2 font-medium">Vorschau</span>
              </div>
              
              <div className={`w-8 h-0.5 ${currentStep === 'download' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
              
              <div className={`flex items-center ${currentStep === 'download' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep === 'download' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                  3
                </div>
                <span className="ml-2 font-medium">Download</span>
              </div>
            </div>
          </div>

          {/* Schritt 1: Formular */}
          {currentStep === 'form' && (
            <div className="bg-white rounded-lg shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <Info className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">Vertragsdaten eingeben</h3>
                </div>
                <p className="text-gray-600 mt-2">
                  Füllen Sie die notwendigen Informationen aus. Felder mit <span className="text-red-500">*</span> sind verpflichtend, 
                  alle anderen können leer gelassen werden (erscheinen dann als Blanks im PDF).
                </p>
              </div>
              <ContractForm onSubmit={handleFormSubmit} />
            </div>
          )}

          {/* Schritt 2: Vorschau */}
          {currentStep === 'preview' && contractData && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <FileText className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">Vertragsvorschau</h3>
                </div>
                <button
                  onClick={handleBackToForm}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  ← Zurück zum Formular
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                
                {/* Vermieter */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    👤 Vermieter
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {formatName(contractData, 'landlord')}</p>
                    <p><strong>Adresse:</strong> {formatAddress(contractData, 'landlord')}</p>
                  </div>
                </div>

                {/* Mieter */}
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    👥 Mieter
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {formatName(contractData, 'tenant')}</p>
                    <p><strong>Adresse:</strong> {formatAddress(contractData, 'tenant')}</p>
                  </div>
                </div>

                {/* Mietobjekt */}
                <div className="bg-yellow-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    🚗 Mietobjekt
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Art:</strong> {contractData.garage_type === 'garage' ? 'Garage' : 'Stellplatz'}</p>
                    <p><strong>Nummer:</strong> {contractData.garage_number || 'Nicht angegeben'}</p>
                    <p><strong>Adresse:</strong> {contractData.garage_same_address ? formatAddress(contractData, 'landlord') : formatAddress(contractData, 'garage')}</p>
                    <p><strong>Vertrag:</strong> {contractData.garage_lease_type === 'unbefristet' ? 'Unbefristet' : 'Befristet'}</p>
                    <p><strong>Schlüssel:</strong> {contractData.garage_keys || '1'}</p>
                  </div>
                </div>

                {/* Konditionen */}
                <div className="bg-purple-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    💰 Konditionen
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Grundmiete:</strong> {contractData.rent ? `${contractData.rent} €` : 'Nicht angegeben'}</p>
                    {contractData.has_utilities && (
                      <p><strong>Betriebskosten:</strong> {contractData.utilities ? `${contractData.utilities} €` : 'Nicht angegeben'}</p>
                    )}
                    {contractData.has_deposit && (
                      <p><strong>Kaution:</strong> {contractData.deposit ? `${contractData.deposit} €` : 'Nicht angegeben'}</p>
                    )}
                    <p><strong>Mietbeginn:</strong> {contractData.lease_start || 'Nicht angegeben'}</p>
                    {contractData.garage_lease_type === 'befristet' && (
                      <p><strong>Mietende:</strong> {contractData.lease_end || 'Nicht angegeben'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bankdaten */}
              {(contractData.iban || contractData.bank) && (
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    🏦 Bankdaten
                  </h4>
                  <div className="space-y-2 text-sm">
                    {contractData.iban && <p><strong>IBAN:</strong> {contractData.iban}</p>}
                    {contractData.bank && <p><strong>Bank:</strong> {contractData.bank}</p>}
                  </div>
                </div>
              )}

              {/* Zusatzprodukte */}
              {contractData.include_explanations && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-orange-600 mr-2" />
                    <h4 className="font-semibold text-gray-900">Rechtliche Erläuterungen inklusive</h4>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">
                    Ihr Vertrag wird um umfassende rechtliche Erläuterungen ergänzt, die folgende Themen abdecken:
                  </p>
                  <ul className="text-sm text-gray-700 mt-2 list-disc list-inside space-y-1">
                    <li>Rechtliche Einordnung des Garagenmietvertrags</li>
                    <li>Mieterhöhungsverfahren und Besonderheiten</li>
                    <li>E-Mobilität und Wallbox-Installation</li>
                    <li>Kautionsregelung bei Garagen/Stellplätzen</li>
                    <li>Umsatzsteuerliche Behandlung</li>
                  </ul>
                </div>
              )}

              {/* Preisübersicht */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  🎉 Testzeitraum - Kostenübersicht
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Garage/Stellplatz Mietvertrag:</span>
                    <span className="line-through text-gray-500">7,90 €</span>
                  </div>
                  {contractData.include_explanations && (
                    <div className="flex justify-between text-sm">
                      <span>Rechtliche Erläuterungen:</span>
                      <span className="line-through text-gray-500">4,90 €</span>
                    </div>
                  )}
                  <hr className="border-green-200" />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Ihr Preis (Testzeitraum):</span>
                    <span className="text-green-600">0,00 € (KOSTENLOS)</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    * Regulärer Preis nach Testzeitraum: {getPrice().toFixed(2)} €
                  </p>
                </div>
              </div>

              {/* ContractPreview Komponente */}
              <div className="border-t pt-8">
                <h4 className="font-semibold text-gray-900 mb-4">Vertrags-Details:</h4>
                <ContractPreview data={contractData} />
              </div>

              {/* Aktions-Buttons */}
              <div className="flex justify-center space-x-4 mt-8 pt-6 border-t">
                <button
                  onClick={handleBackToForm}
                  className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Bearbeiten
                </button>
                <button
                  onClick={handleGenerateContract}
                  disabled={isGenerating}
                  className="px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium transition-colors flex items-center disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Wird erstellt...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      🎉 Kostenlos herunterladen
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Schritt 3: Download erfolgreich */}
          {currentStep === 'download' && (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="mb-6">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Vertrag erfolgreich erstellt!
                </h3>
                <p className="text-gray-600">
                  Ihr Garage/Stellplatz-Mietvertrag wurde erfolgreich generiert und heruntergeladen.
                  {contractData?.include_explanations && " Inklusive rechtlicher Erläuterungen."}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-center mb-4">
                  <Info className="h-5 w-5 text-blue-600 mr-2" />
                  <h4 className="font-semibold text-gray-900">Was Sie jetzt tun sollten:</h4>
                </div>
                <ul className="text-sm text-gray-700 space-y-2 text-left max-w-md mx-auto">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">1.</span>
                    Überprüfen Sie alle Angaben im heruntergeladenen Dokument
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">2.</span>
                    Drucken Sie den Vertrag aus oder verwenden Sie ihn digital
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">3.</span>
                    Lassen Sie beide Parteien den Vertrag unterzeichnen
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">4.</span>
                    Bewahren Sie eine Kopie für Ihre Unterlagen auf
                  </li>
                </ul>
              </div>

              {contractData?.include_explanations && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center mb-2">
                    <FileText className="h-5 w-5 text-orange-600 mr-2" />
                    <span className="font-semibold text-gray-900">Rechtliche Erläuterungen erhalten</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Sie haben auch die rechtlichen Erläuterungen erhalten. Diese enthalten wichtige 
                    Informationen zu Ihren Rechten und Pflichten als Vermieter/Mieter.
                  </p>
                </div>
              )}

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setCurrentStep('form')
                    setContractData(null)
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Neuen Vertrag erstellen
                </button>
                <Link 
                  href="/"
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors inline-flex items-center"
                >
                  Zur Startseite
                </Link>
              </div>

              {/* Feedback Bereich */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-4">
                  Wie war Ihre Erfahrung mit PalWorks?
                </p>
                <div className="flex justify-center space-x-2">
                  <button className="text-2xl hover:scale-110 transition-transform">😊</button>
                  <button className="text-2xl hover:scale-110 transition-transform">😐</button>
                  <button className="text-2xl hover:scale-110 transition-transform">😞</button>
                </div>
              </div>
            </div>
          )}

          {/* Informations-Sidebar für Form und Preview */}
          {currentStep !== 'download' && (
            <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Info className="h-5 w-5 text-blue-600 mr-2" />
                Wichtige Informationen
              </h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl mb-2">⚖️</div>
                  <h4 className="font-semibold text-gray-900 mb-2">Rechtssicher</h4>
                  <p className="text-sm text-gray-600">
                    Von einem Anwalt entwickelt und an aktuelles deutsches Recht angepasst.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl mb-2">🚀</div>
                  <h4 className="font-semibold text-gray-900 mb-2">Schnell & Einfach</h4>
                  <p className="text-sm text-gray-600">
                    In wenigen Minuten zum fertigen Vertrag - keine Vorkenntnisse nötig.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl mb-2">🔒</div>
                  <h4 className="font-semibold text-gray-900 mb-2">Datenschutz</h4>
                  <p className="text-sm text-gray-600">
                    Ihre Daten werden verschlüsselt übertragen und nicht dauerhaft gespeichert.
                  </p>
                </div>
              </div>

              {/* Testzeitraum Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-800 mb-1">Testzeitraum - Befristetes Angebot</h4>
                      <p className="text-sm text-green-700">
                        Während des Testzeitraums sind alle Verträge und Zusatzprodukte komplett kostenlos. 
                        Nach dem Testzeitraum gelten die regulären Preise ab 7,90 €.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
