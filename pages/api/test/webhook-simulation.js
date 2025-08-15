// pages/api/test/webhook-simulation.js
import { updateContractPaymentStatus } from '../../../lib/supabase/contractService';
import { updatePaymentStatus, logPaymentAttempt } from '../../../lib/supabase/paymentService';

/**
 * Test-Endpoint für Webhook-Simulation
 * ACHTUNG: Nur für Development/Testing verwenden!
 */
export default async function handler(req, res) {
  // Erlauben in Development ODER wenn explizit für Testing aktiviert
  const isTestingEnabled = process.env.ENABLE_WEBHOOK_TESTING === 'true';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (!isDevelopment && !isTestingEnabled) {
    return res.status(403).json({ 
      error: 'Webhook simulation not allowed in production',
      hint: 'Set ENABLE_WEBHOOK_TESTING=true to enable testing'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('🧪 WEBHOOK SIMULATION - Processing mock event...');
  
  try {
    const mockEvent = req.body;
    
    if (!mockEvent || !mockEvent.type || !mockEvent.data) {
      return res.status(400).json({ 
        error: 'Invalid mock event structure' 
      });
    }

    console.log('📧 Mock Event Type:', mockEvent.type);
    console.log('📄 Mock Event ID:', mockEvent.id);

    // Simuliere die gleiche Logik wie der echte Webhook
    switch (mockEvent.type) {
      case 'payment_intent.succeeded':
        await simulatePaymentSucceeded(mockEvent.data.object);
        break;

      case 'payment_intent.payment_failed':
        await simulatePaymentFailed(mockEvent.data.object);
        break;

      case 'payment_intent.canceled':
        await simulatePaymentCanceled(mockEvent.data.object);
        break;

      default:
        console.log('ℹ️ Unhandled mock event type:', mockEvent.type);
        break;
    }

    // Erfolgreiche Simulation bestätigen
    res.status(200).json({ 
      simulation: true,
      received: true,
      event_type: mockEvent.type,
      event_id: mockEvent.id,
      timestamp: new Date().toISOString(),
      message: 'Mock webhook processed successfully'
    });

  } catch (error) {
    console.error('❌ Error in webhook simulation:', error.message);
    res.status(500).json({ 
      error: 'Webhook simulation failed',
      message: error.message,
      simulation: true
    });
  }
}

// ========================================
// SIMULATION HANDLERS
// ========================================

async function simulatePaymentSucceeded(paymentIntent) {
  console.log('💰 SIMULATION: Processing successful payment:', paymentIntent.id);

  try {
    const contractId = paymentIntent.metadata?.contract_id;
    
    if (!contractId) {
      throw new Error('No contract_id in mock payment intent metadata');
    }

    console.log('📄 SIMULATION: Updating contract status for ID:', contractId);

    // 1. Contract-Status auf 'paid' setzen
    const contractResult = await updateContractPaymentStatus(
      contractId, 
      'paid', 
      paymentIntent.id
    );

    if (!contractResult.success) {
      throw new Error(`Contract update failed: ${contractResult.error}`);
    }

    console.log('✅ SIMULATION: Contract status updated to paid');

    // 2. Payment-Log aktualisieren
    const logResult = await updatePaymentStatus(
      paymentIntent.id, 
      'succeeded',
      {
        amount_received: paymentIntent.amount_received,
        charges: paymentIntent.charges?.data || [],
        receipt_email: paymentIntent.receipt_email,
        simulation: true,
        updated_at: new Date().toISOString()
      }
    );

    if (!logResult.success) {
      console.warn('⚠️ SIMULATION: Failed to update payment log (non-critical):', logResult.error);
    } else {
      console.log('✅ SIMULATION: Payment log updated');
    }

    console.log('🎉 SIMULATION: Payment processing completed successfully');

  } catch (error) {
    console.error('❌ SIMULATION Error in handlePaymentSucceeded:', error.message);
    throw error;
  }
}

async function simulatePaymentFailed(paymentIntent) {
  console.log('💸 SIMULATION: Processing failed payment:', paymentIntent.id);

  try {
    const contractId = paymentIntent.metadata?.contract_id;
    
    if (!contractId) {
      throw new Error('No contract_id in mock payment intent metadata');
    }

    // 1. Contract-Status auf 'payment_failed' setzen
    const contractResult = await updateContractPaymentStatus(
      contractId, 
      'payment_failed', 
      paymentIntent.id
    );

    if (!contractResult.success) {
      console.error('❌ SIMULATION: Failed to update contract status:', contractResult.error);
    } else {
      console.log('✅ SIMULATION: Contract status updated to payment_failed');
    }

    // 2. Payment-Log mit Fehlerdetails aktualisieren
    const logResult = await updatePaymentStatus(
      paymentIntent.id, 
      'failed',
      {
        last_payment_error: paymentIntent.last_payment_error || { message: 'Simulated failure' },
        failure_code: 'simulation_error',
        failure_message: 'Simulated payment failure for testing',
        simulation: true,
        updated_at: new Date().toISOString()
      }
    );

    if (!logResult.success) {
      console.warn('⚠️ SIMULATION: Failed to update payment log:', logResult.error);
    } else {
      console.log('✅ SIMULATION: Payment failure logged');
    }

    console.log('📝 SIMULATION: Payment failure processing completed');

  } catch (error) {
    console.error('❌ SIMULATION Error in handlePaymentFailed:', error.message);
  }
}

async function simulatePaymentCanceled(paymentIntent) {
  console.log('🚫 SIMULATION: Processing canceled payment:', paymentIntent.id);

  try {
    const contractId = paymentIntent.metadata?.contract_id;
    
    if (!contractId) {
      throw new Error('No contract_id in mock payment intent metadata');
    }

    // Contract-Status auf 'canceled' setzen
    const contractResult = await updateContractPaymentStatus(
      contractId, 
      'canceled', 
      paymentIntent.id
    );

    if (!contractResult.success) {
      console.error('❌ SIMULATION: Failed to update contract status:', contractResult.error);
    } else {
      console.log('✅ SIMULATION: Contract status updated to canceled');
    }

    // Payment-Log aktualisieren
    const logResult = await updatePaymentStatus(
      paymentIntent.id, 
      'canceled',
      {
        cancellation_reason: 'user_canceled',
        simulation: true,
        canceled_at: new Date().toISOString()
      }
    );

    if (!logResult.success) {
      console.warn('⚠️ SIMULATION: Failed to update payment log:', logResult.error);
    } else {
      console.log('✅ SIMULATION: Payment cancellation logged');
    }

    console.log('🗑️ SIMULATION: Payment cancellation processing completed');

  } catch (error) {
    console.error('❌ SIMULATION Error in handlePaymentCanceled:', error.message);
  }
}
