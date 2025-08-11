// pages/untermietvertrag.js - DEPLOYMENT FIX VERSION
import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { FileText, ArrowLeft, CheckCircle, Download, Mail } from 'lucide-react'
import UntermietvertragForm from '../components/UntermietvertragForm'
import PaymentModule from '../components/modules/PaymentModule'

// ❌ ENTFERNT: Defekte modulare Imports die nicht existieren
// import PricingSection from '../components/shared/PricingSection'
// import { useContractForm } from '../hooks/useContractForm'

export default function UntermietvertragPage() {
  const [currentStep, setCurrentStep] = useState('form') // form, preview, success
  const [paymentResult, setPaymentResult] = useState(null)
  const [contractData, setContractData] = useState({})

  // ❌ ENTFERNT: Defekter modularer Hook
  // const { formData: contractData, selectedAddons, totalPrice, handleInputChange, handleAddonChange, updateFormData } = useContractForm('untermietvertrag', 12.90)

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
    return [] // Erstmal leeres Array
  }

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
                  Anwaltlich geprüft • Sofort verfügbar • 12,90€
                </p>
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

              {/* Contract Preview */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Vertragsvorschau
                </h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700">
                    Ihr Untermietvertrag wird mit den eingegebenen Daten erstellt...
                  </p>
                  {/* Hier würde normalerweise die Vertragsvorschau stehen */}
                </div>
              </div>

              {/* Payment */}
              <PaymentModule
                amount={12.90}
                orderDescription="Untermietvertrag - Rechtssicher & Sofort verfügbar"
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

                <div className="mt-8">
                  <Link
                    href="/"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Zurück zur Übersicht
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
