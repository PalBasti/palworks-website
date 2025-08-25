import '../styles/globals.css'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { AuthProvider } from '../lib/contexts/AuthContext'
import { Toaster } from 'react-hot-toast'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Elements stripe={stripePromise}>
        <Component {...pageProps} />
        
        {/* Test Mode Warning (bestehende Funktionalität) */}
        {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.includes('pk_test') && (
          <div className="fixed top-0 left-0 right-0 bg-yellow-100 border-b border-yellow-400 text-yellow-800 px-4 py-2 text-center text-sm z-50">
            ⚠️ TEST-MODUS: Verwenden Sie Testkarte 4242 4242 4242 4242
          </div>
        )}
        
        {/* Toast Notifications für Auth Feedback */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
      </Elements>
    </AuthProvider>
  )
}
