// pages/api/test-supabase.js
export default async function handler(req, res) {
  try {
    // Environment Variables checken
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    let canConnect = false;
    let connectionError = null;
    let tablesExist = false;

    if (hasUrl && hasKey) {
      try {
        // Supabase importieren und testen
        const { supabase } = await import('../../lib/supabase/supabase');
        
        // Simple Query testen
        const { data, error } = await supabase
          .from('contracts')
          .select('count', { count: 'exact', head: true });

        if (error) {
          connectionError = error.message;
          console.error('Supabase connection error:', error);
        } else {
          canConnect = true;
          tablesExist = true;
        }
      } catch (importError) {
        connectionError = `Import error: ${importError.message}`;
        console.error('Supabase import error:', importError);
      }
    }

    return res.status(200).json({
      success: canConnect,
      hasUrl,
      hasKey,
      hasServiceKey,
      canConnect,
      tablesExist,
      connectionError,
      urlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 50) + '...',
      keyPreview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...'
    });

  } catch (error) {
    console.error('Test Supabase API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
