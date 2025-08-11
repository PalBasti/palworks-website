// pages/untermietvertrag.js - KORRIGIERTE VERSION mit fixer Preisberechnung

import { useState, useCallback, useMemo } from 'react'
import { Stepper } from '../components/ui/stepper'
import { Button } from '../components/ui/button'
import { CheckCircle, FileText, Mail, AlertCircle } from 'lucide-react'
import UntermietvertragForm from '../components/UntermietvertragForm'
import PaymentModule from '../components/modules/PaymentModule'
import PricingSection from '../components/shared/PricingSection'

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

  // Basispreis für Untermietverträge
  const basePrice = 12.90

  // Addon-Handler mit useCallback für Performance
  const handleAddonChange = useCallback((newAddons) => {
    setSelectedAddons(newAddons)
  }, [])

  // Gesamtpreis berechnen - useMemo für Performance
  const totalPrice = useMemo(() => {
    // Diese Funktion wird in PricingSection berechnet, hier nur als Fallback
    return basePrice + (selectedAddons?.length || 0) * 5 // Fallback-Berechnung
  }, [selectedAddons])

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
  }

  const handlePaymentError = (error) => {
    console.error('Payment error:', error)
    // Error-Handling kann hier erweitert werden
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

            {/* Rechte Spalte: Preisübersicht (1 Spalte) - FIXED POSITIONING */}
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
              {/* Vertragsdaten Zusammenfassung */}
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
                  {contractData.newsletter_signup && (
                    <div className="col-span-2">
                      <span className="text-sm text-blue-600">
                        ✉️ Sie erhalten auch unseren Newsletter mit nützlichen Rechtstipps.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Zusätzliche Addon-Auswahl für Payment-Schritt */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  🛒 Noch weitere Services hinzufügen?
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Sie können auch jetzt noch zusätzliche Services zu Ihrem Vertrag hinzufügen.
                </p>
                
                {/* Addon-Auswahl Container */}
                <PricingSection
                  contractType="untermietvertrag"
                  basePrice={basePrice}
                  selectedAddons={selectedAddons}
                  onAddonChange={handleAddonChange}
                  className="border-0 shadow-none bg-gray-50"
                />
              </div>
            </div>

            {/* Rechte Spalte: Payment Module (1 Spalte) - FIXED */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <PaymentModule
                  contractType="untermietvertrag"
                  formData={contractData}
                  selectedAddons={getSelectedAddons()}
                  amount={totalPrice.toFixed(2)}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                  customerEmail={contractData.customer_email}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Schritt 3: Erfolgreich */}
        {currentStep === 'success' && paymentResult && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Vertrag erfolgreich erstellt!
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Ihr Untermietvertrag wurde erfolgreich generiert und ist bereit zum Download.
              </p>
              
              {paymentResult.pdfUrl && (
                <div className="space-y-4">
                  <Button
                    onClick={() => window.open(paymentResult.pdfUrl, '_blank')}
                    className="w-full sm:w-auto"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    PDF herunterladen
                  </Button>
                  
                  {contractData.customer_email && (
                    <p className="text-sm text-gray-600 flex items-center justify-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Eine Kopie wurde an {contractData.customer_email} gesendet
                    </p>
                  )}
                </div>
              )}

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Wichtige Hinweise:</h3>
                <ul className="text-sm text-blue-800 text-left space-y-1">
                  <li>• Bewahren Sie den Vertrag sicher auf</li>
                  <li>• Alle Parteien sollten eine Kopie erhalten</li>
                  <li>• Bei Fragen kontaktieren Sie unseren Support</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
