// pages/test-supabase-debug.js
import { useState } from 'react';

export default function TestSupabaseDebug() {
  const [supabaseTest, setSupabaseTest] = useState(null);
  const [contractServiceTest, setContractServiceTest] = useState(null);
  const [directDbTest, setDirectDbTest] = useState(null);
  const [loading, setLoading] = useState({ supabase: false, service: false, direct: false });

  // Test 1: Supabase-Verbindung testen
  const testSupabaseConnection = async () => {
    setLoading(prev => ({ ...prev, supabase: true }));
    setSupabaseTest(null);

    try {
      console.log('🧪 Testing Supabase connection...');
      
      // Direkte API-Route für Supabase-Test erstellen
      const response = await fetch('/api/test-supabase', {
        method: 'GET'
      });

      const data = await response.json();
      
      setSupabaseTest({
        success: response.ok,
        status: response.status,
        data: data
      });

    } catch (error) {
      console.error('❌ Supabase test error:', error);
      setSupabaseTest({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(prev => ({ ...prev, supabase: false }));
    }
  };

  // Test 2: Contract Service direkt testen
  const testContractService = async () => {
    setLoading(prev => ({ ...prev, service: true }));
    setContractServiceTest(null);

    try {
      console.log('🧪 Testing contract service...');
      
      // Contract Service direkt importieren und testen
      const { createContract } = await import('../lib/supabase/contractService');
      
      const testData = {
        contractType: 'untermietvertrag',
        customerEmail: 'service-test@palworks-debug.de',
        formData: {
          landlord_name: 'Service Test Vermieter',
          tenant_name: 'Service Test Mieter'
        },
        selectedAddons: [],
        totalAmount: 19.90
      };

      console.log('📊 Test data:', testData);
      
      const result = await createContract(testData);
      
      console.log('📊 Service result:', result);
      
      setContractServiceTest({
        success: result.success,
        result: result,
        testData: testData
      });

    } catch (error) {
      console.error('❌ Contract service error:', error);
      setContractServiceTest({
        success: false,
        error: error.message,
        stack: error.stack
      });
    } finally {
      setLoading(prev => ({ ...prev, service: false }));
    }
  };

  // Test 3: Direkte DB-Verbindung testen
  const testDirectDb = async () => {
    setLoading(prev => ({ ...prev, direct: true }));
    setDirectDbTest(null);

    try {
      console.log('🧪 Testing direct DB...');
      
      const response = await fetch('/api/test-db-direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: 'direct-db-access'
        })
      });

      const data = await response.json();
      
      setDirectDbTest({
        success: response.ok,
        status: response.status,
        data: data
      });

    } catch (error) {
      console.error('❌ Direct DB test error:', error);
      setDirectDbTest({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(prev => ({ ...prev, direct: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🔍 Supabase Debug Dashboard
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Test 1: Supabase Connection */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">
                🔌 Supabase Connection
              </h2>
              
              <button 
                onClick={testSupabaseConnection}
                disabled={loading.supabase}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 w-full mb-4"
              >
                {loading.supabase ? '⏳ Testing...' : 'Test Connection'}
              </button>
              
              {supabaseTest && (
                <div className="p-3 bg-gray-50 rounded text-sm">
                  <p className={supabaseTest.success ? 'text-green-600' : 'text-red-600'}>
                    {supabaseTest.success ? '✅ SUCCESS' : '❌ FAILED'}
                  </p>
                  
                  {supabaseTest.data?.hasUrl && (
                    <p className="text-green-600">✅ Has URL</p>
                  )}
                  
                  {supabaseTest.data?.hasKey && (
                    <p className="text-green-600">✅ Has Key</p>
                  )}
                  
                  {supabaseTest.data?.canConnect && (
                    <p className="text-green-600">✅ Can Connect</p>
                  )}
                  
                  {supabaseTest.error && (
                    <p className="text-red-600">❌ {supabaseTest.error}</p>
                  )}
                  
                  <details className="mt-2">
                    <summary className="cursor-pointer text-blue-600">Details</summary>
                    <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(supabaseTest.data, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>

            {/* Test 2: Contract Service */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">
                📄 Contract Service
              </h2>
              
              <button 
                onClick={testContractService}
                disabled={loading.service}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 w-full mb-4"
              >
                {loading.service ? '⏳ Testing...' : 'Test Service'}
              </button>
              
              {contractServiceTest && (
                <div className="p-3 bg-gray-50 rounded text-sm">
                  <p className={contractServiceTest.success ? 'text-green-600' : 'text-red-600'}>
                    {contractServiceTest.success ? '✅ SUCCESS' : '❌ FAILED'}
                  </p>
                  
                  {contractServiceTest.result?.contract?.id && (
                    <p className="text-green-600">
                      ✅ Contract: {contractServiceTest.result.contract.id}
                    </p>
                  )}
                  
                  {contractServiceTest.result?.error && (
                    <p className="text-red-600">
                      ❌ Service Error: {contractServiceTest.result.error}
                    </p>
                  )}
                  
                  {contractServiceTest.error && (
                    <p className="text-red-600">
                      ❌ Import Error: {contractServiceTest.error}
                    </p>
                  )}
                  
                  <details className="mt-2">
                    <summary className="cursor-pointer text-blue-600">Details</summary>
                    <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(contractServiceTest, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>

            {/* Test 3: Direct DB */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">
                🗄️ Direct DB Access
              </h2>
              
              <button 
                onClick={testDirectDb}
                disabled={loading.direct}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 w-full mb-4"
              >
                {loading.direct ? '⏳ Testing...' : 'Test DB Direct'}
              </button>
              
              {directDbTest && (
                <div className="p-3 bg-gray-50 rounded text-sm">
                  <p className={directDbTest.success ? 'text-green-600' : 'text-red-600'}>
                    {directDbTest.success ? '✅ SUCCESS' : '❌ FAILED'}
                  </p>
                  
                  {directDbTest.data?.tablesExist && (
                    <p className="text-green-600">✅ Tables Exist</p>
                  )}
                  
                  {directDbTest.data?.canInsert && (
                    <p className="text-green-600">✅ Can Insert</p>
                  )}
                  
                  {directDbTest.error && (
                    <p className="text-red-600">❌ {directDbTest.error}</p>
                  )}
                  
                  <details className="mt-2">
                    <summary className="cursor-pointer text-blue-600">Details</summary>
                    <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(directDbTest.data, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          </div>

          {/* Environment Info */}
          <div className="mt-8 border border-blue-200 bg-blue-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">
              📋 Environment Check
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
                <p><strong>Supabase Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
              </div>
              <div>
                <p><strong>URL Preview:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30)}...</p>
                <p><strong>Key Preview:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
