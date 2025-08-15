// pages/api/debug/gmail-status.js
// Überprüfung der Gmail-Konfiguration

export default async function handler(req, res) {
  try {
    // Environment Variables Check
    const gmailStatus = {
      user: {
        exists: !!process.env.GMAIL_SMTP_USER,
        value: process.env.GMAIL_SMTP_USER || 'NOT_SET',
        isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.GMAIL_SMTP_USER || '')
      },
      password: {
        exists: !!process.env.GMAIL_SMTP_PASS,
        length: process.env.GMAIL_SMTP_PASS?.length || 0,
        isAppPassword: process.env.GMAIL_SMTP_PASS?.length === 16 && !/\s/.test(process.env.GMAIL_SMTP_PASS || '')
      },
      replyTo: {
        exists: !!process.env.GMAIL_REPLY_TO,
        value: process.env.GMAIL_REPLY_TO || 'NOT_SET'
      }
    };

    // Gmail Verbindungstest (nur wenn alle Credentials vorhanden)
    let connectionTest = { attempted: false };
    
    if (gmailStatus.user.exists && gmailStatus.password.exists) {
      try {
        const nodemailer = require('nodemailer');
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

        // Nur Verbindung testen, keine E-Mail senden
        await transporter.verify();
        
        connectionTest = {
          attempted: true,
          success: true,
          message: 'Gmail SMTP Verbindung erfolgreich!'
        };
      } catch (error) {
        connectionTest = {
          attempted: true,
          success: false,
          error: error.message,
          code: error.code
        };
      }
    }

    // Gesamtstatus bewerten
    const isFullyConfigured = 
      gmailStatus.user.exists && gmailStatus.user.isValid &&
      gmailStatus.password.exists && gmailStatus.password.isAppPassword;

    const recommendations = [];
    
    if (!gmailStatus.user.exists) {
      recommendations.push('GMAIL_SMTP_USER Environment Variable setzen');
    } else if (!gmailStatus.user.isValid) {
      recommendations.push('GMAIL_SMTP_USER sollte eine gültige E-Mail-Adresse sein');
    }
    
    if (!gmailStatus.password.exists) {
      recommendations.push('GMAIL_SMTP_PASS App-Passwort in Environment Variables setzen');
    } else if (!gmailStatus.password.isAppPassword) {
      recommendations.push('GMAIL_SMTP_PASS sollte ein 16-stelliges App-Passwort ohne Leerzeichen sein');
    }

    if (connectionTest.attempted && !connectionTest.success) {
      if (connectionTest.error?.includes('Username and Password not accepted')) {
        recommendations.push('Neues Gmail App-Passwort erstellen - aktuelles ist ungültig');
      } else if (connectionTest.error?.includes('Network')) {
        recommendations.push('Netzwerkproblem - später nochmal versuchen');
      } else {
        recommendations.push(`SMTP Fehler: ${connectionTest.error}`);
      }
    }

    return res.status(200).json({
      gmail: gmailStatus,
      connection: connectionTest,
      status: {
        ready: isFullyConfigured && (!connectionTest.attempted || connectionTest.success),
        configured: isFullyConfigured,
        tested: connectionTest.attempted
      },
      recommendations,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Gmail status check failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Gmail App-Passwort Setup Anleitung
export const GMAIL_SETUP_INSTRUCTIONS = `
📧 Gmail App-Passwort Setup:

1. Google Account öffnen (account.google.com)
2. Sicherheit → 2-Faktor-Authentifizierung aktivieren
3. Sicherheit → App-Passwörter → "Mail" auswählen
4. 16-stelliges Passwort kopieren (ohne Leerzeichen!)
5. In Vercel: Environment Variables → GMAIL_SMTP_PASS setzen

Beispiel: GMAIL_SMTP_PASS=abcdefghijklmnop

⚠️ WICHTIG: 
- Haupt-E-Mail verwenden, keine Aliase
- App-Passwort, nicht normales Gmail-Passwort
- Keine Leerzeichen im Passwort
`;`
