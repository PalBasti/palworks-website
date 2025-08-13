// pages/test-stripe-debug.js
import { useState } from 'react';

export default function TestStripeDebug() {
  const [contractTest, setContractTest] = useState(null);
  const [paymentTest, setPaymentTest] = useState(null);
  const [loading, setLoading] = useState({ contract: false, payment: false });

  // Test 1: Nur Contract Creation testen
  const testContractCreation = async () => {
    setLoading(prev => ({ ...prev, contract: true }));
    setContractTest(null);

    try {
      console.log('🧪 Testing contract creation...');
      
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractType: 'untermietvertrag',
          customerEmail: 'debug@palworks-test.de',
          formData: {
            landlord_name: 'Debug Vermieter',
            tenant_name: 'Debug Mieter',
            landlord_address: 'Teststraße 1, 12345 Berlin',
            tenant_address: 'Mietstraße 2, 12345 Berlin'
          },
          selectedAddons: [],
          totalAmount: 19.90
        })
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response headers:', response.headers);

      const responseText = await response.text();
      console.log('📊 Raw response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        data = { error: 'Invalid JSON response', rawResponse: responseText };
      }

      setContractTest({
        success: response.ok,
        status: response.status,
        data: data,
        rawResponse: responseText.length > 500 ? responseText.substring(0, 500) + '...' : responseText
      });

    } catch (error) {
      console.error('❌ Contract test error:', error);
      setContractTest({
        success: false,
        error: error.message,
        stack: error.stack
      });
    } finally {
      setLoading(prev => ({ ...prev, contract: false }));
    }
  };

  // Test 2: Payment Intent mit fester Contract ID testen
  const testPaymentIntent = async () => {
    setLoading(prev => ({ ...prev, payment: true }));
    setPaymentTest(null);

    try {
      console.log('🧪 Testing payment intent...');

      // Zuerst schauen ob wir eine Contract ID haben
      let contractId = contractTest?.data?.contract?.id;
      
      if (!contractId) {
        console.log('⚠️ No contract ID, using test ID');
        contractId = 'test-contract-id-123';
      }

      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractId: contractId
        })
      });

      console.log('📊 Payment response status:', response.status);

      const responseText = await response.text();
      console.log('📊 Payment raw response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Payment JSON parse error:', parseError);
        data = { error: 'Invalid JSON response', rawResponse: responseText };
      }

      setPaymentTest({
        success: response.ok,
        status: response.status,
        contractId: contractId,
        data: data,
        rawResponse: responseText.length > 500 ? responseText.substring(0, 500) + '...' : responseText
      });

    } catch (error) {
      console.error('❌ Payment test error:', error);
      setPaymentTest({
        success: false,
        error: error.message,
        stack: error.stack
      });
    } finally {
      setLoading(prev => ({ ...prev, payment: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🔍 Stripe Debug Dashboard
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Contract Test */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                📄 Test 1: Contract Creation
              </h2>
              
              <button 
                onClick={testContractCreation}
                disabled={loading.contract}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 w-full"
              >
                {loading.contract ? '⏳ Creating Contract...' : 'Test Contract API'}
              </button>
              
              {contractTest && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-bold text-gray-800 mb-2">Contract Results:</h3>
                  <div className="space-y-2 text-sm">
                    <p className={contractTest.success ? 'text-green-600' : 'text-red-600'}>
                      Status: {contractTest.success ? '✅ SUCCESS' : '❌ FAILED'} ({contractTest.status})
                    </p>
                    
                    {contractTest.data?.contract?.id && (
                      <p className="text-green-600">
                        ✅ Contract ID: {contractTest.data.contract.id}
                      </p>
                    )}
                    
                    {contractTest.data?.error && (
                      <p className="text-red-600">
                        ❌ API Error: {contractTest.data.error}
                      </p>
                    )}
                    
                    {contractTest.error && (
                      <p className="text-red-600">
                        ❌ Client Error: {contractTest.error}
                      </p>
                    )}
                    
                    <details className="mt-4">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                        📋 Show Raw Response
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                        {contractTest.rawResponse || JSON.stringify(contractTest, null, 2)}
                      </pre>
                    </details>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Intent Test */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                💳 Test 2: Payment Intent
              </h2>
              
              <button 
                onClick={testPaymentIntent}
                disabled={loading.payment}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 w-full"
              >
                {loading.payment ? '⏳ Creating Payment Intent...' : 'Test Payment API'}
              </button>
              
              {paymentTest && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-bold text-gray-800 mb-2">Payment Results:</h3>
                  <div className="space-y-2 text-sm">
                    <p className={paymentTest.success ? 'text-green-600' : 'text-red-600'}>
                      Status: {paymentTest.success ? '✅ SUCCESS' : '❌ FAILED'} ({paymentTest.status})
                    </p>
                    
                    <p className="text-gray-700">
                      Contract ID Used: {paymentTest.contractId}
                    </p>
                    
                    {paymentTest.data?.payment_intent?.id && (
                      <p className="text-green-600">
                        ✅ Payment Intent: {paymentTest.data.payment_intent.id}
                      </p>
                    )}
                    
                    {paymentTest.data?.client_secret && (
                      <p className="text-green-600">
                        ✅ Client Secret: {paymentTest.data.client_secret.substring(0, 20)}...
                      </p>
                    )}
                    
                    {paymentTest.data?.error && (
                      <p className="text-red-600">
                        ❌ API Error: {paymentTest.data.error}
                      </p>
                    )}
                    
                    {paymentTest.error && (
                      <p className="text-red-600">
                        ❌ Client Error: {paymentTest.error}
                      </p>
                    )}
                    
                    <details className="mt-4">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                        📋 Show Raw Response
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                        {paymentTest.rawResponse || JSON.stringify(paymentTest, null, 2)}
                      </pre>
                    </details>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 border border-blue-200 bg-blue-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">
              🔧 Debug Instructions
            </h2>
            <div className="text-blue-700 space-y-2 text-sm">
              <p><strong>Schritt 1:</strong> Teste "Contract API" - das sollte einen Contract in der DB erstellen</p>
              <p><strong>Schritt 2:</strong> Teste "Payment API" - das sollte einen Stripe Payment Intent erstellen</p>
              <p><strong>Bei Fehlern:</strong> Öffne die "Raw Response" Details und schicke mir den Output</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
