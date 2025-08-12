{/* ✅ MANUAL DEBUGGING: Zeige Raw Form Data */}
        {process.env.NODE_ENV === 'development' && currentStep === 'preview' && (
          <div className="fixed bottom-20 right-4 bg-red-600 text-white p-3 rounded-lg shadow-lg max-w-xs text-xs">
            <h4 className="font-bold mb-1">🚨 Raw Preview Data</h4>
            <div>formData keys: {Object.keys(formData).length}</div>
            <div>selected_addons exists: {formData.selected_addons ? 'YES' : 'NO'}</div>
            <div>addon_details exists: {formData.addon_details ? 'YES' : 'NO'}</div>
            <div>calculated_total: {formData.calculated_total || 'MISSING'}</div>
          </div>
        )}// pages/untermietvertrag.js - SSR-SAFE VERSION
import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { FileText, ArrowLeft, CheckCircle, Download, Mail, User, Home, Euro } from 'lucide-react'
import UntermietvertragForm from '../components/UntermietvertragForm'
import PaymentModule from '../components/modules/PaymentModule'

// ✅ Modulare Imports
import PricingSection from '../components/shared/PricingSection'

export default function UntermietvertragPage() {
  const [currentStep, setCurrentStep] = useState('form') // form, preview, success
  const [paymentResult, setPaymentResult] = useState(null)
  const [mounted, setMounted] = useState(false)
  
  // ✅ FALLBACK: Manueller State für SSR-Safety
  const [formData, setFormData] = useState({})
  const [selectedAddons, setSelectedAddons] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // ✅ Hook State (wird nur client-side geladen)
  const [hookState, setHookState] = useState(null)

  // ✅ SSR-Safe mounting
  useEffect(() => {
    setMounted(true)
    
    // ✅ Dynamic Hook Import (nur client-side)
    const loadHook = async () => {
      try {
        const { useContractForm } = await import('../hooks/useContractForm')
        // Hook wird erst geladen, wenn Component mounted ist
        setHookState('ready')
      } catch (error) {
        console.log('Hook not available, using fallback state')
        setHookState('fallback')
      }
    }
    
    loadHook()
  }, [])

  // ✅ Basis-Preisberechnung (SSR-safe)
  const basePrice = 12.90
  const calculateTotalPrice = () => {
    const addonPrices = {
      'explanation': 9.90,
      'handover_protocol': 7.90
    }
    
    const addonTotal = selectedAddons.reduce((sum, addonKey) => {
      return sum + (addonPrices[addonKey] || 0)
    }, 0)
    
    return basePrice + addonTotal
  }

  const totalPrice = calculateTotalPrice()

  const handleAddonChange = (newAddons) => {
    setSelectedAddons(newAddons)
  }

  const updateFormData = (newData) => {
    setFormData(prev => ({
      ...prev,
      ...newData
    }))
  }

  const resetForm = () => {
    setFormData({})
    setSelectedAddons([])
  }

  const getSelectedAddonDetails = () => {
    const addonDetails = {
      'explanation': { name: 'Vertragserläuterungen', price: 9.90 },
      'handover_protocol': { name: 'Übergabeprotokoll', price: 7.90 }
    }

    return selectedAddons.map(key => ({
      key,
      ...addonDetails[key]
    })).filter(addon => addon.name)
  }

  const handleFormSubmit = (data) => {
    console.log('📋 Parent handleFormSubmit received:', data)
    
    // ✅ Die Daten kommen jetzt bereits komplett von der UntermietvertragForm
    // Keine weitere Verarbeitung nötig, da Form bereits Addons eingebaut hat
    updateFormData(data)
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
    return selectedAddons
  }

  const selectedAddonDetails = getSelectedAddonDetails()

  // ✅ SSR-Safe Rendering
  if (!mounted) {
    return (
      <>
        <Head>
          <title>Untermietvertrag erstellen - PalWorks</title>
          <meta name="description" content="Rechtssicherer Untermietvertrag. Optional mit Übergabeprotokoll und Vertragserläuterungen." />
        </Head>
        
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Lade Vertragsformular...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Untermietvertrag erstellen - PalWorks</title>
        <meta name="description" content="Rechtssicherer Untermietvertrag. Optional mit Übergabeprotokoll und Vertragserläuterungen." />
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
                  Anwaltlich geprüft • Sofort verfügbar • Ab 12,90€
                </p>
                
                {/* Live Preisvorschau */}
                {selectedAddons.length > 0 && (
                  <div className="mt-4 inline-flex items-center bg-blue-50 text-blue-800 px-4 py-2 rounded-lg text-sm">
                    💡 Gesamtpreis mit Zusatzleistungen: <span className="font-bold ml-1">{totalPrice.toFixed(2)}€</span>
                  </div>
                )}
              </div>

              {/* PricingSection */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    🎯 Vertrag + Zusatzleistungen
                  </h3>
                  <PricingSection
                    contractType="untermietvertrag"
                    basePrice={basePrice}
                    selectedAddons={selectedAddons}
                    onAddonChange={handleAddonChange}
                    enabledAddons={['explanation', 'handover_protocol']}
                  />
                </div>
              </div>

              {/* ✅ FIX: UntermietvertragForm mit Addon-Daten versorgen */}
              <UntermietvertragForm 
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
                initialData={formData}
                // ✅ WICHTIG: Addon-Daten an Form weitergeben
                selectedAddons={selectedAddons}
                addonDetails={getSelectedAddonDetails()}
                totalPrice={totalPrice}
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

              {/* Vertragsteaser */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  📄 Ihr Untermietvertrag
                </h3>
                
                <div className="prose max-w-none text-gray-700 mb-6">
                  <p className="text-sm leading-relaxed bg-gray-50 p-4 rounded border-l-4 border-blue-500">
                    <strong>Vertragsteaser:</strong> Ihr rechtssicherer Untermietvertrag wird zwischen{' '}
                    <span className="font-medium">{formData.landlord_name || '[Hauptmieter]'}</span> als Untervermieter 
                    und <span className="font-medium">{formData.tenant_name || '[Untermieter]'}</span> als Untermieter 
                    für das Objekt in <span className="font-medium">{formData.property_address || '[Objektadresse]'}</span> erstellt.
                    Die monatliche Miete beträgt <span className="font-medium">{formData.rent_amount || '[Miete]'}€</span>.
                    Der Vertrag wird nach deutschem Recht erstellt und enthält alle notwendigen Klauseln für eine rechtssichere Untervermietung.
                  </p>
                  
                  {/* ✅ FIX: Klar trennen zwischen Miete und Kaufpreis */}
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-800">
                      <strong>💡 Hinweis:</strong> Die Miete ({formData.rent_amount || '[Miete]'}€/Monat) ist der monatliche Betrag zwischen den Parteien. 
                      Der Kaufpreis für diesen Vertrag beträgt {formData.calculated_total ? formData.calculated_total.toFixed(2) : totalPrice.toFixed(2)}€.
                    </p>
                  </div>
                </div>

                {/* Wichtige Vertragsdaten */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded">
                    <div className="flex items-center mb-2">
                      <User className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="font-medium text-blue-900">Vertragsparteien</h4>
                    </div>
                    <div className="text-sm text-blue-800">
                      <p><span className="font-medium">Hauptmieter:</span> {formData.landlord_name || '[Wird ergänzt]'}</p>
                      <p><span className="font-medium">Untermieter:</span> {formData.tenant_name || '[Wird ergänzt]'}</p>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded">
                    <div className="flex items-center mb-2">
                      <Home className="h-5 w-5 text-green-600 mr-2" />
                      <h4 className="font-medium text-green-900">Mietobjekt</h4>
                    </div>
                    <div className="text-sm text-green-800">
                      <p>{formData.property_address || '[Adresse]'}</p>
                      <p>{formData.property_postal || '[PLZ]'} {formData.property_city || '[Stadt]'}</p>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded">
                    <div className="flex items-center mb-2">
                      <Euro className="h-5 w-5 text-purple-600 mr-2" />
                      <h4 className="font-medium text-purple-900">Vertragsdaten</h4>
                    </div>
                    <div className="text-sm text-purple-800">
                      <p><span className="font-medium">Miete:</span> {formData.rent_amount || '[Betrag]'}€/Monat</p>
                      <p><span className="font-medium">Beginn:</span> {formData.start_date || '[Datum]'}</p>
                      <p><span className="font-medium">Vertragskosten:</span> {formData.calculated_total ? formData.calculated_total.toFixed(2) : totalPrice.toFixed(2)}€</p>
                    </div>
                  </div>
                </div>

                {/* Rechnungsempfänger */}
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">📧 Rechnungsempfänger</h4>
                  <div className="text-sm text-yellow-800">
                    <p><span className="font-medium">Name:</span> {formData.billing_name || '[Wird ergänzt]'}</p>
                    <p><span className="font-medium">Adresse:</span> {formData.billing_address || '[Wird ergänzt]'}</p>
                    <p><span className="font-medium">E-Mail:</span> {formData.billing_email || '[Wird ergänzt]'}</p>
                  </div>
                </div>
              </div>

              {/* Bestellübersicht */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    💳 Ihre Bestellung
                  </h3>
                  
                  {/* Basis-Vertrag */}
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-blue-900">🏠 Untermietvertrag</h4>
                        <p className="text-sm text-blue-700 mt-1">Rechtssicherer Basisvertrag</p>
                      </div>
                      <span className="text-lg font-bold text-blue-900">
                        {basePrice.toFixed(2)} €
                      </span>
                    </div>
                  </div>

                  {/* Gewählte Addons */}
                  {selectedAddonDetails.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <h4 className="font-medium text-gray-900">Gewählte Zusatzleistungen:</h4>
                      {selectedAddonDetails.map((addon) => (
                        <div key={addon.key} className="flex justify-between items-center p-3 bg-green-50 rounded">
                          <div>
                            <span className="font-medium text-green-900">+ {addon.name}</span>
                            <p className="text-sm text-green-700">Zusatzleistung</p>
                          </div>
                          <span className="font-bold text-green-900">+{addon.price.toFixed(2)}€</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ✅ FIX: Gesamtsumme aus übertragenen Daten */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Gesamtsumme</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {formData.calculated_total ? formData.calculated_total.toFixed(2) : totalPrice.toFixed(2)}€
                      </span>
                    </div>
                    
                    {/* ✅ FIX: Aufschlüsselung aus übertragenen Daten */}
                    {formData.addon_details && formData.addon_details.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex justify-between">
                            <span>Basis-Vertrag</span>
                            <span>{basePrice.toFixed(2)} €</span>
                          </div>
                          {formData.addon_details.map(addon => (
                            <div key={addon.key} className="flex justify-between text-blue-600">
                              <span className="flex items-center">
                                <span className="text-xs mr-1">+</span>
                                {addon.name}
                              </span>
                              <span>+{addon.price.toFixed(2)} €</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ✅ FIX: Payment mit korrektem Preis und Addons */}
              <PaymentModule
                amount={formData.calculated_total || totalPrice}
                orderDescription={`Untermietvertrag${formData.selected_addons && formData.selected_addons.length > 0 ? ' + Zusatzleistungen' : ''}`}
                customerEmail={formData.billing_email || ''}
                formData={formData}
                selectedAddons={formData.selected_addons || getSelectedAddons()}
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

                {/* Erfolgs-Details */}
                <div className="bg-green-50 rounded-lg p-6 mb-8">
                  <h3 className="font-semibold text-green-900 mb-3">📄 Ihre Dokumente</h3>
                  <div className="space-y-2 text-sm text-green-800">
                    <div className="flex items-center justify-center">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>Untermietvertrag.pdf</span>
                    </div>
                    {/* ✅ FIX: Success-Dokumente aus übertragenen Addons */}
                    {formData.selected_addons && formData.selected_addons.includes('handover_protocol') && (
                      <div className="flex items-center justify-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Übergabeprotokoll.pdf</span>
                      </div>
                    )}
                    {formData.selected_addons && formData.selected_addons.includes('explanation') && (
                      <div className="flex items-center justify-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Vertragserläuterungen.pdf</span>
                      </div>
                    )}
                  </div>
                </div>

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
                      Der Vertrag wurde an {formData.billing_email} gesendet
                    </span>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <button
                    onClick={() => {
                      setCurrentStep('form')
                      resetForm()
                      setPaymentResult(null)
                    }}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Neuen Vertrag erstellen
                  </button>
                  
                  <Link
                    href="/"
                    className="block text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Zurück zur Übersicht
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Development Debug Info */}
        {process.env.NODE_ENV === 'development' && mounted && (
          <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-lg shadow-lg max-w-xs">
            <h4 className="font-bold text-sm mb-1">🔧 State Debug</h4>
            <div className="text-xs space-y-1">
              <div>Step: {currentStep}</div>
              <div>Mounted: ✅</div>
              <div>Hook: {hookState || 'loading'}</div>
              <div>Form Addons: {formData.selected_addons ? formData.selected_addons.join(', ') : 'NONE'}</div>
              <div>Current Addons: {selectedAddons.join(', ') || 'NONE'}</div>
              <div>Addon Details: {formData.addon_details ? formData.addon_details.length : 0}</div>
              <div>Form Price: {formData.calculated_total ? formData.calculated_total.toFixed(2) : 'none'}€</div>
              <div>Current Price: {totalPrice.toFixed(2)}€</div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
