-- Minimal-Seed für v2

-- Beispiel-Company
INSERT INTO companies (name, legal_form, registration_number, tax_id, industry, address, contact_person, subscription_plan)
VALUES (
  'Acme GmbH', 'GmbH', 'HRB 123456', 'DE123456789', 'Consulting',
  '{"street":"Hauptstr. 1","city":"Berlin","zip":"10115","country":"DE"}',
  '{"name":"Max Mustermann","email":"max@acme.example","phone":"+49 30 123456"}',
  'pro'
)
ON CONFLICT DO NOTHING;

-- Beispiel-Template
INSERT INTO contract_templates (template_name, category, industry, template_data, compliance_tags)
VALUES (
  'Dienstleistungsvertrag Standard', 'service', 'consulting',
  '{"sections":["scope","sla","termination"]}',
  ARRAY['gdpr','b2b']
)
ON CONFLICT DO NOTHING;
