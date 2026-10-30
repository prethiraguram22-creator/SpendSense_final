import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { listTransactions } from './transaction.service.js';

const memoryBudgets = new Map();

function formatBudget(row) {
  return {
    id: row.id,
    categoryId: row.category_id,
    limit: Number(row.limit_amount),
    createdAt: row.created_at,
  };
}

export const listBudgets = async (userId, monthKey = null) => {
  // Current month key (YYYY-MM)
  const targetMonth = monthKey || new Date().toISOString().slice(0, 7);

  let rawBudgets = [];

  if (!isSupabaseConfigured() || userId.startsWith('00000000-')) {
    rawBudgets = memoryBudgets.get(userId) || [];
  } else {
    const { data, error } = await supabaseAdmin
      .from('budgets')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    rawBudgets = data.map(formatBudget);
  }

  // Get current month transactions to compute live spending & utilization
  const startDate = `${targetMonth}-01`;
  const [year, month] = targetMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const endDate = `${targetMonth}-${String(daysInMonth).padStart(2, '0')}`;

  const transactions = await listTransactions(userId, {
    startDate,
    endDate,
    type: 'expense',
  });

  const spendingByCategory = {};
  for (const t of transactions) {
    spendingByCategory[t.categoryId] = (spendingByCategory[t.categoryId] || 0) + t.amount;
  }

  return rawBudgets.map((b) => {
    const spent = Math.round((spendingByCategory[b.categoryId] || 0) * 100) / 100;
    const remaining = Math.round((b.limit - spent) * 100) / 100;
    const ratio = b.limit > 0 ? spent / b.limit : 0;
    const utilization = Math.round(ratio * 100);

    let state = 'safe';
    if (spent > b.limit) state = 'over';
    else if (ratio >= 0.8) state = 'warning';

    return {
      ...b,
      spent,
      remaining,
      utilization,
      ratio,
      state,
      month: targetMonth,
    };
  });
};

export const saveBudget = async (userId, input) => {
  const limitAmount = Number(input.limit);

  if (!isSupabaseConfigured() || userId.startsWith('00000000-')) {
    const list = memoryBudgets.get(userId) || [];
    const existingIndex = list.findIndex((b) => b.categoryId === input.categoryId);
    const budgetItem = {
      id: existingIndex >= 0 ? list[existingIndex].id : crypto.randomUUID(),
      categoryId: input.categoryId,
      limit: limitAmount,
      createdAt: new Date().toISOString(),
    };
    if (existingIndex >= 0) {
      list[existingIndex] = budgetItem;
    } else {
      list.push(budgetItem);
    }
    memoryBudgets.set(userId, list);
    return budgetItem;
  }

  const { data, error } = await supabaseAdmin
    .from('budgets')
    .upsert(
      {
        user_id: userId,
        category_id: input.categoryId,
        limit_amount: limitAmount,
      },
      { onConflict: 'user_id, category_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return formatBudget(data);
};

export const deleteBudget = async (userId, id) => {
  if (!isSupabaseConfigured() || userId.startsWith('00000000-')) {
    const list = memoryBudgets.get(userId) || [];
    memoryBudgets.set(userId, list.filter((b) => b.id !== id));
    return { success: true };
  }

  const { error } = await supabaseAdmin
    .from('budgets')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
  return { success: true };
};

export const seedMemoryBudgets = (userId, budgets) => {
  memoryBudgets.set(userId, budgets);
};

