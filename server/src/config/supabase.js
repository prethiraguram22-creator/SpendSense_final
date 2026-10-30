import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

export const isSupabaseConfigured = () => {
  if (process.env.NODE_ENV === 'test') {
    return false;
  }
  return (
    env.SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    env.SUPABASE_ANON_KEY !== 'placeholder-anon-key'
  );
};

// Admin client with service role key (for user administration and server-side operations)
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY !== 'placeholder-service-role-key'
    ? env.SUPABASE_SERVICE_ROLE_KEY
    : env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Creates a client scoped to a user's JWT access token
export const createScopedClient = (token) => {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

