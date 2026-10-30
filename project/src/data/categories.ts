import {
  Armchair,
  Briefcase,
  Car,
  Clapperboard,
  GraduationCap,
  HeartPulse,
  Home,
  Laptop,
  MoreHorizontal,
  Plane,
  Repeat,
  ShoppingBag,
  ShoppingBasket,
  Sparkles,
  TrendingUp,
  Utensils,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { TransactionType } from '@/types/finance';

export interface Category {
  id: string;
  label: string;
  type: TransactionType;
  color: string;
  icon: LucideIcon;
}

export const CATEGORIES: Category[] = [
  { id: 'salary', label: 'Salary', type: 'income', color: '#34d399', icon: Briefcase },
  { id: 'freelance', label: 'Freelance', type: 'income', color: '#67e8f9', icon: Laptop },
  { id: 'investments', label: 'Investments', type: 'income', color: '#fde047', icon: TrendingUp },
  { id: 'other-income', label: 'Other income', type: 'income', color: '#a3e635', icon: Sparkles },
  { id: 'housing', label: 'Housing', type: 'expense', color: '#2dd4bf', icon: Home },
  { id: 'groceries', label: 'Groceries', type: 'expense', color: '#4ade80', icon: ShoppingBasket },
  { id: 'food', label: 'Dining out', type: 'expense', color: '#fb923c', icon: Utensils },
  { id: 'transport', label: 'Transport', type: 'expense', color: '#38bdf8', icon: Car },
  { id: 'utilities', label: 'Utilities', type: 'expense', color: '#facc15', icon: Zap },
  { id: 'entertainment', label: 'Entertainment', type: 'expense', color: '#f472b6', icon: Clapperboard },
  { id: 'shopping', label: 'Shopping', type: 'expense', color: '#fb7185', icon: ShoppingBag },
  { id: 'health', label: 'Health & fitness', type: 'expense', color: '#f87171', icon: HeartPulse },
  { id: 'education', label: 'Education', type: 'expense', color: '#60a5fa', icon: GraduationCap },
  { id: 'subscriptions', label: 'Subscriptions', type: 'expense', color: '#e2e8f0', icon: Repeat },
  { id: 'travel', label: 'Travel', type: 'expense', color: '#22d3ee', icon: Plane },
  { id: 'home-goods', label: 'Home & decor', type: 'expense', color: '#fcd34d', icon: Armchair },
  { id: 'other', label: 'Other', type: 'expense', color: '#94a3b8', icon: MoreHorizontal },
];

export const INCOME_CATEGORIES = CATEGORIES.filter((category) => category.type === 'income');
export const EXPENSE_CATEGORIES = CATEGORIES.filter((category) => category.type === 'expense');

const CATEGORY_MAP = new Map(CATEGORIES.map((category) => [category.id, category]));

export function getCategory(id: string): Category {
  return CATEGORY_MAP.get(id) ?? CATEGORIES[CATEGORIES.length - 1];
}

export const GOAL_COLORS = ['#2dd4bf', '#fbbf24', '#38bdf8', '#34d399', '#fb7185', '#e2e8f0'];
