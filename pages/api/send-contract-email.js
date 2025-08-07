// pages/api/send-contract-email.js - OHNE RESEND DEPENDENCY
import { generateAndReturnPDF } from '../../lib/pdf/untermietvertragGenerator';

// Einfacher E-Mail-Service ohne externe Dependencies
const sendEmail = async (to, subject, htmlContent, pdfBuffer = null) => {
  // TESTING/DEVELOPMENT VERSION - Console Log + Success Response
  console.log('📧 E-MAIL-SIMULATION:');
  console.log('An:', to);
  console.log('Betreff:', subject);
  console.log('PDF-Anhang:', pdfBuffer ? 'Ja (' + pdfBuffer.byteLength + ' bytes)' : 'Nein');
  console.log('Inhalt-Vorschau:', htmlContent.substring(0, 150) + '...');
  
  // Simuliere erfolgreichen E-Mail-Versand
  return { 
    success: true, 
    data: { id: 'test_email_' + Date.now() },
    note: 'E-Mail-Simulation - Wurde nur geloggt, nicht wirklich versendet'
  };
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, contractType, formData, selectedAddons } = req.body;

    // Validierung
    if (!email || !formData || !contractType) {
      return res.status(400).json({ 
        error: 'Fehlende Daten',
        details: 'E-Mail, formData und contractType sind erforderlich' 
      });
    }

    // PDF generieren
    console.log('🔄 Generiere PDF für E-Mail-Versand...');
    const pdfBuffer = await generateAndReturnPDF(
      formData, 
      selectedAddons || [], 
      'arraybuffer'
    );

    // E-Mail-Template erstellen
    const htmlContent = createContractEmailTemplate(formData, contractType, selectedAddons);
    const subject = `Ihr ${contractType === 'untermietvertrag' ? 'Untermietvertrag' : 'Vertrag'} von PalWorks`;

    // E-Mail "senden" (aktuell nur Simulation)
    const emailResult = await sendEmail(
      email,
      subject,
      htmlContent,
      Buffer.from(pdfBuffer)
    );

    // Erfolgreiche Response
    return res.status(200).json({
      success: true,
      message: 'E-Mail erfolgreich versendet',
      emailId: emailResult.data?.id,
      testMode: true, // Immer Test-Modus ohne Resend
      note: 'E-Mail wurde simuliert - PDF wurde generiert aber nicht wirklich versendet'
    });

  } catch (error) {
    console.error('❌ Contract email error:', error);
    return res.status(500).json({ 
      error: 'E-Mail-Versand fehlgeschlagen',
      details: error.message 
    });
  }
}

// E-Mail-Template (gleich wie vorher)
function createContractEmailTemplate(formData, contractType, selectedAddons = []) {
  const hasProtocol = selectedAddons.includes('protocol');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Ihr Vertrag von PalWorks</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: white; padding: 30px; border-radius: 8px;">
        
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e9ecef; padding-bottom: 20px;">
          <div style="font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 10px;">📄 PalWorks</div>
          <h1>Ihr Untermietvertrag ist fertig!</h1>
        </div>

        <div style="background-color: #d4edda; color: #155724; padding: 12px; border-radius: 6px; margin: 20px 0;">
          ✅ <strong>Erfolgreich erstellt:</strong> Ihr rechtssicherer Untermietvertrag wurde generiert.
        </div>

        <p>Liebe/r ${formData.landlord_name || formData.tenant_name || 'Kunde/Kundin'},</p>
        
        <p>vielen Dank für Ihr Vertrauen in PalWorks! Ihr Untermietvertrag wurde erfolgreich erstellt.</p>

        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #2563eb;">
          <h3>📋 Vertragsdetails:</h3>
          <ul>
            <li><strong>Vertragstyp:</strong> Untermietvertrag (ganze Wohnung)</li>
            <li><strong>Mietobjekt:</strong> ${formData.property_address || '[Adresse]'}</li>
            ${formData.rent_amount ? `<li><strong>Monatsmiete:</strong> ${formData.rent_amount} EUR</li>` : ''}
            <li><strong>Erstellt am:</strong> ${new Date().toLocaleDateString('de-DE')}</li>
            ${hasProtocol ? '<li><strong>Übergabeprotokoll:</strong> Inklusive</li>' : ''}
          </ul>
        </div>

        <h3>🔍 Nächste Schritte:</h3>
        <ol>
          <li>PDF aus dem Browser herunterladen</li>
          <li>Vertrag mit der anderen Partei durchgehen</li>
          <li>Von beiden Parteien unterschreiben lassen</li>
          <li>Je eine Kopie für alle Beteiligten erstellen</li>
        </ol>

        <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>

        <p>Herzliche Grüße<br>Ihr PalWorks-Team</p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 12px; color: #6c757d; text-align: center;">
          <strong>PalWorks - Rechtssichere Vertragsvorlagen</strong><br>
          support@palworks.de | palworks.de
        </div>
      </div>
    </body>
    </html>
  `;
}

export const config = {
  api: {
    responseLimit: '10mb',
  },
};
