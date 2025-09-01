-- Migration: add_business_database_v2
-- Description: Companies, business_contracts, contract_templates, company_users, bulk_orders, RLS, and B2B addons

-- Ensure required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Companies Tabelle für Unternehmenskunden
CREATE TABLE IF NOT EXISTS companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    legal_form VARCHAR(50),
    registration_number VARCHAR(100),
    tax_id VARCHAR(100),
    industry VARCHAR(100),
    address JSONB NOT NULL,
    contact_person JSONB NOT NULL,
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Contracts (erweitert die bestehende contracts Tabelle)
CREATE TABLE IF NOT EXISTS business_contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    contract_type VARCHAR(50) NOT NULL,
    contract_data JSONB NOT NULL,
    template_id UUID,
    legal_review_required BOOLEAN DEFAULT false,
    compliance_status VARCHAR(50) DEFAULT 'pending',
    bulk_order_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contract Templates
CREATE TABLE IF NOT EXISTS contract_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    industry VARCHAR(100),
    template_data JSONB NOT NULL,
    compliance_tags TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company Users
CREATE TABLE IF NOT EXISTS company_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    permissions JSONB DEFAULT '{}',
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE
);

-- Bulk Orders
CREATE TABLE IF NOT EXISTS bulk_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    contract_type VARCHAR(50) NOT NULL,
    total_contracts INTEGER NOT NULL,
    processed_contracts INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    upload_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_orders ENABLE ROW LEVEL SECURITY;

-- For initial setup, allow all using true (restrict later)
DO $$ BEGIN
  CREATE POLICY "Service role can manage companies" ON companies FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can manage business_contracts" ON business_contracts FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can manage contract_templates" ON contract_templates FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can manage company_users" ON company_users FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can manage bulk_orders" ON bulk_orders FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- B2B Addons erweitern, falls Tabelle existiert
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contract_addons') THEN
    INSERT INTO contract_addons (contract_type, addon_key, name, description, base_price, features) VALUES
    ('business_service', 'legal_review', 'Juristische Prüfung', 'Professionelle Rechtsprüfung durch Anwalt', 89.00, '{"includes": ["legal_check", "modifications", "compliance_review"]}'),
    ('business_service', 'bulk_generation', 'Bulk-Generierung', 'Automatische Erstellung mehrerer Verträge', 29.00, '{"max_contracts": 50, "csv_upload": true}'),
    ('business_service', 'priority_support', 'Priority Support', '24h Support für Geschäftskunden', 49.00, '{"response_time": "2h", "phone_support": true}'),
    ('business_service', 'custom_branding', 'Custom Branding', 'Verträge mit Firmenlogo und CI', 19.00, '{"logo_upload": true, "color_customization": true}')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

