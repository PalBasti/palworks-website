// pages/api/send-contract-email.js - ERWEITERTE DIAGNOSE  
export default async function handler(req, res) {
  console.log('🔍 nodemailer DIAGNOSE gestartet...');
  
  try {
    const nodemailer = await import('nodemailer');
    
    // Detaillierte Analyse
    console.log('📋 nodemailer analysis:', {
      defaultType: typeof nodemailer.default,
      directType: typeof nodemailer.createTransporter,
      hasDefaultCreateTransporter: typeof nodemailer.default?.createTransporter,
      keys: Object.keys(nodemailer.default || {}).slice(0, 5)
    });
    
    // Teste verschiedene Zugriffswege
    const createTransporter = 
      nodemailer.default?.createTransporter || 
      nodemailer.createTransporter;
      
    console.log('🔧 createTransporter gefunden:', typeof createTransporter);
    
    return res.status(200).json({
      success: true,
      diagnosis: 'complete',
      canCreateTransporter: typeof createTransporter === 'function'
    });
    
  } catch (error) {
    console.error('❌ Diagnose error:', error);
    return res.status(500).json({ error: error.message });
  }
}
