import { useState } from 'react';

export default function TestTemplate() {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Komponenten-Test
          </h1>
          <p className="text-gray-600">
            Schritt-für-Schritt Testing einzelner Komponenten
          </p>
        </div>

        {/* Status Indicator */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              status === 'idle' ? 'bg-gray-100 text-gray-800' :
              status === 'loading' ? 'bg-blue-100 text-blue-800' :
              status === 'success' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              Status: {status}
            </div>
            
            {error && (
              <div className="text-red-600 text-sm">
                ❌ {error}
              </div>
            )}
            
            {success && (
              <div className="text-green-600 text-sm">
                ✅ {success}
              </div>
            )}
          </div>
        </div>

        {/* Test Content hier einfügen */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Komponente unter Test */}
        </div>

        {/* Debug Panel */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">🔍 Debug Info</h3>
          <pre className="text-xs text-gray-600 bg-white p-3 rounded overflow-auto">
            {JSON.stringify({
              status,
              error,
              success,
              timestamp: new Date().toISOString()
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
