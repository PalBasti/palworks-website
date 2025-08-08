// pages/api/send-contract-email.js - ERWEITERTE DIAGNOSE
export default async function handler(req, res) {
  console.log('✅ E-Mail API aufgerufen - nodemailer diagnose...');
  
  try {
    // Dynamic import testen
    const nodemailer = await import('nodemailer');
    console.log('📋 nodemailer details:', {
      type: typeof nodemailer.default,
      hasCreateTransporter: typeof nodemailer.default?.createTransporter,
      keys: Object.keys(nodemailer.default || {}),
      directAccess: typeof nodemailer.createTransporter
    });
    
    // Versuche Transporter zu erstellen
    const createTransporter = nodemailer.default?.createTransporter || nodemailer.createTransporter;
    console.log('🔧 createTransporter type:', typeof createTransporter);
    
    if (createTransporter) {
      const transporter = createTransporter({
        service: 'gmail',
        auth: { user: 'test', pass: 'test' }
      });
      console.log('✅ Transporter erstellt:', typeof transporter);
    }
    
    return res.status(200).json({
      success: true,
      message: 'nodemailer diagnose erfolgreich',
      details: {
        defaultType: typeof nodemailer.default,
        hasCreateTransporter: typeof (nodemailer.default?.createTransporter || nodemailer.createTransporter),
        canCreateTransporter: !!(nodemailer.default?.createTransporter || nodemailer.createTransporter)
      }
    });
  } catch (error) {
    console.error('❌ nodemailer diagnose fehler:', error);
    return res.status(500).json({
      error: 'nodemailer diagnose fehlgeschlagen',
      details: error.message
    });
  }
}
