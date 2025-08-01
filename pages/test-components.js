// pages/test-components.js
import { useState } from 'react';
import PricingSection from '@/components/shared/PricingSection';
import CustomerDataSection from '@/components/shared/CustomerDataSection';

export default function TestComponents() {
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [formData, setFormData] = useState({
    customer_email: '',
    newsletter_signup: false
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddonChange = (newAddons) => {
    setSelectedAddons(newAddons);
    console.log('Selected addons:', newAddons);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">🧪 Component Testing</h1>
        <p>Teste die neuen Shared Components</p>
      </div>

      {/* Test PricingSection */}
      <div>
        <h2 className="text-xl font-semibold mb-4">1. PricingSection Test</h2>
        <PricingSection
          contractType="untermietvertrag"
          basePrice={19.90}
          selectedAddons={selectedAddons}
          onAddonChange={handleAddonChange}
        />
      </div>

      {/* Test CustomerDataSection */}
      <div>
        <h2 className="text-xl font-semibold mb-4">2. CustomerDataSection Test</h2>
        <CustomerDataSection
          formData={formData}
          handleChange={handleInputChange}
          errors={errors}
        />
      </div>

      {/* Debug Output */}
      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <pre className="text-sm">
          {JSON.stringify({ selectedAddons, formData }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
