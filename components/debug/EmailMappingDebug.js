// components/debug/EmailMappingDebug.js - TEMPORÄRE DEBUG-KOMPONENTE
import { useState, useEffect } from 'react'
import { Mail, AlertCircle, CheckCircle, Info } from 'lucide-react'

export default function EmailMappingDebug({ contractData, visible = false }) {
  const [debugInfo, setDebugInfo] = useState(null)

  useEffect(() => {
    if (contractData) {
      const info = {
        timestamp: new Date().toISOString(),
        hasContractData: !!contractData,
        allKeys: Object.keys(contractData),
        emailFields: {
          billing_email: contractData.billing_email,
          customer_email: contractData.customer_email,
          customerEmail: contractData.customerEmail
        },
        extractedEmail: extractEmail(contractData),
        validation: validateEmail(extractEmail(contractData))
      }
      setDebugInfo(info)
      console.log('🔍 E-Mail Debug Info:', info)
    }
  }, [contractData])

  const extractEmail = (data) => {
    return data.billing_email || data.customer_email || data.customerEmail || null
  }

  const validateEmail = (email) => {
    if (!email) return { valid: false, error: 'Keine E-Mail-Adresse gefunden' }
    if (typeof email !== 'string') return { valid: false, error: 'E-Mail ist kein String' }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { valid: false, error: 'Ungültiges E-Mail-Format' }
    return { valid: true, error: null }
  }

  if (!visible || !debugInfo) return null

  const email = debugInfo.extractedEmail
  const validation = debugInfo.validation

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center">
          <Info className="w-4 h-4 mr-1" />
          E-Mail Debug
        </h3>
        <span className="text-xs text-gray-500">{new Date().toLocaleTimeString()}</span>
      </div>

      {/* E-Mail Status */}
      <div className="mb-3">
        <div className="flex items-center space-x-2">
          {validation.valid ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span className="text-sm font-medium">
            {validation.valid ? 'E-Mail gefunden' : 'E-Mail-Problem'}
          </span>
        </div>
        {email && (
          <p className="text-xs text-gray-600 mt-1 break-all">
            📧 {email}
          </p>
        )}
        {!validation.valid && (
          <p className="text-xs text-red-600 mt-1">
            ❌ {validation.error}
          </p>
        )}
      </div>

      {/* Feld-Details */}
      <div className="bg-gray-50 rounded p-2 mb-3">
        <p className="text-xs font-medium text-gray-700 mb-1">Verfügbare E-Mail-Felder:</p>
        <div className="space-y-1">
          {Object.entries(debugInfo.emailFields).map(([key, value]) => (
            <div key={key} className="flex justify-between text-xs">
              <span className="text-gray-600">{key}:</span>
              <span className={value ? 'text-green-700' : 'text-gray-400'}>
                {value || 'leer'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mapping-Logik */}
      <div className="bg-blue-50 rounded p-2 mb-3">
        <p className="text-xs font-medium text-blue-700 mb-1">Mapping-Priorität:</p>
        <ol className="text-xs text-blue-600 space-y-1">
          <li>1. billing_email {debugInfo.emailFields.billing_email ? '✓' : '✗'}</li>
          <li>2. customer_email {debugInfo.emailFields.customer_email ? '✓' : '✗'}</li>
          <li>3. customerEmail {debugInfo.emailFields.customerEmail ? '✓' : '✗'}</li>
        </ol>
      </div>

      {/* Test-Buttons */}
      <div className="space-y-2">
        <button
          onClick={() => console.log('📋 Contract Data:', contractData)}
          className="w-full text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
        >
          Log Contract Data
        </button>
        
        <button
          onClick={() => {
            const testData = {
              ...contractData,
              customer_email: email,
              customerEmail: email
            }
            console.log('🧪 Test Payment Data:', testData)
          }}
          className="w-full text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded text-blue-700"
        >
          Test Payment Data
        </button>
        
        {validation.valid && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(email)
              alert('E-Mail kopiert!')
            }}
            className="w-full text-xs bg-green-100 hover:bg-green-200 px-2 py-1 rounded text-green-700"
          >
            E-Mail kopieren
          </button>
        )}
      </div>

      {/* Raw Data (ausblendbar) */}
      <details className="mt-3">
        <summary className="text-xs text-gray-500 cursor-pointer">Raw Data anzeigen</summary>
        <pre className="text-xs text-gray-600 bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </details>
    </div>
  )
}

// Verwendung in untermietvertrag.js:
// import EmailMappingDebug from '../components/debug/EmailMappingDebug'
// 
// return (
//   <div>
//     {/* Normale Komponenten */}
//     <EmailMappingDebug 
//       contractData={contractData} 
//       visible={process.env.NODE_ENV === 'development'} 
//     />
//   </div>
// )
