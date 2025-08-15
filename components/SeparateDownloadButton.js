// components/SeparateDownloadButton.js
// Button-Komponente für separate PDF-Downloads mit Progress-Anzeige

import { useState } from 'react';
import { useSeparateDownloads } from '../hooks/useSeparateDownloads';

export function SeparateDownloadButton({ 
  formData, 
  selectedAddons = [], 
  contractType,
  className = '',
  variant = 'separate', // 'separate' | 'combined' | 'both'
  children 
}) {
  const { 
    downloadSeparatePDFs, 
    downloadCombinedPDF, 
    isGenerating, 
    downloadProgress, 
    error,
    clearError 
  } = useSeparateDownloads();

  const [lastDownloadInfo, setLastDownloadInfo] = useState(null);

  // Anzahl erwarteter Dokumente berechnen
  const getExpectedDocumentCount = () => {
    let count = 1; // Hauptvertrag
    if (selectedAddons.includes('explanation') || selectedAddons.includes('explanations')) count++;
    if (selectedAddons.includes('protocol') || selectedAddons.includes('handover_protocol')) count++;
    return count;
  };

  // Separate Downloads starten
  const handleSeparateDownload = async () => {
    try {
      clearError();
      console.log('🔍 Starting separate downloads from component...');
      
      const result = await downloadSeparatePDFs(formData, selectedAddons, contractType);
      
      setLastDownloadInfo({
        type: 'separate',
        count: result.documentCount,
        documents: result.documents
      });
      
      console.log('✅ Downloads completed successfully');
      
    } catch (error) {
      console.error('❌ Download failed:', error);
      // Error wird bereits im Hook gesetzt
    }
  };

  // Kombinierter Download starten
  const handleCombinedDownload = async () => {
    try {
      clearError();
      console.log('🔍 Starting combined download from component...');
      
      const result = await downloadCombinedPDF(formData, selectedAddons, contractType);
      
      setLastDownloadInfo({
        type: 'combined',
        count: result.documentCount
      });
      
      console.log('✅ Combined download completed');
      
    } catch (error) {
      console.error('❌ Combined download failed:', error);
      // Error wird bereits im Hook gesetzt
    }
  };

  // Progress-Balken Komponente
  const ProgressBar = () => {
    if (!isGenerating || downloadProgress.total === 0) return null;
    
    const percentage = (downloadProgress.current / downloadProgress.total) * 100;
    
    return (
      <div className="mt-3 w-full">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            {downloadProgress.currentFile}
          </span>
          <span className="text-sm text-gray-500">
            {downloadProgress.current} / {downloadProgress.total}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  // Success-Message Komponente
  const SuccessMessage = () => {
    if (!lastDownloadInfo || isGenerating) return null;
    
    return (
      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-green-800 font-medium">
            {lastDownloadInfo.type === 'separate' 
              ? `${lastDownloadInfo.count} Dokumente erfolgreich heruntergeladen!`
              : 'PDF erfolgreich heruntergeladen!'
            }
          </span>
        </div>
        
        {lastDownloadInfo.type === 'separate' && lastDownloadInfo.documents && (
          <div className="mt-2 text-sm text-green-700">
            Downloads: {lastDownloadInfo.documents.map(d => d.filename).join(', ')}
          </div>
        )}
      </div>
    );
  };

  // Error-Message Komponente
  const ErrorMessage = () => {
    if (!error) return null;
    
    return (
      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-red-800 font-medium">Download fehlgeschlagen</span>
        </div>
        <p className="mt-1 text-sm text-red-700">{error}</p>
        <button
          onClick={clearError}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Fehler ausblenden
        </button>
      </div>
    );
  };

  // Haupt-Render
  if (variant === 'both') {
    return (
      <div className={`space-y-3 ${className}`}>
        {/* Separate Downloads Button */}
        <button
          onClick={handleSeparateDownload}
          disabled={isGenerating}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Generiere {getExpectedDocumentCount()} Dokumente...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {getExpectedDocumentCount()} separate PDFs herunterladen
            </>
          )}
        </button>

        {/* Kombinierter Download Button */}
        <button
          onClick={handleCombinedDownload}
          disabled={isGenerating}
          className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Oder als kombiniertes PDF
        </button>

        <ProgressBar />
        <SuccessMessage />
        <ErrorMessage />
      </div>
    );
  }

  // Einzelner Button (separate oder combined)
  const isSeparate = variant === 'separate';
  const handleClick = isSeparate ? handleSeparateDownload : handleCombinedDownload;
  
  return (
    <div className={className}>
      <button
        onClick={handleClick}
        disabled={isGenerating}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            {isSeparate ? `Generiere ${getExpectedDocumentCount()} Dokumente...` : 'Generiere PDF...'}
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {children || (isSeparate 
              ? `${getExpectedDocumentCount()} separate PDFs herunterladen`
              : 'PDF herunterladen'
            )}
          </>
        )}
      </button>

      <ProgressBar />
      <SuccessMessage />
      <ErrorMessage />
    </div>
  );
}
