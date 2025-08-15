// hooks/useSeparateDownloads.js
// React Hook für separate PDF-Downloads

import { useState } from 'react';

export function useSeparateDownloads() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({
    current: 0,
    total: 0,
    currentFile: ''
  });
  const [error, setError] = useState(null);

  /**
   * Startet Download von separaten PDFs
   */
  const downloadSeparatePDFs = async (formData, selectedAddons, contractType) => {
    try {
      setIsGenerating(true);
      setError(null);
      setDownloadProgress({ current: 0, total: 0, currentFile: 'Generiere PDFs...' });

      console.log('🔍 Starting separate downloads...');
      console.log('🔍 Contract Type:', contractType);
      console.log('🔍 Selected Addons:', selectedAddons);

      // API aufrufen
      const response = await fetch('/api/generate-separate-pdfs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          selectedAddons,
          contractType
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'PDF-Generierung fehlgeschlagen');
      }

      const data = await response.json();
      
      if (!data.success || !data.documents) {
        throw new Error('Ungültige API-Antwort');
      }

      console.log('🔍 Received documents:', data.documents.map(d => d.filename));

      // Progress für Downloads setzen
      setDownloadProgress({ 
        current: 0, 
        total: data.documents.length, 
        currentFile: 'Starte Downloads...' 
      });

      // Jedes PDF einzeln downloaden
      for (let i = 0; i < data.documents.length; i++) {
        const doc = data.documents[i];
        
        setDownloadProgress({ 
          current: i + 1, 
          total: data.documents.length, 
          currentFile: doc.filename 
        });

        await downloadSinglePDF(doc);
        
        // Kurze Pause zwischen Downloads (bessere UX)
        if (i < data.documents.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      console.log('✅ All downloads completed');
      
      return {
        success: true,
        documentCount: data.documents.length,
        documents: data.documents.map(d => ({
          name: d.name,
          filename: d.filename,
          type: d.type
        }))
      };

    } catch (error) {
      console.error('❌ Separate downloads failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsGenerating(false);
      setDownloadProgress({ current: 0, total: 0, currentFile: '' });
    }
  };

  /**
   * Lädt ein einzelnes PDF herunter
   */
  const downloadSinglePDF = async (document) => {
    try {
      // Base64 zu Blob konvertieren
      const binaryString = atob(document.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: 'application/pdf' });
      
      // Download starten
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = document.filename;
      
      // Link zum DOM hinzufügen, klicken, wieder entfernen
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // URL cleanup
      URL.revokeObjectURL(url);
      
      console.log('✅ Downloaded:', document.filename);
      
    } catch (error) {
      console.error('❌ Single download failed:', document.filename, error);
      throw new Error(`Download von ${document.filename} fehlgeschlagen: ${error.message}`);
    }
  };

  /**
   * Fallback: Einzelner kombinierter Download (für bestehende Integration)
   */
  const downloadCombinedPDF = async (formData, selectedAddons, contractType) => {
    try {
      setIsGenerating(true);
      setError(null);
      setDownloadProgress({ current: 0, total: 1, currentFile: 'Generiere PDF...' });

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          selectedAddons,
          contractType
        })
      });

      if (!response.ok) {
        throw new Error('PDF-Generierung fehlgeschlagen');
      }

      const blob = await response.blob();
      
      // Download starten
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${contractType}_${Date.now()}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { success: true, documentCount: 1 };

    } catch (error) {
      console.error('❌ Combined download failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsGenerating(false);
      setDownloadProgress({ current: 0, total: 0, currentFile: '' });
    }
  };

  return {
    // States
    isGenerating,
    downloadProgress,
    error,
    
    // Actions
    downloadSeparatePDFs,
    downloadCombinedPDF,
    
    // Utilities
    clearError: () => setError(null)
  };
}
