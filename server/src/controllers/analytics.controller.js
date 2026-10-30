import { listTransactions } from '../services/transaction.service.js';

export const getAnalytics = async (req, res, next) => {
  try {
    const transactions = await listTransactions(req.user.id, { limit: 1000 });

    // 1. Day of week spending distribution
    const weekdaySpending = [0, 0, 0, 0, 0, 0, 0];
    const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (const t of transactions) {
      if (t.type === 'expense') {
        const day = new Date(t.date).getDay();
        weekdaySpending[day] += t.amount;
      }
    }

    const weekdayDistribution = weekdayLabels.map((label, idx) => ({
      day: label,
      amount: Math.round(weekdaySpending[idx] * 100) / 100,
    }));

    // 2. Merchant / Description aggregation (top spenders)
    const merchantMap = {};
    for (const t of transactions) {
      if (t.type === 'expense') {
        const desc = t.description.trim();
        merchantMap[desc] = (merchantMap[desc] || 0) + t.amount;
      }
    }

    const topMerchants = Object.entries(merchantMap)
      .map(([merchant, total]) => ({
        merchant,
        total: Math.round(total * 100) / 100,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        weekdayDistribution,
        topMerchants,
      },
    });
  } catch (err) {
    next(err);
  }
};

