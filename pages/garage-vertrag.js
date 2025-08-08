// pages/garage-vertrag.js - ÜBERARBEITET MIT E-MAIL + ADDONS
import { useState } from 'react'
import Head from 'next/head'
import { Download, FileText, CheckCircle, Info, ArrowLeft } from 'lucide-react'

// ✅ KOMPONENTEN IMPORTIEREN
import GaragenvertragForm from '../components/GaragenvertragForm'
import PaymentModule from '../components/modules/PaymentModule'
import ContractPreview from '../components/ContractPreview'

// ✅ PDF-GENERATOR IMPORTIEREN
import { generateGaragePDF } from '../lib/pdf/garagenvertragGenerator'

export default function GarageVertragPage() {
  // ✅ STATE MANAGEMENT
  const [currentStep, setCurrentStep] = useState('form') // 'form', 'preview', 'payment', 'success'
  const [contractData, setContractData] = useState(null)
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)

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

  // ✅ FORM SUBMIT HANDLER
  const handleFormSubmit = (formData) => {
    console.log('🔍 Garage form submitted:', formData)
    setContractData(formData)
    setCurrentStep('preview')
  }

  // ✅ ZURÜCK ZUM FORMULAR
  const handleBackToForm = () => {
    setCurrentStep('form')
  }

  // ✅ WEITER ZUR ZAHLUNG
  const handleProceedToPayment = () => {
    setCurrentStep('payment')
  }

  // ✅ PDF-GENERIERUNG
  const generatePDF = async () => {
    if (!contractData) return null

    setIsGenerating(true)
    try {
      console.log('🔄 Generiere Garagenvertrag-PDF...')
      
      const pdfBlob = await generateGaragePDF(
        contractData, 
        contractData.selected_addons || [], 
        'blob'
      )
      
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

  // ✅ PAYMENT SUCCESS HANDLER
  const handlePaymentSuccess = async (paymentData) => {
    console.log('✅ Payment erfolgreich:', paymentData)
    
    // PDF generieren falls noch nicht vorhanden
    if (!generatedPdfUrl) {
      await generatePDF()
    }
    
    setCurrentStep('success')
  }

  // ✅ PAYMENT ERROR HANDLER
  const handlePaymentError = (error) => {
    console.error('❌ Payment Fehler:', error)
    alert('Zahlung fehlgeschlagen. Bitte versuchen Sie es erneut.')
  }

  // ✅ PREISBERECHNUNG
  const calculateTotalPrice = () => {
    if (!contractData) return '7.90'
    
    let total = 7.90 // Garagenvertrag Basispreis
    
    if (contractData.selected_addons) {
      contractData.selected_addons.forEach(addonId => {
        switch(addonId) {
          case 'explanations':
            total += 9.90
            break
          case 'handover_protocol':
            total += 7.90
            break
        }
      })
    }
    
    return total.toFixed(2)
  }

  return (
    <>
      <Head>
        <title>
          {contractData?.garage_type === 'garage' ? 'Garagenmietvertrag' : 'Stellplatzmietvertrag'} erstellen - PalWorks
        </title>
        <meta name="description" content="Erstellen Sie rechtssichere Garagen- oder Stellplatzmietverträge mit automatischem E-Mail-Versand und professionellen Zusatzservices." />
        <meta name="keywords" content="Garagenmietvertrag, Stellplatzmietvertrag, DIY Vertrag, Mietvertrag erstellen" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          
          {/* ✅ PROGRESS INDICATOR */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className={`flex items-center ${currentStep === 'form' ? 'text-blue-600' : currentStep === 'preview' || currentStep === 'payment' || currentStep === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep === 'form' ? 'bg-blue-600 text-white' : currentStep === 'preview' || currentStep === 'payment' || currentStep === 'success' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                  1
                </div>
                <span className="ml-2 font-medium">Daten eingeben</span>
              </div>
              
              <div className={`w-8 h-0.5 ${currentStep === 'preview' || currentStep === 'payment' || currentStep === 'success' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
              
              <div className={`flex items-center ${currentStep === 'preview' ? 'text-blue-600' : currentStep === 'payment' || currentStep === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep === 'preview' ? 'bg-blue-600 text-white' : currentStep === 'payment' || currentStep === 'success' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                  2
                </div>
                <span className="ml-2 font-medium">Vorschau</span>
              </div>
              
              <div className={`w-8 h-0.5 ${currentStep === 'payment' || currentStep === 'success' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
              
              <div className={`flex items-center ${currentStep === 'payment' ? 'text-blue-600' : currentStep === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep === 'payment' ? 'bg-blue-600 text-white' : currentStep === 'success' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                  3
                </div>
                <span className="ml-2 font-medium">Bezahlen</span>
              </div>
              
              <div className={`w-8 h-0.5 ${currentStep === 'success' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
              
              <div className={`flex items-center ${currentStep === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep === 'success' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                  4
                </div>
                <span className="ml-2 font-medium">Erhalten</span>
              </div>
            </div>
          </div>

          {/* ✅ SCHRITT 1: FORMULAR */}
          {currentStep === 'form' && (
            <div className="max-w-6xl mx-auto">
              <GaragenvertragForm onSubmit={handleFormSubmit} />
            </div>
          )}

          {/* ✅ SCHRITT 2: VORSCHAU */}
          {currentStep === 'preview' && contractData && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <FileText className="h-6 w-6 text-blue-600 mr-2" />
                    <h3 className="text-xl font-semibold text-gray-900">Vertragsvorschau</h3>
                  </div>
                  <button
                    onClick={handleBackToForm}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Zurück zum Formular
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
                      <p><strong>Adresse:</strong> {formatAddress(contractData, 'garage')}</p>
                      <p><strong>Vertrag:</strong> {contractData.garage_lease_type === 'unbefristet' ? 'Unbefristet' : `Befristet bis ${contractData.end_date}`}</p>
                    </div>
                  </div>

                  {/* Finanzen */}
                  <div className="bg-green-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      💰 Konditionen
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Miete:</strong> {contractData.rent ? `${contractData.rent} EUR/Monat` : '[BETRAG] EUR/Monat'}</p>
                      {contractData.has_utilities && (
                        <p><strong>Betriebskosten:</strong> {contractData.utilities} EUR/Monat</p>
                      )}
                      {contractData.has_deposit && (
                        <p><strong>Kaution:</strong> {contractData.deposit} EUR</p>
                      )}
                      <p><strong>Schlüssel:</strong> {contractData.garage_keys || '1'} Stück</p>
                    </div>
                  </div>
                </div>

                {/* Addons-Übersicht */}
                {contractData.selected_addons && contractData.selected_addons.length > 0 && (
                  <div className="bg-purple-50 rounded-lg p-6 mb-8">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      📋 Zusätzliche Services
                    </h4>
                    <div className="space-y-2 text-sm">
                      {contractData.selected_addons.includes('explanations') && (
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          <span>Rechtliche Erläuterungen (+9,90 EUR)</span>
                        </div>
                      )}
                      {contractData.selected_addons.includes('handover_protocol') && (
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          <span>Übergabeprotokoll für Garage (+7,90 EUR)</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* E-Mail-Hinweis */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <strong>E-Mail-Versand:</strong> Ihr fertiger Vertrag wird automatisch an 
                      <strong className="ml-1">{contractData.customer_email}</strong> gesendet.
                      {contractData.newsletter_signup && (
                        <div className="mt-1">Sie erhalten auch unseren Newsletter mit nützlichen Rechtstipps.</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preisübersicht */}
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h4 className="font-semibold text-gray-900 mb-4">💰 Preisübersicht</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>{contractData.garage_type === 'garage' ? 'Garagenmietvertrag' : 'Stellplatzmietvertrag'}:</span>
                      <span>7,90 EUR</span>
                    </div>
                    {contractData.selected_addons?.includes('explanations') && (
                      <div className="flex justify-between">
                        <span>Rechtliche Erläuterungen:</span>
                        <span>9,90 EUR</span>
                      </div>
                    )}
                    {contractData.selected_addons?.includes('handover_protocol') && (
                      <div className="flex justify-between">
                        <span>Übergabeprotokoll:</span>
                        <span>7,90 EUR</span>
                      </div>
                    )}
                    <div className="border-t border-gray-300 pt-2 flex justify-between font-semibold text-lg">
                      <span>Gesamtpreis:</span>
                      <span>{calculateTotalPrice()} EUR</span>
                    </div>
                    <div className="text-xs text-gray-600">inkl. 19% MwSt.</div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-between">
                  <button
                    onClick={handleBackToForm}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Bearbeiten
                  </button>
                  
                  <button
                    onClick={handleProceedToPayment}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center"
                  >
                    Zur Zahlung
                    <FileText className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ✅ SCHRITT 3: PAYMENT */}
          {currentStep === 'payment' && contractData && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Zahlung abschließen</h3>
                  <p className="text-gray-600">
                    Ihr {contractData.garage_type === 'garage' ? 'Garagen' : 'Stellplatz'}mietvertrag 
                    für {calculateTotalPrice()} EUR
                  </p>
                </div>

                <PaymentModule
                  contractData={contractData}
                  totalAmount={parseFloat(calculateTotalPrice())}
                  contractType="garagenvertrag"
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setCurrentStep('preview')}
                    className="text-gray-600 hover:text-gray-800 text-sm"
                  >
                    ← Zurück zur Vorschau
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ✅ SCHRITT 4: SUCCESS */}
          {currentStep === 'success' && contractData && (
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
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                        Generiere PDF...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        PDF generieren
                      </>
                    )}
                  </button>
                )}

                <div className="pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Fragen? Kontaktieren Sie uns unter{' '}
                    <a href="mailto:support@palworks.de" className="text-blue-600 hover:underline">
                      support@palworks.de
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
