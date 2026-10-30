import type { Budget, FinanceData, Transaction } from '@/types/finance';
import { getCategory, type Category } from '@/data/categories';
import { getRecentMonths, monthKey, parseISODate } from '@/lib/dates';

export type BudgetState = 'safe' | 'warning' | 'over';

export interface MonthSummary {
  income: number;
  expenses: number;
  net: number;
  savingsRate: number;
}

export interface BudgetStatus {
  budget: Budget;
  category: Category;
  spent: number;
  remaining: number;
  ratio: number;
  state: BudgetState;
}

export interface CategoryShare {
  categoryId: string;
  label: string;
  color: string;
  value: number;
  share: number;
}

export interface CategoryComparison {
  categoryId: string;
  label: string;
  color: string;
  current: number;
  previous: number;
  change: number;
}

export const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

export function summarizeMonth(transactions: Transaction[], key: string): MonthSummary {
  let income = 0;
  let expenses = 0;
  for (const transaction of transactions) {
    if (monthKey(transaction.date) !== key) continue;
    if (transaction.type === 'income') income += transaction.amount;
    else expenses += transaction.amount;
  }
  const net = income - expenses;
  return { income, expenses, net, savingsRate: income > 0 ? (net / income) * 100 : 0 };
}

export function getCashFlow(transactions: Transaction[], count = 6) {
  return getRecentMonths(count).map((month) => ({
    key: month.key,
    label: month.label,
    ...summarizeMonth(transactions, month.key),
  }));
}

export function getPriorMonthsAverage(transactions: Transaction[], count = 3, reference = new Date()) {
  const months = getRecentMonths(count + 1, reference).slice(0, count);
  const totals = months.map((month) => summarizeMonth(transactions, month.key));
  const income = sum(totals.map((item) => item.income));
  const expenses = sum(totals.map((item) => item.expenses));
  const net = sum(totals.map((item) => item.net));
  return {
    income: income / count,
    expenses: expenses / count,
    net: net / count,
    savingsRate: income > 0 ? (net / income) * 100 : 0,
  };
}

export function getCategoryBreakdown(transactions: Transaction[], key: string): CategoryShare[] {
  const totals = new Map<string, number>();
  let total = 0;
  for (const transaction of transactions) {
    if (transaction.type !== 'expense' || monthKey(transaction.date) !== key) continue;
    totals.set(transaction.categoryId, (totals.get(transaction.categoryId) ?? 0) + transaction.amount);
    total += transaction.amount;
  }
  return [...totals.entries()]
    .map(([categoryId, value]) => {
      const category = getCategory(categoryId);
      return { categoryId, label: category.label, color: category.color, value, share: total > 0 ? value / total : 0 };
    })
    .sort((a, b) => b.value - a.value);
}

export function getCategoryComparison(transactions: Transaction[], currentKey: string, previousKey: string) {
  const rows = new Map<string, { current: number; previous: number }>();
  for (const transaction of transactions) {
    if (transaction.type !== 'expense') continue;
    const key = monthKey(transaction.date);
    if (key !== currentKey && key !== previousKey) continue;
    const row = rows.get(transaction.categoryId) ?? { current: 0, previous: 0 };
    if (key === currentKey) row.current += transaction.amount;
    else row.previous += transaction.amount;
    rows.set(transaction.categoryId, row);
  }
  const result: CategoryComparison[] = [...rows.entries()].map(([categoryId, row]) => {
    const category = getCategory(categoryId);
    const change = row.previous > 0 ? ((row.current - row.previous) / row.previous) * 100 : row.current > 0 ? 100 : 0;
    return { categoryId, label: category.label, color: category.color, current: row.current, previous: row.previous, change };
  });
  return result.sort((a, b) => b.current - a.current);
}

