// pages/untermietvertrag.js - AKTUALISIERTE VERSION
import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { FileText, ArrowLeft, CheckCircle, Download, Mail } from 'lucide-react'
import ContractForm from '../components/UntermietvertragForm'
import ContractPreview from '../components/UntermietvertragPreview'
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
        
        {/* SCHRITT 1: FORMULAR */}
        {currentStep === 'form' && (
          <ContractForm onSubmit={handleFormSubmit} />
        )}
        
        {/* SCHRITT 2: VORSCHAU & PAYMENT */}
        {currentStep === 'preview' && contractData && (
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Preview */}
              <div>
                <div className="mb-4">
                  <button
                    onClick={handleBackToForm}
                    className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Zurück zur Bearbeitung
                  </button>
                </div>
                <ContractPreview data={contractData} />
              </div>
              
              {/* Payment Sidebar */}
              <div className="space-y-6">
                <PaymentModule
                  amount={getPrice()}
                  currency="€"
                  orderDescription="Untermietvertrag - PalWorks"
                  customerEmail={contractData.customer_email}
                  formData={contractData}
                  selectedAddons={getSelectedAddons()}
                  contractType="untermietvertrag"
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                  enabledMethods={['card', 'paypal', 'sofort']}
                  showSecurityBadge={true}
                />
              </div>
            </div>
          </div>
        )}

        {/* SCHRITT 3: SUCCESS */}
        {currentStep === 'success' && paymentResult && contractData && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              
              {/* Success Header */}
              <div className="mb-8">
                <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Ihr Untermietvertrag ist fertig!
                </h1>
                <p className="text-lg text-gray-600">
                  Zahlung erfolgreich • PDF wurde automatisch heruntergeladen
                </p>
              </div>

              {/* Success Details */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                
                {/* Vertragsdetails */}
                <div className="bg-blue-50 rounded-lg p-6 text-left">
                  <h3 className="font-semibold text-blue-900 mb-4">📋 Ihr Vertrag</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Typ:</strong> Untermietvertrag</div>
                    <div><strong>Objekt:</strong> {contractData.property_address}</div>
                    <div><strong>Miete:</strong> {contractData.rent_amount} EUR/Monat</div>
                    <div><strong>Erstellt:</strong> {new Date().toLocaleDateString('de-DE')}</div>
                    {getSelectedAddons().includes('protocol') && (
                      <div><strong>Extras:</strong> Übergabeprotokoll inklusive</div>
                    )}
                  </div>
                </div>

                {/* Zahlungsdetails */}
                <div className="bg-green-50 rounded-lg p-6 text-left">
                  <h3 className="font-semibold text-green-900 mb-4">💳 Zahlungsdetails</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Betrag:</strong> {getPrice()} EUR</div>
                    <div><strong>Zahlungsart:</strong> {paymentResult.paymentMethod || 'Kreditkarte'}</div>
                    <div><strong>Transaktions-ID:</strong> {paymentResult.transactionId}</div>
                    <div><strong>Status:</strong> <span className="text-green-600">Bezahlt</span></div>
                    {contractData.customer_email && (
                      <div><strong>E-Mail:</strong> {contractData.customer_email}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 mb-8">
                
                {/* PDF erneut herunterladen */}
                <button
                  onClick={() => {
                    // PDF erneut generieren und downloaden
                    fetch('/api/generate-pdf', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        formData: contractData,
                        selectedAddons: getSelectedAddons(),
                        contractType: 'untermietvertrag'
                      })
                    })
                    .then(response => response.blob())
                    .then(blob => {
                      const url = window.URL.createObjectURL(blob)
                      const link = document.createElement('a')
                      link.href = url
                      link.download = `untermietvertrag_${new Date().toISOString().slice(0,10)}.pdf`
                      link.click()
                    })
                    .catch(error => {
                      console.error('Download error:', error)
                      alert('Download fehlgeschlagen. Bitte kontaktieren Sie den Support.')
                    })
                  }}
                  className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Download className="h-5 w-5 mr-2" />
                  PDF erneut herunterladen
                </button>

                {/* Neuen Vertrag erstellen */}
                <button
                  onClick={() => {
                    setContractData(null)
                    setPaymentResult(null)
                    setCurrentStep('form')
                  }}
                  className="w-full bg-gray-100 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Neuen Vertrag erstellen
                </button>
              </div>

              {/* Status Checklist */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">✅ Was ist passiert:</h3>
                <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Zahlung erfolgreich verarbeitet
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    PDF automatisch generiert
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Vertrag heruntergeladen
                  </div>
                  {contractData.customer_email && (
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      E-Mail-Kopie versendet
                    </div>
                  )}
                </div>
              </div>

              {/* Email Status */}
              {contractData.customer_email && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
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
        )}
      </main>
    </>
  )
}
