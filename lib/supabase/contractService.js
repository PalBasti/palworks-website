// lib/supabase/contractService.js
import { supabase } from './client';

/**
 * Contract Service - Erweiterte Version für modulare Architektur
 * Unterstützt alle CRUD-Operationen für Verträge
 */

// Bestehende Funktion (falls noch nicht vorhanden)
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
        status: 'draft', // Initial status
        payment_status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating contract:', error);
      throw new Error('Failed to create contract');
    }

    console.log('Contract created successfully:', data.id);
    return { success: true, contract: data };
  } catch (error) {
    console.error('Contract creation error:', error);
    return { success: false, error: error.message };
  }
}

// NEU: Contract abrufen
export async function getContract(contractId) {
  try {
    if (!contractId) {
      throw new Error('Contract ID is required');
    }

    const { data, error } = await supabase
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

// NEU: Contract aktualisieren
export async function updateContract(contractId, updates) {
  try {
    if (!contractId) {
      throw new Error('Contract ID is required');
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

    const { data, error } = await supabase
      .from('contracts')
      .update(filteredUpdates)
      .eq('id', contractId)
      .select()
      .single();

    if (error) {
      console.error('Error updating contract:', error);
      throw new Error('Failed to update contract');
    }

    console.log('Contract updated successfully:', contractId);
    return { success: true, contract: data };
  } catch (error) {
    console.error('Contract update error:', error);
    return { success: false, error: error.message };
  }
}

// NEU: Payment Status aktualisieren
export async function updateContractPaymentStatus(contractId, paymentStatus, paymentIntentId = null) {
  try {
    if (!contractId || !paymentStatus) {
      throw new Error('Contract ID and payment status are required');
    }

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
    }

    const { data, error } = await supabase
      .from('contracts')
      .update(updates)
      .eq('id', contractId)
      .select()
      .single();

    if (error) {
      console.error('Error updating payment status:', error);
      throw new Error('Failed to update payment status');
    }

    console.log('Payment status updated:', { contractId, paymentStatus });
    return { success: true, contract: data };
  } catch (error) {
    console.error('Payment status update error:', error);
    return { success: false, error: error.message };
  }
}

// NEU: Contracts nach E-Mail suchen
export async function getContractsByEmail(email) {
  try {
    if (!email) {
      throw new Error('Email is required');
    }

    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('customer_email', email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contracts by email:', error);
      throw new Error('Failed to fetch contracts');
    }

    return { success: true, contracts: data };
  } catch (error) {
    console.error('Contracts fetch error:', error);
    return { success: false, error: error.message };
  }
}

// NEU: Contract-Statistiken
export async function getContractStats() {
  try {
    // Gesamtanzahl
    const { count: totalCount, error: totalError } = await supabase
      .from('contracts')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    // Bezahlte Verträge
    const { count: paidCount, error: paidError } = await supabase
      .from('contracts')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'paid');

    if (paidError) throw paidError;

    // Nach Vertragstyp
    const { data: typeStats, error: typeError } = await supabase
      .from('contracts')
      .select('contract_type')
      .eq('payment_status', 'paid');

    if (typeError) throw typeError;

    // Vertragstyp-Verteilung berechnen
    const typeDistribution = typeStats.reduce((acc, contract) => {
      acc[contract.contract_type] = (acc[contract.contract_type] || 0) + 1;
      return acc;
    }, {});

    return {
      success: true,
      stats: {
        total: totalCount,
        paid: paidCount,
        pending: totalCount - paidCount,
        typeDistribution
      }
    };
  } catch (error) {
    console.error('Contract stats error:', error);
    return { success: false, error: error.message };
  }
}

// NEU: Contract-Validierung
export function validateContractData(contractData) {
  const errors = [];

  // Pflichtfelder prüfen
  if (!contractData.contractType) {
    errors.push('Contract type is required');
  }

  if (!contractData.customerEmail) {
    errors.push('Customer email is required');
  }

  if (!contractData.formData || Object.keys(contractData.formData).length === 0) {
    errors.push('Form data is required');
  }

  if (typeof contractData.totalAmount !== 'number' || contractData.totalAmount <= 0) {
    errors.push('Valid total amount is required');
  }

  // E-Mail-Format validieren
  if (contractData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contractData.customerEmail)) {
    errors.push('Valid email format is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
