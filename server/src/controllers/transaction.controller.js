import * as txService from '../services/transaction.service.js';

export const list = async (req, res, next) => {
  try {
    const transactions = await txService.listTransactions(req.user.id, req.query);
    res.json({ success: true, data: transactions });
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const transaction = await txService.createTransaction(req.user.id, req.body);
    res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req, res, next) => {
  try {
    const transaction = await txService.getTransactionById(req.user.id, req.params.id);
    res.json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const transaction = await txService.updateTransaction(req.user.id, req.params.id, req.body);
    res.json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await txService.deleteTransaction(req.user.id, req.params.id);
    res.json({ success: true, message: 'Transaction deleted' });
  } catch (err) {
    next(err);
  }
};

