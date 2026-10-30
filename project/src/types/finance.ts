export type TransactionType = 'income' | 'expense';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  description: string;
  date: string;
  createdAt: number;
}

export type TransactionInput = Omit<Transaction, 'id' | 'createdAt'>;

export interface Budget {
  id: string;
  categoryId: string;
  limit: number;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
  deadline: string;
  color: string;
}

export interface NotificationPrefs {
  budgetAlerts: boolean;
  weeklyDigest: boolean;
  goalMilestones: boolean;
}

export interface Settings {
  name: string;
  email: string;
  currency: CurrencyCode;
  notifications: NotificationPrefs;
  hideBalance: boolean;
}

export interface FinanceData {
  openingBalance: number;
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  dismissedRecommendations: string[];
  settings: Settings;
}
