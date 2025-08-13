// pages/api/contracts.js
import { createContract } from '../../lib/supabase/contractService';

export default async function handler(req, res) {
  // Nur POST-Requests erlauben
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are allowed'
    });
  }

  try {
    const { 
      contractType, 
      customerEmail, 
      formData, 
      selectedAddons = [], 
      totalAmount 
    } = req.body;

    // Input-Validierung
    if (!contractType || !customerEmail || !formData || !totalAmount) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'contractType, customerEmail, formData, and totalAmount are required'
      });
    }

    console.log('Creating contract:', { contractType, customerEmail, totalAmount });

    // Contract über Service erstellen
    const result = await createContract({
      contractType,
      customerEmail,
      formData,
      selectedAddons,
      totalAmount
    });

    if (!result.success) {
      return res.status(500).json({
        error: 'Contract creation failed',
        message: result.error
      });
    }

    console.log('Contract created successfully:', result.contract.id);

    // Erfolgreiche Response
    return res.status(201).json({
      success: true,
      contract: result.contract,
      message: 'Contract created successfully'
    });

  } catch (error) {
    console.error('Contract API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
