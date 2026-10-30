import { getUserProfile, updateUserProfile, clearUserData } from '../services/user.service.js';
import { createTransaction } from '../services/transaction.service.js';
import { saveBudget } from '../services/budget.service.js';
import { createGoal } from '../services/goal.service.js';

export const getProfile = async (req, res, next) => {
  try {
    const profile = await getUserProfile(req.user.id, req.user.email);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updated = await updateUserProfile(req.user.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const clearData = async (req, res, next) => {
  try {
    await clearUserData(req.user.id);
    res.json({ success: true, message: 'All personal financial records cleared.' });
  } catch (err) {
    next(err);
  }
};

export const loadDemoData = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Clear existing
    await clearUserData(userId);

    // Update opening balance
    await updateUserProfile(userId, {
      openingBalance: 12500,
      currency: 'USD',
      dismissedRecommendations: [],
    });

    const now = new Date();
    const isoDate = (yearOffset, monthOffset, day) => {
      const d = new Date(now.getFullYear() + yearOffset, now.getMonth() + monthOffset, day);
      return d.toISOString().slice(0, 10);
    };

    // Seed realistic sample transactions
    const sampleTxs = [
      { type: 'income', amount: 5200, categoryId: 'salary', description: 'Tech Corp Monthly Direct Deposit', date: isoDate(0, 0, 1) },
      { type: 'income', amount: 850, categoryId: 'freelance', description: 'Design Sprint Client Invoice', date: isoDate(0, 0, 12) },
      { type: 'expense', amount: 1650, categoryId: 'housing', description: 'Metropolitan Apartment Rent', date: isoDate(0, 0, 2) },
      { type: 'expense', amount: 340, categoryId: 'groceries', description: 'Whole Foods Market Weekly Stock', date: isoDate(0, 0, 5) },
      { type: 'expense', amount: 95, categoryId: 'food', description: 'Dinner at Blue Oak Osteria', date: isoDate(0, 0, 8) },
      { type: 'expense', amount: 65, categoryId: 'transport', description: 'Metro Monthly Transit Pass', date: isoDate(0, 0, 3) },
      { type: 'expense', amount: 140, categoryId: 'utilities', description: 'City Power & High-Speed Fiber', date: isoDate(0, 0, 9) },
      { type: 'expense', amount: 28, categoryId: 'subscriptions', description: 'Spotify + GitHub Copilot', date: isoDate(0, 0, 14) },
      { type: 'expense', amount: 110, categoryId: 'health', description: 'Equinox Gym Membership', date: isoDate(0, 0, 6) },
      // Prior month transactions for trend metrics
      { type: 'income', amount: 5200, categoryId: 'salary', description: 'Tech Corp Direct Deposit', date: isoDate(0, -1, 1) },
      { type: 'expense', amount: 1650, categoryId: 'housing', description: 'Metropolitan Apartment Rent', date: isoDate(0, -1, 2) },
      { type: 'expense', amount: 310, categoryId: 'groceries', description: 'Whole Foods Market', date: isoDate(0, -1, 7) },
      { type: 'expense', amount: 75, categoryId: 'food', description: 'Sushi Dinner', date: isoDate(0, -1, 15) },
    ];

    for (const tx of sampleTxs) {
      await createTransaction(userId, tx);
    }

    // Seed sample budgets
    await saveBudget(userId, { categoryId: 'housing', limit: 1700 });
    await saveBudget(userId, { categoryId: 'groceries', limit: 500 });
    await saveBudget(userId, { categoryId: 'food', limit: 250 });
    await saveBudget(userId, { categoryId: 'transport', limit: 150 });
    await saveBudget(userId, { categoryId: 'subscriptions', limit: 50 });

    // Seed sample goals
    await createGoal(userId, {
      name: 'Emergency Buffer (6 Mo)',
      target: 15000,
      saved: 9200,
      deadline: isoDate(1, 0, 1),
      color: '#34d399',
    });
    await createGoal(userId, {
      name: 'Japan Autumn Expedition',
      target: 4500,
      saved: 2400,
      deadline: isoDate(0, 8, 15),
      color: '#22d3ee',
    });

    res.json({
      success: true,
      message: 'Realistic 6-month financial baseline loaded successfully.',
    });
  } catch (err) {
    next(err);
  }
};

