import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

// In-memory store for demo sandbox mode or tests
const memoryProfiles = new Map();

export const getUserProfile = async (userId, userEmail = '') => {
  if (!isSupabaseConfigured() || userId.startsWith('00000000-')) {
    if (!memoryProfiles.has(userId)) {
      memoryProfiles.set(userId, {
        id: userId,
        email: userEmail || 'alex@spendsense.app',
        name: 'Alex Morgan',
        currency: 'USD',
        openingBalance: 12500,
        hideBalance: false,
        notifications: { budgetAlerts: true, weeklyDigest: true, goalMilestones: true },
        dismissedRecommendations: [],
      });
    }
    return memoryProfiles.get(userId);
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    // If profile row doesn't exist yet, insert default
    const newProfile = {
      id: userId,
      email: userEmail,
      name: userEmail ? userEmail.split('@')[0] : 'User',
      currency: 'USD',
      opening_balance: 0,
      hide_balance: false,
      notifications: { budgetAlerts: true, weeklyDigest: true, goalMilestones: true },
      dismissed_recommendations: [],
    };
    await supabaseAdmin.from('profiles').insert(newProfile);
    return {
      id: userId,
      email: userEmail,
      name: newProfile.name,
      currency: 'USD',
      openingBalance: 0,
      hideBalance: false,
      notifications: newProfile.notifications,
      dismissedRecommendations: [],
    };
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    currency: data.currency,
    openingBalance: Number(data.opening_balance),
    hideBalance: data.hide_balance,
    notifications: data.notifications,
    dismissedRecommendations: data.dismissed_recommendations || [],
  };
};

export const updateUserProfile = async (userId, patch) => {
  if (!isSupabaseConfigured() || userId.startsWith('00000000-')) {
    const existing = await getUserProfile(userId);
    const updated = { ...existing, ...patch };
    memoryProfiles.set(userId, updated);
    return updated;
  }

  const dbPatch = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.email !== undefined) dbPatch.email = patch.email;
  if (patch.currency !== undefined) dbPatch.currency = patch.currency;
  if (patch.openingBalance !== undefined) dbPatch.opening_balance = patch.openingBalance;
  if (patch.hideBalance !== undefined) dbPatch.hide_balance = patch.hideBalance;
  if (patch.notifications !== undefined) dbPatch.notifications = patch.notifications;
  if (patch.dismissedRecommendations !== undefined)
    dbPatch.dismissed_recommendations = patch.dismissedRecommendations;

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(dbPatch)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    currency: data.currency,
    openingBalance: Number(data.opening_balance),
    hideBalance: data.hide_balance,
    notifications: data.notifications,
    dismissedRecommendations: data.dismissed_recommendations || [],
  };
};

export const clearUserData = async (userId) => {
  if (!isSupabaseConfigured() || userId.startsWith('00000000-')) {
    memoryProfiles.delete(userId);
    return { success: true };
  }

  await Promise.all([
    supabaseAdmin.from('transactions').delete().eq('user_id', userId),
    supabaseAdmin.from('budgets').delete().eq('user_id', userId),
    supabaseAdmin.from('goals').delete().eq('user_id', userId),
  ]);

  return { success: true };
};

