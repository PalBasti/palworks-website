// components/DownloadIntegrationWrapper.js
// Wrapper-Komponente zur einfachen Integration in bestehende Formulare

import { SeparateDownloadButton } from './SeparateDownloadButton';

export function DownloadIntegrationWrapper({ 
  formData, 
  selectedAddons = [], 
  contractType,
  customerEmail,
  totalPrice,
  onDownloadStart,
  onDownloadComplete,
  onDownloadError,
  className = ''
}) {
  
  // Event-Handler für Download-Events
  const handleDownloadStart = () => {
    console.log('🔍 Download started from wrapper');
    onDownloadStart?.();
  };

  const handleDownloadComplete = (result) => {
    console.log('✅ Download completed from wrapper:', result);
    onDownloadComplete?.(result);
  };

  const handleDownloadError = (error) => {
    console.error('❌ Download error from wrapper:', error);
    onDownloadError?.(error);
  };

  // Validierung vor Download
  const isReadyForDownload = () => {
    if (!formData || Object.keys(formData).length === 0) {
      console.warn('⚠️ FormData is empty');
      return false;
    }
    
    if (!contractType) {
      console.warn('⚠️ ContractType missing');
      return false;
    }
    
    return true;
  };

  // Enhanced SeparateDownloadButton mit Event-Handling
  const EnhancedDownloadButton = (props) => {
    const originalProps = { ...props };
    
    // Wrap die internen Handler
    const enhancedHandleSeparateDownload = async () => {
      handleDownloadStart();
      try {
        const result = await originalProps.downloadSeparatePDFs?.(formData, selectedAddons, contractType);
        handleDownloadComplete(result);
        return result;
      } catch (error) {
        handleDownloadError(error);
        throw error;
      }
    };

    return (
      <SeparateDownloadButton
        {...originalProps}
        formData={formData}
        selectedAddons={selectedAddons}
        contractType={contractType}
        className={className}
      />
    );
  };

  if (!isReadyForDownload()) {
    return (
      <div className={`p-4 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
        <div className="flex items-center">
          <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-yellow-800 font-medium">Bitte füllen Sie alle Pflichtfelder aus</span>
        </div>
        <p className="text-yellow-700 text-sm mt-1">
          Vertragstyp und Grunddaten müssen vollständig sein, bevor der Download möglich ist.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Info-Header mit Zusammenfassung */}
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">🎯 Ihre Downloads</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>Vertragstyp:</strong> {contractType}</p>
          <p><strong>E-Mail-Versand an:</strong> {customerEmail || '[E-Mail erforderlich]'}</p>
          <p><strong>Gesamtpreis:</strong> {totalPrice ? `${totalPrice}€` : 'Wird berechnet...'}</p>
          <p><strong>Dokumente:</strong> {1 + (selectedAddons?.length || 0)} PDF(s)</p>
        </div>
      </div>

      {/* Download-Button mit beiden Optionen */}
      <SeparateDownloadButton
        formData={formData}
        selectedAddons={selectedAddons}
        contractType={contractType}
        variant="both"
        className="w-full"
      />

      {/* Hinweise für bessere UX */}
      <div className="mt-4 text-xs text-gray-600 space-y-1">
        <p>💡 <strong>Separate Downloads:</strong> Jedes Dokument als einzelne PDF-Datei</p>
        <p>📄 <strong>Kombiniertes PDF:</strong> Alle Dokumente in einer Datei</p>
        <p>📧 <strong>E-Mail-Versand:</strong> Downloads werden zusätzlich per E-Mail versendet</p>
      </div>
    </div>
  );
}

// Vereinfachte Variante für schnelle Integration
export function QuickDownloadButton({ 
  formData, 
  selectedAddons = [], 
  contractType,
  className = '' 
}) {
  return (
    <SeparateDownloadButton
      formData={formData}
      selectedAddons={selectedAddons}
      contractType={contractType}
      variant="separate"
      className={className}
    />
  );
}

// Export für bestehende Formulare
export default DownloadIntegrationWrapper;
