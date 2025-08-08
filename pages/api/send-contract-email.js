// pages/api/send-contract-email.js - FINALE GMAIL VERSION MIT DEBUG
import { generateAndReturnPDF } from '../../lib/pdf/untermietvertragGenerator';

// Gmail SMTP-Konfiguration mit Debug
const createGmailTransporter = async () => {
  const nodemailer = require('nodemailer'); // Standard require statt dynamic import
  
  // Debug Environment Variables
  console.log('🔍 Gmail Environment Debug:', {
    hasUser: !!process.env.GMAIL_SMTP_USER,
    hasPass: !!process.env.GMAIL_SMTP_PASS,
    user: process.env.GMAIL_SMTP_USER,
    passLength: process.env.GMAIL_SMTP_PASS?.length,
    passFirst4: process.env.GMAIL_SMTP_PASS?.substring(0, 4),
    passLast4: process.env.GMAIL_SMTP_PASS?.substring(-4)
  });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_SMTP_USER,
      pass: process.env.GMAIL_SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // Verbindung testen
  try {
    console.log('🔄 Teste Gmail SMTP Verbindung...');
    await transporter.verify();
    console.log('✅ Gmail SMTP Verbindung erfolgreich!');
  } catch (error) {
    console.error('❌ Gmail SMTP Verbindungstest fehlgeschlagen:', error.message);
    throw error;
  }

  return transporter;
};

// E-Mail versenden mit Gmail SMTP
const sendEmailWithGmail = async (to, subject, htmlContent, pdfBuffer = null) => {
  const transporter = await createGmailTransporter();

  const mailOptions = {
    from: {
      name: 'PalWorks - Rechtssichere Verträge',
      address: process.env.GMAIL_SMTP_USER
    },
    to: to,
    replyTo: process.env.GMAIL_REPLY_TO || process.env.GMAIL_SMTP_USER,
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
    console.log('📧 Mail Options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      hasAttachment: !!pdfBuffer
    });
    
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // TEMP: Debug-Only Mode - nur Verbindungstest
  if (req.body.debugOnly) {
    try {
      console.log('🧪 Debug-Only Mode: Teste nur Gmail-Verbindung...');
      
      // Environment Variables Debug
      console.log('🔍 Environment Check:', {
        hasGmailUser: !!process.env.GMAIL_SMTP_USER,
        hasGmailPass: !!process.env.GMAIL_SMTP_PASS,
        gmailUser: process.env.GMAIL_SMTP_USER,
        passLength: process.env.GMAIL_SMTP_PASS?.length
      });

      // Gmail Transporter erstellen und testen
      const transporter = await createGmailTransporter();
      
      return res.status(200).json({ 
        success: true, 
        message: 'Gmail SMTP Verbindung erfolgreich!',
        debug: {
          user: process.env.GMAIL_SMTP_USER,
          passLength: process.env.GMAIL_SMTP_PASS?.length
        }
      });
      
    } catch (error) {
      console.error('❌ Debug-Test fehlgeschlagen:', error);
      return res.status(500).json({ 
        error: 'Debug-Test failed',
        details: error.message,
        stack: error.stack
      });
    }
  }

  // Normale E-Mail-Verarbeitung
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

// E-Mail-Template
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
            ${formData.rent_amount ? `<li><strong>💰 Miete:</strong> ${formData.rent_amount}€/Monat</li>` : ''}
            ${hasProtocol ? '<li><strong>📋 Protokoll:</strong> Übergabeprotokoll inklusive</li>' : ''}
          </ul>
        </div>

        <div class="steps">
          <h3>📌 Nächste Schritte:</h3>
          <ol style="list-style: decimal; padding-left: 20px;">
            <li><strong>PDF herunterladen</strong> und ausdrucken (2x)</li>
            <li><strong>Beide Parteien unterschreiben</strong> alle Exemplare</li>
            <li><strong>Je ein Exemplar</strong> für Vermieter und Untermieter</li>
            ${hasProtocol ? '<li><strong>Übergabeprotokoll</strong> bei Schlüsselübergabe ausfüllen</li>' : ''}
          </ol>
        </div>

        <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung. Antworten Sie einfach auf diese E-Mail.</p>

        <p>Viel Erfolg mit Ihrem Mietvertrag!</p>
        
        <p>Ihr PalWorks-Team</p>

        <div class="footer">
          <p>PalWorks - Rechtssichere Verträge für Jedermann</p>
          <p>
            <a href="https://palworks.de" style="color: #2563eb;">palworks.de</a> | 
            <a href="mailto:support@palworks.de" style="color: #2563eb;">Support</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
