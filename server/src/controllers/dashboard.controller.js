import { getDashboardSummary } from '../services/dashboard.service.js';

export const getSummary = async (req, res, next) => {
  try {
    const summary = await getDashboardSummary(req.user.id, req.query.date || null);
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
};

