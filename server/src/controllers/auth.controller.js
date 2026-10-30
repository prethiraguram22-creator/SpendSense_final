import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { getUserProfile } from '../services/user.service.js';

export const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!isSupabaseConfigured()) {
      // Mock session for development sandbox
      const mockUser = {
        id: crypto.randomUUID(),
        email,
        user_metadata: { name },
      };
      const profile = await getUserProfile(mockUser.id, email);
      return res.status(201).json({
        success: true,
        user: mockUser,
        profile,
        session: {
          access_token: `demo-session-${mockUser.id}`,
          token_type: 'bearer',
          expires_in: 3600,
          user: mockUser,
        },
      });
    }

    const { data, error } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    const user = data.user;
    const profile = await getUserProfile(user.id, user.email);

    res.status(201).json({
      success: true,
      user,
      profile,
      session: data.session,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!isSupabaseConfigured()) {
      const mockUser = {
        id: crypto.randomUUID(),
        email,
        user_metadata: { name: email.split('@')[0] },
      };
      const profile = await getUserProfile(mockUser.id, email);
      return res.json({
        success: true,
        user: mockUser,
        profile,
        session: {
          access_token: `demo-session-${mockUser.id}`,
          token_type: 'bearer',
          expires_in: 3600,
          user: mockUser,
        },
      });
    }

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ success: false, error: error.message });
    }

    const user = data.user;
    const profile = await getUserProfile(user.id, user.email);

    res.json({
      success: true,
      user,
      profile,
      session: data.session,
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    if (isSupabaseConfigured() && req.token && !req.token.startsWith('demo-')) {
      await supabaseAdmin.auth.admin.signOut(req.token);
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const profile = await getUserProfile(req.user.id, req.user.email);
    res.json({
      success: true,
      user: req.user,
      profile,
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!isSupabaseConfigured()) {
      return res.json({
        success: true,
        message: 'Password reset link sent (simulated in development mode)',
      });
    }

    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${req.headers.origin || 'http://localhost:5173'}/login?reset=success`,
    });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.json({
      success: true,
      message: 'Password reset instructions have been sent to your email.',
    });
  } catch (err) {
    next(err);
  }
};

