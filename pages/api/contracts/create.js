// pages/api/contracts/create.js
import { createContract } from '../../../lib/supabase/contractService';

export default async function handler(req, res) {
  console.log('🔄 Contract API called:', req.method);

  // Nur POST-Requests erlauben
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are allowed'
    });
  }

  try {
    console.log('📝 Request body:', req.body);

    const { 
      contract_type,
      contractType, // Alternative naming
      form_data,
      formData, // Alternative naming
      customer_email,
      customerEmail, // Alternative naming
      selected_addons = [],
      selectedAddons = [], // Alternative naming
      total_amount,
      totalAmount, // Alternative naming
      base_price,
      basePrice // Alternative naming
    } = req.body;

    // Field-Mapping (unterstützt beide Naming-Konventionen)
    const contractData = {
      contractType: contract_type || contractType,
      customerEmail: customer_email || customerEmail,
      formData: form_data || formData,
      selectedAddons: selected_addons.length > 0 ? selected_addons : selectedAddons,
      totalAmount: total_amount || totalAmount,
      basePrice: base_price || basePrice || total_amount || totalAmount
    };

    console.log('📊 Mapped contract data:', contractData);

    // Input-Validierung
    if (!contractData.contractType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: contract_type or contractType'
      });
    }

    if (!contractData.customerEmail) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: customer_email or customerEmail'
      });
    }

    if (!contractData.formData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: form_data or formData'
      });
    }

    if (!contractData.totalAmount || contractData.totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid total_amount/totalAmount'
      });
    }

    console.log('✅ Validation passed, creating contract...');

    // Contract über Service erstellen
    const result = await createContract(contractData);

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
