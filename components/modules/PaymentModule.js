// components/modules/PaymentModule.js - KORRIGIERTE VERSION mit dynamischer Preisberechnung

import { useState, useEffect, useMemo } from 'react'
import { CreditCard, Smartphone, Lock, CheckCircle, AlertCircle, Download, Mail, Loader2 } from 'lucide-react'
import { getAddonsByContractType } from '@/lib/supabase/addonService'

const PaymentModule = ({
  amount: propAmount, // Prop amount als Fallback
  currency = "€",
  orderDescription = "PalWorks Vertragserstellung",
  customerEmail = "",
  formData = {},
  selectedAddons = [],
  contractType = "untermietvertrag",
  onPaymentSuccess,
  onPaymentError,
  onPaymentInitiated,
  enabledMethods = ['card', 'paypal', 'sofort'],
  showSecurityBadge = true,
  className = ""
}) => {
  const [selectedMethod, setSelectedMethod] = useState('card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [pdfUrl, setPdfUrl] = useState(null)
  const [contractId, setContractId] = useState(null)
  const [addons, setAddons] = useState([])
  const [addonsLoaded, setAddonsLoaded] = useState(false)

  // Basispreise für verschiedene Vertragstypen
  const basePrices = {
    untermietvertrag: 12.90,
    mietvertrag: 15.90,
    garagenvertrag: 7.90,
    stellplatzvertrag: 7.90,
    gewerbemietvertrag: 24.90
  }

  const basePrice = basePrices[contractType] || 12.90

  // Addons laden beim Mount oder wenn contractType ändert
  useEffect(() => {
    const loadAddons = async () => {
      try {
        const response = await getAddonsByContractType(contractType)
        if (response.success) {
          setAddons(response.data || [])
        } else {
          console.warn('Addon loading failed:', response.error)
          setAddons([])
        }
      } catch (error) {
        console.error('Error loading addons:', error)
        setAddons([])
      } finally {
        setAddonsLoaded(true)
      }
    }

    if (contractType) {
      loadAddons()
    }
  }, [contractType])

  // Dynamische Preisberechnung basierend auf aktuellen Addons
  const calculatedAmount = useMemo(() => {
    if (!addonsLoaded) {
      return propAmount || basePrice // Fallback während Laden
    }

    const addonTotal = selectedAddons.reduce((sum, addonKey) => {
      const addon = addons.find(a => a.addon_key === addonKey)
      return sum + (addon?.price || 0)
    }, 0)

    return basePrice + addonTotal
  }, [basePrice, selectedAddons, addons, addonsLoaded, propAmount])

  // Amount für Display formatieren
  const displayAmount = calculatedAmount.toFixed(2)

  const paymentMethods = [
    {
      id: 'card',
      name: 'Kreditkarte',
      icon: CreditCard,
      description: 'Visa, Mastercard, American Express'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: () => (
        <div className="w-5 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
          P
        </div>
      ),
      description: 'Sicher mit PayPal bezahlen'
    },
    {
      id: 'sofort',
      name: 'Sofortüberweisung',
      icon: () => (
        <div className="w-5 h-5 bg-pink-500 rounded text-white text-xs flex items-center justify-center font-bold">
          S
        </div>
      ),
      description: 'Direkt vom Bankkonto'
    }
  ]

  const formatAmount = (amount) => {
    return parseFloat(amount).toFixed(2).replace('.', ',')
  }

  const handlePaymentSubmit = async () => {
    if (!customerEmail?.trim()) {
      setErrorMessage('Bitte geben Sie eine gültige E-Mail-Adresse ein')
      return
    }

    try {
      setIsProcessing(true)
      setPaymentStatus('processing')
      setErrorMessage('')

      if (onPaymentInitiated) {
        onPaymentInitiated({ 
          method: selectedMethod, 
          amount: displayAmount,
          contractType,
          selectedAddons
        })
      }

      // 1. Contract in Database erstellen
      console.log('Creating contract with data:', {
        formData,
        selectedAddons,
        totalAmount: displayAmount,
        contractType
      })

      // 2. Payment verarbeiten (simuliert)
      const paymentData = {
        method: selectedMethod,
        amount: displayAmount,
        currency: currency,
        description: orderDescription,
        customerEmail: customerEmail,
        contractType: contractType,
        selectedAddons: selectedAddons
      }

      const paymentResponse = await processPayment(paymentData)
      
      if (paymentResponse.success) {
        // 3. PDF generieren
        console.log('Payment successful, generating PDF...')
        const pdfUrl = await generatePDF()
        
        // 4. E-Mail versenden
        if (customerEmail) {
          await sendContractEmail(pdfUrl)
        }
        
        // 5. Success State setzen
        setPaymentStatus('success')
        setContractId(paymentResponse.transactionId)
        
        if (onPaymentSuccess) {
          onPaymentSuccess({
            ...paymentResponse,
            pdfUrl,
            contractId: paymentResponse.transactionId,
            finalAmount: displayAmount,
            selectedAddons
          })
        }
      } else {
        throw new Error(paymentResponse.error || 'Zahlung fehlgeschlagen')
      }
    } catch (error) {
      console.error('Payment/PDF Error:', error)
      setPaymentStatus('error')
      setErrorMessage(error.message)
      if (onPaymentError) {
        onPaymentError(error)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  // Simulierte Payment-Funktion (durch echte Stripe-Integration ersetzen)
  const processPayment = async (paymentData) => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    if (Math.random() > 0.05) {
      return {
        success: true,
        transactionId: 'txn_' + Date.now(),
        paymentMethod: paymentData.method,
        amount: paymentData.amount
      }
    } else {
      return {
        success: false,
        error: 'Zahlung wurde von der Bank abgelehnt'
      }
    }
  }

  const generatePDF = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return `/api/pdf/contract_${Date.now()}.pdf`
  }

  const sendContractEmail = async (pdfUrl) => {
    console.log(`Sending contract email to ${customerEmail} with PDF: ${pdfUrl}`)
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  if (paymentStatus === 'success') {
    return (
      <div className={`bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center ${className}`}>
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-green-800 mb-2">Zahlung erfolgreich!</h3>
        <p className="text-green-700 mb-4">
          Ihre Zahlung über {formatAmount(displayAmount)} {currency} wurde erfolgreich verarbeitet.
        </p>
        {pdfUrl && (
          <div className="space-y-3">
            <button
              onClick={() => window.open(pdfUrl, '_blank')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center mx-auto transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              PDF herunterladen
            </button>
