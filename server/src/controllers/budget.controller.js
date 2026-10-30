import * as budgetService from '../services/budget.service.js';

export const list = async (req, res, next) => {
  try {
    const month = req.query.month || null;
    const budgets = await budgetService.listBudgets(req.user.id, month);
    res.json({ success: true, data: budgets });
  } catch (err) {
    next(err);
  }
};

export const save = async (req, res, next) => {
  try {
    const budget = await budgetService.saveBudget(req.user.id, req.body);
    res.status(201).json({ success: true, data: budget });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await budgetService.deleteBudget(req.user.id, req.params.id);
    res.json({ success: true, message: 'Budget deleted' });
  } catch (err) {
    next(err);
  }
};

