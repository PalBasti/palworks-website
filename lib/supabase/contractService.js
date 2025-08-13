// lib/supabase/contractService.js
import { supabase, supabaseAdmin } from './supabase';

/**
 * Contract Service - Harmonisierte Version
 * Einheitliches Return-Format für alle Funktionen
 */

/**
 * Neuen Vertrag erstellen
 * @param {Object} contractData - Vertragsdaten
 * @returns {Promise<Object>} { success: boolean, contract?: Object, error?: string }
 */
export async function createContract(contractData) {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .insert([{
        contract_type: contractData.contractType,
        form_data: contractData.formData,
        selected_addons: contractData.selectedAddons || [],
        addon_prices: contractData.addonPrices || {},
        total_amount: contractData.totalAmount,
        customer_email: contractData.customerEmail,
        status: 'draft',
        payment_status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating contract:', error);
      return { success: false, error: 'Failed to create contract' };
    }

    console.log('Contract created successfully:', data.id);
    return { success: true, contract: data };
  } catch (error) {
    console.error('Contract creation error:', error);
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

/**
 * Contract-Statistiken abrufen
 * @returns {Promise<Object>} { success: boolean, stats?: Object, error?: string }
 */
export async function getContractStats() {
  try {
    // Gesamtanzahl
    const { count: totalCount, error: totalError } = await supabase
      .from('contracts')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      return { success: false, error: 'Failed to fetch contract stats' };
    }

    // Status-Verteilung
    const { data: statusData, error: statusError } = await supabase
      .from('contracts')
      .select('status')
      .not('status', 'is', null);

    if (statusError) {
      return { success: false, error: 'Failed to fetch status distribution' };
    }

    // Status-Counts berechnen
    const statusCounts = statusData.reduce((acc, contract) => {
      acc[contract.status] = (acc[contract.status] || 0) + 1;
      return acc;
    }, {});

    const stats = {
      total: totalCount || 0,
      draft: statusCounts.draft || 0,
      paid: statusCounts.paid || 0,
      completed: statusCounts.completed || 0,
      cancelled: statusCounts.cancelled || 0
    };

    return { success: true, stats };
  } catch (error) {
    console.error('Contract stats error:', error);
    return { success: false, error: error.message };
  }
}
