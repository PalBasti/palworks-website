// pages/api/send-contract-email.js - PRODUKTIVE VERSION MIT GMAIL SMTP
const { generateAndReturnPDF } = require('../../lib/pdf/untermietvertragGenerator');
const nodemailer = require('nodemailer');

// Gmail SMTP-Konfiguration (PalWorks Alias-Setup)
const createGmailTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_SMTP_USER, // aurich@palworks.de
      pass: process.env.GMAIL_SMTP_PASS  // App-Passwort für aurich@palworks.de
    }
  });
};

// E-Mail versenden mit Gmail SMTP
const sendEmailWithGmail = async (to, subject, htmlContent, pdfBuffer = null) => {
  const transporter = createGmailTransporter();

  const mailOptions = {
    from: {
      name: 'PalWorks - Rechtssichere Verträge',
      address: process.env.GMAIL_SMTP_USER
    },
    to: to,
    replyTo: process.env.GMAIL_REPLY_TO, // Optional: Reply-To setzen
    subject: subject,
    html: htmlContent,
    attachments: pdfBuffer ? [{
      filename: `Untermietvertrag_${new Date().toISOString().slice(0,10)}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    }] : []
  };

  try {
    console.log('📧 Sende E-Mail via Gmail SMTP...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ E-Mail erfolgreich gesendet:', result.messageId);
    
    return { 
      success: true, 
      data: { id: result.messageId },
      provider: 'gmail-smtp'
    };
  } catch (error) {
    console.error('❌ Gmail SMTP Fehler:', error);
    throw new Error(`Gmail SMTP failed: ${error.message}`);
  }
};

module.exports = async function handler(req, res) {
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

    // E-Mail mit Gmail SMTP versenden
    const emailResult = await sendEmailWithGmail(
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
      provider: emailResult.provider
    });

  } catch (error) {
    console.error('❌ Contract email error:', error);
    return res.status(500).json({ 
      error: 'E-Mail-Versand fehlgeschlagen',
      details: error.message 
    });
  }
}

// E-Mail-Template (professionell & rechtssicher)
function createContractEmailTemplate(formData, contractType, selectedAddons = []) {
  const hasProtocol = selectedAddons.includes('protocol');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Ihr Vertrag von PalWorks</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e9ecef; padding-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
        .success-box { background-color: #d4edda; color: #155724; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
        .details-box { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 12px; color: #6c757d; text-align: center; }
        ul { padding-left: 0; list-style: none; }
        li { margin: 8px 0; padding: 5px 0; }
        .steps { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        
        <div class="header">
          <div class="logo">📄 PalWorks</div>
          <h1 style="color: #333; margin: 0;">Ihr Untermietvertrag ist fertig!</h1>
        </div>

        <div class="success-box">
          <strong>✅ Zahlung erfolgreich!</strong> Ihr rechtssicherer Untermietvertrag wurde erstellt und ist im Anhang.
        </div>

        <p>Liebe/r ${formData.tenant_name || formData.landlord_name || 'Kunde/Kundin'},</p>
        
        <p>vielen Dank für Ihr Vertrauen in PalWorks! Ihr Untermietvertrag wurde erfolgreich erstellt und ist als PDF-Datei angehängt.</p>

        <div class="details-box">
          <h3>📋 Ihre Vertragsdetails:</h3>
          <ul>
            <li><strong>📝 Vertragstyp:</strong> Untermietvertrag (ganze Wohnung)</li>
            <li><strong>🏠 Mietobjekt:</strong> ${formData.property_address || '[Adresse]'}</li>
            ${formData.rent_amount ? `<li><strong>💰 Monatsmiete:</strong> ${formData.rent_amount} EUR</li>` : ''}
            <li><strong>📅 Erstellt am:</strong> ${new Date().toLocaleDateString('de-DE')}</li>
            ${hasProtocol ? '<li><strong>📋 Übergabeprotokoll:</strong> Inklusive</li>' : ''}
          </ul>
        </div>

        <div class="steps">
          <h3>🔍 Nächste Schritte:</h3>
          <ol style="padding-left: 20px;">
            <li>PDF-Anhang herunterladen und öffnen</li>
            <li>Vertrag sorgfältig durchlesen</li>
            <li>Mit der anderen Vertragspartei besprechen</li>
            <li>Von beiden Parteien unterschreiben lassen</li>
            <li>Je eine Kopie für Vermieter und Mieter erstellen</li>
          </ol>
        </div>

        <p><strong>💡 Wichtiger Hinweis:</strong> Dieser Vertrag wurde nach aktueller deutscher Rechtslage erstellt. Bei rechtlichen Fragen empfehlen wir die Beratung durch einen Anwalt.</p>

        <p>Bei Fragen oder Problemen stehen wir Ihnen gerne zur Verfügung unter <a href="mailto:support@palworks.de">support@palworks.de</a></p>

        <p style="margin-top: 30px;">Herzliche Grüße<br><strong>Ihr PalWorks-Team</strong></p>

        <div class="footer">
          <strong>PalWorks - Rechtssichere Vertragsvorlagen</strong><br>
          Web: <a href="https://palworks.de">palworks.de</a> | Support: <a href="mailto:support@palworks.de">support@palworks.de</a><br>
          <small style="color: #999;">Diese E-Mail wurde automatisch von noreply@palworks.de generiert.</small>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports.config = {
  api: {
    responseLimit: '10mb',
  },
};
