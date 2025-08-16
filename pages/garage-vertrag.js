// pages/garage-vertrag.js - 3 SCHRITTE WIE UNTERMIETVERTRAG mit Header
import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Download, FileText, CheckCircle, Info, ArrowLeft } from 'lucide-react'

// ✅ IMPORTS
import GaragenvertragForm from '../components/GaragenvertragForm'
import PaymentModule from '../components/modules/PaymentModule'

export default function GarageVertragPage() {
  // ✅ STATE MANAGEMENT (3 Schritte)
  const [currentStep, setCurrentStep] = useState(0) // 0: form, 1: preview+payment, 2: success
  const [contractData, setContractData] = useState(null)
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // ✅ STEP CONFIGURATION
  const steps = [
    { title: 'Formular', description: 'Daten eingeben' },
    { title: 'Vorschau & Zahlung', description: 'Prüfen & bezahlen' },
    { title: 'Fertig', description: 'Download' }
  ]

  // ✅ HILFSFUNKTIONEN
  const formatName = (data, prefix) => {
    return data[`${prefix}_name`] || `[${prefix.toUpperCase()}_NAME]`
  }

  const formatAddress = (data, prefix) => {
    if (prefix === 'garage' && data.garage_same_address) {
      return formatAddress(data, 'landlord')
    }
    
    if (prefix === 'garage') {
      const address = data.garage_address || '[GARAGE_ADRESSE]'
      const postal = data.garage_postal || '[PLZ]'
      const city = data.garage_city || '[STADT]'
      return `${address}, ${postal} ${city}`
    }
    
    return data[`${prefix}_address`] || `[${prefix.toUpperCase()}_ADRESSE]`
  }

  const calculateTotalPrice = () => {
    if (!contractData) return '7.90'
    
    let total = 7.90 // Basis-Preis
    
    const selectedAddons = contractData.selected_addons || []
    if (selectedAddons.includes('explanations')) total += 9.90
    if (selectedAddons.includes('handover_protocol')) total += 7.90
    
    return total.toFixed(2)
  }

  // ✅ NAVIGATION HANDLER
  const handleFormSubmit = (formData) => {
    console.log('🔍 Garage form submitted:', formData)
    setContractData(formData)
    setCurrentStep(1) // Zu Preview+Payment
  }

  const handleBackToForm = () => {
    setCurrentStep(0)
  }

  const handlePaymentSuccess = async (paymentData) => {
    console.log('✅ Payment erfolgreich:', paymentData)
    
    // PDF generieren falls noch nicht vorhanden
    if (!generatedPdfUrl) {
      await generatePDF()
    }
    
    setCurrentStep(2) // Zu Success
  }

  const handlePaymentError = (error) => {
    console.error('❌ Payment Fehler:', error)
    alert('Zahlung fehlgeschlagen. Bitte versuchen Sie es erneut.')
  }

  // ✅ PDF-GENERIERUNG
  const generatePDF = async () => {
    if (!contractData) return null

    setIsGenerating(true)
    try {
      console.log('🔄 Generiere Garagenvertrag-PDF...')
      
      const { generateAndReturnGaragePDF } = await import('../lib/pdf/garagenvertragGenerator')
      const pdfBlob = await generateAndReturnGaragePDF(contractData, contractData.selected_addons || [], 'blob')
      const url = URL.createObjectURL(pdfBlob)
      setGeneratedPdfUrl(url)
      console.log('✅ Garagenvertrag-PDF generiert')
      return url
    } catch (error) {
      console.error('❌ PDF-Generierung fehlgeschlagen:', error)
      alert('PDF-Generierung fehlgeschlagen. Bitte versuchen Sie es erneut.')
      return null
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Garagenmietvertrag erstellen - PalWorks</title>
        <meta name="description" content="Rechtssicherer Garagenmietvertrag online erstellen. Schnell, günstig und vom Anwalt erstellt." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* ✅ HEADER WIE UNTERMIETVERTRAG */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-5 w-5 mr-2" />
              <FileText className="h-8 w-8 mr-3" />
              <span className="text-2xl font-bold text-gray-900">PalWorks</span>
            </Link>
            <div className="text-right">
              <h1 className="text-xl font-semibold text-gray-900">
                {contractData?.garage_type === 'stellplatz' ? 'Stellplatzmietvertrag' : 'Garagenmietvertrag'}
              </h1>
              <p className="text-sm text-gray-600">Rechtssicher & günstig</p>
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* ✅ STEPS NAVIGATION (3 Schritte) */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-8">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className={`flex items-center ${
                    index === currentStep ? 'text-blue-600' : 
                    index < currentStep ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      index === currentStep ? 'bg-blue-600 text-white' : 
                      index < currentStep ? 'bg-green-500 text-white' : 'bg-gray-200'
                    }`}>
                      {index < currentStep ? '✓' : index + 1}
                    </div>
                    <span className="ml-2 font-medium">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-4 ${
                      index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ✅ SCHRITT 1: FORMULAR */}
          {currentStep === 0 && (
            <div className="bg-white rounded-lg shadow-lg">
              <div className="text-center p-8 border-b">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {contractData?.garage_type === 'stellplatz' ? 
                    '🅿️ Stellplatzmietvertrag erstellen' : 
                    '🚗 Garagenmietvertrag erstellen'
                  }
                </h1>
                <p className="text-gray-600 mb-4">
                  Rechtssicherer {contractData?.garage_type === 'stellplatz' ? 'Stellplatz' : 'Garagen'}mietvertrag 
                  mit allen wichtigen Klauseln
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
                  <p className="text-blue-800 font-medium">
                    ✨ Professioneller Vertrag für nur {calculateTotalPrice()}€!
                  </p>
                </div>
              </div>
              <div className="p-8">
                <GaragenvertragForm onSubmit={handleFormSubmit} />
              </div>
            </div>
          )}

          {/* ✅ SCHRITT 2: VORSCHAU + PAYMENT (KOMBINIERT) */}
          {currentStep === 1 && contractData && (
            <div className="grid lg:grid-cols-2 gap-8">
              
              {/* VORSCHAU */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Vertragsvorschau</h2>
                  <button
                    onClick={handleBackToForm}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Bearbeiten
                  </button>
                </div>

                <p className="text-gray-600 mb-6">
                  Überprüfen Sie Ihren {contractData.garage_type === 'garage' ? 'Garagen' : 'Stellplatz'}mietvertrag vor dem Kauf.
                </p>

                <div className="space-y-6">
                  {/* Vertragsparteien */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">👤 Vermieter</h4>
                      <div className="text-sm space-y-1">
                        <p><strong>Name:</strong> {formatName(contractData, 'landlord')}</p>
                        <p><strong>Adresse:</strong> {formatAddress(contractData, 'landlord')}</p>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">👥 Mieter</h4>
                      <div className="text-sm space-y-1">
                        <p><strong>Name:</strong> {formatName(contractData, 'tenant')}</p>
                        <p><strong>Adresse:</strong> {formatAddress(contractData, 'tenant')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Mietobjekt */}
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {contractData.garage_type === 'garage' ? '🚗 Garage' : '🅿️ Stellplatz'}
                    </h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Adresse:</strong> {formatAddress(contractData, 'garage')}</p>
                      {contractData.garage_number && (
                        <p><strong>Nummer:</strong> {contractData.garage_number}</p>
                      )}
                      <p><strong>Miete:</strong> {contractData.rent}€ monatlich</p>
                      <p><strong>Mietbeginn:</strong> {contractData.start_date}</p>
                    </div>
                  </div>

                  {/* Zusätzliche Services */}
                  {contractData.selected_addons && contractData.selected_addons.length > 0 && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">📋 Zusätzliche Services</h4>
                      <ul className="text-sm space-y-1">
                        {contractData.selected_addons.includes('explanations') && (
                          <li>✅ Rechtliche Erläuterungen (+9.90€)</li>
                        )}
                        {contractData.selected_addons.includes('handover_protocol') && (
                          <li>✅ Übergabeprotokoll (+7.90€)</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                  <p className="text-green-800 font-medium text-sm">
                    ✅ Alle Ihre Eingaben wurden übernommen und sind im Vertrag enthalten!
                  </p>
                </div>
              </div>

              {/* PAYMENT */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Zahlung</h2>
                <p className="text-gray-600 mb-6">
                  Schließen Sie Ihren Kauf ab und erhalten Sie sofort Ihren rechtssicheren Vertrag.
                </p>

                <PaymentModule
                  contractData={contractData}
                  totalAmount={parseFloat(calculateTotalPrice())}
                  contractType="garagenvertrag"
                  selectedAddons={contractData.selected_addons || []}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </div>
            </div>
          )}

          {/* ✅ SCHRITT 3: SUCCESS */}
          {currentStep === 2 && contractData && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-6xl mb-6">🎉</div>
                
                <h3 className="text-2xl font-bold text-green-600 mb-4">
                  Vielen Dank für Ihren Kauf!
                </h3>
                <p className="text-gray-600 mb-6">
                  Ihr {contractData.garage_type === 'garage' ? 'Garagen' : 'Stellplatz'}mietvertrag 
                  wurde erfolgreich erstellt und per E-Mail an 
                  <strong className="ml-1">{contractData.customer_email}</strong> gesendet.
                </p>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <Info className="h-5 w-5 text-blue-600 mr-2" />
                    <h4 className="font-semibold text-gray-900">Was Sie jetzt tun sollten:</h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-2 text-left max-w-md mx-auto">
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">1.</span>
                      Überprüfen Sie alle Angaben im E-Mail-Anhang
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">2.</span>
                      Drucken Sie den Vertrag für die Unterschriften aus
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

                {/* PDF-Download als Fallback */}
                {generatedPdfUrl && (
                  <div className="mb-6">
                    <a
                      href={generatedPdfUrl}
                      download={`${contractData.garage_type === 'garage' ? 'Garagenmietvertrag' : 'Stellplatzmietvertrag'}_${new Date().toISOString().slice(0,10)}.pdf`}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors inline-flex items-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Vertrag als PDF herunterladen
                    </a>
                  </div>
                )}

                {!generatedPdfUrl && (
                  <button
                    onClick={generatePDF}
                    disabled={isGenerating}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors inline-flex items-center mb-6"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        PDF wird erstellt...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        PDF erstellen
                      </>
                    )}
                  </button>
                )}

                <div className="border-t pt-6 mt-6">
                  <Link
                    href="/"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    ← Zurück zur Hauptseite
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
