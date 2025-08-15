// pages/api/contract-addons/[contractType].js
// FEHLENDES BINDEGLIED zwischen addonService.js und Frontend

import { getAddonsForContract } from '../../../lib/supabase/addonService';

export default async function handler(req, res) {
  const { contractType } = req.query;

  // CORS Headers für Frontend-Zugriff
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📋 Fetching addons for contract type:', contractType);

    // Verwende den bereits existierenden addonService
    const addons = await getAddonsForContract(contractType);
    
    console.log('✅ Found addons:', addons?.length || 0);

    // Formatierung für Frontend (falls nötig)
    const formattedAddons = addons.map(addon => ({
      id: addon.addon_key || addon.id,
      addon_key: addon.addon_key,
      name: addon.name,
      description: addon.description,
      price: parseFloat(addon.price),
      category: addon.category || 'general',
      recommended: addon.recommended || false,
      features: addon.features || [],
      sort_order: addon.sort_order || 0
    }));

    return res.status(200).json({
      success: true,
      contractType,
      addons: formattedAddons,
      count: formattedAddons.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Contract addons API error:', error);
    
    // Fallback mit Standard-Addons (falls Supabase-Problem)
    const fallbackAddons = getFallbackAddons(contractType);
    
    return res.status(200).json({
      success: true,
      contractType,
      addons: fallbackAddons,
      count: fallbackAddons.length,
      fallback: true,
      timestamp: new Date().toISOString()
    });
  }
}

// Fallback-Addons falls Supabase nicht erreichbar
function getFallbackAddons(contractType) {
  const addonConfigs = {
    untermietvertrag: [
      {
        id: 'explanation',
        addon_key: 'explanation',
        name: 'Vertragserläuterungen',
        description: 'Detaillierte Erläuterungen zu allen Vertragsklauseln',
        price: 6.90,
        category: 'legal',
        recommended: true
      },
      {
        id: 'handover_protocol',
        addon_key: 'handover_protocol',
        name: 'Übergabeprotokoll',
        description: 'Professionelles Übergabeprotokoll für Ihre Immobilie',
        price: 4.90,
        category: 'document',
        recommended: true
      },
      {
        id: 'insurance_clause',
        addon_key: 'insurance_clause',
        name: 'Versicherungsklauseln',
        description: 'Zusätzliche Absicherung durch Versicherungsklauseln',
        price: 3.90,
        category: 'legal',
        recommended: false
      }
    ],
    garagenvertrag: [
      {
        id: 'explanation',
        addon_key: 'explanation',
        name: 'Vertragserläuterungen',
        description: 'Erläuterungen speziell für Garagenmietverträge',
        price: 4.90,
        category: 'legal',
        recommended: true
      },
      {
        id: 'handover_protocol',
        addon_key: 'handover_protocol',
        name: 'Übergabeprotokoll',
        description: 'Zustandsprotokoll für die Garage',
        price: 3.90,
        category: 'document',
        recommended: false
      }
    ],
    'wg-untermietvertrag': [
      {
        id: 'explanation',
        addon_key: 'explanation',
        name: 'WG-Rechtserläuterungen',
        description: 'Spezielle Erläuterungen für WG-Untermietverträge',
        price: 5.90,
        category: 'legal',
        recommended: true
      },
      {
        id: 'house_rules',
        addon_key: 'house_rules',
        name: 'WG-Hausordnung',
        description: 'Muster-Hausordnung für Wohngemeinschaften',
        price: 2.90,
        category: 'document',
        recommended: false
      }
    ]
  };

  return addonConfigs[contractType] || [];
}
