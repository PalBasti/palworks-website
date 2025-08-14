// lib/supabase/contractService.js
import { supabase, supabaseAdmin } from './supabase';

/**
 * Contract Service - Vollständige Implementation
 * Verwendet supabaseAdmin für Server-seitige Operationen
 */

export async function createContract(contractData) {
  try {
    console.log('📊 Creating contract with data:', contractData);

    // Field-Mapping für verschiedene Input-Formate
    const mappedData = {
      contract_type: contractData.contractType || contractData.contract_type,
      customer_email: contractData.customerEmail || contractData.customer_email,
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

    console.log('🔍 Fetching contract:', contractId);

    // Admin Client verwenden
    const client = supabaseAdmin || supabase;

    const { data, error } = await client
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single();

    if (error) {
      console.error('❌ Contract fetch error:', error);
      return { success: false, error: 'Contract not found' };
    }

    console.log('✅ Contract fetched successfully');
    return { success: true, contract: data };

  } catch (error) {
    console.error('❌ Contract fetch error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function updateContract(contractId, updates) {
  try {
    if (!contractId) {
      return { success: false, error: 'Contract ID is required' };
    }

    console.log('📝 Updating contract:', contractId, 'with:', updates);

    // Admin Client verwenden
    const client = supabaseAdmin || supabase;

    const { data, error } = await client
      .from('contracts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', contractId)
      .select()
      .single();

    if (error) {
      console.error('❌ Contract update error:', error);
      return { success: false, error: 'Failed to update contract' };
    }

    console.log('✅ Contract updated successfully');
    return { success: true, contract: data };

  } catch (error) {
    console.error('❌ Contract update error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function updateContractPaymentStatus(contractId, status, paymentIntentId = null) {
  try {
    if (!contractId || !status) {
      return { success: false, error: 'Contract ID and status are required' };
    }

    console.log('💳 Updating contract payment status:', contractId, 'to:', status);

    const updates = {
      status: status, // 'paid', 'payment_failed', 'canceled', etc.
      payment_status: status === 'paid' ? 'paid' : status === 'payment_failed' ? 'failed' : status,
      updated_at: new Date().toISOString()
    };

    if (paymentIntentId) {
      updates.payment_intent_id = paymentIntentId;
    }

    if (status === 'paid') {
      updates.paid_at = new Date().toISOString();
    }

    // Admin Client verwenden
    const client = supabaseAdmin || supabase;

    const { data, error } = await client
      .from('contracts')
      .update(updates)
      .eq('id', contractId)
      .select()
      .single();

    if (error) {
      console.error('❌ Payment status update error:', error);
      return { success: false, error: 'Failed to update payment status' };
    }

    console.log('✅ Payment status updated successfully');
    return { success: true, contract: data };

  } catch (error) {
    console.error('❌ Payment status update error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function getContractsByEmail(email) {
  try {
    if (!email) {
      return { success: false, error: 'Email is required' };
    }

    console.log('📧 Fetching contracts for email:', email);

    // Admin Client verwenden
    const client = supabaseAdmin || supabase;

    const { data, error } = await client
      .from('contracts')
      .select('*')
      .eq('customer_email', email.toLowerCase().trim())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Contracts fetch error:', error);
      return { success: false, error: 'Failed to fetch contracts' };
    }

    console.log('✅ Contracts fetched successfully:', data.length);
    return { success: true, contracts: data };

  } catch (error) {
    console.error('❌ Contracts fetch error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function deleteContract(contractId) {
  try {
    if (!contractId) {
      return { success: false, error: 'Contract ID is required' };
    }

    console.log('🗑️ Deleting contract:', contractId);

    // Admin Client verwenden
    const client = supabaseAdmin || supabase;

    const { error } = await client
      .from('contracts')
      .delete()
      .eq('id', contractId);

    if (error) {
      console.error('❌ Contract deletion error:', error);
      return { success: false, error: 'Failed to delete contract' };
    }

    console.log('✅ Contract deleted successfully');
    return { success: true };

  } catch (error) {
    console.error('❌ Contract deletion error:', error.message);
    return { success: false, error: error.message };
  }
}

// Utility: Contract-Status prüfen
export function isContractPayable(contract) {
  return contract && contract.status === 'draft' && contract.payment_status === 'pending';
}

// Utility: Contract für Payment Intent formatieren
export function formatContractForPayment(contract) {
  return {
    id: contract.id,
    type: contract.contract_type,
    amount: contract.total_amount,
    currency: 'eur',
    customer_email: contract.customer_email,
    description: `${contract.contract_type} - ${contract.customer_email}`
  };
}
