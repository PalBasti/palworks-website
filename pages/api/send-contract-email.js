// pages/api/send-contract-email.js - ANGEPASST FÜR BROWSER-PDF
import { generateAndReturnPDF } from '../../lib/pdf/untermietvertragGenerator'

// Gmail SMTP-Konfiguration (unverändert)
const createGmailTransporter = async () => {
  const nodemailer = require('nodemailer')
  return nodemailer.createTransporter({
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
  })
}

// ✅ GARAGENVERTRAG-SPEZIFISCHES E-MAIL-TEMPLATE
const createGarageEmailTemplate = (formData, selectedAddons = []) => {
  const garageType = formData.garage_type === 'garage' ? 'Garage' : 'Stellplatz'
  const contractTitle = `${garageType}mietvertrag`
  
  // Addon-Details für E-Mail
  const addonDetails = selectedAddons.map(addonId => {
    switch(addonId) {
      case 'explanations':
        return '📋 Rechtliche Erläuterungen - Verständliche Rechtstexte und Vermieter-/Mieterrechte'
      case 'handover_protocol':
        return '✅ Übergabeprotokoll - Zustandsdokumentation und Schlüsselübergabe'
      default:
        return `➕ ${addonId}`
    }
  }).join('<br>')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ihr ${contractTitle} von PalWorks</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; color: white;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🎉 Ihr ${contractTitle} ist bereit!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
          Rechtssicher • Professionell • Sofort einsatzbereit
        </p>
      </div>

      <!-- Bestätigung -->
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #28a745;">
        <h2 style="color: #28a745; margin: 0 0 15px 0; font-size: 20px;">✅ Payment erfolgreich</h2>
        <p style="margin: 0; font-size: 16px;">
          Vielen Dank für Ihr Vertrauen! Ihr ${contractTitle} wurde erfolgreich erstellt und 
          ist als PDF-Anhang beigefügt.
        </p>
      </div>

      <!-- Vertragsdetails -->
      <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
        <h3 style="color: #495057; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #e9ecef; padding-bottom: 10px;">
          📋 Ihre Vertragsdetails
        </h3>
        
        <div style="margin-bottom: 15px;">
          <strong style="color: #6c757d;">Mietobjekt:</strong><br>
          ${garageType}${formData.garage_number ? ` Nr. ${formData.garage_number}` : ''}<br>
          ${formData.garage_same_address ? 
            (formData.landlord_address || '[Adresse vom Vermieter]') : 
            (formData.garage_address ? `${formData.garage_address}, ${formData.garage_postal} ${formData.garage_city}` : '[Garage-Adresse]')
          }
        </div>

        <div style="margin-bottom: 15px;">
          <strong style="color: #6c757d;">Parteien:</strong><br>
          <strong>Vermieter:</strong> ${formData.landlord_name || '[Name Vermieter]'}<br>
          <strong>Mieter:</strong> ${formData.tenant_name || '[Name Mieter]'}
        </div>

        <div style="margin-bottom: 15px;">
          <strong style="color: #6c757d;">Mietkonditionen:</strong><br>
          <strong>Monatliche Miete:</strong> ${formData.rent ? `${formData.rent} EUR` : '[Betrag] EUR'}<br>
          <strong>Mietbeginn:</strong> ${formData.start_date || '[Datum]'}<br>
          <strong>Laufzeit:</strong> ${formData.garage_lease_type === 'befristet' ? 
            `Befristet bis ${formData.end_date || '[Datum]'}` : 'Unbefristet'
          }
        </div>

        ${selectedAddons.length > 0 ? `
          <div style="margin-bottom: 15px;">
            <strong style="color: #6c757d;">Zusätzliche Services:</strong><br>
            ${addonDetails}
          </div>
        ` : ''}
      </div>

      <!-- Nächste Schritte -->
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
        <h3 style="color: #856404; margin: 0 0 15px 0; font-size: 18px;">📋 Nächste Schritte</h3>
        <ol style="margin: 0; padding-left: 20px; color: #856404;">
          <li style="margin-bottom: 8px;"><strong>PDF prüfen:</strong> Überprüfen Sie alle Angaben im angehängten Vertrag</li>
          <li style="margin-bottom: 8px;"><strong>Ausdrucken:</strong> Drucken Sie den Vertrag für die Unterschriften aus</li>
          <li style="margin-bottom: 8px;"><strong>Unterzeichnen:</strong> Lassen Sie beide Parteien den Vertrag unterschreiben</li>
          <li style="margin-bottom: 8px;"><strong>Aufbewahren:</strong> Bewahren Sie eine Kopie für Ihre Unterlagen auf</li>
        </ol>
      </div>

      <!-- Support -->
      <div style="background: #e3f2fd; border: 1px solid #90caf9; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
        <h3 style="color: #1565c0; margin: 0 0 15px 0; font-size: 18px;">💬 Fragen oder Probleme?</h3>
        <p style="margin: 0; color: #1565c0;">
          Unser Support-Team hilft Ihnen gerne weiter:<br>
          📧 <a href="mailto:support@palworks.de" style="color: #1565c0;">support@palworks.de</a><br>
          🌐 <a href="https://palworks.de" style="color: #1565c0;">palworks.de</a>
        </p>
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding: 20px; border-top: 1px solid #dee2e6; color: #6c757d;">
        <p style="margin: 0 0 10px 0; font-size: 14px;">
          <strong>PalWorks - Rechtssichere Verträge</strong><br>
          Ihr Partner für professionelle Do-it-yourself-Verträge
        </p>
        <p style="margin: 0; font-size: 12px;">
          Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese E-Mail.
        </p>
      </div>

    </body>
    </html>
  `
}

// ✅ UNTERMIETVERTRAG E-MAIL-TEMPLATE (Original beibehalten)
const createContractEmailTemplate = (formData, contractType, selectedAddons = []) => {
  const addonDetails = selectedAddons.map(addonId => {
    switch(addonId) {
      case 'protocol':
        return '📋 Übergabeprotokoll - Professionelle Zustandsdokumentation'
      case 'explanations':
        return '📚 Rechtliche Erläuterungen - Verständliche Rechtstexte'
      default:
        return `➕ ${addonId}`
    }
  }).join('<br>')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ihr Untermietvertrag von PalWorks</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; color: white;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🎉 Ihr Untermietvertrag ist bereit!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
          Rechtssicher • Professionell • Sofort einsatzbereit
        </p>
      </div>

      <!-- Bestätigung -->
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #28a745;">
        <h2 style="color: #28a745; margin: 0 0 15px 0; font-size: 20px;">✅ Payment erfolgreich</h2>
        <p style="margin: 0; font-size: 16px;">
          Vielen Dank für Ihr Vertrauen! Ihr Untermietvertrag wurde erfolgreich erstellt und 
          ist als PDF-Anhang beigefügt.
        </p>
      </div>

      <!-- Vertragsdetails -->
      <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
        <h3 style="color: #495057; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #e9ecef; padding-bottom: 10px;">
          📋 Ihre Vertragsdetails
        </h3>
        
        <div style="margin-bottom: 15px;">
          <strong style="color: #6c757d;">Mietobjekt:</strong><br>
          ${formData.property_address || '[Adresse]'}, ${formData.property_postal || '[PLZ]'} ${formData.property_city || '[Stadt]'}
        </div>

        <div style="margin-bottom: 15px;">
          <strong style="color: #6c757d;">Parteien:</strong><br>
          <strong>Hauptmieter:</strong> ${formData.landlord_name || '[Name Hauptmieter]'}<br>
          <strong>Untermieter:</strong> ${formData.tenant_name || '[Name Untermieter]'}
        </div>

        <div style="margin-bottom: 15px;">
          <strong style="color: #6c757d;">Mietkonditionen:</strong><br>
          <strong>Monatliche Miete:</strong> ${formData.rent_amount ? `${formData.rent_amount} EUR` : '[Betrag] EUR'}<br>
          <strong>Mietbeginn:</strong> ${formData.start_date || '[Datum]'}<br>
          <strong>Laufzeit:</strong> ${formData.contract_type === 'fixed_term' ? 
            `Befristet bis ${formData.end_date || '[Datum]'}` : 'Unbefristet'
          }
        </div>

        ${selectedAddons.length > 0 ? `
          <div style="margin-bottom: 15px;">
            <strong style="color: #6c757d;">Zusätzliche Services:</strong><br>
            ${addonDetails}
          </div>
        ` : ''}
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding: 20px; border-top: 1px solid #dee2e6; color: #6c757d;">
        <p style="margin: 0 0 10px 0; font-size: 14px;">
          <strong>PalWorks - Rechtssichere Verträge</strong><br>
          Ihr Partner für professionelle Do-it-yourself-Verträge
        </p>
        <p style="margin: 0; font-size: 12px;">
          Diese E-Mail wurde automatisch generiert.
        </p>
      </div>
      
    </body>
    </html>
  `
}

