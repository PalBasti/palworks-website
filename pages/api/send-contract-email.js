// pages/api/send-contract-email.js - COMPLETE FIXED VERSION mit Multiple PDFs

async function createGmailTransporter() {
  try {
    console.log('🔍 Gmail Environment Debug:', {
      hasUser: !!process.env.GMAIL_SMTP_USER,
      passLength: process.env.GMAIL_SMTP_PASS?.length,
      user: process.env.GMAIL_SMTP_USER
    });

    const nodemailer = require('nodemailer');
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

    await transporter.verify();
    console.log('✅ Gmail SMTP Verbindung erfolgreich!');
    
    return transporter;
  } catch (error) {
    console.error('❌ Gmail SMTP Verbindung fehlgeschlagen:', error.message);
    throw error;
  }
}

// 🔧 FIX: Neue Funktion für SEPARATE PDFs statt kombiniertes PDF
async function generatePDFsForContract(contractType, formData, selectedAddons) {
  try {
    console.log('📄 Generiere separate PDFs für ' + contractType + '...');
    console.log('🔍 === SEPARATE PDF API ENTRY POINT ===');
    console.log('🔍 Received selectedAddons:', selectedAddons);
    console.log('🔍 Addons type:', typeof selectedAddons, Array.isArray(selectedAddons));
    console.log('🔍 Return type: arraybuffer');
    console.log('🔍 === CALLING SEPARATE PDF GENERATOR ===');

    let generateSeparateDocuments;

    switch (contractType) {
      case 'untermietvertrag':
        const { generateSeparateDocuments: untermieteSeparate } = await import('../../lib/pdf/untermietvertragGenerator');
        generateSeparateDocuments = untermieteSeparate;
        break;
      
      case 'garagenvertrag':
        const { generateSeparateDocuments: garageSeparate } = await import('../../lib/pdf/garagenvertragGenerator');
        generateSeparateDocuments = garageSeparate;
        break;
      
      case 'wg-untermietvertrag':
        const { generateSeparateDocuments: wgSeparate } = await import('../../lib/pdf/wgUntermietvertragGenerator');
        generateSeparateDocuments = wgSeparate;
        break;
      
      default:
        throw new Error(`Unbekannter Vertragstyp: ${contractType}`);
    }

    if (!generateSeparateDocuments) {
      console.warn('⚠️ generateSeparateDocuments nicht verfügbar, fallback zu einzelnem PDF');
      // Fallback zur alten Methode falls separate Docs nicht verfügbar
      return await generateSinglePDFAsArray(contractType, formData, selectedAddons);
    }

    // Separate Dokumente generieren
    const documents = await generateSeparateDocuments(formData, selectedAddons || [], 'arraybuffer');
    
    console.log('✅ Separate PDFs generiert:', documents.map(d => d.filename));
    
    return documents;

  } catch (error) {
    console.error('❌ Separate PDF-Generierung fehlgeschlagen:', error);
    console.warn('⚠️ Fallback zu einzelnem PDF...');
    // Fallback zur alten Methode
    return await generateSinglePDFAsArray(contractType, formData, selectedAddons);
  }
}

// Fallback-Funktion für einzelnes PDF (kompatibel mit alter Version)
async function generateSinglePDFAsArray(contractType, formData, selectedAddons) {
  try {
    console.log('📄 Fallback: Generiere einzelnes PDF für ' + contractType + '...');

    let generateFunction;
    switch (contractType) {
      case 'untermietvertrag':
        const { generateAndReturnPDF } = await import('../../lib/pdf/untermietvertragGenerator');
        generateFunction = generateAndReturnPDF;
        break;
      
      case 'garagenvertrag':
        const { generateAndReturnGaragePDF } = await import('../../lib/pdf/garagenvertragGenerator');
        generateFunction = generateAndReturnGaragePDF;
        break;
      
      case 'wg-untermietvertrag':
        const { generateAndReturnWGPDF } = await import('../../lib/pdf/wgUntermietvertragGenerator');
        generateFunction = generateAndReturnWGPDF;
        break;
      
      default:
        throw new Error(`Unbekannter Vertragstyp: ${contractType}`);
    }

    const pdfBuffer = await generateFunction(formData, selectedAddons, 'arraybuffer');
    
    const contractTypeNames = {
      'untermietvertrag': 'Untermietvertrag',
      'garagenvertrag': 'Garagenmietvertrag', 
      'wg-untermietvertrag': 'WG-Untermietvertrag'
    };

    // Als Array formatieren für einheitliche Verarbeitung
    return [{
      type: 'contract',
      name: contractTypeNames[contractType] || contractType,
      filename: `${contractTypeNames[contractType] || contractType}_${new Date().toISOString().slice(0,10)}.pdf`,
      data: pdfBuffer
    }];

  } catch (error) {
    console.error('❌ Fallback PDF-Generierung fehlgeschlagen:', error);
    throw error;
  }
}

