// pages/api/send-contract-email.js - VOLLSTÄNDIGE KORRIGIERTE VERSION
const nodemailer = require('nodemailer'); // ✅ STATISCHER IMPORT

async function createGmailTransporter() {
  try {
    console.log('🔍 Gmail Environment Debug:', {
      hasUser: !!process.env.GMAIL_SMTP_USER,
      passLength: process.env.GMAIL_SMTP_PASS?.length,
      user: process.env.GMAIL_SMTP_USER
    });

    const transporter = nodemailer.createTransporter({
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
    await transporter.verify();
    console.log('✅ Gmail SMTP Verbindung erfolgreich!');
    
    return transporter;
  } catch (error) {
    console.error('❌ Gmail SMTP Verbindung fehlgeschlagen:', error.message);
    throw error;
  }
}

async function generatePDFForContract(contractType, formData, selectedAddons) {
  try {
    console.log('🔄 Generiere ' + contractType + '-PDF...');
    console.log('🔍 === PDF API ENTRY POINT ===');
    console.log('🔍 Received selectedAddons:', selectedAddons);
    console.log('🔍 Addons type:', typeof selectedAddons, Array.isArray(selectedAddons));
    console.log('🔍 Return type: arraybuffer');
    console.log('🔍 === CALLING PDF GENERATOR ===');

    switch (contractType) {
      case 'untermietvertrag':
        const { generateAndReturnPDF } = await import('../../lib/pdf/untermietvertragGenerator');
        return await generateAndReturnPDF(formData, selectedAddons, 'arraybuffer');
      
      case 'garagenvertrag':
        const { generateAndReturnGaragePDF } = await import('../../lib/pdf/garagenvertragGenerator');
        return await generateAndReturnGaragePDF(formData, selectedAddons, 'arraybuffer');
      
      case 'wg-untermietvertrag':
        const { generateAndReturnWGPDF } = await import('../../lib/pdf/wgUntermietvertragGenerator');
        return await generateAndReturnWGPDF(formData, selectedAddons, 'arraybuffer');
      
      default:
        throw new Error(`Unbekannter Vertragstyp: ${contractType}`);
    }
  } catch (error) {
    console.error('❌ PDF-Generierung fehlgeschlagen:', error);
    throw error;
  }
}

async function sendEmailWithGmail(transporter, email, contractType, formData, pdfBuffer) {
  try {
    const contractTypeNames = {
      'untermietvertrag': 'Untermietvertrag',
      'garagenvertrag': 'Garagenmietvertrag', 
      'wg-untermietvertrag': 'WG-Untermietvertrag'
    };

    const typeName = contractTypeNames[contractType] || contractType;
    const filename = `${typeName}_${new Date().toISOString().slice(0,10)}.pdf`;

    // E-Mail-Template mit professionellem Design
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .contract-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 14px; }
        .success-icon { font-size: 48px; margin-bottom: 20px; }
        .highlight { background: #e8f5e8; padding: 15px; border-left: 4px solid #4caf50; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="success-icon">✅</div>
        <h1>Ihr ${typeName} ist bereit!</h1>
        <p>Vielen Dank für Ihren Kauf bei PalWorks</p>
      </div>
      
      <div class="content">
        <p>Liebe/r ${formData.tenant_name || formData.mieter_name || 'Kunde/Kundin'},</p>
        
        <p>Ihr ${typeName} wurde erfolgreich generiert und ist als PDF-Anhang beigefügt.</p>
        
        <div class="highlight">
          <strong>✅ Zahlung erfolgreich verarbeitet</strong><br>
          <strong>✅ PDF automatisch generiert</strong><br>
          <strong>✅ E-Mail-Kopie versendet</strong>
        </div>

        <div class="contract-details">
          <h3>📋 Vertragsdetails</h3>
          <p><strong>Vertragstyp:</strong> ${typeName}</p>
          ${formData.property_address ? `<p><strong>Objekt:</strong> ${formData.property_address}</p>` : ''}
          ${formData.rent_amount ? `<p><strong>Miete:</strong> ${formData.rent_amount} €</p>` : ''}
          ${formData.start_date ? `<p><strong>Mietbeginn:</strong> ${new Date(formData.start_date).toLocaleDateString('de-DE')}</p>` : ''}
        </div>

        <h3>📎 Im Anhang finden Sie:</h3>
        <ul>
          <li>✅ Ihren vollständigen, rechtssicheren ${typeName}</li>
          <li>✅ Bereits ausgefüllt mit Ihren Daten</li>
          <li>✅ Bereit zum Unterschreiben</li>
        </ul>

        <h3>🔍 Nächste Schritte:</h3>
        <ol>
          <li>PDF-Datei herunterladen und prüfen</li>
          <li>Vertrag ausdrucken (2 Exemplare)</li>
          <li>Von beiden Parteien unterschreiben lassen</li>
          <li>Je ein Exemplar für Vermieter und Mieter</li>
        </ol>

        <div class="highlight">
          <strong>💡 Wichtiger Hinweis:</strong> Bewahren Sie diese E-Mail und das PDF sicher auf. 
          Bei Fragen können Sie sich jederzeit an uns wenden.
        </div>
      </div>
      
      <div class="footer">
        <p><strong>PalWorks - Rechtssichere Verträge leicht gemacht</strong></p>
        <p>📧 Support: support@palworks.de | 🌐 www.palworks.de</p>
        <p>Vielen Dank für Ihr Vertrauen!</p>
      </div>
    </body>
    </html>`;

    const mailOptions = {
      from: {
        name: 'PalWorks',
        address: process.env.GMAIL_SMTP_USER
      },
      to: email,
      replyTo: process.env.GMAIL_REPLY_TO || 'support@palworks.de',
      subject: `✅ Ihr ${typeName} von PalWorks - PDF im Anhang`,
      html: htmlTemplate,
      attachments: [
        {
          filename: filename,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    console.log('📧 Sende E-Mail...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ E-Mail erfolgreich gesendet:', result.messageId);
    
    return {
      success: true,
      messageId: result.messageId,
      filename: filename
    };
  } catch (error) {
    console.error('❌ E-Mail-Versand fehlgeschlagen:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  // Nur POST-Requests erlauben
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, contractType, formData, selectedAddons = [], debugOnly = false } = req.body;

    console.log('🔍 E-Mail-Versand Request:', {
      email,
      contractType,
      hasFormData: !!formData,
      selectedAddons
    });

    // Input-Validierung
    if (!email || !contractType || !formData) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'email, contractType, and formData are required'
      });
    }

    // E-Mail-Format validieren
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        details: 'Please provide a valid email address'
      });
    }

    // Debug-Only Modus für Connection-Tests
    if (debugOnly) {
      const transporter = await createGmailTransporter();
      return res.status(200).json({ 
        success: true, 
        message: 'Gmail connection successful',
        debug: true
      });
    }

    // Gmail Transporter erstellen
    const transporter = await createGmailTransporter();

    // PDF generieren
    const pdfBuffer = await generatePDFForContract(contractType, formData, selectedAddons);
    
    if (!pdfBuffer) {
      throw new Error('PDF generation returned null/undefined');
    }

    console.log('✅ PDF generiert:', {
      size: `${Math.round(pdfBuffer.length / 1024)} KB`,
      filename: `${contractType}_${new Date().toISOString().slice(0,10)}.pdf`
    });

    // E-Mail mit PDF versenden
    const emailResult = await sendEmailWithGmail(transporter, email, contractType, formData, pdfBuffer);

    // Erfolgreiche Antwort
    res.status(200).json({
      success: true,
      message: 'E-Mail erfolgreich versendet',
      messageId: emailResult.messageId,
      filename: emailResult.filename,
      recipient: email,
      contractType: contractType
    });

  } catch (error) {
    console.error('❌ E-Mail-Versand Fehler:', error);
    
    // Fehler-Antwort
    res.status(500).json({
      success: false,
      error: 'E-Mail-Versand fehlgeschlagen',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
