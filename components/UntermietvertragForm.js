// pages/untermietvertrag.js - KORRIGIERTE VERSION MIT MODULAREM SYSTEM
import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { FileText, ArrowLeft, CheckCircle, Download, Mail } from 'lucide-react'
import UntermietvertragForm from '../components/UntermietvertragForm'
import PaymentModule from '../components/modules/PaymentModule'

export default function UntermietvertragPage() {
  const [currentStep, setCurrentStep] = useState('form') // form, preview, success
  const [contractData, setContractData] = useState(null)
  const [paymentResult, setPaymentResult] = useState(null)

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

  const getPrice = () => {
    let basePrice = 12.90
    if (contractData?.selected_addons?.includes('protocol')) {
      basePrice += 4.90
    }
    return basePrice.toFixed(2)
  }

  const getSelectedAddons = () => {
    return contractData?.selected_addons || []
  }

  return (
    <>
      <Head>
        <title>Untermietvertrag erstellen - PalWorks</title>
        <meta name="description" content="Rechtssicherer Untermietvertrag für ganze Wohnungen. Optional mit professionellem Übergabeprotokoll." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-5 w-5 mr-2" />
              <FileText className="h-8 w-8 mr-3" />
              <span className="text-2xl font-bold text-gray-900">PalWorks</span>
            </Link>
            <div className="text-right">
              <h1 className="text-xl font-semibold text-gray-900">Untermietvertrag</h1>
              <p className="text-sm text-gray-600">
                {currentStep === 'form' && 'Schritt 1: Daten eingeben'}
                {currentStep === 'preview' && 'Schritt 2: Vorschau & Bezahlung'}
                {currentStep === 'success' && '✅ Erfolgreich erstellt'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-screen bg-gray-50">
        {/* Schritt 1: Formular */}
        {currentStep === 'form' && (
          <div className="py-8">
            <UntermietvertragForm onSubmit={handleFormSubmit} />
          </div>
        )}

        {/* Schritt 2: Vorschau & Bezahlung */}
        {currentStep === 'preview' && contractData && (
          <div className="py-8">
            <div className="max-w-6xl mx-auto px-4">
              
              {/* Zurück Button */}
              <div className="mb-6">
                <button
                  onClick={handleBackToForm}
                  className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Zurück zum Formular
                </button>
              </div>

              {/* Hauptinhalt */}
              <div className="grid lg:grid-cols-2 gap-8">
                
                {/* Linke Spalte: Vertragsvorschau */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Vertragsvorschau</h2>
                  <p className="text-gray-600 mb-6">
                    Überprüfen Sie Ihren Untermietvertrag vor dem Kauf. Der vollständige Vertrag wird nach der Zahlung als PDF bereitgestellt.
                  </p>
                  
                  {/* Vertragsdetails */}
                  <div className="space-y-4 text-sm">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Vertragsparteien</h4>
                      <div className="space-y-1">
                        <p><span className="font-medium">Untervermieter:</span> {contractData.landlord_name || '[Wird ergänzt]'}</p>
                        <p><span className="font-medium">Untermieter:</span> {contractData.tenant_name || '[Wird ergänzt]'}</p>
                      </div>
                    </div>
                    
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Mietobjekt</h4>
                      <div className="space-y-1">
                        <p><span className="font-medium">Adresse:</span> {contractData.property_address || '[Wird ergänzt]'}</p>
                        <p><span className="font-medium">PLZ/Ort:</span> {contractData.property_postal || '[PLZ]'} {contractData.property_city || '[Ort]'}</p>
                        {contractData.property_sqm && <p><span className="font-medium">Größe:</span> ca. {contractData.property_sqm} qm</p>}
                      </div>
                    </div>
                    
                    <div className="border-l-4 border-yellow-500 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Mietkonditionen</h4>
                      <div className="space-y-1">
                        <p><span className="font-medium">Monatsmiete:</span> {contractData.rent_amount ? `${contractData.rent_amount} €` : '[Wird ergänzt]'}</p>
                        <p><span className="font-medium">Mietbeginn:</span> {contractData.start_date ? new Date(contractData.start_date).toLocaleDateString('de-DE') : '[Wird ergänzt]'}</p>
                        <p><span className="font-medium">Vertragsart:</span> {contractData.contract_type === 'unlimited' ? 'Unbefristet' : 'Befristet'}</p>
                        {contractData.contract_type === 'fixed_term' && contractData.end_date && (
                          <p><span className="font-medium">Mietende:</span> {new Date(contractData.end_date).toLocaleDateString('de-DE')}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Zusätzliche Services */}
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold text-gray-900 mb-3">Enthaltene Services</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span className="text-sm">Rechtssicherer Untermietvertrag</span>
                      </div>
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span className="text-sm">Sofortiger PDF-Download</span>
                      </div>
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span className="text-sm">E-Mail-Versand an {contractData.customer_email}</span>
                      </div>
                      {contractData.selected_addons?.includes('protocol') && (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          <span className="text-sm">Professionelles Übergabeprotokoll</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hinweis zu leeren Feldern */}
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">💡 Hinweis zu leeren Feldern</h4>
                    <p className="text-sm text-yellow-700">
                      Felder, die Sie nicht ausgefüllt haben, erscheinen im finalen PDF als Blanks zum 
                      handschriftlichen Ausfüllen oder späteren Ergänzen.
                    </p>
                  </div>
                </div>

                {/* Rechte Spalte: Payment Module */}
                <div>
                  <PaymentModule
                    contractType="untermietvertrag"
                    formData={contractData}
                    selectedAddons={getSelectedAddons()}
                    totalAmount={getPrice()}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                    customerEmail={contractData.customer_email}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schritt 3: Erfolgreich */}
        {currentStep === 'success' && paymentResult && (
          <div className="py-16">
            <div className="max-w-2xl mx-auto px-4 text-center">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Vertrag erfolgreich erstellt!
                  </h2>
                  <p className="text-lg text-gray-600">
                    Ihr Untermietvertrag wurde erfolgreich generiert und ist bereit zum Download.
                  </p>
                </div>

                {/* Erfolgs-Details */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Zahlung erfolgreich verarbeitet
                  </div>
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    PDF automatisch generiert
                  </div>
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Vertrag heruntergeladen
                  </div>
                  {contractData.customer_email && (
                    <div className="flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      E-Mail-Kopie versendet
                    </div>
                  )}
                </div>

                {/* Email Status */}
                {contractData.customer_email && (
                  <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center text-blue-800">
                      <Mail className="h-5 w-5 mr-2" />
                      <span className="font-medium">
                        Eine Kopie wurde an {contractData.customer_email} gesendet
                      </span>
                    </div>
                    <p className="text-blue-600 text-sm mt-2">
                      Prüfen Sie auch Ihren Spam-Ordner, falls die E-Mail nicht ankommt.
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Neuen Vertrag erstellen
                  </button>
                  
                  <Link
                    href="/"
                    className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center"
                  >
                    Zurück zur Startseite
                  </Link>
                </div>

                {/* Support Info */}
                <div className="mt-8 pt-6 border-t text-sm text-gray-600">
                  <p>
                    <strong>Benötigen Sie Hilfe?</strong><br />
                    Kontaktieren Sie uns unter <a href="mailto:support@palworks.de" className="text-blue-600 hover:underline">support@palworks.de</a>
                  </p>
                  <p className="mt-2">
                    <strong>Wichtiger Hinweis:</strong> Bewahren Sie Ihre PDF-Datei sicher auf. 
                    Ein erneuter Download ist nur über diese Erfolgsseite möglich.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
