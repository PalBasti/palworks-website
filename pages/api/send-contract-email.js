// pages/api/send-contract-email.js - Gmail Integration für PalWorks
import nodemailer from 'nodemailer';
import { generateAndReturnPDF } from '../../lib/pdf/untermietvertragGenerator';

// Gmail SMTP Transporter erstellen
const createGmailTransporter = () => {
  return nodemailer.createTransporter({
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
};

// E-Mail-Versand mit Gmail
const sendEmailWithGmail = async (to, subject, htmlContent, pdfBuffer = null) => {
  try {
    const transporter = createGmailTransporter();
    
    // Transporter-Verbindung testen
    await transporter.verify();
    console.log('✅ Gmail SMTP-Verbindung erfolgreich');

    const mailOptions = {
      from: {
        name: 'PalWorks',
        address: process.env.GMAIL_SMTP_USER || 'noreply@palworks.de'
      },
      to: to,
      subject: subject,
      html: htmlContent,
      replyTo: process.env.GMAIL_REPLY_TO || 'support@palworks.de'
    };

    // PDF-Anhang hinzufügen falls vorhanden
    if (pdfBuffer) {
      mailOptions.attachments = [{
        filename: `untermietvertrag_${new Date().toISOString().slice(0,10)}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }];
    }

    console.log('📧 Sende E-Mail über Gmail SMTP...');
    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ E-Mail erfolgreich versendet via Gmail:', result.messageId);
    
    return { 
      success: true, 
      data: { 
        id: result.messageId,
        response: result.response
      },
      provider: 'gmail'
    };

  } catch (error) {
    console.error('❌ Gmail SMTP-Fehler:', error);
    
    if (error.code === 'EAUTH') {
      throw new Error('Gmail-Authentifizierung fehlgeschlagen. Bitte App-Passwort überprüfen.');
    } else if (error.code === 'ECONNECTION') {
      throw new Error('Verbindung zu Gmail SMTP fehlgeschlagen. Netzwerkproblem?');
    } else if (error.responseCode === 550) {
      throw new Error('E-Mail wurde von Gmail abgelehnt. Empfänger-Adresse prüfen.');
    } else if (error.responseCode === 552) {
      throw new Error('E-Mail-Anhang zu groß für Gmail (max. 25MB).');
    }
    
    throw error;
  }
};

// Fallback E-Mail-Service
const sendEmailFallback = async (to, subject, htmlContent, pdfBuffer = null) => {
  console.log('📧 FALLBACK: Gmail nicht verfügbar, verwende Console-Log');
  console.log('='.repeat(60));
  console.log('An:', to);
  console.log('Betreff:', subject);
  console.log('PDF-Anhang:', pdfBuffer ? `Ja (${pdfBuffer.byteLength} bytes)` : 'Nein');
  console.log('Zeit:', new Date().toISOString());
  console.log('='.repeat(60));
  
  return { 
    success: false, 
    fallback: true,
    data: { id: 'fallback_email_' + Date.now() },
    note: 'E-Mail konnte nicht über Gmail versendet werden'
  };
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, contractType, formData, selectedAddons, contractId } = req.body;

    // Eingabe-Validierung
    if (!email || !formData || !contractType) {
      return res.status(400).json({ 
        error: 'Fehlende Daten',
        details: 'E-Mail, formData und contractType sind erforderlich' 
      });
    }

    // E-Mail-Format validieren
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Ungültige E-Mail-Adresse',
        details: 'Bitte geben Sie eine gültige E-Mail-Adresse ein' 
      });
    }

    // Environment Variables prüfen
    if (!process.env.GMAIL_SMTP_USER || !process.env.GMAIL_SMTP_PASS) {
      console.warn('⚠️ Gmail SMTP-Credentials fehlen, verwende Fallback');
    }

    console.log('🔄 Starte E-Mail-Versand für:', email);
    console.log('📋 Vertragstyp:', contractType);
    console.log('🔧 Addons:', selectedAddons);

    // PDF generieren
    console.log('📄 Generiere PDF für E-Mail-Anhang...');
    const pdfBuffer = await generateAndReturnPDF(
      formData, 
      selectedAddons || [], 
      'arraybuffer'
    );

    if (!pdfBuffer || pdfBuffer.byteLength === 0) {
      throw new Error('PDF-Generierung fehlgeschlagen - Buffer ist leer');
    }

    console.log('✅ PDF erfolgreich generiert:', pdfBuffer.byteLength, 'bytes');

    // E-Mail-Template erstellen
    const htmlContent = createContractEmailTemplate(formData, contractType, selectedAddons);
    const subject = `Ihr ${contractType === 'untermietvertrag' ? 'Untermietvertrag' : 'Vertrag'} von PalWorks - Jetzt herunterladen`;

    // E-Mail versenden (mit Fallback bei Gmail-Problemen)
    let emailResult;
    try {
      emailResult = await sendEmailWithGmail(
        email,
        subject,
        htmlContent,
        Buffer.from(pdfBuffer)
      );
    } catch (gmailError) {
      console.warn('⚠️ Gmail-Versand fehlgeschlagen, aktiviere Fallback:', gmailError.message);
      emailResult = await sendEmailFallback(email, subject, htmlContent, Buffer.from(pdfBuffer));
    }

    // Erfolgreiche Response
    const responseData = {
      success: emailResult.success,
      message: emailResult.success 
        ? 'E-Mail erfolgreich über Gmail versendet' 
        : 'Gmail-Versand fehlgeschlagen, aber PDF wurde generiert',
      emailId: emailResult.data?.id,
      provider: emailResult.provider || 'fallback',
      contractId: contractId,
      recipient: email,
      pdfSize: pdfBuffer.byteLength,
      timestamp: new Date().toISOString()
    };

    if (emailResult.fallback) {
      responseData.warning = 'Gmail SMTP nicht verfügbar - Fallback aktiviert';
      responseData.userMessage = 'E-Mail konnte nicht versendet werden, aber Ihr Vertrag wurde erfolgreich erstellt. Sie können das PDF direkt herunterladen.';
    }

    return res.status(200).json(responseData);

  } catch (error) {
    console.error('❌ Contract email error:', error);
    
    return res.status(500).json({ 
      error: 'E-Mail-Versand fehlgeschlagen',
      details: error.message,
      timestamp: new Date().toISOString(),
      userMessage: 'E-Mail konnte nicht versendet werden, aber Ihr Vertrag wurde erfolgreich erstellt. Sie können das PDF direkt herunterladen.'
    });
  }
}

// E-Mail-Template mit professionellem PalWorks-Branding
function createContractEmailTemplate(formData, contractType, selectedAddons = []) {
  const hasProtocol = selectedAddons.includes('protocol');
  const hasExplanations = selectedAddons.includes('explanations');
  const customerName = formData.landlord_name || formData.tenant_name || 'Kunde/Kundin';
  const contractTitle = contractType === 'untermietvertrag' ? 'Untermietvertrag' : 'Vertrag';
  
  return `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ihr ${contractTitle} von PalWorks</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 30px; }
        .success-badge { background-color: #d4edda; color: #155724; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
        .contract-details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
        .download-section { background-color: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .steps { background-color: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 14px; color: #64748b; }
        .highlight { color: #2563eb; font-weight: bold; }
        ul { padding-left: 20px; }
        li { margin: 8px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        
        <!-- Header -->
        <div class="header">
          <h1>📄 PalWorks</h1>
          <p>Ihr ${contractTitle} ist fertig!</p>
        </div>

        <!-- Content -->
        <div class="content">
          
          <!-- Success Badge -->
          <div class="success-badge">
            <strong>✅ Erfolgreich erstellt:</strong> Ihr rechtssicherer ${contractTitle} wurde generiert und ist als PDF-Anhang beigefügt.
          </div>

          <p>Liebe/r <strong>${customerName}</strong>,</p>
          
          <p>vielen Dank für Ihr Vertrauen in PalWorks! Ihr ${contractTitle} wurde erfolgreich erstellt und ist als PDF-Datei im Anhang dieser E-Mail zu finden.</p>

          <!-- Contract Details -->
          <div class="contract-details">
            <h3>📋 Vertragsdetails:</h3>
            <ul>
              <li><strong>Vertragstyp:</strong> ${contractTitle}</li>
              ${formData.property_address ? `<li><strong>Mietobjekt:</strong> ${formData.property_address}</li>` : ''}
              ${formData.rent_amount ? `<li><strong>Monatsmiete:</strong> ${formData.rent_amount} EUR</li>` : ''}
              <li><strong>Erstellt am:</strong> ${new Date().toLocaleDateString('de-DE')}</li>
              ${hasProtocol ? '<li><strong>Übergabeprotokoll:</strong> ✅ Inklusive</li>' : ''}
              ${hasExplanations ? '<li><strong>Rechtliche Erläuterungen:</strong> ✅ Inklusive</li>' : ''}
            </ul>
          </div>

          <!-- Download Section -->
          <div class="download-section">
            <h3>📎 PDF im Anhang</h3>
            <p>Ihr ${contractTitle} befindet sich als PDF-Datei im Anhang dieser E-Mail. Falls Sie das PDF nicht sehen können, überprüfen Sie bitte Ihren Spam-Ordner oder kontaktieren Sie uns.</p>
          </div>

          <!-- Next Steps -->
          <div class="steps">
            <h3>🔍 Nächste Schritte:</h3>
            <ol>
              <li><strong>PDF herunterladen</strong> aus dem E-Mail-Anhang</li>
              <li><strong>Vertrag prüfen</strong> und mit der anderen Partei durchgehen</li>
              <li><strong>Unterschriften</strong> von allen Beteiligten einholen</li>
              <li><strong>Kopien erstellen</strong> für alle Vertragsparteien</li>
              ${hasProtocol ? '<li><strong>Übergabeprotokoll ausfüllen</strong> bei Wohnungsübergabe</li>' : ''}
            </ol>
          </div>

          <p>Bei Fragen oder Problemen mit Ihrem Vertrag stehen wir Ihnen gerne zur Verfügung. Antworten Sie einfach auf diese E-Mail oder kontaktieren Sie uns direkt.</p>

          <p><strong>Wichtiger Hinweis:</strong> Bitte bewahren Sie diesen Vertrag sorgfältig auf. Wir empfehlen sowohl eine digitale als auch eine physische Kopie zu erstellen.</p>

          <p>Herzliche Grüße<br>
          <span class="highlight">Ihr PalWorks-Team</span></p>

        </div>

        <!-- Footer -->
        <div class="footer">
          <strong>PalWorks - Rechtssichere Vertragsvorlagen</strong><br>
          E-Mail: support@palworks.de | Website: palworks.de<br>
          <small>Versendet über Google Workspace</small>
        </div>
        
      </div>
    </body>
    </html>
  `;
}

export const config = {
  api: {
    responseLimit: '25mb',
  },
};
