import type { FinanceData } from '@/types/finance';
import { formatMoney } from '@/lib/format';
import { getRecentMonths, monthKey, monthsBetween, parseISODate } from '@/lib/dates';
import {
  getBudgetStatuses,
  getCategoryBreakdown,
  getCategoryComparison,
  getPriorMonthsAverage,
  sum,
} from '@/lib/finance';

export type RecommendationTone = 'warning' | 'opportunity' | 'positive';

export interface Recommendation {
  id: string;
  tone: RecommendationTone;
  title: string;
  body: string;
  metric: string;
  action: { label: string; to: string };
}

export function buildRecommendations(data: FinanceData, now: Date = new Date()): Recommendation[] {
  const key = monthKey(now);
  const [previous] = getRecentMonths(2, now);
  const money = (value: number) => formatMoney(value, data.settings.currency, 0);
  const items: Recommendation[] = [];
  const statuses = getBudgetStatuses(data.budgets, data.transactions, key);

  for (const status of statuses.filter((s) => s.state === 'over')) {
    items.push({
      id: `over-${status.budget.categoryId}`,
      tone: 'warning',
      title: `${status.category.label} is over budget`,
      body: `You have spent ${money(status.spent)} against a ${money(status.budget.limit)} limit. Hold off on non-essential purchases in this category for the rest of the month.`,
      metric: `${money(status.spent - status.budget.limit)} over`,
      action: { label: 'Review spending', to: '/app/transactions' },
    });
  }

  const spike = getCategoryComparison(data.transactions, key, previous.key)
    .filter((row) => row.previous > 0 && row.change >= 25 && row.current - row.previous >= 40)
    .sort((a, b) => b.current - b.previous - (a.current - a.previous))[0];
  if (spike) {
    items.push({
      id: `spike-${spike.categoryId}`,
      tone: 'opportunity',
      title: `${spike.label} spending jumped ${Math.round(spike.change)}%`,
      body: `You have spent ${money(spike.current)} this month compared with ${money(spike.previous)} last month. A budget here keeps the increase from becoming a habit.`,
      metric: `+${money(spike.current - spike.previous)}`,
      action: { label: 'Set a budget', to: '/app/budgets' },
    });
  }

  const average = getPriorMonthsAverage(data.transactions, 3, now);
  if (average.savingsRate >= 20) {
    items.push({
      id: 'savings-strong',
      tone: 'positive',
      title: 'Your savings rate is strong',
      body: `You kept ${Math.round(average.savingsRate)}% of your income over the last three months, comfortably above the 20% benchmark.`,
      metric: `${Math.round(average.savingsRate)}% saved`,
      action: { label: 'Grow your goals', to: '/app/goals' },
    });
  } else {
    items.push({
      id: 'savings-low',
      tone: 'opportunity',
      title: 'Automate your savings',
      body: `You have saved about ${Math.max(0, Math.round(average.savingsRate))}% of income recently. Moving 10% of each paycheck into a goal on payday builds the habit without relying on willpower.`,
      metric: 'Target 20%',
      action: { label: 'Open savings goals', to: '/app/goals' },
    });
  }

  const subscriptions = data.transactions.filter(
    (t) => t.type === 'expense' && t.categoryId === 'subscriptions' && monthKey(t.date) === key,
  );
  const subscriptionTotal = sum(subscriptions.map((t) => t.amount));
  if (subscriptions.length > 0 && subscriptionTotal >= 40) {
    items.push({
      id: 'subscriptions',
      tone: 'opportunity',
      title: `${subscriptions.length} subscriptions this month`,
      body: `Recurring services cost ${money(subscriptionTotal)} this month. Cancel the ones you rarely open; each one averages ${money(subscriptionTotal / subscriptions.length)}.`,
      metric: `${money(subscriptionTotal)}/mo`,
      action: { label: 'Review transactions', to: '/app/transactions' },
    });
  }

  const emergency = data.goals.find((goal) => /emergency/i.test(goal.name));
  if (emergency && average.expenses > 0) {
    const months = emergency.saved / average.expenses;
    if (months < 3) {
      items.push({
        id: 'emergency-fund',
        tone: 'opportunity',
        title: 'Build your emergency cushion',
        body: `Your emergency fund covers about ${months.toFixed(1)} months of typical spending. Three to six months is the usual target for a stable buffer.`,
        metric: `${months.toFixed(1)} months`,
        action: { label: 'Add to fund', to: '/app/goals' },
      });
    }
  }

  for (const goal of data.goals) {
    if (goal.saved >= goal.target) continue;
    const monthsLeft = Math.max(1, monthsBetween(now, parseISODate(goal.deadline)));
    const needed = (goal.target - goal.saved) / monthsLeft;
    if (needed > average.net) {
      items.push({
        id: `goal-risk-${goal.id}`,
        tone: 'warning',
        title: `${goal.name} may miss its deadline`,
        body: `You need to save ${money(needed)} a month to finish on time, but your recent average is ${money(Math.max(0, average.net))}. Consider a smaller target or a later date.`,
        metric: `${money(needed)}/mo needed`,
        action: { label: 'View goal', to: '/app/goals' },
      });
    }
  }

  const [topCategory] = getCategoryBreakdown(data.transactions, key);
  if (topCategory && !data.budgets.some((b) => b.categoryId === topCategory.categoryId)) {
    items.push({
      id: `unbudgeted-${topCategory.categoryId}`,
      tone: 'opportunity',
      title: `Set a budget for ${topCategory.label}`,
      body: `${topCategory.label} is your largest expense this month at ${money(topCategory.value)}, yet it has no monthly limit. A budget gives you an early warning before it grows.`,
      metric: `${money(topCategory.value)} spent`,
      action: { label: 'Create budget', to: '/app/budgets' },
    });
  }

  if (statuses.length > 0 && statuses.every((s) => s.state === 'safe')) {
    items.push({
      id: 'budgets-on-track',
      tone: 'positive',
      title: 'Every budget is on track',
      body: 'Spending is comfortably within all of your monthly limits so far this month. Keep the momentum going.',
      metric: `${statuses.length} budgets`,
      action: { label: 'View budgets', to: '/app/budgets' },
    });
  }

  return items;
}
