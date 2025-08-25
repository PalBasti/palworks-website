#!/usr/bin/env node

// scripts/setup-database.js
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

/**
 * Database Setup Script für PalWorks v2.0
 * 
 * Führt automatisch die Database Migration durch:
 * - Erstellt neue Tabellen
 * - Setzt Row Level Security auf
 * - Erstellt Trigger und Functions
 * - Fügt Initial Data ein
 */

// Konfiguration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nphsbwgeverterjbspuf.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Service Role Key für Admin-Operationen

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function executeSQL(sqlContent, description) {
  console.log(`🔄 Executing: ${description}`)
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sqlContent })
    
    if (error) {
      console.error(`❌ Error in ${description}:`, error)
      return false
    }
    
    console.log(`✅ Success: ${description}`)
    return true
  } catch (error) {
    console.error(`❌ Exception in ${description}:`, error)
    return false
  }
}

async function runMigration() {
  console.log('🚀 Starting PalWorks v2.0 Database Migration...\n')

  // 1. Lade SQL Schema
  const schemaPath = path.join(__dirname, '../lib/supabase/schema.sql')
  
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Schema file not found:', schemaPath)
    process.exit(1)
  }

  const schemaSQL = fs.readFileSync(schemaPath, 'utf8')

  // 2. Teile SQL in einzelne Statements auf
  const statements = schemaSQL
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

  console.log(`📋 Found ${statements.length} SQL statements to execute\n`)

  // 3. Führe Statements einzeln aus
  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]
    
    // Bestimme Statement-Typ für bessere Beschreibung
    let description = `Statement ${i + 1}/${statements.length}`
    
    if (statement.includes('CREATE TABLE')) {
      const tableName = statement.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)/i)?.[1]
      description = `Create table: ${tableName}`
    } else if (statement.includes('CREATE POLICY')) {
      const policyName = statement.match(/CREATE POLICY\s+"([^"]+)"/i)?.[1]
      description = `Create policy: ${policyName}`
    } else if (statement.includes('CREATE TRIGGER')) {
      const triggerName = statement.match(/CREATE TRIGGER\s+(\w+)/i)?.[1]
      description = `Create trigger: ${triggerName}`
    } else if (statement.includes('CREATE FUNCTION')) {
      const functionName = statement.match(/CREATE\s+(?:OR REPLACE\s+)?FUNCTION\s+(\w+)/i)?.[1]
      description = `Create function: ${functionName}`
    } else if (statement.includes('INSERT INTO')) {
      const tableName = statement.match(/INSERT INTO\s+(\w+)/i)?.[1]
      description = `Insert data into: ${tableName}`
    }

    const success = await executeSQL(statement + ';', description)
    
    if (success) {
      successCount++
    } else {
      errorCount++
    }
  }

  // 4. Zusammenfassung
  console.log('\n📊 Migration Summary:')
  console.log(`✅ Successful: ${successCount}`)
  console.log(`❌ Failed: ${errorCount}`)
  console.log(`📋 Total: ${statements.length}`)

  if (errorCount === 0) {
    console.log('\n🎉 Database migration completed successfully!')
    
    // 5. Verify tables exist
    console.log('\n🔍 Verifying table creation...')
    await verifyTables()
    
  } else {
    console.log('\n⚠️  Migration completed with errors. Please check the logs above.')
    process.exit(1)
  }
}

async function verifyTables() {
  const expectedTables = [
    'user_profiles',
    'subscriptions', 
    'custom_templates',
    'companies',
    'company_members',
    'usage_analytics',
    'legal_consultations'
  ]

  for (const tableName of expectedTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)

      if (error && !error.message.includes('relation') && !error.message.includes('does not exist')) {
        console.log(`✅ Table verified: ${tableName}`)
      } else if (error) {
        console.log(`❌ Table missing: ${tableName}`)
      } else {
        console.log(`✅ Table verified: ${tableName}`)
      }
    } catch (error) {
      console.log(`❓ Table check failed: ${tableName} - ${error.message}`)
    }
  }
}

// Alternative: Direkte SQL Execution Function für Supabase
async function createRPCFunction() {
  console.log('🔧 Creating SQL execution function...')
  
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql_query;
    END;
    $$;
  `

  try {
    const { error } = await supabase.rpc('query', { query: createFunctionSQL })
    
    if (error) {
      console.log('ℹ️  RPC function might already exist or need different approach')
      return false
    }
    
    console.log('✅ SQL execution function created')
    return true
  } catch (error) {
    console.log('ℹ️  Will try alternative approach for SQL execution')
    return false
  }
}

// Fallback: Execute SQL via individual queries
async function executeSchemaDirectly() {
  console.log('🔄 Executing schema using direct queries...')

  // User Profiles Table
  console.log('📝 Creating user_profiles table...')
  const { error: profileError } = await supabase.rpc('query', {
    query: `
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        company_name VARCHAR(200),
        phone VARCHAR(50),
        role VARCHAR(20) DEFAULT 'public' CHECK (role IN ('public', 'founder', 'enterprise')),
        subscription_status VARCHAR(20) DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'trial')),
        subscription_tier VARCHAR(20) CHECK (subscription_tier IN ('founder', 'enterprise')),
        email_notifications BOOLEAN DEFAULT true,
        marketing_emails BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_login TIMESTAMP WITH TIME ZONE
      );
    `
  })

  if (profileError) {
    console.error('❌ Error creating user_profiles:', profileError)
  } else {
    console.log('✅ user_profiles table created')
  }

  // Continue with other tables...
  console.log('\n⚠️  Note: This is a simplified setup. For full migration, please run the SQL manually in Supabase dashboard.')
  console.log('📋 SQL file location: lib/supabase/schema.sql')
}

// Main execution
async function main() {
  try {
    // Try to create RPC function first
    const rpcCreated = await createRPCFunction()
    
    if (rpcCreated) {
      await runMigration()
    } else {
      await executeSchemaDirectly()
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = { runMigration, executeSQL }