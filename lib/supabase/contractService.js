// lib/supabase/contractService.js
import { supabase, supabaseAdmin } from './supabase';

/**
 * Contract Service - Harmonisierte Version mit Field Mapping
 * Unterstützt beide Field-Formate für Kompatibilität
 */

/**
 * Neuen Vertrag erstellen
 * @param {Object} contractData - Vertragsdaten (flexibles Format)
 * @returns {Promise<Object>} { success: boolean, contract?: Object, error?: string }
 */
export async function createContract(contractData) {
  try {
    console.log('📊 Original contract data:', contractData);

    // Field-Mapping für beide Formate
    const mappedData = {
      // Neue API-Format → DB-Format mapping
      contract_type: contractData.contractType || contractData.contract_type,
      customer_email: contractData.customerEmail || contractData.customer_email,
      form_data: contractData.formData || contractData.form_data,
      selected_addons: contractData.selectedAddons || contractData.selected_addons || [],
      addon_prices: contractData.addonPrices || contractData.addon_prices || {},
      total_amount: contractData.totalAmount || contractData.total_amount || contractData.base_price,
      base_price: contractData.basePrice || contractData.base_price || contractData.totalAmount,
      status: 'draft',
      payment_status: 'pending'
    };

    console.log('📊 Mapped contract data:', mappedData);

    // Validierung
    if (!mappedData.contract_type) {
      return { success: false, error: 'Contract type is required' };
    }
    if (!mappedData.customer_email) {
      return { success: false, error: 'Customer email is required' };
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

    console.log('📊 Final contract data for DB:', mappedData);

    const { data, error } = await supabase
      .from('contracts')
      .insert([mappedData])
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase insert error:', error);
      return { success: false, error: `Database error: ${error.message}` };
    }

    console.log('✅ Contract created successfully:', data.id);
    return { success: true, contract: data };
  } catch (error) {
    console.error('❌ Contract creation error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Vertrag abrufen
 * @param {string} contractId - Contract ID
 * @returns {Promise<Object>} { success: boolean, contract?: Object, error?: string }
 */
export async function getContract(contractId) {
  try {
    if (!contractId) {
      return { success: false, error: 'Contract ID is required' };
    }

    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single();

    if (error) {
      console.error('Error fetching contract:', error);
      return { success: false, error: 'Contract not found' };
    }

    return { success: true, contract: data };
  } catch (error) {
    console.error('Contract fetch error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Vertrag aktualisieren
 * @param {string} contractId - Contract ID
 * @param {Object} updates - Update-Daten
 * @returns {Promise<Object>} { success: boolean, contract?: Object, error?: string }
 */
export async function updateContract(contractId, updates) {
  try {
    const client = supabaseAdmin || supabase;
    
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    // Spezielle Timestamp-Felder setzen
    if (updates.payment_status === 'paid' && !updates.paid_at) {
      updateData.paid_at = new Date().toISOString();
    }
    
    if (updates.status === 'completed' && !updates.completed_at) {
      updateData.completed_at = new Date().toISOString();
    }
    
    const { data, error } = await client
      .from('contracts')
      .update(updateData)
      .eq('id', contractId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating contract:', error);
      return { success: false, error: 'Failed to update contract' };
    }

    return { success: true, contract: data };
  } catch (error) {
    console.error('Contract update error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Contract Payment Status aktualisieren - FÜR API-ENDPOINTS
 * @param {string} contractId - Contract ID
 * @param {string} paymentStatus - Payment Status ('pending', 'paid', 'failed')
 * @param {string} paymentIntentId - Stripe Payment Intent ID (optional)
 * @returns {Promise<Object>} { success: boolean, contract?: Object, error?: string }
 */
export async function updateContractPaymentStatus(contractId, paymentStatus, paymentIntentId = null) {
  try {
    const updates = {
      payment_status: paymentStatus,
      updated_at: new Date().toISOString()
    };

    // Payment Intent ID hinzufügen falls vorhanden
    if (paymentIntentId) {
      updates.payment_intent_id = paymentIntentId;
    }

    // Status auf 'paid' setzen wenn Payment erfolgreich
    if (paymentStatus === 'paid') {
      updates.status = 'paid';
      updates.paid_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('contracts')
      .update(updates)
      .eq('id', contractId)
      .select()
      .single();

    if (error) {
      console.error('Error updating payment status:', error);
      return { success: false, error: 'Failed to update payment status' };
    }

    console.log('Payment status updated:', { contractId, paymentStatus });
    return { success: true, contract: data };
  } catch (error) {
    console.error('Payment status update error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Verträge nach E-Mail abrufen
 * @param {string} email - E-Mail-Adresse
 * @returns {Promise<Object>} { success: boolean, contracts?: Array, error?: string }
 */
export async function getContractsByEmail(email) {
  try {
    if (!email) {
      return { success: false, error: 'Email is required' };
    }

    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('customer_email', email.toLowerCase().trim())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contracts by email:', error);
      return { success: false, error: 'Failed to fetch contracts' };
    }

    return { success: true, contracts: data || [] };
  } catch (error) {
    console.error('Contracts fetch error:', error);
    return { success: false, error: error.message };
  }
}
