// pages/test-pricing-simple.js
import { useState } from 'react';
import PricingSection from '../components/shared/PricingSection';

export default function SimplePricingTest() {
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [contractType, setContractType] = useState('untermietvertrag');
  const [basePrice, setBasePrice] = useState(19.90);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Einfacher PricingSection Test
          </h1>
          <p className="text-gray-600">
            Teste die PricingSection-Komponente mit Mock-Daten (funktioniert auch ohne Supabase)
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">🎛️ Test Controls</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contract Type:
              </label>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="untermietvertrag">Untermietvertrag</option>
                <option value="garagenvertrag">Garagenvertrag</option>
                <option value="wg_untermietvertrag">WG-Untermietvertrag</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Price (€):
              </label>
              <input
                type="number"
                step="0.01"
                value={basePrice}
                onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4">
            <h4 className="font-medium text-gray-900 mb-2">Quick Actions:</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedAddons(['explanation'])}
                className="bg-blue-50 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-100"
              >
                📝 Wähle Erläuterung
              </button>
              <button
                onClick={() => setSelectedAddons(['handover_protocol'])}
                className="bg-green-50 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-100"
              >
                📋 Wähle Übergabeprotokoll
              </button>
              <button
                onClick={() => setSelectedAddons(['explanation', 'handover_protocol'])}
                className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded text-sm hover:bg-yellow-100"
              >
                🎯 Wähle beide
              </button>
              <button
                onClick={() => setSelectedAddons([])}
                className="bg-red-50 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-100"
              >
                🚫 Alle abwählen
              </button>
            </div>
          </div>
        </div>

        {/* PricingSection Component */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">🎯 PricingSection Component</h3>
          
          <PricingSection
            contractType={contractType}
            basePrice={basePrice}
            selectedAddons={selectedAddons}
            onAddonChange={setSelectedAddons}
          />
        </div>

        {/* Debug Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">🔍 Debug Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-medium text-gray-900 mb-2">Component Props:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div><strong>contractType:</strong> {contractType}</div>
                <div><strong>basePrice:</strong> {basePrice}€</div>
                <div><strong>selectedAddons:</strong> [{selectedAddons.join(', ')}]</div>
                <div><strong>addonCount:</strong> {selectedAddons.length}</div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded">
              <h4 className="font-medium text-gray-900 mb-2">Expected Behavior:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>✅ Component sollte laden</div>
                <div>✅ Mock-Addons sollten angezeigt werden</div>
                <div>✅ Addon-Klicks sollten funktionieren</div>
                <div>✅ Preise sollten sich ändern</div>
                <div>✅ Demo-Modus Hinweis sollte erscheinen</div>
              </div>
            </div>
          </div>

          {/* Test Checklist */}
          <div className="mt-6 p-4 bg-green-50 rounded">
            <h4 className="font-medium text-green-900 mb-2">✅ Test Checklist:</h4>
            <div className="text-sm text-green-800 space-y-1">
              <div>□ Seite lädt ohne Fehler</div>
              <div>□ PricingSection wird angezeigt</div>
              <div>□ "Demo-Modus" Badge ist sichtbar</div>
              <div>□ Basis-Vertrag wird mit korrektem Preis angezeigt</div>
              <div>□ 3 Mock-Addons werden angezeigt</div>
              <div>□ Addon-Klicks ändern die Auswahl</div>
              <div>□ Gesamtpreis ändert sich korrekt</div>
              <div>□ Quick Actions funktionieren</div>
              <div>□ Contract Type Wechsel funktioniert</div>
              <div>□ Preis-Eingabe funktioniert</div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 rounded">
            <h4 className="font-medium text-yellow-900 mb-2">💡 Wenn dieser Test funktioniert:</h4>
            <div className="text-sm text-yellow-800">
              <p>Die PricingSection-Komponente ist korrekt implementiert! Der "Demo-Modus" 
              bedeutet, dass Mock-Daten verwendet werden, weil die Supabase-Verbindung 
              fehlgeschlagen ist - das ist für den Test völlig in Ordnung.</p>
              <p className="mt-2"><strong>Nächster Schritt:</strong> Erstelle die anderen Test-Seiten 
              und prüfe die Supabase-Verbindung separat.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
