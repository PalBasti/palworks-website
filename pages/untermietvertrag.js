// pages/untermietvertrag.js - PHASE 1 INTEGRATION
import { useState, useCallback } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { FileText, ArrowLeft, CheckCircle, Download, Mail } from 'lucide-react'
import UntermietvertragForm from '../components/UntermietvertragForm'
import PaymentModule from '../components/modules/PaymentModule'

// ✅ NEU: Modulare Komponente für Phase 1
import PricingSection from '../components/shared/PricingSection'

export default function UntermietvertragPage() {
  const [currentStep, setCurrentStep] = useState('form') // form, preview, success
  const [paymentResult, setPaymentResult] = useState(null)
  const [contractData, setContractData] = useState({})
  
  // ✅ NEU: Addon-Management für Phase 1
  const [selectedAddons, setSelectedAddons] = useState([])

  // ✅ NEU: Addon-Handler für Phase 1
  const handleAddonChange = useCallback((newAddons) => {
    setSelectedAddons(newAddons)
    console.log('📦 Addons changed:', newAddons)
  }, [])

  // ✅ NEU: Dynamische Preisberechnung
  const calculateTotalPrice = () => {
    const basePrice = 12.90
    const addonPrices = {
      'explanation': 9.90,
      'handover_protocol': 7.90,
      'legal_review': 29.90
    }
    
    const addonTotal = selectedAddons.reduce((sum, addonKey) => {
      return sum + (addonPrices[addonKey] || 0)
    }, 0)
    
    return basePrice + addonTotal
  }

  const handleFormSubmit = (data) => {
    console.log('📋 Form submitted with data:', data)
    setContractData(data)
    setCurrentStep('preview')
  }

  const handleBackToForm = () => {
    setCurrentStep('form')
  }

  const handlePaymentSuccess = (result) => {
    console.log('💳 Payment successful:', result)
    setPaymentResult(result)
    setCurrentStep('success')
  }

  const handlePaymentError = (error) => {
    console.error('❌ Payment failed:', error)
    alert('Zahlung fehlgeschlagen: ' + error.message)
  }

  const getSelectedAddons = () => {
    return selectedAddons
  }

  // ✅ NEU: Gesamtpreis für PaymentModule
  const totalPrice = calculateTotalPrice()

  return (
    <>
      <Head>
        <title>Untermietvertrag erstellen - PalWorks</title>
        <meta name="description" content="Rechtssicherer Untermietvertrag für ganze Wohnungen. Optional mit professionellem Übergabeprotokoll." />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Zurück zur Übersicht
              </Link>
              <div className="flex items-center space-x-4">
                <FileText className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">Untermietvertrag</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Form Step */}
          {currentStep === 'form' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Rechtssicherer Untermietvertrag erstellen
                </h2>
                <p className="text-lg text-gray-600">
                  Anwaltlich geprüft • Sofort verfügbar • Ab 12,90€
                </p>
                
                {/* ✅ NEU: Preisvorschau auf Form-Step */}
                {selectedAddons.length > 0 && (
                  <div className="mt-4 inline-flex items-center bg-blue-50 text-blue-800 px-4 py-2 rounded-lg text-sm">
                    💡 Gesamtpreis mit Zusatzleistungen: <span className="font-bold ml-1">{totalPrice.toFixed(2)}€</span>
                  </div>
                )}
              </div>

              {/* ✅ NEU: Modulare PricingSection auf Form-Step */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    🎯 Vertrag + Zusatzleistungen
                  </h3>
                  <PricingSection
                    contractType="untermietvertrag"
                    basePrice={12.90}
                    selectedAddons={selectedAddons}
                    onAddonChange={handleAddonChange}
                  />
                </div>
              </div>

              <UntermietvertragForm 
                onSubmit={handleFormSubmit}
              />
            </div>
          )}

          {/* Preview Step */}
          {currentStep === 'preview' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleBackToForm}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Zurück zum Formular
                </button>
                <h2 className="text-2xl font-bold text-gray-900">
                  Vertrag prüfen & bezahlen
                </h2>
              </div>

              {/* ✅ ERWEITERT: Contract Preview mit Addon-Info */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  📋 Ihre Bestellung
                </h3>
                
                <div className="space-y-4">
                  {/* Basis-Vertrag */}
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <div>
                      <span className="font-medium text-blue-900">Untermietvertrag</span>
                      <p className="text-sm text-blue-700">Rechtssicherer Basisvertrag</p>
                    </div>
                    <span className="font-bold text-blue-900">12,90€</span>
                  </div>

                  {/* ✅ NEU: Gewählte Addons anzeigen */}
                  {selectedAddons.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Gewählte Zusatzleistungen:</h4>
                      {selectedAddons.map(addonKey => {
                        const addonDetails = {
                          'explanation': { name: 'Vertragsberatung', price: 9.90 },
                          'handover_protocol': { name: 'Übergabeprotokoll', price: 7.90 },
                          'legal_review': { name: 'Anwaltliche Prüfung', price: 29.90 }
                        }
                        const addon = addonDetails[addonKey]
                        
                        return addon ? (
                          <div key={addonKey} className="flex justify-between items-center p-3 bg-green-50 rounded">
                            <div>
                              <span className="font-medium text-green-900">+ {addon.name}</span>
                              <p className="text-sm text-green-700">Zusatzleistung</p>
                            </div>
                            <span className="font-bold text-green-900">+{addon.price.toFixed(2)}€</span>
                          </div>
                        ) : null
                      })}
                    </div>
                  )}

                  {/* Gesamtsumme */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Gesamtsumme</span>
                      <span className="text-2xl font-bold text-blue-600">{totalPrice.toFixed(2)}€</span>
                    </div>
                  </div>
                </div>

                {/* Vertragsdaten-Vorschau */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium text-gray-900 mb-3">Ihre Daten:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p><span className="font-medium">Untervermieter:</span> {contractData.untervermieter_name || '[Wird ergänzt]'}</p>
                      <p><span className="font-medium">Untermieter:</span> {contractData.untermieter_name || '[Wird ergänzt]'}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">E-Mail:</span> {contractData.tenant_email || '[Wird ergänzt]'}</p>
                      <p><span className="font-medium">Miete:</span> {contractData.miete_betrag ? `${contractData.miete_betrag}€` : '[Wird ergänzt]'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ✅ ERWEITERT: Payment mit dynamischem Preis */}
              <PaymentModule
                amount={totalPrice}
                orderDescription={`Untermietvertrag${selectedAddons.length > 0 ? ' + Zusatzleistungen' : ''}`}
                customerEmail={contractData.tenant_email || ''}
                formData={contractData}
                selectedAddons={getSelectedAddons()}
                contractType="untermietvertrag"
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                className="max-w-md mx-auto"
              />
            </div>
          )}

          {/* Success Step */}
          {currentStep === 'success' && (
            <div className="text-center space-y-8">
              <div className="max-w-md mx-auto">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Vertrag erfolgreich erstellt!
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Ihr rechtssicherer Untermietvertrag wurde erstellt und per E-Mail versendet.
                </p>

                {/* ✅ NEU: Erfolgs-Details mit Addons */}
                <div className="bg-green-50 rounded-lg p-6 mb-8">
                  <h3 className="font-semibold text-green-900 mb-3">📄 Ihre Dokumente</h3>
                  <div className="space-y-2 text-sm text-green-800">
                    <div className="flex items-center justify-center">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>Untermietvertrag.pdf</span>
                    </div>
                    {selectedAddons.includes('handover_protocol') && (
                      <div className="flex items-center justify-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Übergabeprotokoll.pdf</span>
                      </div>
                    )}
                    {selectedAddons.includes('explanation') && (
                      <div className="flex items-center justify-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Vertragserläuterungen.pdf</span>
                      </div>
                    )}
                    {selectedAddons.includes('legal_review') && (
                      <div className="flex items-center justify-center">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>Anwaltliche Beratung kontaktiert Sie</span>
                      </div>
                    )}
                  </div>
                </div>

                {paymentResult?.pdfUrl && (
                  <div className="space-y-4">
                    <a
                      href={paymentResult.pdfUrl}
                      download
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Vertrag herunterladen
                    </a>
                  </div>
                )}

                <div className="mt-8 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center text-green-800">
                    <Mail className="h-5 w-5 mr-2" />
                    <span className="text-sm">
                      Der Vertrag wurde an Ihre E-Mail-Adresse gesendet
                    </span>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <button
                    onClick={() => {
                      setCurrentStep('form')
                      setContractData({})
                      setSelectedAddons([]) // ✅ NEU: Addons zurücksetzen
                      setPaymentResult(null)
                    }}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Neuen Vertrag erstellen
                  </button>
                  
                  <Link
                    href="/"
                    className="block text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Zurück zur Übersicht
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ✅ NEU: Development Info (nur in Development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-lg shadow-lg max-w-xs">
            <h4 className="font-bold text-sm mb-1">🧪 Phase 1 Debug</h4>
            <div className="text-xs space-y-1">
              <div>Step: {currentStep}</div>
              <div>Addons: {selectedAddons.join(', ') || 'Keine'}</div>
              <div>Preis: {totalPrice.toFixed(2)}€</div>
              <div>Base: 12.90€ + {(totalPrice - 12.90).toFixed(2)}€</div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
