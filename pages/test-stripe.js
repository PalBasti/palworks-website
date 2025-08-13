// pages/test-stripe.js
import { useState } from 'react';

export default function TestStripe() {
  const [result, setResult] = useState(null);
  const [apiTest, setApiTest] = useState(null);
  const [loading, setLoading] = useState(false);

  // Test 1: Frontend Keys prüfen
  const testFrontendKeys = () => {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    setResult({
      hasPublishableKey: !!publishableKey,
      keyPrefix: publishableKey?.substring(0, 15) + '...',
      environment: publishableKey?.includes('test') ? 'TEST' : 'LIVE',
      keyLength: publishableKey?.length || 0
    });
  };

  // Test 2: API-Endpoint testen (Payment Intent Creation)
  const testApiEndpoint = async () => {
    setLoading(true);
    setApiTest(null);

    try {
      // Erst mal einen Test-Contract erstellen (simuliert)
      const testContractResponse = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractType: 'untermietvertrag',
          customerEmail: 'test@palworks-test.de',
          formData: {
            landlord_name: 'Test Vermieter',
            tenant_name: 'Test Mieter'
          },
          selectedAddons: [],
          totalAmount: 19.90
        })
      });

      if (testContractResponse.ok) {
        const contractData = await testContractResponse.json();
        
        // Jetzt Payment Intent erstellen
        const paymentResponse = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contractId: contractData.contract.id
          })
        });

        const paymentData = await paymentResponse.json();

        setApiTest({
          success: paymentResponse.ok,
          contractCreated: !!contractData.contract,
          contractId: contractData.contract?.id,
          paymentIntentCreated: !!paymentData.client_secret,
          paymentIntentId: paymentData.payment_intent?.id,
          amount: paymentData.payment_intent?.amount,
          error: paymentData.error || null
        });
      } else {
        // Fallback: Direkt Payment Intent testen (ohne Contract)
        setApiTest({
          success: false,
          error: 'Contract creation failed - testing API directly',
          contractCreated: false
        });
      }
    } catch (error) {
      setApiTest({
        success: false,
        error: error.message,
        contractCreated: false
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 3: Stripe.js laden
  const testStripeJs = async () => {
    try {
      const { loadStripe } = await import('@stripe/stripe-js');
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
      
      setResult(prev => ({
        ...prev,
        stripeLoaded: !!stripe,
        stripeVersion: stripe?.version || 'unknown'
      }));
    } catch (error) {
      setResult(prev => ({
        ...prev,
        stripeLoaded: false,
        stripeError: error.message
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🧪 Stripe Integration Test
          </h1>
          
          <div className="space-y-6">
            {/* Test 1: Frontend Keys */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                🔑 Test 1: Frontend Keys
              </h2>
              
              <button 
                onClick={testFrontendKeys}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Test Frontend Keys
              </button>
              
              {result && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-bold text-gray-800 mb-2">Results:</h3>
                  <div className="space-y-2 text-sm">
                    <p className={result.hasPublishableKey ? 'text-green-600' : 'text-red-600'}>
                      {result.hasPublishableKey ? '✅' : '❌'} Has Publishable Key: {result.hasPublishableKey ? 'YES' : 'NO'}
                    </p>
                    <p className="text-gray-700">
                      🔑 Key Preview: {result.keyPrefix}
                    </p>
                    <p className={result.environment === 'TEST' ? 'text-green-600' : 'text-orange-600'}>
                      🌍 Environment: {result.environment}
                    </p>
                    <p className="text-gray-700">
                      📏 Key Length: {result.keyLength} chars
                    </p>
                    {result.stripeLoaded !== undefined && (
                      <p className={result.stripeLoaded ? 'text-green-600' : 'text-red-600'}>
                        {result.stripeLoaded ? '✅' : '❌'} Stripe.js: {result.stripeLoaded ? 'Loaded' : 'Failed'}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {result && (
                <button 
                  onClick={testStripeJs}
                  className="mt-4 bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Test Stripe.js Loading
                </button>
              )}
            </div>

            {/* Test 2: API Endpoints */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                🔌 Test 2: API Endpoints
              </h2>
              
              <button 
                onClick={testApiEndpoint}
                disabled={loading}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {loading ? '⏳ Testing...' : 'Test Payment Intent Creation'}
              </button>
              
              {apiTest && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-bold text-gray-800 mb-2">API Test Results:</h3>
                  <div className="space-y-2 text-sm">
                    <p className={apiTest.success ? 'text-green-600' : 'text-red-600'}>
                      {apiTest.success ? '✅' : '❌'} Payment Intent: {apiTest.success ? 'SUCCESS' : 'FAILED'}
                    </p>
                    {apiTest.contractCreated && (
                      <p className="text-green-600">
                        ✅ Contract Created: {apiTest.contractId}
                      </p>
                    )}
                    {apiTest.paymentIntentCreated && (
                      <p className="text-green-600">
                        ✅ Payment Intent: {apiTest.paymentIntentId}
                      </p>
                    )}
                    {apiTest.amount && (
                      <p className="text-gray-700">
                        💰 Amount: {(apiTest.amount / 100).toFixed(2)} EUR
                      </p>
                    )}
                    {apiTest.error && (
                      <p className="text-red-600">
                        ❌ Error: {apiTest.error}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">
                📋 Expected Results
              </h2>
              <div className="text-blue-700 space-y-2 text-sm">
                <p><strong>Test 1 sollte zeigen:</strong></p>
                <ul className="list-disc list-inside ml-4">
                  <li>✅ Has Publishable Key: YES</li>
                  <li>🔑 Key Preview: pk_test_51...</li>
                  <li>🌍 Environment: TEST</li>
                  <li>✅ Stripe.js: Loaded</li>
                </ul>
                
                <p className="mt-4"><strong>Test 2 sollte zeigen:</strong></p>
                <ul className="list-disc list-inside ml-4">
                  <li>✅ Payment Intent: SUCCESS</li>
                  <li>💰 Amount: 19.90 EUR</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
