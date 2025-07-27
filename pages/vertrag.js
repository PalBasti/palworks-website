import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { FileText, ArrowLeft, Download, CreditCard } from 'lucide-react'
import ContractForm from '../components/ContractForm'
import ContractPreview from '../components/ContractPreview'
import PaymentModal from '../components/PaymentModal'

export default function GarageVertrag() {
  const [step, setStep] = useState('form') // 'form', 'preview', 'payment'
  const [contractData, setContractData] = useState({})
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const handleFormSubmit = (data) => {
    setContractData(data)
    setStep('preview')
  }

  const handleBackToForm = () => {
    setStep('form')
  }

  const handleProceedToPayment = () => {
    setShowPaymentModal(true)
  }

  return (
    <>
      <Head>
        <title>Garage/Stellplatz-Mietvertrag erstellen - PalWorks</title>
        <meta name="description" content="Rechtssicheren Garage- oder Stellplatz-Mietvertrag in wenigen Minuten erstellen. Vom Anwalt entwickelt." />
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
              <h1 className="text-xl font-semibold text-gray-900">Garage/Stellplatz-Vertrag</h1>
              <p className="text-sm text-gray-600">Rechtssicher & professionell</p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center">
              <div className={`flex-1 ${step === 'form' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                1. Vertragsdaten
              </div>
              <div className="flex-1 border-t-2 border-gray-300 mx-4"></div>
              <div className={`flex-1 text-center ${step === 'preview' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                2. Vorschau
              </div>
              <div className="flex-1 border-t-2 border-gray-300 mx-4"></div>
              <div className={`flex-1 text-right ${step === 'payment' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                3. Download
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Form Step */}
          {step === 'form' && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6 bg-blue-50 border-b">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Garage/Stellplatz-Mietvertrag erstellen</h2>
                <p className="text-gray-600">Füllen Sie die Vertragsdaten aus. Alle Pflichtfelder sind mit * markiert.</p>
              </div>
              <ContractForm onSubmit={handleFormSubmit} />
            </div>
          )}

          {/* Preview Step */}
          {step === 'preview' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Vertragsvorschau</h2>
                  <div className="flex space-x-4">
                    <button
                      onClick={handleBackToForm}
                      className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Bearbeiten
                    </button>
                    <button
                      onClick={handleProceedToPayment}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Jetzt kaufen - 7,90 €
                    </button>
                  </div>
                </div>
                <ContractPreview data={contractData} />
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        contractType="garage"
        price="7,90"
        contractData={contractData}
      />
    </>
  )
}