export function getCategoryTrend(transactions: Transaction[], count = 6, topN = 5) {
  const months = getRecentMonths(count);
  const totals = new Map<string, number>();
  for (const transaction of transactions) {
    if (transaction.type !== 'expense') continue;
    if (!months.some((month) => month.key === monthKey(transaction.date))) continue;
    totals.set(transaction.categoryId, (totals.get(transaction.categoryId) ?? 0) + transaction.amount);
  }
  const topIds = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, topN).map(([id]) => id);
  const series = topIds.map((id) => {
    const category = getCategory(id);
    return { id, label: category.label, color: category.color };
  });
  const rows = months.map((month) => {
    const row: Record<string, string | number> = { label: month.label };
    for (const id of topIds) row[id] = 0;
    for (const transaction of transactions) {
      if (transaction.type !== 'expense' || monthKey(transaction.date) !== month.key) continue;
      if (!topIds.includes(transaction.categoryId)) continue;
      row[transaction.categoryId] = Number(row[transaction.categoryId]) + transaction.amount;
    }
    return row;
  });
  return { rows, series };
}

export function getCategoryMonthlyAverage(transactions: Transaction[], categoryId: string, count = 3, reference = new Date()) {
  const keys = new Set(getRecentMonths(count + 1, reference).slice(0, count).map((month) => month.key));
  const total = sum(
    transactions
      .filter((t) => t.type === 'expense' && t.categoryId === categoryId && keys.has(monthKey(t.date)))
      .map((t) => t.amount),
  );
  return total / count;
}

export function getBudgetStatuses(budgets: Budget[], transactions: Transaction[], key: string): BudgetStatus[] {
  return budgets
    .map((budget) => {
      const spent = sum(
        transactions
          .filter((t) => t.type === 'expense' && t.categoryId === budget.categoryId && monthKey(t.date) === key)
          .map((t) => t.amount),
      );
      const ratio = budget.limit > 0 ? spent / budget.limit : 0;
      const state: BudgetState = ratio >= 1 ? 'over' : ratio >= 0.8 ? 'warning' : 'safe';
      return {
        budget,
        category: getCategory(budget.categoryId),
        spent,
        remaining: budget.limit - spent,
        ratio,
        state,
      };
    })
    .sort((a, b) => b.ratio - a.ratio);
}

export function getBalance(data: FinanceData) {
  const income = sum(data.transactions.filter((t) => t.type === 'income').map((t) => t.amount));
  const expenses = sum(data.transactions.filter((t) => t.type === 'expense').map((t) => t.amount));
  return data.openingBalance + income - expenses;
}

export function getBalanceTrend(data: FinanceData) {
  const netByMonth = new Map<string, number>();
  for (const transaction of data.transactions) {
    const key = monthKey(transaction.date);
    const signed = transaction.type === 'income' ? transaction.amount : -transaction.amount;
    netByMonth.set(key, (netByMonth.get(key) ?? 0) + signed);
  }
  let running = data.openingBalance;
  return [...netByMonth.keys()].sort().map((key) => {
    running += netByMonth.get(key) ?? 0;
    return { key, balance: running };
  });
}

export function getWeekdaySpending(transactions: Transaction[]) {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const totals = labels.map((label) => ({ label, value: 0 }));
  for (const transaction of transactions) {
    if (transaction.type !== 'expense') continue;
    const index = (parseISODate(transaction.date).getDay() + 6) % 7;
    totals[index].value += transaction.amount;
  }
  return totals;
}

export function getTopMerchants(transactions: Transaction[], limit = 5) {
  const merchants = new Map<string, { name: string; total: number; count: number; categoryId: string }>();
  for (const transaction of transactions) {
    if (transaction.type !== 'expense') continue;
    const entry = merchants.get(transaction.description) ?? {
      name: transaction.description,
      total: 0,
      count: 0,
      categoryId: transaction.categoryId,
    };
    entry.total += transaction.amount;
    entry.count += 1;
    merchants.set(transaction.description, entry);
  }
  return [...merchants.values()].sort((a, b) => b.total - a.total).slice(0, limit);
}
