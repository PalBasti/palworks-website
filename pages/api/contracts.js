// pages/api/contracts.js
import { createContract } from '../../lib/supabase/contractService';

export default async function handler(req, res) {
  // CORS Headers hinzufügen
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS Request für CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Nur POST-Requests erlauben
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are allowed'
    });
  }

  try {
    console.log('📋 Contract API called with body:', req.body);

    const { 
      contractType, 
      contract_type,
      customerEmail, 
      customer_email,
      formData, 
      form_data,
      selectedAddons = [], 
      selected_addons = [],
      totalAmount,
      total_amount,
      basePrice,
      base_price
    } = req.body;

    // 🔧 FIX: Flexible Field-Mapping für verschiedene Naming-Konventionen
    const mappedData = {
      contractType: contractType || contract_type,
      customerEmail: customerEmail || customer_email,
      formData: formData || form_data,
      selectedAddons: selectedAddons.length > 0 ? selectedAddons : selected_addons,
      totalAmount: totalAmount || total_amount,
      basePrice: basePrice || base_price
    };

    console.log('📊 Mapped contract data:', mappedData);

    // Input-Validierung
    if (!mappedData.contractType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: contractType or contract_type'
      });
    }

    if (!mappedData.customerEmail) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: customerEmail or customer_email'
      });
    }

    if (!mappedData.formData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: formData or form_data'
      });
    }

    if (!mappedData.totalAmount || mappedData.totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid totalAmount/total_amount'
      });
    }

    console.log('✅ Validation passed, creating contract...');

    // Contract über Service erstellen
    const result = await createContract(mappedData);

    if (!result.success) {
      console.error('❌ Contract creation failed:', result.error);
      return res.status(500).json({
        success: false,
        error: 'Contract creation failed',
        message: result.error
      });
    }

    console.log('✅ Contract created successfully:', result.contract.id);

    // Erfolgreiche Response
    return res.status(201).json({
      success: true,
      contract_id: result.contract.id,
      contract: result.contract,
      message: 'Contract created successfully'
    });

  } catch (error) {
    console.error('❌ Contract API error:', error.message, error.stack);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