// 🔧 FIX: Neue Funktion für E-Mail mit MULTIPLE ATTACHMENTS
async function sendEmailWithMultiplePDFs(transporter, email, contractType, formData, documents) {
  try {
    const contractTypeNames = {
      'untermietvertrag': 'Untermietvertrag',
      'garagenvertrag': 'Garagenmietvertrag', 
      'wg-untermietvertrag': 'WG-Untermietvertrag'
    };

    const typeName = contractTypeNames[contractType] || contractType;
    
    console.log('🔍 E-Mail wird vorbereitet mit', documents.length, 'PDF-Anhängen');
    console.log('🔍 Dokumente:', documents.map(d => d.filename));

    // Alle PDFs zu Node.js Buffern konvertieren
    const attachments = documents.map(doc => {
      const nodeBuffer = Buffer.from(doc.data);
      
      console.log('🔍 PDF Buffer Debug für', doc.filename, ':', {
        originalType: Object.prototype.toString.call(doc.data),
        originalSize: doc.data.byteLength || doc.data.length,
        bufferType: Object.prototype.toString.call(nodeBuffer),
        bufferSize: nodeBuffer.length,
        isBuffer: Buffer.isBuffer(nodeBuffer)
      });

      return {
        filename: doc.filename,
        content: nodeBuffer,
        contentType: 'application/pdf'
      };
    });

    // Erweiterte E-Mail-Template mit Mehrfach-PDFs
    const documentList = documents.map(doc => 
      `<li>✅ ${doc.name} (${doc.filename})</li>`
    ).join('');

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
        .document-list { background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 15px 0; }
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
        
        <p>Ihr ${typeName} wurde erfolgreich generiert und alle Dokumente sind als PDF-Anhänge beigefügt.</p>
        
        <div class="highlight">
          <strong>✅ Zahlung erfolgreich verarbeitet</strong><br>
          <strong>✅ ${documents.length} PDF${documents.length > 1 ? 's' : ''} automatisch generiert</strong><br>
          <strong>✅ E-Mail-Kopie mit allen Dokumenten versendet</strong>
        </div>

        <div class="contract-details">
          <h3>📋 Vertragsdetails</h3>
          <p><strong>Vertragstyp:</strong> ${typeName}</p>
          ${formData.property_address || formData.garage_address ? 
            `<p><strong>Objekt:</strong> ${formData.property_address || formData.garage_address}</p>` : ''}
          ${formData.rent_amount || formData.garage_rent ? 
            `<p><strong>Miete:</strong> ${formData.rent_amount || formData.garage_rent} €</p>` : ''}
          ${formData.start_date ? 
            `<p><strong>Mietbeginn:</strong> ${new Date(formData.start_date).toLocaleDateString('de-DE')}</p>` : ''}
        </div>

        <div class="document-list">
          <h3>📎 Im Anhang finden Sie ${documents.length} Dokument${documents.length > 1 ? 'e' : ''}:</h3>
          <ul>
            ${documentList}
          </ul>
        </div>

        <h3>📝 Nächste Schritte:</h3>
        <ol>
          <li>Alle PDF-Dateien herunterladen und prüfen</li>
          <li>Hauptvertrag ausdrucken (2 Exemplare)</li>
          <li>Von beiden Parteien unterschreiben lassen</li>
          <li>Je ein Exemplar für Vermieter und Mieter</li>
          ${documents.length > 1 ? '<li>Zusatzdokumente für Ihre Unterlagen verwenden</li>' : ''}
        </ol>

        <div class="highlight">
          <strong>💡 Wichtiger Hinweis:</strong> Bewahren Sie diese E-Mail und alle PDFs sicher auf. 
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
      subject: `✅ Ihr ${typeName} von PalWorks - ${documents.length} PDF${documents.length > 1 ? 's' : ''} im Anhang`,
      html: htmlTemplate,
      attachments: attachments // 🔧 FIX: Jetzt multiple attachments!
    };

    console.log('📧 Sende E-Mail mit', attachments.length, 'Anhängen...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ E-Mail erfolgreich gesendet:', result.messageId);
    
    return {
      success: true,
      messageId: result.messageId,
      documentCount: documents.length,
      documents: documents.map(d => ({ name: d.name, filename: d.filename }))
    };
  } catch (error) {
    console.error('❌ E-Mail-Versand fehlgeschlagen:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  // CORS Headers für Debugging
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
      selectedAddons,
      addonCount: selectedAddons.length,
      timestamp: new Date().toISOString()
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
        debug: true,
        timestamp: new Date().toISOString()
      });
    }

    // Gmail Transporter erstellen
    console.log('🔧 Creating Gmail transporter...');
    const transporter = await createGmailTransporter();
    console.log('✅ Transporter created successfully');

    // 🔧 FIX: Separate PDFs generieren statt einzelnes PDF
    console.log('📄 Generating separate PDFs...');
    const documents = await generatePDFsForContract(contractType, formData, selectedAddons);
    
    if (!documents || documents.length === 0) {
      throw new Error('PDF generation returned no documents');
    }

    console.log('✅ PDFs generiert:', {
      count: documents.length,
      documents: documents.map(d => ({
        name: d.name,
        filename: d.filename,
        size: `${Math.round((d.data.byteLength || d.data.length) / 1024)} KB`
      }))
    });

    // 🔧 FIX: E-Mail mit mehreren PDFs versenden
    console.log('📧 Sending email with multiple PDFs...');
    const emailResult = await sendEmailWithMultiplePDFs(transporter, email, contractType, formData, documents);
    console.log('✅ Email sent successfully with', emailResult.documentCount, 'attachments');

    // Erfolgreiche Antwort
    return res.status(200).json({
      success: true,
      message: `E-Mail erfolgreich versendet mit ${emailResult.documentCount} PDF${emailResult.documentCount > 1 ? 's' : ''}`,
      messageId: emailResult.messageId,
      documentCount: emailResult.documentCount,
      documents: emailResult.documents,
      recipient: email,
      contractType: contractType,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ E-Mail-Versand Fehler:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Detaillierte Fehler-Antwort
    return res.status(500).json({
      success: false,
      error: 'E-Mail-Versand fehlgeschlagen',
      details: error.message,
      timestamp: new Date().toISOString(),
      errorType: error.constructor.name
    });
  }
}
