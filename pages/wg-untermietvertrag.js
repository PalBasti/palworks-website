import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { FileText, ArrowLeft, Check, X, Download, Mail, CreditCard } from 'lucide-react'

// Import der Components (diese sollten separat in /components/ existieren)
import WGUntermietvertragForm from '../components/WGUntermietvertragForm'
import WGUntermietvertragPreview from '../components/WGUntermietvertragPreview'

// Payment Modal Komponente
function PaymentModal({ isOpen, onClose, contractType, price, contractData }) {
  const [step, setStep] = useState('payment') // 'payment', 'processing', 'success'

  if (!isOpen) return null

  const handleDemoPayment = () => {
    setStep('processing')
    
    // Simulate payment processing
    setTimeout(() => {
      setStep('success')
    }, 2000)
  }

  const handleDownloadDemo = () => {
    // In real implementation, this would generate and download the actual PDF
    alert('Demo: In der echten Version würde hier der Vertrag als PDF heruntergeladen werden.')
  }

  const handleRestart = () => {
    onClose()
    // Reload page to restart demo
    window.location.reload()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        
        {/* Payment Step */}
        {step === 'payment' && (
          <>
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Demo-Zahlung</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🛒</div>
                <h4 className="text-xl font-semibold text-blue-600 mb-2">
                  WG-Untermietvertrag
                </h4>
                <div className="text-3xl font-bold text-gray-900 mb-2">{price} €</div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800 text-center">
                  <strong>Demo-Version:</strong> Dies ist eine Demonstration von PalWorks.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold mb-3">In der echten Version erhalten Sie:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-green-600 mr-2" />
                    <span>Vollständiger, rechtssicherer Vertrag als PDF</span>
                  </div>
                  <div className="flex items-center">
                    <Download className="h-4 w-4 text-green-600 mr-2" />
                    <span>Sofortiger Download nach Zahlung</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-green-600 mr-2" />
                    <span>E-Mail-Versand an Ihre Adresse</span>
                  </div>
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 text-green-600 mr-2" />
                    <span>Sichere Zahlung über Stripe</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleDemoPayment}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Demo-Zahlung simulieren
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200"
                >
                  Zurück zur Vorschau
                </button>
              </div>
            </div>
          </>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Zahlung wird verarbeitet...</h3>
            <p className="text-gray-600">Bitte warten Sie einen Moment.</p>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <>
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-green-600">Demo erfolgreich!</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 text-center">
              <div className="text-5xl mb-4">✅</div>
              <h4 className="text-xl font-semibold text-green-600 mb-4">
                Demo-Zahlung erfolgreich!
              </h4>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  In der echten Version würden Sie jetzt automatisch den vollständigen 
                  Vertrag als PDF erhalten und eine Bestätigungs-E-Mail bekommen.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h5 className="font-semibold mb-2 text-blue-900">Interessiert an der Vollversion?</h5>
                <p className="text-sm text-blue-800 mb-3">
                  Kontaktieren Sie uns für Informationen über die echte PalWorks-Plattform:
                </p>
                <p className="text-sm font-medium text-blue-900">info@palworks.de</p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleDownloadDemo}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Demo-Download (Simulation)
                </button>
                
                <button
                  onClick={handleRestart}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700"
                >
                  ✨ Neue Demo starten
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200"
                >
                  Demo beenden
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Hauptkomponente
export default function WGUntermietvertrag() {
  const [currentStep, setCurrentStep] = useState('form') // 'form', 'preview'
  const [contractData, setContractData] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const handleFormSubmit = (data) => {
    setContractData(data)
    setCurrentStep('preview')
  }

  const handleBackToForm = () => {
    setCurrentStep('form')
  }

  const handleBuyContract = () => {
    setShowPaymentModal(true)
  }

  const getTotalPrice = () => {
    if (!contractData) return '9.90'
    let total = 9.90
    if (contractData.include_protocol) {
      total += 3.90
    }
    return total.toFixed(2)
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
              
              {/* Import des ausführlichen Formulars aus components/ */}
              <WGUntermietvertragForm onSubmit={handleFormSubmit} />
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
                
                {/* Import der ausführlichen Preview aus components/ */}
                <WGUntermietvertragPreview data={contractData} />
              </div>
              
              <div className="space-y-6">
                {/* Actions */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Aktionen</h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleBackToForm}
                      className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Zurück zum Formular
                    </button>
                    <button
                      onClick={handleBuyContract}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <FileText className="h-5 w-5 mr-2" />
                      Vertrag kaufen - {getTotalPrice()} €
                    </button>
                  </div>
                </div>

                {/* Vertragsinhalt Info */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Ihr Vertragsinhalt</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Untervermieter:</span>
                      <span className="font-medium">{contractData.landlord_name || '[Wird ergänzt]'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Zimmer:</span>
                      <span className="font-medium">{contractData.exclusive_room || '[Wird ergänzt]'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Wohnung:</span>
                      <span className="font-medium">{contractData.property_address || '[Wird ergänzt]'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Miete:</span>
                      <span className="font-medium text-green-600">{contractData.rent_amount ? `${contractData.rent_amount} €` : '[Wird ergänzt]'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gemeinschaftsräume:</span>
                      <span className="font-medium">
                        {[
                          contractData.shared_kitchen && 'Küche',
                          contractData.shared_bathroom && 'Bad',
                          contractData.shared_living && 'Wohnzimmer',
                          contractData.shared_hallway && 'Flur'
                        ].filter(Boolean).join(', ') || 'Keine'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">✅ Das erhalten Sie</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-3" />
                      <span>Vollständiger WG-Untermietvertrag als PDF</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-3" />
                      <span>Alle 14 rechtlich relevanten Paragraphen</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-3" />
                      <span>Detaillierte Wohnungs- und Raumaufteilung</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-3" />
                      <span>Gemeinschaftsräume und -einrichtungen</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-3" />
                      <span>Sofortiger Download nach Zahlung</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-3" />
                      <span>E-Mail-Versand inklusive</span>
                    </div>
                    {contractData.include_protocol && (
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-600 mr-3" />
                        <span>WG-Übergabeprotokoll inklusive</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Warum PalWorks */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Warum PalWorks?</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Vom Anwalt entwickelt</li>
                    <li>• Rechtssicher nach deutschem Recht</li>
                    <li>• Speziell für WG-Situationen optimiert</li>
                    <li>• Günstiger als Anwaltsbesuch</li>
                    <li>• Sofort verfügbar</li>
                  </ul>
                </div>

                {/* Preis Details */}
                <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Preisdetails</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>WG-Untermietvertrag:</span>
                      <span className="font-medium">9,90 €</span>
                    </div>
                    {contractData.include_protocol && (
                      <div className="flex justify-between text-blue-700">
                        <span>+ Übergabeprotokoll:</span>
                        <span className="font-medium">3,90 €</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>Gesamtpreis:</span>
                      <span className="text-green-600">{getTotalPrice()} €</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-3">
                    Einmaliger Preis • Keine Abonnements • Sofortiger Download
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        contractType="wg"
        price={getTotalPrice()}
        contractData={contractData}
      />
    </>
  )
}
