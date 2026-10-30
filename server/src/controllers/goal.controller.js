import * as goalService from '../services/goal.service.js';

export const list = async (req, res, next) => {
  try {
    const goals = await goalService.listGoals(req.user.id);
    res.json({ success: true, data: goals });
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const goal = await goalService.createGoal(req.user.id, req.body);
    res.status(201).json({ success: true, data: goal });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const goal = await goalService.updateGoal(req.user.id, req.params.id, req.body);
    res.json({ success: true, data: goal });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await goalService.deleteGoal(req.user.id, req.params.id);
    res.json({ success: true, message: 'Goal deleted' });
  } catch (err) {
    next(err);
  }
};

export const contribute = async (req, res, next) => {
  try {
    const goal = await goalService.contributeToGoal(req.user.id, req.params.id, req.body.amount);
    res.json({ success: true, data: goal });
  } catch (err) {
    next(err);
  }
};

