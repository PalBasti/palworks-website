// pages/api/send-contract-email.js - MINIMAL TEST
export default async function handler(req, res) {
  console.log('✅ E-Mail API aufgerufen - nodemailer test...');
  
  try {
    // Teste ob nodemailer geladen werden kann
    const nodemailer = await import('nodemailer');
    console.log('✅ nodemailer erfolgreich geladen:', typeof nodemailer.default);
    
    return res.status(200).json({
      success: true,
      message: 'nodemailer test erfolgreich',
      hasCreateTransporter: typeof nodemailer.default?.createTransporter
    });
  } catch (error) {
    console.error('❌ nodemailer test fehler:', error);
    return res.status(500).json({
      error: 'nodemailer test fehlgeschlagen',
      details: error.message
    });
  }
}
