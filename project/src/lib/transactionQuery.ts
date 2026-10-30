import { getCategory } from '@/data/categories';
import type { Transaction, TransactionType } from '@/types/finance';

export type TypeFilter = 'all' | TransactionType;
export type SortKey = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

export interface TransactionFilters {
  query: string;
  type: TypeFilter;
  categoryId: string;
  from: string;
  to: string;
  sort: SortKey;
}

export const DEFAULT_TRANSACTION_FILTERS: TransactionFilters = {
  query: '',
  type: 'all',
  categoryId: 'all',
  from: '',
  to: '',
  sort: 'date-desc',
};

export function countActiveFilters(filters: TransactionFilters) {
  return [
    filters.query.trim() !== '',
    filters.type !== 'all',
    filters.categoryId !== 'all',
    filters.from !== '' || filters.to !== '',
  ].filter(Boolean).length;
}

export function queryTransactions(transactions: Transaction[], filters: TransactionFilters): Transaction[] {
  const needle = filters.query.trim().toLowerCase();
  const matches = transactions.filter((transaction) => {
    if (filters.type !== 'all' && transaction.type !== filters.type) return false;
    if (filters.categoryId !== 'all' && transaction.categoryId !== filters.categoryId) return false;
    if (filters.from && transaction.date < filters.from) return false;
    if (filters.to && transaction.date > filters.to) return false;
    if (needle) {
      const haystack = `${transaction.description} ${getCategory(transaction.categoryId).label}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });

  return matches.sort((a, b) => {
    switch (filters.sort) {
      case 'date-asc':
        return a.date.localeCompare(b.date) || a.createdAt - b.createdAt;
      case 'amount-desc':
        return b.amount - a.amount;
      case 'amount-asc':
        return a.amount - b.amount;
      default:
        return b.date.localeCompare(a.date) || b.createdAt - a.createdAt;
    }
  });
}

export interface DayGroup {
  date: string;
  items: Transaction[];
  net: number;
}

export function groupByDay(transactions: Transaction[]): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const transaction of transactions) {
    const signed = transaction.type === 'income' ? transaction.amount : -transaction.amount;
    const last = groups[groups.length - 1];
    if (last && last.date === transaction.date) {
      last.items.push(transaction);
      last.net += signed;
    } else {
      groups.push({ date: transaction.date, items: [transaction], net: signed });
    }
  }
  return groups;
}
