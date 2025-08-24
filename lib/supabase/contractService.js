// lib/supabase/contractService.js - KORRIGIERTE VERSION MIT ROBUSTEM E-MAIL-MAPPING
import { supabase, supabaseAdmin } from './supabase';

/**
 * 🔧 FIX: Robuste E-Mail-Extraktion mit mehreren Fallbacks
 * Unterstützt billing_email, customer_email, customerEmail
 */
function extractCustomerEmail(contractData) {
  // Priorität: billing_email > customer_email > customerEmail
  const email = contractData.billing_email || 
                contractData.customer_email || 
                contractData.customerEmail ||
                null;
  
  console.log('📧 E-Mail-Extraktion:', {
    input: {
      billing_email: contractData.billing_email,
      customer_email: contractData.customer_email,
      customerEmail: contractData.customerEmail
    },
    extracted: email
  });
  
  return email;
}

/**
 * Contract Service - Mit verbessertem E-Mail-Mapping
 */
export async function createContract(contractData) {
  try {
    console.log('📊 Creating contract with original data:', contractData);

    // 🔧 FIX: Robuste E-Mail-Extraktion
    const customerEmail = extractCustomerEmail(contractData);

    // Field-Mapping für verschiedene Input-Formate
    const mappedData = {
      contract_type: contractData.contractType || contractData.contract_type,
      customer_email: customerEmail, // ✅ KORRIGIERT: Verwende extrahierte E-Mail
      form_data: contractData.formData || contractData.form_data || {},
      selected_addons: contractData.selectedAddons || contractData.selected_addons || [],
      addon_prices: contractData.addonPrices || contractData.addon_prices || {},
      total_amount: contractData.totalAmount || contractData.total_amount,
      base_price: contractData.basePrice || contractData.base_price || contractData.totalAmount,
      status: 'draft',
      payment_status: 'pending'
    };

    console.log('📋 Mapped data for database:', mappedData);

    // Validierung
    if (!mappedData.contract_type) {
      return { success: false, error: 'Contract type is required' };
    }
    if (!mappedData.customer_email) {
      return { success: false, error: 'Customer email is required - E-Mail-Adresse fehlt im Formular' };
    }
    if (!mappedData.total_amount || mappedData.total_amount <= 0) {
      return { success: false, error: 'Valid total amount is required' };
    }

    // E-Mail normalisieren
    mappedData.customer_email = mappedData.customer_email.toLowerCase().trim();

    // E-Mail validieren
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mappedData.customer_email)) {
      return { success: false, error: 'Valid email format is required' };
    }

    // Admin Client verwenden (bypassed RLS)
    const client = supabaseAdmin || supabase;
    
    if (!supabaseAdmin) {
      console.warn('⚠️ Warning: Using regular client instead of admin client');
    }

    console.log('💾 Inserting contract into database...');

    const { data, error } = await client
      .from('contracts')
      .insert([mappedData])
      .select()
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('✅ Contract created successfully with ID:', data.id);
    return { success: true, contract: data };

  } catch (error) {
    console.error('❌ Contract creation error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function getContract(contractId) {
  try {
    if (!contractId) {
      return { success: false, error: 'Contract ID is required' };
    }

    const client = supabaseAdmin || supabase;
    if (!supabaseAdmin) {
      console.warn('⚠️ getContract: using public client (RLS may block access)');
    }

    console.log('🔎 Fetching contract by ID:', contractId);

    const { data, error } = await client
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single();

    if (error) {
      console.error('Error fetching contract:', error);
      throw new Error('Contract not found');
    }

    return { success: true, contract: data };
  } catch (error) {
    console.error('Contract fetch error:', error);
    return { success: false, error: error.message };
  }
}

export async function updateContract(contractId, updates) {
  try {
    if (!contractId) {
      return { success: false, error: 'Contract ID is required' };
    }

    // 🔧 FIX: E-Mail-Mapping auch bei Updates
    if (updates.billing_email && !updates.customer_email) {
      updates.customer_email = updates.billing_email;
      console.log('📧 Update: Mapped billing_email to customer_email:', updates.customer_email);
    }

    // Erlaubte Felder für Updates
    const allowedFields = [
      'form_data',
      'selected_addons', 
      'addon_prices',
      'total_amount',
      'customer_email',
      'status',
      'payment_status',
      'payment_intent_id',
      'pdf_url',
      'generated_pdf_url'
    ];

    // Nur erlaubte Felder filtern
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    // Updated_at automatisch setzen
    filteredUpdates.updated_at = new Date().toISOString();

    const client = supabaseAdmin || supabase;

    const { data, error } = await client
      .from('contracts')
      .update(filteredUpdates)
      .eq('id', contractId)
      .select()
      .single();

    if (error) {
      console.error('Error updating contract:', error);
      throw new Error('Failed to update contract');
    }

    console.log('✅ Contract updated successfully:', contractId);
    return { success: true, contract: data };
  } catch (error) {
    console.error('Contract update error:', error);
    return { success: false, error: error.message };
  }
}

export async function updateContractPaymentStatus(contractId, paymentStatus, paymentIntentId = null) {
  try {
    if (!contractId || !paymentStatus) {
      return { success: false, error: 'Contract ID and payment status are required' };
    }

    const updates = {
      payment_status: paymentStatus,
      updated_at: new Date().toISOString()
    };

    if (paymentIntentId) {
      updates.payment_intent_id = paymentIntentId;
    }

    // Automatisch paid_at setzen wenn payment_status auf 'paid' gesetzt wird
    if (paymentStatus === 'paid') {
      updates.paid_at = new Date().toISOString();
    }

    const client = supabaseAdmin || supabase;

    const { data, error } = await client
      .from('contracts')
      .update(updates)
      .eq('id', contractId)
      .select()
      .single();

    if (error) {
      console.error('Error updating payment status:', error);
      throw new Error('Failed to update payment status');
    }

    console.log('✅ Payment status updated successfully:', contractId);
    return { success: true, contract: data };
  } catch (error) {
    console.error('Payment status update error:', error);
    return { success: false, error: error.message };
  }
}

// Utility-Funktionen für E-Mail-Handling
export function normalizeContractData(rawData) {
  return {
    ...rawData,
    customer_email: extractCustomerEmail(rawData),
    // Backup: Beide Formate verfügbar machen
    customerEmail: extractCustomerEmail(rawData)
  };
}

export function validateContractData(contractData) {
  const errors = {};
  
  const email = extractCustomerEmail(contractData);
  if (!email) {
    errors.customer_email = 'E-Mail-Adresse ist erforderlich';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.customer_email = 'Ungültige E-Mail-Adresse';
  }

  if (!contractData.contract_type && !contractData.contractType) {
    errors.contract_type = 'Vertragstyp ist erforderlich';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    normalizedData: normalizeContractData(contractData)
  };
}

// Export für externe Verwendung
export { extractCustomerEmail };
