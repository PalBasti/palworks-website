// pages/api/test-gmail-connection.js - VERCEL GMAIL CONNECTION TEST

export default async function handler(req, res) {
  const testResults = {
    timestamp: new Date().toISOString(),
    environment: 'vercel',
    tests: {}
  };

  try {
    // TEST 1: Environment Variables Check
    console.log('🧪 TEST 1: Environment Variables');
    testResults.tests.environmentVariables = {
      GMAIL_SMTP_USER: {
        exists: !!process.env.GMAIL_SMTP_USER,
        value: process.env.GMAIL_SMTP_USER,
        isValid: !!process.env.GMAIL_SMTP_USER && process.env.GMAIL_SMTP_USER.includes('@')
      },
      GMAIL_SMTP_PASS: {
        exists: !!process.env.GMAIL_SMTP_PASS,
        length: process.env.GMAIL_SMTP_PASS?.length,
        isValid: !!process.env.GMAIL_SMTP_PASS && process.env.GMAIL_SMTP_PASS.length === 16
      },
      GMAIL_REPLY_TO: {
        exists: !!process.env.GMAIL_REPLY_TO,
        value: process.env.GMAIL_REPLY_TO
      }
    };

    // TEST 2: Nodemailer Import Test
    console.log('🧪 TEST 2: Nodemailer Import');
    try {
      // Verschiedene Import-Methoden testen
      
      // Methode A: require (current)
      const nodemailerA = require('nodemailer');
      testResults.tests.nodemailerImport = {
        requireMethod: {
          success: true,
          hasCreateTransport: typeof nodemailerA.createTransport === 'function',
          type: typeof nodemailerA.createTransport,
          methods: Object.keys(nodemailerA)
        }
      };

      // Methode B: dynamic import
      try {
        const nodemailerB = await import('nodemailer');
        testResults.tests.nodemailerImport.dynamicImport = {
          success: true,
          hasCreateTransport: typeof nodemailerB.default?.createTransport === 'function',
          hasDefault: !!nodemailerB.default,
          defaultMethods: nodemailerB.default ? Object.keys(nodemailerB.default) : [],
          directMethods: Object.keys(nodemailerB)
        };
      } catch (importError) {
        testResults.tests.nodemailerImport.dynamicImport = {
          success: false,
          error: importError.message
        };
      }

    } catch (requireError) {
      testResults.tests.nodemailerImport = {
        requireMethod: {
          success: false,
          error: requireError.message
        }
      };
    }

    // TEST 3: Transporter Creation Test (Multiple Methods)
    console.log('🧪 TEST 3: Transporter Creation');
    testResults.tests.transporterCreation = {};

    // Method A: Standard require
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

      testResults.tests.transporterCreation.standardRequire = {
        success: true,
        transporterType: typeof transporter,
        hasVerify: typeof transporter.verify === 'function',
        hasSendMail: typeof transporter.sendMail === 'function'
      };

      // TEST 4: Gmail Connection Verification
      console.log('🧪 TEST 4: Gmail Connection Verification');
      try {
        await transporter.verify();
        testResults.tests.gmailConnection = {
          success: true,
          message: 'Gmail SMTP connection successful'
        };
      } catch (verifyError) {
        testResults.tests.gmailConnection = {
          success: false,
          error: verifyError.message,
          code: verifyError.code,
          command: verifyError.command
        };
      }

    } catch (transportError) {
      testResults.tests.transporterCreation.standardRequire = {
        success: false,
        error: transportError.message
      };
    }

    // Method B: Dynamic import transporter
    try {
      const { default: nodemailer } = await import('nodemailer');
      if (nodemailer && typeof nodemailer.createTransport === 'function') {
        const transporter2 = nodemailer.createTransport({
          service: 'gmail',
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.GMAIL_SMTP_USER,
            pass: process.env.GMAIL_SMTP_PASS
          }
        });

        testResults.tests.transporterCreation.dynamicImport = {
          success: true,
          transporterType: typeof transporter2
        };
      } else {
        testResults.tests.transporterCreation.dynamicImport = {
          success: false,
          error: 'No createTransport function found in dynamic import'
        };
      }
    } catch (dynamicError) {
      testResults.tests.transporterCreation.dynamicImport = {
        success: false,
        error: dynamicError.message
      };
    }

    // TEST 5: Alternative SMTP Test (Raw Socket)
    console.log('🧪 TEST 5: Raw SMTP Test');
    try {
      // Teste ob wir überhaupt Gmail SMTP erreichen können
      const net = require('net');
      
      const socketTest = new Promise((resolve, reject) => {
        const socket = net.createConnection(587, 'smtp.gmail.com');
        
        socket.on('connect', () => {
          socket.end();
          resolve({ success: true, message: 'SMTP socket connection successful' });
        });
        
        socket.on('error', (error) => {
          reject({ success: false, error: error.message });
        });
        
        // Timeout nach 5 Sekunden
        setTimeout(() => {
          socket.destroy();
          reject({ success: false, error: 'Connection timeout' });
        }, 5000);
      });

      testResults.tests.rawSMTPConnection = await socketTest;

    } catch (socketError) {
      testResults.tests.rawSMTPConnection = {
        success: false,
        error: socketError.message || socketError
      };
    }

    // TEST 6: Runtime Environment Check
    console.log('🧪 TEST 6: Runtime Environment');
    testResults.tests.runtime = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      vercelRuntime: process.env.VERCEL_RUNTIME,
      hasNet: typeof require('net') !== 'undefined',
      hasTls: typeof require('tls') !== 'undefined',
      availableModules: {
        nodemailer: (() => {
          try {
            require('nodemailer');
            return true;
          } catch {
            return false;
          }
        })(),
        net: (() => {
          try {
            require('net');
            return true;
          } catch {
            return false;
          }
        })(),
        tls: (() => {
          try {
            require('tls');
            return true;
          } catch {
            return false;
          }
        })()
      }
    };

    // FINAL RESULT
    const overallSuccess = testResults.tests.gmailConnection?.success || false;
    
    console.log('📊 TEST RESULTS:', JSON.stringify(testResults, null, 2));

    return res.status(200).json({
      success: overallSuccess,
      message: overallSuccess ? 'Gmail connection working!' : 'Gmail connection failed',
      testResults,
      recommendation: overallSuccess 
        ? 'Gmail SMTP is working - check your email sending code'
        : 'Gmail SMTP connection failed - check credentials or try alternative method'
    });

  } catch (globalError) {
    console.error('❌ Global test error:', globalError);
    
    return res.status(500).json({
      success: false,
      error: 'Test execution failed',
      details: globalError.message,
      testResults
    });
  }
}
