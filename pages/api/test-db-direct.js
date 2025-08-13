// pages/api/test-db-direct.js
export default async function handler(req, res) {
  try {
    console.log('🧪 Starting direct DB test...');

    // Supabase direkt importieren
    const { supabase } = await import('../../lib/supabase/supabase');
    
    let tablesExist = false;
    let canInsert = false;
    let insertError = null;
    let tableInfo = {};

    // Test 1: Prüfen ob contracts Tabelle existiert
    try {
      console.log('📊 Testing table existence...');
      
      const { data: tableData, error: tableError } = await supabase
        .from('contracts')
        .select('count', { count: 'exact', head: true });

      if (tableError) {
        console.error('❌ Table error:', tableError);
        tableInfo.error = tableError.message;
      } else {
        tablesExist = true;
        tableInfo.contractsCount = tableData?.count || 0;
        console.log('✅ Contracts table exists, count:', tableData?.count);
      }
    } catch (error) {
      console.error('❌ Table check failed:', error);
      tableInfo.checkError = error.message;
    }

    // Test 2: Testdaten einfügen versuchen
    if (tablesExist) {
      try {
        console.log('📊 Testing insert...');
        
        const testContract = {
          contract_type: 'test-direct-db',
          form_data: {
            test: true,
            timestamp: new Date().toISOString()
          },
          selected_addons: [],
          addon_prices: {},
          total_amount: 1.00,
          customer_email: 'db-direct-test@palworks-debug.de',
          status: 'draft',
          payment_status: 'pending'
        };

        const { data: insertData, error: insertError } = await supabase
          .from('contracts')
          .insert([testContract])
          .select()
          .single();

        if (insertError) {
          console.error('❌ Insert error:', insertError);
          insertError = insertError.message;
        } else {
          canInsert = true;
          console.log('✅ Insert successful:', insertData.id);
          
          // Test-Eintrag wieder löschen
          await supabase
            .from('contracts')
            .delete()
            .eq('id', insertData.id);
        }
      } catch (error) {
        console.error('❌ Insert test failed:', error);
        insertError = error.message;
      }
    }

    return res.status(200).json({
      success: tablesExist && canInsert,
      tablesExist,
      canInsert,
      insertError,
      tableInfo,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Direct DB test error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
