import { getInsights } from '../services/insight.service.js';
import { getUserProfile, updateUserProfile } from '../services/user.service.js';

export const list = async (req, res, next) => {
  try {
    const insights = await getInsights(req.user.id, req.query.date || null);
    res.json({ success: true, data: insights });
  } catch (err) {
    next(err);
  }
};

export const dismiss = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await getUserProfile(req.user.id);
    const dismissed = Array.from(new Set([...(profile.dismissedRecommendations || []), id]));
    await updateUserProfile(req.user.id, { dismissedRecommendations: dismissed });
    res.json({ success: true, message: 'Insight dismissed', dismissed });
  } catch (err) {
    next(err);
  }
};

export const restore = async (req, res, next) => {
  try {
    await updateUserProfile(req.user.id, { dismissedRecommendations: [] });
    res.json({ success: true, message: 'All insights restored' });
  } catch (err) {
    next(err);
  }
};

