import { Settings, Lightbulb, LayoutDashboard, ArrowLeftRight, Wallet, BarChart3, PiggyBank, type LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/app/dashboard', label: 'Dashboard', shortLabel: 'Home', icon: LayoutDashboard },
  { to: '/app/transactions', label: 'Transactions', shortLabel: 'Activity', icon: ArrowLeftRight },
  { to: '/app/budgets', label: 'Budgets', shortLabel: 'Budgets', icon: Wallet },
  { to: '/app/insights', label: 'Insights', shortLabel: 'Insights', icon: BarChart3 },
  { to: '/app/goals', label: 'Savings goals', shortLabel: 'Goals', icon: PiggyBank },
  { to: '/app/recommendations', label: 'Recommendations', shortLabel: 'Tips', icon: Lightbulb },
  { to: '/app/settings', label: 'Settings', shortLabel: 'Settings', icon: Settings },
];
