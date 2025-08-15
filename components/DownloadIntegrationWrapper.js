// components/DownloadIntegrationWrapper.js - KORRIGIERTE VERSION MIT E-MAIL-MAPPING
import { useState, useEffect } from 'react'
import { Download, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import SeparateDownloadButton from './SeparateDownloadButton'

export default function DownloadIntegrationWrapper({ 
  contractData, 
  contractType = 'untermietvertrag',
  selectedAddons = [],
  isVisible = false,
  onClose = () => {} 
}) {
  const [downloadState, setDownloadState] = useState('ready') // ready, downloading, success, error
  const [downloadResults, setDownloadResults] = useState(null)
  const [emailStatus, setEmailStatus] = useState('pending') // pending, sending, sent, failed

  // 🔧 FIX: Robuste E-Mail-Extraktion mit mehreren Fallbacks
  const getCustomerEmail = () => {
    if (!contractData) return 'Keine E-Mail verfügbar'
    
    // Priorität: billing_email > customer_email > customerEmail
    return contractData.billing_email || 
           contractData.customer_email || 
           contractData.customerEmail ||
           'Keine E-Mail-Adresse verfügbar'
  }

  // Debug: E-Mail-Mapping protokollieren
  useEffect(() => {
    if (contractData) {
      console.log('📧 DownloadIntegrationWrapper - Contract Data:', {
        hasData: !!contractData,
        billing_email: contractData.billing_email,
        customer_email: contractData.customer_email,
        customerEmail: contractData.customerEmail,
        extractedEmail: getCustomerEmail(),
        allKeys: Object.keys(contractData)
      })
    }
  }, [contractData])

  // Bestimme verfügbare Downloads basierend auf Addons
  const getAvailableDownloads = () => {
    const downloads = [
      {
        id: 'main_contract',
        name: 'Haupt-Vertrag',
        description: 'Vollständiger Untermietvertrag (ausfüllbare Version)',
        included: true,
        price: 0
      }
    ]

    // Vertragserläuterungen hinzufügen wenn ausgewählt
    if (selectedAddons.includes('explanation')) {
      downloads.push({
        id: 'contract_explanation',
        name: 'Vertragserläuterungen',
        description: 'Detaillierte Erklärungen zu allen Vertragsklauseln',
        included: true,
        price: 9.90
      })
    }

    // Übergabeprotokoll hinzufügen wenn ausgewählt
    if (selectedAddons.includes('handover_protocol')) {
      downloads.push({
        id: 'handover_protocol',
        name: 'Übergabeprotokoll',
        description: 'Professionelles Protokoll für Wohnungsübergabe',
        included: true,
        price: 7.90
      })
    }

    return downloads
  }

  const handleDownloadStart = () => {
    setDownloadState('downloading')
    setEmailStatus('sending')
    console.log('🔄 Starting download process for email:', getCustomerEmail())
  }

  const handleDownloadSuccess = (results) => {
    console.log('✅ Download successful:', results)
    setDownloadResults(results)
    setDownloadState('success')
    setEmailStatus('sent')
  }

  const handleDownloadError = (error) => {
    console.error('❌ Download failed:', error)
    setDownloadState('error')
    setEmailStatus('failed')
  }

  if (!isVisible) return null

  const customerEmail = getCustomerEmail()
  const availableDownloads = getAvailableDownloads()
  const hasValidEmail = customerEmail && customerEmail !== 'Keine E-Mail-Adresse verfügbar'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                📄 Ihre Vertragsdownloads
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Separate Downloads für alle bestellten Dokumente
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* E-Mail Status Anzeige */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              hasValidEmail ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {hasValidEmail ? (
                <Mail className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {hasValidEmail ? (
                  <>E-Mail-Versand an: <span className="text-blue-600">{customerEmail}</span></>
                ) : (
                  'E-Mail-Adresse nicht verfügbar'
                )}
              </p>
              <p className="text-xs text-gray-600">
                {hasValidEmail ? (
                  emailStatus === 'sending' ? 'E-Mail wird versendet...' :
                  emailStatus === 'sent' ? 'E-Mail erfolgreich versendet!' :
                  emailStatus === 'failed' ? 'E-Mail-Versand fehlgeschlagen' :
                  'E-Mail wird nach Download automatisch versendet'
                ) : (
                  'PDFs können nur heruntergeladen werden'
                )}
              </p>
            </div>
            
            {emailStatus === 'sent' && (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
          </div>
        </div>

        {/* Download Liste */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Verfügbare Downloads ({availableDownloads.length})
          </h3>
          
          <div className="space-y-4">
            {availableDownloads.map((download) => (
              <div key={download.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{download.name}</h4>
                    {download.included && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Inklusive
                      </span>
                    )}
                    {download.price > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        +{download.price.toFixed(2)} €
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{download.description}</p>
                </div>
                
                <div className="ml-4">
                  <Download className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Download Button */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <SeparateDownloadButton
            contractType={contractType}
            contractData={{
              ...contractData,
              // ✅ SICHERSTELLEN: E-Mail ist für Download verfügbar
              customer_email: customerEmail,
              customerEmail: customerEmail
            }}
            selectedAddons={selectedAddons}
            onDownloadStart={handleDownloadStart}
            onDownloadSuccess={handleDownloadSuccess}
            onDownloadError={handleDownloadError}
            isLoading={downloadState === 'downloading'}
            className="w-full"
          />

          {/* Status Messages */}
          {downloadState === 'success' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Downloads erfolgreich!
                  </p>
                  <p className="text-xs text-green-700">
                    {hasValidEmail ? 
                      `PDFs wurden heruntergeladen und an ${customerEmail} gesendet.` :
                      'PDFs wurden erfolgreich heruntergeladen.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {downloadState === 'error' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-red-900">
                    Download fehlgeschlagen
                  </p>
                  <p className="text-xs text-red-700">
                    Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Debug Info (nur in Development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
              <strong>Debug Info:</strong>
              <pre className="mt-1 text-yellow-800 whitespace-pre-wrap">
                {JSON.stringify({
                  hasContractData: !!contractData,
                  extractedEmail: customerEmail,
                  hasValidEmail,
                  emailStatus,
                  downloadState,
                  availableDownloads: availableDownloads.length
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