// E-Mail versenden mit Gmail SMTP
const sendEmailWithGmail = async (to, subject, htmlContent, pdfBuffer = null, filename = 'Vertrag.pdf') => {
  const transporter = await createGmailTransporter()

  const mailOptions = {
    from: {
      name: 'PalWorks - Rechtssichere Verträge',
      address: process.env.GMAIL_SMTP_USER
    },
    to: to,
    replyTo: process.env.GMAIL_REPLY_TO,
    subject: subject,
    html: htmlContent,
    attachments: pdfBuffer ? [{
      filename: filename,
      content: pdfBuffer,
      contentType: 'application/pdf'
    }] : []
  }

  try {
    console.log('📧 Sende E-Mail via Gmail SMTP...')
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ E-Mail erfolgreich gesendet:', result.messageId)
    
    return { 
      success: true, 
      data: { id: result.messageId },
      provider: 'gmail-smtp'
    }
  } catch (error) {
    console.error('❌ Gmail SMTP Fehler:', error)
    throw new Error(`Gmail SMTP failed: ${error.message}`)
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, contractType, formData, selectedAddons } = req.body

    console.log('🔍 E-Mail-Versand Request:', {
      email,
      contractType,
      hasFormData: !!formData,
      selectedAddons: selectedAddons || []
    })

    // Validierung
    if (!email || !formData || !contractType) {
      return res.status(400).json({ 
        error: 'Fehlende Daten',
        details: 'E-Mail, formData und contractType sind erforderlich' 
      })
    }

    let pdfBuffer, htmlContent, subject, filename

    // ✅ VERTRAGSTYP-SPEZIFISCHE VERARBEITUNG
    switch (contractType) {
      case 'untermietvertrag':
        console.log('🔄 Generiere Untermietvertrag-PDF...')
        pdfBuffer = await generateAndReturnPDF(formData, selectedAddons || [], 'arraybuffer')
        htmlContent = createContractEmailTemplate(formData, contractType, selectedAddons)
        subject = 'Ihr Untermietvertrag von PalWorks - Sofort einsatzbereit!'
        filename = `Untermietvertrag_${new Date().toISOString().slice(0,10)}.pdf`
        break

      case 'garagenvertrag':
      case 'garage':
        console.log('🔄 Generiere Garagenvertrag-PDF...')
        try {
          // ✅ VERWENDE NEUEN jsPDF-BASIERTEN GENERATOR
          const { generateAndReturnGaragePDF } = await import('../../lib/pdf/garagenvertragGenerator')
          pdfBuffer = await generateAndReturnGaragePDF(formData, selectedAddons || [], 'arraybuffer')
        } catch (error) {
          console.warn('⚠️ Garagenvertrag-Generator nicht verfügbar, verwende Fallback')
          // Fallback: Nutze Untermietvertrag-Generator
          pdfBuffer = await generateAndReturnPDF(formData, selectedAddons || [], 'arraybuffer')
        }
        
        htmlContent = createGarageEmailTemplate(formData, selectedAddons)
        const garageType = formData.garage_type === 'garage' ? 'Garagen' : 'Stellplatz'
        subject = `Ihr ${garageType}mietvertrag von PalWorks - Sofort einsatzbereit!`
        filename = `${garageType}mietvertrag_${new Date().toISOString().slice(0,10)}.pdf`
        break

      default:
        return res.status(400).json({ 
          error: 'Unbekannter Vertragstyp',
          details: `Vertragstyp '${contractType}' wird nicht unterstützt` 
        })
    }

    // PDF-Generierung validieren
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('PDF-Generierung fehlgeschlagen - Buffer ist leer')
    }

    console.log('✅ PDF generiert:', {
      size: `${(pdfBuffer.length / 1024).toFixed(1)} KB`,
      filename
    })

    // E-Mail senden
    console.log('📧 Sende E-Mail...')
    const emailResult = await sendEmailWithGmail(email, subject, htmlContent, pdfBuffer, filename)

    console.log('✅ E-Mail-Versand erfolgreich:', emailResult)

    return res.status(200).json({
      success: true,
      message: `${contractType} erfolgreich per E-Mail versendet`,
      data: {
        emailResult,
        contractType,
        filename,
        pdfSize: pdfBuffer.length
      }
    })

  } catch (error) {
    console.error('❌ E-Mail-Versand Fehler:', error)
    
    return res.status(500).json({
      success: false,
      error: 'E-Mail-Versand fehlgeschlagen',
      details: error.message,
      fallback: 'PDF-Download bleibt verfügbar'
    })
  }
}
