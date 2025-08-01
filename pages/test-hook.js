// pages/test-hook.js
import { useContractForm } from '@/hooks/useContractForm';

export default function TestHook() {
  const {
    formData,
    selectedAddons,
    totalPrice,
    handleInputChange,
    handleAddonChange,
    loading,
    errors
  } = useContractForm('untermietvertrag', 19.90);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🎣 Hook Testing</h1>
      
      <div className="space-y-4">
        <div>
          <label>E-Mail:</label>
          <input
            type="email"
            name="customer_email"
            value={formData.customer_email || ''}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <p>Selected Addons: {selectedAddons.join(', ')}</p>
          <p>Total Price: {totalPrice}€</p>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  );
}
