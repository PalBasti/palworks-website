// pages/api/send-contract-email.js
import { generateAndReturnPDF } from '../../lib/pdf/untermietvertragGenerator';

// Für Produktion: Resend oder SendGrid verwenden
// Für Testing: Console-Output
const sendEmail = async (to, subject, htmlContent, pdfBuffer = null) => {
  // PRODUCTION VERSION - Resend Integration
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      const attachments = [];
      if (pdfBuffer) {
        attachments.push({
          filename: 'untermietvertrag.pdf',
          content: pdfBuffer,
        });
      }

      const { data, error } = await resend.emails.send({
        from: 'PalWorks <noreply@palworks.de>',
        to: [to],
        subject,
        html: htmlContent,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Resend email error:', error);
      throw error;
    }
  }

  // TESTING VERSION - Console Log
  console.log('📧 E-MAIL WÜRDE GESENDET WERDEN:');
  console.log('An:', to);
  console.log('Betreff:', subject);
  console.log('PDF-Anhang:', pdfBuffer ? 'Ja (' + pdfBuffer.byteLength + ' bytes)' : 'Nein');
  console.log('HTML-Inhalt:', htmlContent.substring(0, 200) + '...');
  
  return { 
    success: true, 
    data: { id: 'test_' + Date.now() },
    note: 'Test-Modus - E-Mail wurde nur geloggt'
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
    const pdfBuffer = await generateAndReturnPDF(
      formData, 
      selectedAddons || [], 
      'arraybuffer'
    );

    // E-Mail-Template
    const htmlContent = createContractEmailTemplate(formData, contractType, selectedAddons);
    const subject = `Ihr ${contractType === 'untermietvertrag' ? 'Untermietvertrag' : 'Vertrag'} von PalWorks`;

    // E-Mail senden
    const emailResult = await sendEmail(
      email,
      subject,
      htmlContent,
      Buffer.from(pdfBuffer)
    );

    return res.status(200).json({
      success: true,
      message: 'E-Mail erfolgreich versendet',
      emailId: emailResult.data?.id,
      testMode: !process.env.RESEND_API_KEY
    });

  } catch (error) {
    console.error('Contract email error:', error);
    return res.status(500).json({ 
      error: 'E-Mail-Versand fehlgeschlagen',
      details: error.message 
    });
  }
}

// E-Mail-Template erstellen
function createContractEmailTemplate(formData, contractType, selectedAddons = []) {
  const hasProtocol = selectedAddons.includes('protocol');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ihr Vertrag von PalWorks</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background-color: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #e9ecef;
          padding-bottom: 20px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .success-badge {
          background-color: #d4edda;
          color: #155724;
          padding: 12px;
          border-radius: 6px;
          margin: 20px 0;
          border: 1px solid #c3e6cb;
        }
        .info-box {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          margin: 15px 0;
          border-left: 4px solid #2563eb;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          font-size: 12px;
          color: #6c757d;
          text-align: center;
        }
        .button {
          display: inline-block;
          background-color: #2563eb;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          margin: 10px 0;
        }
        ul { padding-left: 20px; }
        li { margin-bottom: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">📄 PalWorks</div>
          <h1>Ihr Untermietvertrag ist fertig!</h1>
        </div>

        <div class="success-badge">
          ✅ <strong>Erfolgreich erstellt:</strong> Ihr rechtssicherer Untermietvertrag wurde generiert und ist als PDF-Anhang beigefügt.
        </div>

        <p>Liebe/r ${formData.landlord_name || formData.tenant_name || 'Kunde/Kundin'},</p>
        
        <p>vielen Dank für Ihr Vertrauen in PalWorks! Ihr Untermietvertrag wurde erfolgreich erstellt und ist bereit zur Verwendung.</p>

        <div class="info-box">
          <h3>📋 Vertragsdetails:</h3>
          <ul>
            <li><strong>Vertragstyp:</strong> Untermietvertrag (ganze Wohnung)</li>
            <li><strong>Mietobjekt:</strong> ${formData.property_address || '[Adresse]'}, ${formData.property_postal || ''} ${formData.property_city || ''}</li>
            ${formData.rent_amount ? `<li><strong>Monatsmiete:</strong> ${formData.rent_amount} EUR</li>` : ''}
            ${formData.start_date ? `<li><strong>Mietbeginn:</strong> ${new Date(formData.start_date).toLocaleDateString('de-DE')}</li>` : ''}
            <li><strong>Erstellt am:</strong> ${new Date().toLocaleDateString('de-DE')}</li>
            ${hasProtocol ? '<li><strong>Übergabeprotokoll:</strong> Inklusive</li>' : ''}
          </ul>
        </div>

        <div class="info-box">
          <h3>📎 Im Anhang finden Sie:</h3>
          <ul>
            <li>✓ Vollständigen Untermietvertrag als PDF</li>
            ${hasProtocol ? '<li>✓ Übergabeprotokoll mit Ihren Daten vorausgefüllt</li>' : ''}
            <li>✓ Alle relevanten rechtlichen Bestimmungen</li>
            <li>✓ Unterschriftenfelder für beide Parteien</li>
          </ul>
        </div>

        <h3>🔍 Nächste Schritte:</h3>
        <ol>
          <li>PDF herunterladen und ausdrucken</li>
          <li>Vertrag mit der anderen Partei durchgehen</li>
          <li>Von beiden Parteien unterschreiben lassen</li>
          <li>Je eine Kopie für alle Beteiligten erstellen</li>
        </ol>

        <div class="info-box">
          <h3>⚖️ Rechtlicher Hinweis:</h3>
          <p>Dieser Vertrag wurde nach bestem Wissen und aktueller Rechtslage erstellt. Bei besonderen Umständen oder Unsicherheiten empfehlen wir die Konsultation eines Anwalts.</p>
        </div>

        <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung. Vielen Dank, dass Sie PalWorks gewählt haben!</p>

        <p>Herzliche Grüße<br>
        Ihr PalWorks-Team</p>

        <div class="footer">
          <p>
            <strong>PalWorks - Rechtssichere Vertragsvorlagen</strong><br>
            Diese E-Mail wurde automatisch generiert.<br>
            <a href="mailto:support@palworks.de">support@palworks.de</a> | 
            <a href="https://palworks.de">palworks.de</a>
          </p>
          <p>
            Bewahren Sie diese E-Mail und das PDF sicher auf.<br>
            Bei Verlust können Sie den Vertrag nicht erneut herunterladen.
          </p>
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
