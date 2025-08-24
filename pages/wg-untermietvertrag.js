import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { FileText, ArrowLeft, Check, X, Download, Mail, CreditCard } from 'lucide-react'
import CheckoutSection from '../components/shared/CheckoutSection'

// Import der Components (diese sollten separat in /components/ existieren)
import WGUntermietvertragForm from '../components/WGUntermietvertragForm'
import WGUntermietvertragPreview from '../components/WGUntermietvertragPreview'

export default function WGUntermietvertrag() {
  const [currentStep, setCurrentStep] = useState('form') // 'form', 'preview'
  const [contractData, setContractData] = useState(null)

  const handleFormSubmit = (data) => {
    setContractData(data)
    setCurrentStep('preview')
  }

  const handleBackToForm = () => {
    setCurrentStep('form')
  }

  const getTotalPrice = () => {
    if (!contractData) return 9.90
    let total = 9.90
    if (contractData.include_protocol) {
      total += 3.90
    }
    return total
  }

  return (
    <>
      <Head>
        <title>WG-Untermietvertrag erstellen - PalWorks</title>
        <meta name="description" content="Rechtssicherer Untermietvertrag für einzelne Zimmer in Wohngemeinschaften. Schnell, günstig und vom Anwalt erstellt." />
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
              <h1 className="text-xl font-semibold text-gray-900">WG-Untermietvertrag</h1>
              <p className="text-sm text-gray-600">Rechtssicher & günstig</p>
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Steps Navigation */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-8">
              <div className={`flex items-center ${currentStep === 'form' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep === 'form' ? 'bg-blue-600 text-white' : contractData ? 'bg-green-500 text-white' : 'bg-gray-200'
                }`}>
                  {contractData ? '✓' : '1'}
                </div>
                <span className="ml-2 font-medium">Daten eingeben</span>
              </div>
              <div className={`flex items-center ${currentStep === 'preview' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                  2
                </div>
                <span className="ml-2 font-medium">Vorschau & Kauf</span>
              </div>
            </div>
          </div>

          {/* Form Step */}
          {currentStep === 'form' && (
            <div className="bg-white rounded-lg shadow-lg">
              <div className="text-center p-8 border-b">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">WG-Untermietvertrag erstellen</h1>
                <p className="text-gray-600 mb-4">Rechtssicherer Untermietvertrag für einzelne Zimmer in Wohngemeinschaften</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
                  <p className="text-blue-800 font-medium">
                    ✨ Jetzt mit detailliertem Formular und allen WG-spezifischen Feldern!
                  </p>
                </div>
              </div>
              <div className="p-8">
                <WGUntermietvertragForm onSubmit={handleFormSubmit} />
              </div>
            </div>
          )}

          {/* Preview Step */}
          {currentStep === 'preview' && contractData && (
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Vertragsvorschau</h2>
                  <p className="text-gray-600 mb-6">
                    Überprüfen Sie Ihren WG-Untermietvertrag vor dem Kauf. Der vollständige Vertrag wird nach der Zahlung als PDF bereitgestellt.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-medium text-sm">
                      ✅ Alle Ihre detaillierten Eingaben wurden übernommen und sind im Vertrag enthalten!
                    </p>
                  </div>
                </div>

                <WGUntermietvertragPreview data={contractData} />
              </div>

              {/* Checkout Section */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Zahlung</h3>
                <CheckoutSection
                  contractType="wg-untermietvertrag"
                  formData={contractData}
                  selectedAddons={contractData.include_protocol ? ['handover_protocol'] : []}
                  totalPrice={getTotalPrice()}
                  onPaymentSuccess={() => setCurrentStep('form')}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
