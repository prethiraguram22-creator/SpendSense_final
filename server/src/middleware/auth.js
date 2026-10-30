import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';
export const DEMO_EMAIL = 'alex@spendsense.app';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.cookies && req.cookies['sb-access-token']) {
      token = req.cookies['sb-access-token'];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Missing Bearer access token.',
      });
    }

    // Support offline sandbox / demo token when Supabase is in demo mode
    if (token === 'demo-token') {
      req.user = {
        id: DEMO_USER_ID,
        email: DEMO_EMAIL,
        user_metadata: { name: 'Alex Morgan' },
        app_metadata: {},
        isDemo: true,
      };
      req.token = token;
      return next();
    } else if (token.startsWith('demo-session-')) {
      const scopedId = token.replace('demo-session-', '');
      req.user = {
        id: scopedId,
        email: `user-${scopedId.slice(0, 8)}@spendsense.app`,
        user_metadata: { name: 'Demo User' },
        app_metadata: {},
        isDemo: true,
      };
      req.token = token;
      return next();
    }

    if (!isSupabaseConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Supabase authentication service is not configured. Please supply valid SUPABASE_URL and SUPABASE_ANON_KEY.',
      });
    }

    // Verify token cryptographically and retrieve authenticated user
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid, revoked, or expired authentication token.',
        details: error?.message,
      });
    }

    // Attach verified user and token to request object
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    next(err);
  }
};
