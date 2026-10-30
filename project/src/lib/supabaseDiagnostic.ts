import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Development-only Supabase connectivity diagnostic runner.
 * Tests client initialization, auth session retrieval, and safe table read query.
 */
export async function runSupabaseDiagnostics(): Promise<void> {
  if (!import.meta.env.DEV) return;

  const url = import.meta.env.VITE_SUPABASE_URL;

  console.groupCollapsed('%c[SpendSense] Supabase Connectivity Diagnostics', 'color: #38bdf8; font-weight: bold;');
  console.log('Project URL:', url || '(missing)');
  console.log('Configured:', isSupabaseConfigured);

  try {
    // Test 1: Initialize the Supabase client
    if (!supabase) {
      console.error('❌ Test 1 (Client Initialization): Supabase client instance is undefined.');
    } else {
      console.log('✅ Test 1 (Client Initialization): Supabase client initialized successfully.');
    }

    if (!isSupabaseConfigured) {
      console.warn('⚠️ Environment variables missing. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in project/.env.');
      console.groupEnd();
      return;
    }

    // Test 2: Check authentication session
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.error('❌ Test 2 (Auth Session Retrieval): Failed -', authError.message);
    } else {
      console.log(
        '✅ Test 2 (Auth Session Retrieval): Succeeded. Session state:',
        authData.session ? `Authenticated as ${authData.session.user.email}` : 'No active session (clean anonymous state)',
      );
    }

    // Test 3: Safe read-only query against database
    const { data: catData, error: catError } = await supabase
      .from('categories')
      .select('id, label, type')
      .limit(1);

    if (catError) {
      if (catError.code === 'PGRST205') {
        console.warn(
          '⚠️ Test 3 (Database Query): Connected to Supabase PostgREST, but table "categories" was not found in schema cache. Run the migrations in supabase/migrations/ in your Supabase SQL editor to create the schema.',
        );
      } else {
        console.warn(`⚠️ Test 3 (Database Query): Query returned code ${catError.code} - ${catError.message}`);
      }
    } else {
      console.log('✅ Test 3 (Database Query): Succeeded! Returned records:', catData);
    }
  } catch (err) {
    console.error('❌ Diagnostic error:', err);
  } finally {
    console.groupEnd();
  }
}

