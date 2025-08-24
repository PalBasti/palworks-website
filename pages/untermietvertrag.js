// pages/untermietvertrag.js - VOLLSTÄNDIG MIT ALLEN KOMPONENTEN
import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { FileText, ArrowLeft, CheckCircle, Download, Mail, AlertCircle, Edit } from 'lucide-react'
import UntermietvertragForm from '../components/UntermietvertragForm'
import CheckoutSection from '../components/shared/CheckoutSection'
import PricingSection from '../components/shared/PricingSection'
import { useContractForm } from '../hooks/useContractForm'

export default function UntermietvertragPage() {
  const [currentStep, setCurrentStep] = useState('form') // form, preview, success
  const [paymentResult, setPaymentResult] = useState(null)

  // ✅ VERWENDE MODULAREN HOOK
  const {
    formData: contractData,
    selectedAddons,
    totalPrice,
    handleInputChange,
    handleAddonChange,
    updateFormData
  } = useContractForm('untermietvertrag', 12.90)

  // 🔧 FIX: E-Mail-Field-Mapping von billing_email zu customer_email
  const handleFormSubmit = (data) => {
    console.log('📋 Original form data:', data)
    
    // ✅ KRITISCH: E-Mail-Mapping billing_email -> customer_email
    const mappedData = {
      ...data,
      customer_email: data.billing_email || data.customer_email, // Priorität: billing_email
      // Zusätzlich: Backup für verschiedene Namenskonventionen
      customerEmail: data.billing_email || data.customer_email
    }
    
    console.log('📋 Mapped form data with customer_email:', mappedData)
    console.log('🔍 Customer email extracted:', mappedData.customer_email)
    
    updateFormData(mappedData)
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
    return selectedAddons || []
  }

  // 🔍 DEBUG: E-Mail-Adresse für Preview-Anzeige extrahieren
  const getCustomerEmail = () => {
    // Mehrere Fallback-Optionen für E-Mail-Extraktion
    return contractData.customer_email || 
           contractData.customerEmail || 
           contractData.billing_email || 
           'Keine E-Mail-Adresse verfügbar'
  }

  // Addon-Namen für Anzeige in Order Summary
  const getAddonDisplayName = (addonKey) => {
    const addonNames = {
      'explanation': 'Vertragserläuterungen',
      'handover_protocol': 'Übergabeprotokoll',
      'legal_review': 'Anwaltliche Prüfung'
    }
    return addonNames[addonKey] || addonKey
  }

  // Addon-Preise für Order Summary
  const getAddonPrice = (addonKey) => {
    const addonPrices = {
      'explanation': 9.90,
      'handover_protocol': 7.90,
      'legal_review': 29.90
    }
    return addonPrices[addonKey] || 0
  }

  return (
    <>
      <Head>
        <title>Untermietvertrag erstellen - PalWorks</title>
        <meta name="description" content="Rechtssicherer Untermietvertrag für ganze Wohnungen. Optional mit professionellem Übergabeprotokoll." />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Link href="/" className="flex items-center text-blue-600 hover:text-blue-700 mr-4">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Zurück zur Übersicht
                </Link>
                <div className="flex items-center">
                  <FileText className="h-6 w-6 text-blue-600 mr-2" />
                  <h1 className="text-xl font-semibold text-gray-900">Untermietvertrag</h1>
                </div>
              </div>
              
              {/* Step Indicator */}
              <div className="flex items-center space-x-4">
                <div className={`flex items-center ${currentStep === 'form' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === 'form' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    1
                  </div>
                  <span className="ml-2 text-sm font-medium">Formular</span>
                </div>
                <div className="w-8 h-px bg-gray-200"></div>
                <div className={`flex items-center ${currentStep === 'preview' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === 'preview' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium">Vorschau & Zahlung</span>
                </div>
                <div className="w-8 h-px bg-gray-200"></div>
                <div className={`flex items-center ${currentStep === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === 'success' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {currentStep === 'success' ? <CheckCircle className="h-5 w-5" /> : '3'}
                  </div>
                  <span className="ml-2 text-sm font-medium">Fertig</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentStep === 'form' && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Vertragsdaten eingeben
                  </h2>
                  <UntermietvertragForm 
                    onSubmit={handleFormSubmit}
                    initialData={contractData}
                  />
                </div>
              </div>

              {/* Pricing Sidebar */}
              <div className="lg:col-span-1">
                <PricingSection
                  contractType="untermietvertrag"
                  basePrice={12.90}
                  selectedAddons={getSelectedAddons()}
                  onAddonChange={handleAddonChange}
                  totalPrice={totalPrice}
                />
                
                {/* Info-Box für separate Downloads */}
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-900 mb-1">
                        📄 Separate PDF-Downloads
                      </p>
                      <p className="text-amber-800">
                        Jede Zusatzleistung wird als separates PDF-Dokument per E-Mail versendet. 
                        Alle Dokumente enthalten Ihre Vertragsdaten.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'preview' && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Preview */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Vertrag bestellen
                    </h2>
                    <button
                      onClick={handleBackToForm}
                      className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Bearbeiten
                    </button>
                  </div>

                  {/* 🔍 DEBUG: E-Mail-Anzeige zur Verifizierung */}
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-blue-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          E-Mail-Versand an: {getCustomerEmail()}
                        </p>
                        <p className="text-xs text-blue-700">
                          Ihr Vertrag wird nach dem Payment automatisch an diese Adresse gesendet.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contract Summary */}
                  <div className="border rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-gray-900 mb-3">Vertragsinformationen</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vertragstyp:</span>
                        <span className="text-gray-900">Untermietvertrag</span>
                      </div>
                      {contractData.property_address && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Objekt:</span>
                          <span className="text-gray-900">{contractData.property_address}</span>
                        </div>
                      )}
                      {contractData.rent_amount && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Miete:</span>
                          <span className="text-gray-900">{contractData.rent_amount} €</span>
                        </div>
                      )}
                      {contractData.start_date && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mietbeginn:</span>
                          <span className="text-gray-900">
                            {new Date(contractData.start_date).toLocaleDateString('de-DE')}
                          </span>
                        </div>
                      )}
                      {contractData.billing_email && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">E-Mail:</span>
                          <span className="text-gray-900">{contractData.billing_email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Addon Summary */}
                  {getSelectedAddons().length > 0 && (
                    <div className="border rounded-lg p-4 mb-6">
                      <h3 className="font-medium text-gray-900 mb-3">Gewählte Zusatzleistungen</h3>
                      <div className="space-y-2 text-sm">
                        {getSelectedAddons().map(addon => (
                          <div key={addon} className="flex justify-between">
                            <span className="text-gray-600">{getAddonDisplayName(addon)}</span>
                            <span className="text-gray-900">{getAddonPrice(addon).toFixed(2)} €</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Checkout Section mit Stripe CardElement */}
                  <CheckoutSection
                    contractType="untermietvertrag"
                    formData={contractData}
                    selectedAddons={getSelectedAddons()}
                    totalPrice={totalPrice}
                    onPaymentSuccess={(contractId, paymentIntentId) => handlePaymentSuccess({ contractId, paymentIntentId })}
                  />
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Bestellübersicht
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Untermietvertrag</span>
                      <span className="text-gray-900">12,90 €</span>
                    </div>
                    
                    {getSelectedAddons().map(addon => (
                      <div key={addon} className="flex justify-between text-sm">
                        <span className="text-gray-600">+ {getAddonDisplayName(addon)}</span>
                        <span className="text-gray-900">
                          {getAddonPrice(addon).toFixed(2)} €
                        </span>
                      </div>
                    ))}
                    
                    <div className="border-t pt-3">
                      <div className="flex justify-between font-semibold">
                        <span className="text-gray-900">Gesamtsumme</span>
                        <span className="text-blue-600">{totalPrice.toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>

                  {/* Hinweis zu separaten Downloads */}
                  <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-sm">
                      <p className="font-medium text-green-900 mb-1">
                        ✅ Was Sie erhalten:
                      </p>
                      <ul className="text-green-800 space-y-1">
                        <li>• Untermietvertrag (PDF)</li>
                        {getSelectedAddons().includes('explanation') && (
                          <li>• Vertragserläuterungen (separates PDF)</li>
                        )}
                        {getSelectedAddons().includes('handover_protocol') && (
                          <li>• Übergabeprotokoll (separates PDF)</li>
                        )}
                        <li>• E-Mail-Versand inklusive</li>
                        <li>• Sofortiger Download</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'success' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Vielen Dank für Ihre Bestellung!
                </h2>
                
                <p className="text-gray-600 mb-6">
                  Ihr Untermietvertrag wurde erfolgreich erstellt und wird an{' '}
                  <strong>{getCustomerEmail()}</strong> gesendet.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-blue-900 mb-2">Was passiert als nächstes?</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✅ PDF wird automatisch an Ihre E-Mail gesendet</li>
                    <li>✅ Vertrag ist rechtssicher und sofort verwendbar</li>
                    {getSelectedAddons().length > 0 && (
                      <li>✅ Zusatzleistungen als separate PDFs inklusive</li>
                    )}
                    <li>✅ Bei Fragen: support@palworks.de</li>
                  </ul>
                </div>

                {/* Bestellübersicht auf Success-Seite */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Ihre Bestellung:</h3>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Untermietvertrag</span>
                      <span>12,90 €</span>
                    </div>
                    {getSelectedAddons().map(addon => (
                      <div key={addon} className="flex justify-between">
                        <span>{getAddonDisplayName(addon)}</span>
                        <span>{getAddonPrice(addon).toFixed(2)} €</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Gesamt</span>
                      <span>{totalPrice.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 justify-center">
                  <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    Weitere Verträge erstellen
                  </Link>
                  <button
                    onClick={() => {
                      setCurrentStep('form')
                      setPaymentResult(null)
                    }}
                    className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200"
                  >
                    Neuen Vertrag erstellen
                  </button>
                </div>

                {/* Debug Info in Development */}
                {process.env.NODE_ENV === 'development' && paymentResult && (
                  <details className="mt-6 text-left">
                    <summary className="text-sm text-gray-500 cursor-pointer">Debug Info</summary>
                    <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                      {JSON.stringify({ 
                        paymentResult, 
                        contractData: {
                          customer_email: contractData.customer_email,
                          billing_email: contractData.billing_email,
                          selectedAddons
                        }
                      }, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
