import { useState } from 'react'
import { X, CreditCard, Download, Mail, FileText } from 'lucide-react'

export default function PaymentModal({ isOpen, onClose, contractType, price, contractData }) {
  const [step, setStep] = useState('payment') // 'payment', 'processing', 'success'

  if (!isOpen) return null

  const getContractTitle = () => {
    switch (contractType) {
      case 'garage': return 'Garage/Stellplatz-Mietvertrag'
      case 'untermietvertrag': return 'Untermietvertrag'
      default: return 'Vertrag'
    }
  }

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
                  {getContractTitle()}
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
                  {contractData?.include_protocol && (
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-green-600 mr-2" />
                      <span>Übergabeprotokoll mit Ihren Daten</span>
                    </div>
                  )}
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
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                  <span className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    {getContractTitle()}.pdf
                  </span>
                  <Download className="h-4 w-4 text-gray-400" />
                </div>
                
                {contractData?.include_protocol && (
                  <div className="flex items-center justify-between bg-blue-50 p-3 rounded">
                    <span className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-blue-600" />
                      Übergabeprotokoll.pdf
                    </span>
                    <Download className="h-4 w-4 text-blue-400" />
                  </div>
                )}
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
