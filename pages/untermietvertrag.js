// pages/untermietvertrag.js - ERWEITERT MIT SEPARATEN DOWNLOADS
import { useState, useCallback, useMemo } from 'react'
import { Stepper } from '../components/ui/stepper'
import { Button } from '../components/ui/button'
import { CheckCircle, FileText, Mail, AlertCircle } from 'lucide-react'
import UntermietvertragForm from '../components/UntermietvertragForm'
import PaymentModule from '../components/modules/PaymentModule'
import PricingSection from '../components/shared/PricingSection'
// ✅ NEUE IMPORTS FÜR SEPARATE DOWNLOADS
import { DownloadIntegrationWrapper } from '../components/DownloadIntegrationWrapper'

const steps = [
  { title: 'Vertragsdaten', description: 'Formular ausfüllen' },
  { title: 'Prüfung & Zahlung', description: 'Daten prüfen und bezahlen' },
  { title: 'Fertig', description: 'Vertrag erhalten' }
]

export default function UntermietvertragPage() {
  const [currentStep, setCurrentStep] = useState('form')
  const [contractData, setContractData] = useState({})
  const [paymentResult, setPaymentResult] = useState(null)
  const [selectedAddons, setSelectedAddons] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  // ✅ NEUE STATES FÜR DOWNLOAD-MANAGEMENT
  const [downloadStatus, setDownloadStatus] = useState(null)
  const [showDownloads, setShowDownloads] = useState(false)

  // Basispreis für Untermietverträge
  const basePrice = 12.90

  // Addon-Handler mit useCallback für Performance
  const handleAddonChange = useCallback((newAddons) => {
    setSelectedAddons(newAddons)
  }, [])

  // Gesamtpreis berechnen - useMemo für Performance
  const totalPrice = useMemo(() => {
    // Mock-Preise für die Addons
    const addonPrices = {
      'explanation': 9.90,
      'protocol': 9.90,
      'uebergabeprotokoll': 9.90,
      'rechtsberatung': 29.90
    }
    
    const addonTotal = selectedAddons.reduce((sum, addonKey) => {
      return sum + (addonPrices[addonKey] || 0)
    }, 0)
    
    return basePrice + addonTotal
  }, [selectedAddons, basePrice])

  // Formular Submit Handler
  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true)
      setContractData(formData)
      setCurrentStep('payment')
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePaymentSuccess = (result) => {
    setPaymentResult(result)
    setCurrentStep('success')
    // ✅ DOWNLOADS NACH ERFOLGREICHEM PAYMENT ANZEIGEN
    setShowDownloads(true)
  }

  const handlePaymentError = (error) => {
    console.error('Payment error:', error)
    // Error-Handling kann hier erweitert werden
  }

  // ✅ NEUE DOWNLOAD-EVENT-HANDLER
  const handleDownloadStart = () => {
    setDownloadStatus('downloading')
    console.log('🔍 Downloads started for Untermietvertrag')
  }

  const handleDownloadComplete = (result) => {
    setDownloadStatus('completed')
    console.log('✅ Downloads completed:', result)
    // Optional: Success-Nachricht anzeigen
  }

  const handleDownloadError = (error) => {
    setDownloadStatus('error')
    console.error('❌ Download failed:', error)
  }

  const getSelectedAddons = () => {
    return selectedAddons || []
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Untermietvertrag erstellen
          </h1>
          <p className="text-lg text-gray-600">
            Rechtssicher • Anwaltlich geprüft • Sofort verfügbar
          </p>
        </div>

        {/* Progress Stepper */}
        <div className="mb-8">
          <Stepper 
            steps={steps} 
            currentStep={currentStep === 'form' ? 0 : currentStep === 'payment' ? 1 : 2} 
          />
        </div>

        {/* Schritt 1: Formular */}
        {currentStep === 'form' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Linke Spalte: Formular (2 Spalten) */}
            <div className="lg:col-span-2">
              <UntermietvertragForm
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
                initialData={contractData}
              />
            </div>

            {/* Rechte Spalte: Preisübersicht (1 Spalte) */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <PricingSection
                  contractType="untermietvertrag"
                  basePrice={basePrice}
                  selectedAddons={selectedAddons}
                  onAddonChange={handleAddonChange}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Schritt 2: Payment */}
        {currentStep === 'payment' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Linke Spalte: Vertragsdaten + Addons (2 Spalten) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bestehende Vertragsdaten Zusammenfassung */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📋 Ihre Vertragsdaten
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Untermieter:</span>
                    <p className="text-gray-900">
                      {contractData.tenant_first_name} {contractData.tenant_last_name}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Hauptmieter:</span>
                    <p className="text-gray-900">
                      {contractData.landlord_first_name} {contractData.landlord_last_name}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Mietobjekt:</span>
                    <p className="text-gray-900">
                      {contractData.property_address}, {contractData.property_postal} {contractData.property_city}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Miete:</span>
                    <p className="text-gray-900">
                      {contractData.rent_amount}€ monatlich
                    </p>
                  </div>
                </div>

                {/* ✅ NEUE MODULARE PRICING SECTION */}
                <div className="mt-6 pt-6 border-t">
                  <PricingSection
                    contractType="untermietvertrag"
                    basePrice={12.90}
                    selectedAddons={selectedAddons}
                    onAddonChange={handleAddonChange}
                    showTitle={false}
                    compact={true}
                  />
                </div>
              </div>

              {/* PaymentModule */}
              <PaymentModule
                contractType="untermietvertrag"
                contractData={contractData}
                selectedAddons={getSelectedAddons()}
                totalAmount={totalPrice}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            </div>

            {/* Rechte Spalte: Was Sie erhalten */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    📄 Das erhalten Sie
                  </h3>
                  <div className="space-y-3">
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
                      <span className="text-sm">E-Mail-Versand</span>
                    </div>
                    {selectedAddons?.includes('protocol') && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span className="text-sm">Übergabeprotokoll</span>
                      </div>
                    )}
                    {selectedAddons?.includes('explanation') && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span className="text-sm">Vertragserläuterungen</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Gesamtpreis:</strong> {totalPrice.toFixed(2)}€
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schritt 3: Success mit Downloads */}
        {currentStep === 'success' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🎉 Zahlung erfolgreich!
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Ihr Untermietvertrag wurde erfolgreich erstellt und bezahlt.
              </p>

              {/* ✅ NEUE DOWNLOAD-INTEGRATION */}
              {showDownloads && (
                <div className="mb-8">
                  <DownloadIntegrationWrapper
                    formData={contractData}
                    selectedAddons={selectedAddons}
                    contractType="untermietvertrag"
                    customerEmail={contractData.customer_email}
                    totalPrice={totalPrice}
                    onDownloadStart={handleDownloadStart}
                    onDownloadComplete={handleDownloadComplete}
                    onDownloadError={handleDownloadError}
                    className="max-w-lg mx-auto"
                  />
                </div>
              )}

              {/* Download Status Anzeige */}
              {downloadStatus && (
                <div className="mb-6">
                  {downloadStatus === 'downloading' && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800">📄 Downloads werden vorbereitet...</p>
                    </div>
                  )}
                  {downloadStatus === 'completed' && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800">✅ Alle Dokumente erfolgreich heruntergeladen!</p>
                    </div>
                  )}
                  {downloadStatus === 'error' && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800">❌ Download fehlgeschlagen. Bitte versuchen Sie es erneut.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Details */}
              {paymentResult && (
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">📋 Zahlungsdetails</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Betrag:</strong> {totalPrice.toFixed(2)}€</p>
                    <p><strong>E-Mail:</strong> {contractData.customer_email}</p>
                    <p><strong>Dokumente:</strong> {1 + (selectedAddons?.length || 0)} PDF(s)</p>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="flex items-center"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Weiteren Vertrag erstellen
                </Button>
                <Button
                  onClick={() => window.location.href = '/kontakt'}
                  className="flex items-center"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Support kontaktieren
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
