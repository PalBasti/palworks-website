// lib/supabase/addonService.js - TEMPORÄRER FALLBACK (funktional)
export async function getAddonsByContractType(contractType) {
  // Simuliere API-Aufruf mit Delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Fallback-Addons basierend auf Vertragstyp
  const addons = {
    untermietvertrag: [
      {
        id: 'temp-1',
        addon_key: 'explanations',
        name: 'Rechtliche Erläuterungen',
        description: 'Detaillierte Erklärungen aller Vertragsklauseln',
        price: 9.90,
        sort_order: 1
      },
      {
        id: 'temp-2', 
        addon_key: 'handover_protocol',
        name: 'Übergabeprotokoll',
        description: 'Professionelles Übergabeprotokoll',
        price: 7.90,
        sort_order: 2
      }
    ],
    garagenvertrag: [
      {
        id: 'temp-3',
        addon_key: 'explanations', 
        name: 'Rechtliche Erläuterungen',
        description: 'Spezielle Erläuterungen für Garagenverträge',
        price: 7.90,
        sort_order: 1
      },
      {
        id: 'temp-4',
        addon_key: 'handover_protocol',
        name: 'Übergabeprotokoll', 
        description: 'Garage-Übergabeprotokoll',
        price: 5.90,
        sort_order: 2
      }
    ],
    'wg-untermietvertrag': [
      {
        id: 'temp-5',
        addon_key: 'explanations',
        name: 'Rechtliche Erläuterungen', 
        description: 'WG-spezifische Vertragsklauseln erklärt',
        price: 9.90,
        sort_order: 1
      },
      {
        id: 'temp-6',
        addon_key: 'wg_rules',
        name: 'WG-Hausordnung Vorlage',
        description: 'Professionelle Hausordnung für WGs',
        price: 4.90,
        sort_order: 2
      }
    ]
  };

  return {
    success: true,
    data: addons[contractType] || []
  };
}

// Für Kompatibilität mit bestehenden Importen
export async function getAddonsForContract(contractType) {
  const result = await getAddonsByContractType(contractType);
  return result.data;
}

export async function calculateAddonPrices(contractType, selectedAddonKeys) {
  if (!selectedAddonKeys || selectedAddonKeys.length === 0) {
    return { addons: [], totalPrice: 0 };
  }
  
  const result = await getAddonsByContractType(contractType);
  const allAddons = result.data;
  
  const selectedAddons = allAddons.filter(addon => 
    selectedAddonKeys.includes(addon.addon_key)
  );
  
  const totalPrice = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
  
  return {
    addons: selectedAddons,
    totalPrice: Math.round(totalPrice * 100) / 100
  };
}
