// pages/test/01-newsletter-service.js
import { useState } from 'react';

export default function TestNewsletterService() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  // Test: Newsletter-Anmeldung
  const testSubscribe = async () => {
    try {
      setStatus('testing-subscribe');
      setError(null);
      
      const testEmail = `test.${Date.now()}@palworks-test.de`;
      
      // NewsletterService importieren
      const { subscribeToNewsletter } = await import('../../lib/supabase/newsletterService');
      
      const result = await subscribeToNewsletter(testEmail);
      
      setResults(prev => [...prev, {
        test: 'Newsletter Subscribe',
        email: testEmail,
        result,
        timestamp: new Date().toISOString()
      }]);

      if (result.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setError(result.error);
      }
    } catch (err) {
      setStatus('error');
      setError(err.message);
      console.error('Newsletter test error:', err);
    }
  };

  // Test: Doppelte Anmeldung
  const testDuplicateSubscribe = async () => {
    try {
      setStatus('testing-duplicate');
      setError(null);
      
      const testEmail = 'duplicate.test@palworks-test.de';
      
      const { subscribeToNewsletter } = await import('../../lib/supabase/newsletterService');
      
      // Erste Anmeldung
      const result1 = await subscribeToNewsletter(testEmail);
      
      // Zweite Anmeldung (sollte "already subscribed" zurückgeben)
      const result2 = await subscribeToNewsletter(testEmail);
      
      setResults(prev => [...prev, 
        {
          test: 'First Subscribe',
          email: testEmail,
          result: result1,
          timestamp: new Date().toISOString()
        },
        {
          test: 'Duplicate Subscribe',
          email: testEmail,
          result: result2,
          timestamp: new Date().toISOString()
        }
      ]);

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  };

  // Test: Ungültige E-Mail
  const testInvalidEmail = async () => {
    try {
      setStatus('testing-invalid');
      setError(null);
      
      const invalidEmails = ['invalid', 'test@', '@test.com', ''];
      const { subscribeToNewsletter } = await import('../../lib/supabase/newsletterService');
      
      const testResults = [];
      
      for (const invalidEmail of invalidEmails) {
        const result = await subscribeToNewsletter(invalidEmail);
        testResults.push({
          test: 'Invalid Email Test',
          email: invalidEmail,
          result,
          timestamp: new Date().toISOString()
        });
      }
      
      setResults(prev => [...prev, ...testResults]);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  };

  // Test: Newsletter-Status prüfen
  const testGetStatus = async () => {
    try {
      setStatus('testing-status');
      setError(null);
      
      const { getNewsletterStatus } = await import('../../lib/supabase/newsletterService');
      
      const testEmail = 'status.test@palworks-test.de';
      const result = await getNewsletterStatus(testEmail);
      
      setResults(prev => [...prev, {
        test: 'Get Newsletter Status',
        email: testEmail,
        result,
        timestamp: new Date().toISOString()
      }]);

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  };

  // Alle Tests löschen
  const clearResults = () => {
    setResults([]);
    setStatus('idle');
    setError(null);
  };

  // Supabase-Verbindung testen
  const testConnection = async () => {
    try {
      setStatus('testing-connection');
      setError(null);
      
      const { supabase } = await import('../../lib/supabase/supabase');
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      
      setResults(prev => [...prev, {
        test: 'Supabase Connection',
        result: { success: true, message: 'Verbindung erfolgreich' },
        timestamp: new Date().toISOString()
      }]);
      
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err.message);
      
      setResults(prev => [...prev, {
        test: 'Supabase Connection',
        result: { success: false, error: err.message },
        timestamp: new Date().toISOString()
      }]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Test 1: Newsletter Service
          </h1>
          <p className="text-gray-600">
            Teste den Newsletter-Service bevor andere Komponenten integriert werden
          </p>
        </div>

        {/* Status */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              status === 'idle' ? 'bg-gray-100 text-gray-800' :
              status.includes('testing') ? 'bg-blue-100 text-blue-800' :
              status === 'success' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              Status: {status}
            </div>
            
            <div className="text-sm text-gray-600">
              Tests durchgeführt: {results.length}
            </div>
          </div>
          
          {error && (
            <div className="mt-3 p-3 bg-red-50 rounded text-red-700 text-sm">
              ❌ <strong>Fehler:</strong> {error}
            </div>
          )}
        </div>

        {/* Test Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">📋 Newsletter Service Tests</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={testConnection}
              disabled={status.includes('testing')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              1. Supabase-Verbindung
            </button>
            
            <button
              onClick={testSubscribe}
              disabled={status.includes('testing')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              2. Newsletter-Anmeldung
            </button>
            
            <button
              onClick={testDuplicateSubscribe}
              disabled={status.includes('testing')}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50"
            >
              3. Doppelte Anmeldung
            </button>
            
            <button
              onClick={testInvalidEmail}
              disabled={status.includes('testing')}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
            >
              4. Ungültige E-Mails
            </button>
            
            <button
              onClick={testGetStatus}
              disabled={status.includes('testing')}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
            >
              5. Status prüfen
            </button>
            
            <button
              onClick={clearResults}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              🗑️ Ergebnisse löschen
            </button>
          </div>
        </div>

        {/* Test Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">📊 Test-Ergebnisse</h3>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.result.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">
                      {result.result.success ? '✅' : '❌'} {result.test}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {result.email && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>E-Mail:</strong> {result.email}
                    </p>
                  )}
                  
                  <div className="text-sm">
                    {result.result.success ? (
                      <div className="text-green-700">
                        <strong>Erfolg:</strong> {result.result.message || 'Test bestanden'}
                        {result.result.alreadySubscribed && ' (Bereits angemeldet)'}
                      </div>
                    ) : (
                      <div className="text-red-700">
                        <strong>Fehler:</strong> {result.result.error}
                      </div>
                    )}
                  </div>
                  
                  {/* Raw Result für Debugging */}
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer">
                      Raw Result anzeigen
                    </summary>
                    <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                      {JSON.stringify(result.result, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Erfolgs-Checklist */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">✅ Erfolgs-Checklist</h3>
          <div className="space-y-2 text-sm">
            {[
              'Supabase-Verbindung funktioniert',
              'Newsletter-Anmeldung mit neuer E-Mail erfolgreich',
              'Doppelte Anmeldung wird korrekt behandelt',
              'Ungültige E-Mails werden abgelehnt',
              'Newsletter-Status kann abgerufen werden'
            ].map((item, index) => {
              const hasSuccessfulTest = results.some(r => 
                r.test.includes(['Connection', 'Subscribe', 'Duplicate', 'Invalid', 'Status'][index]) && 
                r.result.success
              );
              
              return (
                <div key={index} className="flex items-center">
                  <div className={`w-4 h-4 rounded mr-3 ${
                    hasSuccessfulTest ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <span className={hasSuccessfulTest ? 'text-gray-900' : 'text-gray-500'}>
                    {item}
                  </span>
                </div>
              );
            })}
          </div>
          
          {results.filter(r => r.result.success).length >= 3 && (
            <div className="mt-4 p-3 bg-green-50 rounded text-green-800">
              🎉 <strong>Newsletter Service ist bereit!</strong> Du kannst zur nächsten Komponente.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
