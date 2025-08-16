// pages/garage-vertrag.js - ERWEITERT MIT E-MAIL-INTEGRATION
import { useState } from 'react'
import Head from 'next/head'
import { Download, FileText, CheckCircle, Info, ArrowLeft, Mail } from 'lucide-react'

// ✅ IMPORTS - GaragenvertragForm bereits vorhanden
import GaragenvertragForm from '../components/GaragenvertragForm'
import PaymentModule from '../components/modules/PaymentModule'

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

  // ✅ FORM SUBMIT HANDLER - ERWEITERT MIT E-MAIL-VALIDATION
  const handleFormSubmit = (formData) => {
    console.log('🔍 Garage form submitted:', formData)
    
    // ✅ E-MAIL-VALIDATION (wie bei Untermietvertrag)
    if (!formData.customer_email || !formData.customer_email.includes('@')) {
      alert('Bitte geben Sie eine gültige E-Mail-Adresse für die Vertragszustellung ein.')
      return
    }
    
    // ✅ DATEN ERWEITERN mit wichtigen Feldern
    const enrichedData = {
      ...formData,
      // E-Mail-Integration
      customer_email: formData.customer_email,
      billing_email: formData.customer_email, // Kompatibilität mit PaymentModule
      // Contract-Type für E-Mail-Template
      contract_type: 'garagenvertrag',
      // Addons für PDF-Generation  
      selected_addons: formData.selected_addons || [],
      // Preisberechnung
      total_amount: parseFloat(calculateTotalPrice(formData))
    }
    
    console.log('📧 E-Mail wird gesendet an:', enrichedData.customer_email)
    console.log('📋 Gewählte Addons:', enrichedData.selected_addons)
    console.log('💰 Gesamtpreis:', enrichedData.total_amount)
    
    setContractData(enrichedData)
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

  // ✅ PREISBERECHNUNG - ERWEITERT FÜR ADDONS
  const calculateTotalPrice = (data = contractData) => {
    if (!data) return '7.90'
    
    let total = 7.90 // Garagenvertrag Basispreis
    
    // ✅ Addon-Preise hinzufügen
    if (data.selected_addons && Array.isArray(data.selected_addons)) {
      data.selected_addons.forEach(addonKey => {
        switch(addonKey) {
          case 'explanations':
            total += 9.90
            break
          case 'handover_protocol':
            total += 7.90
            break
          case 'legal_review':
            total += 29.90
            break
          default:
            console.log('Unknown addon:', addonKey)
        }
      })
    }
    
    return total.toFixed(2)
  }

  // ✅ PDF-GENERIERUNG - ERWEITERT MIT ADDON-SUPPORT
  const generatePDF = async () => {
    if (!contractData) return null

    setIsGenerating(true)
    try {
      console.log('🔄 Generiere Garagenvertrag-PDF...')
      console.log('📧 E-Mail:', contractData.customer_email)
      console.log('📋 Addons:', contractData.selected_addons)
      
      // Versuche spezifischen Garage-Generator
      try {
        const { generateAndReturnGaragePDF } = await import('../lib/pdf/garagenvertragGenerator')
        const pdfBlob = await generateAndReturnGaragePDF(
          contractData, 
          contractData.selected_addons || [], 
          'blob'
        )
        const url = URL.createObjectURL(pdfBlob)
        setGeneratedPdfUrl(url)
        console.log('✅ Garagenvertrag-PDF mit Addons generiert')
        return url
      } catch (generatorError) {
        console.warn('⚠️ Garagenvertrag-Generator nicht verfügbar, verwende Fallback')
        // Fallback auf Untermietvertrag-Generator
        const { generateAndReturnPDF } = await import('../lib/pdf/untermietvertragGenerator')
        const pdfBlob = await generateAndReturnPDF(contractData, contractData.selected_addons || [], 'blob')
        const url = URL.createObjectURL(pdfBlob)
        setGeneratedPdfUrl(url)
        console.log('✅ Fallback-PDF generiert')
        return url
      }
      
    } catch (error) {
      console.error('❌ PDF-Generierung fehlgeschlagen:', error)
      // Nicht kritisch - E-Mail-Versand funktioniert trotzdem
      return null
    } finally {
      setIsGenerating(false)
    }
  }

  // ✅ PAYMENT SUCCESS HANDLER - UNVERÄNDERT
  const handlePaymentSuccess = async (paymentData) => {
    console.log('✅ Payment erfolgreich:', paymentData)
    
    // PDF generieren falls noch nicht vorhanden
    if (!generatedPdfUrl) {
      await generatePDF()
    }
    
    setCurrentStep('success')
  }

  // ✅ PAYMENT ERROR HANDLER - UNVERÄNDERT
  const handlePaymentError = (error) => {
    console.error('❌ Payment Fehler:', error)
    alert('Zahlung fehlgeschlagen. Bitte versuchen Sie es erneut.')
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
          
          {/* ✅ PROGRESS INDICATOR - UNVERÄNDERT */}
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

          {/* ✅ SCHRITT 1: FORMULAR - UNVERÄNDERT */}
          {currentStep === 'form' && (
            <div className="max-w-6xl mx-auto">
              <GaragenvertragForm onSubmit={handleFormSubmit} />
            </div>
          )}

          {/* ✅ SCHRITT 2: VORSCHAU - ERWEITERT MIT E-MAIL-ANZEIGE */}
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

                {/* ✅ NEU: Addons-Übersicht - ERWEITERT */}
                {contractData.selected_addons && contractData.selected_addons.length > 0 && (
                  <div className="bg-purple-50 rounded-lg p-6 mb-8">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      📋 Zusätzliche Services
                    </h4>
                    <div className="space-y-2 text-sm">
                      {contractData.selected_addons.includes('explanations') && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                            <span>Rechtliche Erläuterungen</span>
                          </div>
                          <span className="font-medium text-purple-600">+9,90 EUR</span>
                        </div>
                      )}
                      {contractData.selected_addons.includes('handover_protocol') && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                            <span>Übergabeprotokoll für Garage</span>
                          </div>
                          <span className="font-medium text-purple-600">+7,90 EUR</span>
                        </div>
                      )}
                      {contractData.selected_addons.includes('legal_review') && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                            <span>Anwaltliche Prüfung</span>
                          </div>
                          <span className="font-medium text-purple-600">+29,90 EUR</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ✅ NEU: E-Mail-Hinweis - WIE BEI UNTERMIETVERTRAG */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <strong>📧 E-Mail-Zustellung:</strong> Ihr fertiger Vertrag wird automatisch an 
                      <strong className="ml-1">{contractData.customer_email}</strong> gesendet.
                      {contractData.newsletter_signup && (
                        <div className="mt-1">✓ Sie erhalten auch unseren Newsletter mit nützlichen Rechtstipps.</div>
                      )}
                      <div className="mt-2 text-xs text-blue-600">
                        ✅ Sofortiger Versand nach Zahlung • 📱 Auch Spam-Ordner prüfen
                      </div>
                    </div>
                  </div>
                </div>

                {/* ✅ ERWEITERTE Preisübersicht */}
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    💰 Preisübersicht
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>{contractData.garage_type === 'garage' ? 'Garagenmietvertrag' : 'Stellplatzmietvertrag'}:</span>
                      <span>7,90 EUR</span>
                    </div>
                    {contractData.selected_addons?.includes('explanations') && (
                      <div className="flex justify-between">
                        <span>• Rechtliche Erläuterungen:</span>
                        <span>9,90 EUR</span>
                      </div>
                    )}
                    {contractData.selected_addons?.includes('handover_protocol') && (
                      <div className="flex justify-between">
                        <span>• Übergabeprotokoll:</span>
                        <span>7,90 EUR</span>
                      </div>
                    )}
                    {contractData.selected_addons?.includes('legal_review') && (
                      <div className="flex justify-between">
                        <span>• Anwaltliche Prüfung:</span>
                        <span>29,90 EUR</span>
                      </div>
                    )}
                    <div className="border-t border-gray-300 pt-2 flex justify-between font-semibold text-lg">
                      <span>Gesamtpreis:</span>
                      <span className="text-green-600">{calculateTotalPrice()} EUR</span>
                    </div>
                    <div className="text-xs text-gray-600">inkl. 19% MwSt. • Sofortiger PDF-Download</div>
                  </div>
                </div>

                {/* Buttons - UNVERÄNDERT */}
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

          {/* ✅ SCHRITT 3: PAYMENT - ERWEITERT MIT E-MAIL-ANZEIGE */}
          {currentStep === 'payment' && contractData && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Zahlung abschließen</h3>
                  <p className="text-gray-600 mb-4">
                    Ihr {contractData.garage_type === 'garage' ? 'Garagen' : 'Stellplatz'}mietvertrag 
                    für {calculateTotalPrice()} EUR
                  </p>
                  
                  {/* ✅ NEU: E-Mail-Bestätigung vor Payment */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-center text-sm text-blue-800">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>📧 Automatischer Versand an: <strong>{contractData.customer_email}</strong></span>
                    </div>
                  </div>
                </div>

                <PaymentModule
                  contractData={{
                    ...contractData,
                    // ✅ E-Mail-Mapping für PaymentModule
                    customer_email: contractData.customer_email,
                    billing_email: contractData.customer_email,
                    // ✅ Contract-Type für korrekte E-Mail-API
                    contract_type: 'garagenvertrag',
                    // ✅ Addons für PDF-Generation
                    selected_addons: contractData.selected_addons || []
                  }}
                  totalAmount={parseFloat(calculateTotalPrice())}
                  contractType="garagenvertrag"  // ✅ Wichtig für send-contract-email.js
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

          {/* ✅ SCHRITT 4: SUCCESS - ERWEITERT MIT E-MAIL-BESTÄTIGUNG */}
          {currentStep === 'success' && contractData && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-6xl mb-6">🎉</div>
                
                <h3 className="text-2xl font-bold text-green-600 mb-4">
                  Vielen Dank für Ihren Kauf!
                </h3>
                
                {/* ✅ NEU: E-Mail-Bestätigung */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <p className="text-green-800 font-medium">
                      Ihr {contractData.garage_type === 'garage' ? 'Garagen' : 'Stellplatz'}mietvertrag wurde erfolgreich erstellt!
                    </p>
                  </div>
                  <div className="text-sm text-green-700 space-y-1">
                    <div className="flex items-center justify-center">
                      <Mail className="h-4 w-4 mr-1" />
                      <span>Automatisch gesendet an: <strong>{contractData.customer_email}</strong></span>
                    </div>
                    <p className="text-xs text-green-600">
                      📧 Prüfen Sie auch Ihren Spam-Ordner • ⏱️ Zustellung binnen 2 Minuten
                    </p>
                  </div>
                </div>

                {/* ✅ NEU: Addon-Bestätigung */}
                {contractData.selected_addons && contractData.selected_addons.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center justify-center">
                      <FileText className="h-4 w-4 mr-2" />
                      📋 Zusätzlich in Ihrer E-Mail enthalten:
                    </h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      {contractData.selected_addons.includes('explanations') && (
                        <div className="flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          <span>✓ Rechtliche Erläuterungen als separates PDF</span>
                        </div>
                      )}
                      {contractData.selected_addons.includes('handover_protocol') && (
                        <div className="flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          <span>✓ Übergabeprotokoll für Ihre Garage</span>
                        </div>
                      )}
                      {contractData.selected_addons.includes('legal_review') && (
                        <div className="flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          <span>✓ Anwaltliche Prüfung (wird separat bearbeitet)</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Handlungsempfehlungen */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <Info className="h-5 w-5 text-blue-600 mr-2" />
                    <h4 className="font-semibold text-gray-900">Was Sie jetzt tun sollten:</h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-2 text-left max-w-md mx-auto">
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2 font-medium">1.</span>
                      E-Mail öffnen und PDF-Anhang herunterladen
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2 font-medium">2.</span>
                      Vertrag ausdrucken (alle Seiten)
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2 font-medium">3.</span>
                      Beide Parteien unterschreiben lassen
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2 font-medium">4.</span>
                      Je eine Kopie für Vermieter und Mieter
                    </li>
                  </ul>
                </div>

                {/* ✅ PDF-Download als Fallback */}
                {generatedPdfUrl && (
                  <div className="mb-6">
                    <a
                      href={generatedPdfUrl}
                      download={`${contractData.garage_type === 'garage' ? 'Garagenmietvertrag' : 'Stellplatzmietvertrag'}_${new Date().toISOString().slice(0,10)}.pdf`}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors inline-flex items-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Vertrag als PDF herunterladen (Backup)
                    </a>
                    <p className="text-xs text-gray-600 mt-2">
                      Falls Sie die E-Mail nicht erhalten haben
                    </p>
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
                        PDF als Backup generieren
                      </>
                    )}
                  </button>
                )}

                {/* ✅ NEU: Neuen Vertrag erstellen */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setCurrentStep('form')
                      setContractData(null)
                      setGeneratedPdfUrl(null)
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm underline flex items-center justify-center"
                  >
                    ✨ Neuen Vertrag erstellen
                  </button>
                </div>

                {/* Kontakt & Support */}
                <div className="mt-6">
                  <p className="text-sm text-gray-600">
                    Fragen oder Probleme? Kontaktieren Sie uns unter{' '}
                    <a href="mailto:support@palworks.de" className="text-blue-600 hover:underline font-medium">
                      support@palworks.de
                    </a>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    📞 Telefonisch erreichbar: Mo-Fr 9-17 Uhr
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
