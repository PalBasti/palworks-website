// pages/webhook-test.js
import { useState } from 'react';

export default function WebhookTestPage() {
  const [testResults, setTestResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Test 1: Contract Creation
  const testContractCreation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/contracts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_type: 'untermietvertrag',
          customer_email: 'test@palworks-debug.de', // ✅ FIX: Fehlende customer_email hinzugefügt
          form_data: {
            mieter_name: 'Test User Debug',
            mieter_email: 'test@palworks-debug.de',
            objekt_adresse: 'Teststraße 123, 12345 Berlin',
            miete_betrag: '500',
            mietvertrag_beginn: '2025-09-01'
          },
          selected_addons: ['rechtsberatung'],
          total_amount: 39.90,
          base_price: 19.90
        })
      });

      const result = await response.json();
      setTestResults(prev => ({
        ...prev,
        contractCreation: {
          success: response.ok,
          data: result,
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        contractCreation: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }));
    }
    setIsLoading(false);
  };

  // Test 2: Payment Intent Creation
  const testPaymentIntent = async () => {
    if (!testResults?.contractCreation?.data?.contract_id) {
      alert('Bitte zuerst Contract Creation testen!');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_id: testResults.contractCreation.data.contract_id,
          amount: 3990, // 39.90 EUR in Cents
          currency: 'eur'
        })
      });

      const result = await response.json();
      setTestResults(prev => ({
        ...prev,
        paymentIntent: {
          success: response.ok,
          data: result,
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        paymentIntent: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }));
    }
    setIsLoading(false);
  };

  // Test 3: Webhook Simulation
  const testWebhookSimulation = async () => {
    if (!testResults?.paymentIntent?.data?.payment_intent?.id) {
      alert('Bitte zuerst Payment Intent erstellen!');
      return;
    }

    setIsLoading(true);
    try {
      // Simuliere ein erfolgreicherss Payment Intent Event
      const mockWebhookEvent = {
        id: 'evt_test_' + Math.random().toString(36).substr(2, 9),
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: testResults.paymentIntent.data.payment_intent.id,
            amount_received: 3990,
            metadata: {
              contract_id: testResults.contractCreation.data.contract_id
            },
            receipt_email: 'test@example.com'
          }
        }
      };

      // Direkter API-Call an Webhook (ohne Stripe Signature für Test)
      const response = await fetch('/api/test/webhook-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockWebhookEvent)
      });

      const result = await response.json();
      setTestResults(prev => ({
        ...prev,
        webhookSimulation: {
          success: response.ok,
          data: result,
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        webhookSimulation: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }));
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Webhook Integration Test Suite
          </h1>
          <p className="text-gray-600">
            Phase 1.2 - Teste den kompletten Payment-to-Webhook Flow
          </p>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            🎯 Test Sequence
          </h2>
          
          <div className="grid gap-4 md:grid-cols-3">
            {/* Test 1 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">
                1️⃣ Contract Creation
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Erstelle Test-Contract in Supabase
              </p>
              <button
                onClick={testContractCreation}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                {isLoading ? '⏳ Creating...' : 'Test Contract API'}
              </button>
              
              {testResults?.contractCreation && (
                <div className={`mt-3 p-2 rounded text-sm ${
                  testResults.contractCreation.success 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {testResults.contractCreation.success ? '✅ SUCCESS' : '❌ FAILED'}
                  {testResults.contractCreation.data?.contract_id && (
                    <div>ID: {testResults.contractCreation.data.contract_id.slice(0, 8)}...</div>
                  )}
                </div>
              )}
            </div>

            {/* Test 2 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">
                2️⃣ Payment Intent
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Erstelle Stripe Payment Intent
              </p>
              <button
                onClick={testPaymentIntent}
                disabled={isLoading || !testResults?.contractCreation?.success}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                {isLoading ? '⏳ Creating...' : 'Test Payment API'}
              </button>
              
              {testResults?.paymentIntent && (
                <div className={`mt-3 p-2 rounded text-sm ${
                  testResults.paymentIntent.success 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {testResults.paymentIntent.success ? '✅ SUCCESS' : '❌ FAILED'}
                  {testResults.paymentIntent.data?.payment_intent?.id && (
                    <div>PI: {testResults.paymentIntent.data.payment_intent.id.slice(0, 8)}...</div>
                  )}
                </div>
              )}
            </div>

            {/* Test 3 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">
                3️⃣ Webhook Simulation
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Simuliere payment_intent.succeeded
              </p>
              <button
                onClick={testWebhookSimulation}
                disabled={isLoading || !testResults?.paymentIntent?.success}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                {isLoading ? '⏳ Testing...' : 'Test Webhook'}
              </button>
              
              {testResults?.webhookSimulation && (
                <div className={`mt-3 p-2 rounded text-sm ${
                  testResults.webhookSimulation.success 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {testResults.webhookSimulation.success ? '✅ SUCCESS' : '❌ FAILED'}
                </div>
              )}
            </div>
          </div>

          {/* Quick Test All Button */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={async () => {
                await testContractCreation();
                setTimeout(async () => {
                  await testPaymentIntent();
                  setTimeout(async () => {
                    await testWebhookSimulation();
                  }, 1000);
                }, 1000);
              }}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              🚀 Run Full Test Sequence
            </button>
          </div>
        </div>

        {/* Detailed Results */}
        {testResults && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📊 Detailed Test Results
            </h2>
            
            <div className="space-y-4">
              {Object.entries(testResults).map(([testName, result]) => (
                <details key={testName} className="border border-gray-200 rounded-lg">
                  <summary className="cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <span className="font-medium">
                      {testName === 'contractCreation' && '📄 Contract Creation'}
                      {testName === 'paymentIntent' && '💳 Payment Intent'}
                      {testName === 'webhookSimulation' && '🔔 Webhook Simulation'}
                    </span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      result.success 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.success ? 'SUCCESS' : 'FAILED'}
                    </span>
                  </summary>
                  
                  <div className="p-4">
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 border border-blue-200 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">
            📋 Test Instructions
          </h2>
          <div className="text-blue-700 space-y-2">
            <p><strong>Phase 1.2 Ziel:</strong> Webhook-Integration validieren</p>
            <p><strong>Expected Flow:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Contract wird in Supabase erstellt (Status: 'draft')</li>
              <li>Payment Intent wird in Stripe erstellt</li>
              <li>Webhook simuliert Payment Success</li>
              <li>Contract Status wird auf 'paid' gesetzt</li>
              <li>Payment Log wird aktualisiert</li>
            </ol>
            <p className="mt-4"><strong>Bei Fehlern:</strong> Checke Console Logs und API-Responses</p>
          </div>
        </div>
      </div>
    </div>
  );
}
