import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { FileText, ArrowLeft, Check, Plus, Download } from 'lucide-react'
import WGContractForm from '../components/WGUntermietvertragForm'
import WGContractPreview from '../components/WGUntermietvertragPreview'
import PaymentModal from '../components/PaymentModal'

export default function WGUntermietvertragPage() {
  const [currentStep, setCurrentStep] = useState('form') // form, preview
  const [contractData, setContractData] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const handleFormSubmit = (data) => {
    setContractData(data)
    setCurrentStep('preview')
  }

  const handleBackToForm = () => {
    setCurrentStep('form')
  }

  const handlePurchase = () => {
    setShowPaymentModal(true)
  }

  const getPrice = () => {
    let basePrice = 9.90
    if (contractData?.include_protocol) {
      basePrice += 3.90
    }
    return basePrice.toFixed(2)
  }

  return (
    <>
      <Head>
        <title>WG-Untermietvertrag erstellen - PalWorks</title>
        <meta name="description" content="Rechtssicherer Untermietvertrag für WG-Zimmer. Optional mit professionellem Übergabeprotokoll." />
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
              <p className="text-sm text-gray-600">Einzelnes Zimmer</p>
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-screen bg-gray-50">
        {currentStep === 'form' && (
          <WGContractForm onSubmit={handleFormSubmit} />
        )}
        
        {currentStep === 'preview' && contractData && (
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Preview */}
              <div>
                <WGContractPreview data={contractData} />
              </div>
              
              {/* Sidebar */}
              <div className="space-y-6">
                {/* Produktübersicht */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Ihre Bestellung</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">WG-Untermietvertrag</p>
                        <p className="text-sm text-gray-600">Rechtssicherer Vertrag</p>
                      </div>
                      <span className="font-bold">9,90 €</span>
                    </div>
                    
                    {contractData.include_protocol && (
                      <div className="flex justify-between items-center border-t pt-3">
                        <div>
                          <p className="font-medium flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-blue-600" />
                            Übergabeprotokoll
                          </p>
                          <p className="text-sm text-gray-600">Mit Datenübernahme</p>
                        </div>
                        <span className="font-bold text-blue-600">3,90 €</span>
                      </div>
                    )}
                    
                    <div className="border-t pt-3 flex justify-between items-center text-lg font-bold">
                      <span>Gesamtpreis</span>
                      <span className="text-blue-600">{getPrice()} €</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="space-y-4">
                    <button
                      onClick={handlePurchase}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Jetzt kaufen - {getPrice()} €
                    </button>
                    <button
                      onClick={handleBackToForm}
                      className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Änderungen vornehmen
                    </button>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">✓ Das erhalten Sie:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Rechtssicherer WG-Untermietvertrag als PDF</li>
                    <li>• Sofortiger Download nach Zahlung</li>
                    {contractData.include_protocol && (
                      <li>• Übergabeprotokoll mit Ihren Daten</li>
                    )}
                    <li>• E-Mail-Versand zur Sicherheit</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        contractType="wg_untermietvertrag"
        price={getPrice()}
        contractData={contractData}
      />
    </>
  )
}
