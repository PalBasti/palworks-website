// pages/api/generate-separate-pdfs.js
// Neue API für separate PDF-Downloads

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { formData, selectedAddons, contractType } = req.body;

    console.log('🔍 Separate PDFs API - Entry Point');
    console.log('🔍 Contract Type:', contractType);
    console.log('🔍 Selected Addons:', selectedAddons);

    // Validierung
    if (!formData || !contractType) {
      return res.status(400).json({ 
        error: 'Fehlende Daten', 
        details: 'formData und contractType sind erforderlich' 
      });
    }

    // Generator-Funktion je nach Vertragstyp laden
    let generateSeparateDocuments;
    
    switch (contractType) {
      case 'untermietvertrag':
        const untermiete = await import('../../lib/pdf/untermietvertragGenerator');
        generateSeparateDocuments = untermiete.generateSeparateDocuments;
        break;
        
      case 'garagenvertrag':
        const garage = await import('../../lib/pdf/garagenvertragGenerator');
        generateSeparateDocuments = garage.generateSeparateDocuments;
        break;
        
      case 'wg-untermietvertrag':
        const wg = await import('../../lib/pdf/wgUntermietvertragGenerator');
        generateSeparateDocuments = wg.generateSeparateDocuments;
        break;
        
      default:
        return res.status(400).json({ 
          error: 'Nicht unterstützter Vertragstyp',
          details: `${contractType} ist noch nicht implementiert` 
        });
    }

    if (!generateSeparateDocuments) {
      return res.status(500).json({ 
        error: 'Generator nicht gefunden',
        details: `Separate PDF Generator für ${contractType} nicht verfügbar` 
      });
    }

    // Separate PDFs generieren
    console.log('🔍 Generating separate documents...');
    const documents = await generateSeparateDocuments(formData, selectedAddons || [], 'arraybuffer');
    
    // Response formatieren
    const response = {
      success: true,
      documentCount: documents.length,
      documents: documents.map(doc => ({
        type: doc.type,
        name: doc.name,
        filename: doc.filename,
        size: doc.data.byteLength,
        data: Buffer.from(doc.data).toString('base64') // Als Base64 für JSON-Transport
      }))
    };

    console.log('🔍 Generated documents:', documents.map(d => d.filename));
    
    // JSON Response mit Base64-encodierten PDFs
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ Separate PDFs API Error:', error);
    return res.status(500).json({ 
      error: 'PDF-Generierung fehlgeschlagen',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

export const config = {
  api: {
    responseLimit: '50mb', // Mehrere PDFs können groß werden
  },
}
