// pages/api/generate-pdf.js
import { generateAndReturnPDF } from '../../lib/pdf/untermietvertragGenerator';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { formData, selectedAddons, contractType } = req.body;

    // Validierung
    if (!formData || !contractType) {
      return res.status(400).json({ 
        error: 'Fehlende Daten', 
        details: 'formData und contractType sind erforderlich' 
      });
    }

    // Nur Untermietvertrag ist implementiert
    if (contractType !== 'untermietvertrag') {
      return res.status(400).json({ 
        error: 'Nicht unterstützter Vertragstyp',
        details: `${contractType} ist noch nicht implementiert` 
      });
    }

    // PDF generieren
    const pdfBuffer = await generateAndReturnPDF(formData, selectedAddons || [], 'arraybuffer');
    
    // Response Headers für PDF-Download setzen
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="untermietvertrag_${Date.now()}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.byteLength);

    // PDF als Buffer senden
    return res.status(200).send(Buffer.from(pdfBuffer));

  } catch (error) {
    console.error('PDF API Error:', error);
    return res.status(500).json({ 
      error: 'PDF-Generierung fehlgeschlagen',
      details: error.message 
    });
  }
}

export const config = {
  api: {
    responseLimit: '10mb', // PDFs können groß werden
  },
}
