-- Database Schema für PalWorks Multi-Tier Platform
-- Erweitert bestehende Database um User Management & Subscriptions

-- ===== USER PROFILES =====
-- Erweitert Supabase Auth.Users um Business Logic
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  
  -- Personal Information
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  company_name VARCHAR(200),
  phone VARCHAR(50),
  
  -- Role & Subscription
  role VARCHAR(20) DEFAULT 'public' CHECK (role IN ('public', 'founder', 'enterprise')),
  subscription_status VARCHAR(20) DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'trial')),
  subscription_tier VARCHAR(20) CHECK (subscription_tier IN ('founder', 'enterprise')),
  
  -- Settings
  email_notifications BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- RLS (Row Level Security) für user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users können nur ihr eigenes Profil sehen/bearbeiten
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Automatische Profil-Erstellung bei Registrierung
CREATE POLICY "Enable insert for authenticated users" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===== SUBSCRIPTIONS =====
-- Stripe Subscription Management
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Subscription Details
  subscription_tier VARCHAR(20) NOT NULL CHECK (subscription_tier IN ('founder', 'enterprise')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due', 'unpaid')),
  
  -- Stripe Integration
  stripe_subscription_id VARCHAR(100) UNIQUE,
  stripe_customer_id VARCHAR(100),
  stripe_price_id VARCHAR(100),
  
  -- Billing Periods
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  
  -- Pricing
  monthly_price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  UNIQUE(user_id, subscription_tier)
);

-- RLS für subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- ===== CUSTOM TEMPLATES (Enterprise Feature) =====
-- Enterprise Kunden können eigene Vertragsvorlagen erstellen
CREATE TABLE IF NOT EXISTS custom_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Template Details
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'custom',
  
  -- Template Content
  template_data JSONB NOT NULL, -- Enthält Formular-Konfiguration
  pdf_template JSONB,           -- PDF Layout-Konfiguration
  
  -- Settings
  is_active BOOLEAN DEFAULT true,
  is_shared BOOLEAN DEFAULT false, -- Für Multi-User Enterprise Accounts
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS für custom_templates
ALTER TABLE custom_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own templates" ON custom_templates
  FOR ALL USING (auth.uid() = user_id);

-- ===== COMPANY ACCOUNTS (Enterprise Feature) =====
-- Multi-User Enterprise Accounts
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Company Details
  name VARCHAR(200) NOT NULL,
  domain VARCHAR(100), -- z.B. "@company.com" für automatische Zuordnung
  
  -- Settings
  max_users INTEGER DEFAULT 10,
  
  -- Branding (White-Label)
  logo_url VARCHAR(500),
  primary_color VARCHAR(7), -- Hex Color
  secondary_color VARCHAR(7),
  custom_domain VARCHAR(100),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== COMPANY MEMBERS =====
-- Verknüpfung zwischen Users und Companies
CREATE TABLE IF NOT EXISTS company_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Role within Company
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member')),
  
  -- Permissions
  can_create_templates BOOLEAN DEFAULT false,
  can_manage_users BOOLEAN DEFAULT false,
  can_access_analytics BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invited_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  UNIQUE(company_id, user_id)
);

-- RLS für company_members
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view company memberships" ON company_members
  FOR SELECT USING (auth.uid() = user_id);

-- ===== USAGE ANALYTICS (Enterprise Feature) =====
-- Tracking für Enterprise Dashboard
CREATE TABLE IF NOT EXISTS usage_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Event Details
  event_type VARCHAR(50) NOT NULL, -- 'contract_generated', 'template_created', etc.
  contract_type VARCHAR(50),
  template_id UUID,
  
  -- Metadata
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index für Performance
CREATE INDEX idx_usage_analytics_user_date ON usage_analytics(user_id, created_at);
CREATE INDEX idx_usage_analytics_company_date ON usage_analytics(company_id, created_at);

-- RLS für usage_analytics
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics" ON usage_analytics
  FOR SELECT USING (auth.uid() = user_id);

-- ===== LEGAL CONSULTATIONS (Enterprise Feature) =====
-- Rechtsberatung Booking System
CREATE TABLE IF NOT EXISTS legal_consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Consultation Details
  topic VARCHAR(200) NOT NULL,
  description TEXT,
  consultation_type VARCHAR(50) DEFAULT 'general' CHECK (consultation_type IN ('general', 'contract_review', 'custom_template', 'legal_advice')),
  
  -- Scheduling
  requested_date TIMESTAMP WITH TIME ZONE,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 30,
  
  -- Status
  status VARCHAR(20) DEFAULT 'requested' CHECK (status IN ('requested', 'scheduled', 'completed', 'cancelled')),
  
  -- Meeting Details
  meeting_url VARCHAR(500),
  meeting_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS für legal_consultations
ALTER TABLE legal_consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own consultations" ON legal_consultations
  FOR ALL USING (auth.uid() = user_id);

-- ===== ERWEITERE BESTEHENDE CONTRACT LOGS =====
-- Erweitere bestehende contract_logs um User-Zuordnung (NULLABLE für Rückwärtskompatibilität)
ALTER TABLE contract_logs 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_authenticated BOOLEAN DEFAULT false;

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_contract_logs_user ON contract_logs(user_id);

-- ===== FUNCTIONS & TRIGGERS =====

-- Function: Auto-Update updated_at Timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger: Auto-Update Timestamps
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_templates_updated_at BEFORE UPDATE ON custom_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Automatische Profil-Erstellung bei User-Registrierung
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, email, role, subscription_status)
  VALUES (NEW.id, NEW.email, 'public', 'inactive');
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger: Erstelle Profil bei neuer User-Registrierung
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ===== INITIAL DATA =====

-- Standard-Subscription-Tiers
INSERT INTO subscriptions (user_id, subscription_tier, status, stripe_subscription_id, monthly_price) 
VALUES 
  (NULL, 'founder', 'inactive', 'tier_founder', 29.99),
  (NULL, 'enterprise', 'inactive', 'tier_enterprise', 99.99)
ON CONFLICT DO NOTHING;

-- ===== GRANTS & PERMISSIONS =====

-- Grant permissions für authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant permissions für anon users (für public contracts)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON contract_logs TO anon;
GRANT INSERT ON contract_logs TO anon;