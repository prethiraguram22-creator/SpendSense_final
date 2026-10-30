import { listTransactions } from './transaction.service.js';
import { listBudgets } from './budget.service.js';
import { listGoals } from './goal.service.js';
import { getUserProfile } from './user.service.js';

export const getInsights = async (userId, customDate = null) => {
  const now = customDate ? new Date(customDate) : new Date();
  const currentKey = now.toISOString().slice(0, 7);

  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevKey = prevDate.toISOString().slice(0, 7);

  const [profile, transactions, budgets, goals] = await Promise.all([
    getUserProfile(userId),
    listTransactions(userId, { limit: 1000 }),
    listBudgets(userId, currentKey),
    listGoals(userId),
  ]);

  const currency = profile.currency;
  const formatCur = (val) => `${currency} ${Math.round(val).toLocaleString()}`;

  const insights = [];

  // -------------------------------------------------------------
  // P0: Immediate Critical Warnings & Over-Budget Alerts
  // -------------------------------------------------------------
  for (const b of budgets) {
    if (b.state === 'over') {
      const overBy = Math.abs(b.remaining);
      insights.push({
        id: `p0-over-${b.categoryId}`,
        priority: 'P0',
        tone: 'warning',
        title: `${b.categoryId.toUpperCase()} is over budget`,
        body: `You have spent ${formatCur(b.spent)} against a ${formatCur(b.limit)} limit. Hold off on non-essential purchases in this category for the rest of the month.`,
        metric: `${formatCur(overBy)} over`,
        action: { label: 'Review spending', to: '/app/transactions' },
      });
    } else if (b.state === 'warning') {
      insights.push({
        id: `p0-near-${b.categoryId}`,
        priority: 'P0',
        tone: 'warning',
        title: `${b.categoryId.toUpperCase()} nearing limit (${b.utilization}%)`,
        body: `You have used ${b.utilization}% of your ${formatCur(b.limit)} budget with ${formatCur(b.remaining)} remaining.`,
        metric: `${b.utilization}% used`,
        action: { label: 'Review budget', to: '/app/budgets' },
      });
    }
  }

  // -------------------------------------------------------------
  // P1: Category Spikes & Savings Pacing
  // -------------------------------------------------------------
  const curCategoryExpenses = {};
  const prevCategoryExpenses = {};
  let curIncome = 0;
  let curExpense = 0;

  for (const t of transactions) {
    if (t.date.startsWith(currentKey)) {
      if (t.type === 'expense') {
        curExpense += t.amount;
        curCategoryExpenses[t.categoryId] = (curCategoryExpenses[t.categoryId] || 0) + t.amount;
      } else {
        curIncome += t.amount;
      }
    } else if (t.date.startsWith(prevKey) && t.type === 'expense') {
      prevCategoryExpenses[t.categoryId] = (prevCategoryExpenses[t.categoryId] || 0) + t.amount;
    }
  }

  // Find biggest category spending spike
  let biggestSpike = null;
  for (const [cat, curAmt] of Object.entries(curCategoryExpenses)) {
    const prevAmt = prevCategoryExpenses[cat] || 0;
    if (prevAmt > 0) {
      const diff = curAmt - prevAmt;
      const pct = (diff / prevAmt) * 100;
      if (pct >= 25 && diff >= 40) {
        if (!biggestSpike || diff > biggestSpike.diff) {
          biggestSpike = { category: cat, cur: curAmt, prev: prevAmt, pct: Math.round(pct), diff: Math.round(diff) };
        }
      }
    }
  }

  if (biggestSpike) {
    insights.push({
      id: `p1-spike-${biggestSpike.category}`,
      priority: 'P1',
      tone: 'opportunity',
      title: `${biggestSpike.category.toUpperCase()} spending jumped ${biggestSpike.pct}%`,
      body: `You spent ${formatCur(biggestSpike.cur)} this month compared with ${formatCur(biggestSpike.prev)} last month. Setting a budget guardrail prevents this from compounding.`,
      metric: `+${formatCur(biggestSpike.diff)}`,
      action: { label: 'Set category budget', to: '/app/budgets' },
    });
  }

  // Dynamic Savings Rate Benchmark (P1)
  const savingsRate = curIncome > 0 ? Math.max(0, Math.round(((curIncome - curExpense) / curIncome) * 100)) : 0;
  if (savingsRate >= 20) {
    insights.push({
      id: 'p1-savings-strong',
      priority: 'P1',
      tone: 'positive',
      title: 'Savings rate exceeds 20% benchmark',
      body: `You retained ${savingsRate}% of income this month. Allocating surplus liquidity directly to target reserves locks in your gains.`,
      metric: `${savingsRate}% saved`,
      action: { label: 'Fund goals', to: '/app/goals' },
    });
  } else if (curIncome > 0) {
    insights.push({
      id: 'p1-savings-low',
      priority: 'P1',
      tone: 'opportunity',
      title: 'Savings rate below 20% benchmark',
      body: `Current savings rate is ${savingsRate}%. Automating 10% transfers on income arrival builds financial freedom with zero friction.`,
      metric: `${savingsRate}% rate`,
      action: { label: 'Automate savings', to: '/app/goals' },
    });
  }

  // -------------------------------------------------------------
  // P2: Recurring Subscriptions & Buffer Optimization
  // -------------------------------------------------------------
  const subscriptionTxs = transactions.filter(
    (t) => t.type === 'expense' && t.categoryId === 'subscriptions' && t.date.startsWith(currentKey)
  );
  const subTotal = subscriptionTxs.reduce((sum, t) => sum + t.amount, 0);

  if (subscriptionTxs.length > 0 && subTotal >= 30) {
    insights.push({
      id: 'p2-subscriptions',
      priority: 'P2',
      tone: 'opportunity',
      title: `${subscriptionTxs.length} active recurring subscriptions`,
      body: `Recurring services total ${formatCur(subTotal)} this month (${formatCur(subTotal / subscriptionTxs.length)} average). Review unutilized memberships.`,
      metric: `${formatCur(subTotal)}/mo`,
      action: { label: 'Audit subscriptions', to: '/app/transactions' },
    });
  }

  // Emergency cushion check
  const emergencyGoal = goals.find((g) => /emergency/i.test(g.name));
  if (emergencyGoal && curExpense > 0) {
    const cushionMonths = emergencyGoal.saved / curExpense;
    if (cushionMonths < 3) {
      insights.push({
        id: 'p2-emergency-cushion',
        priority: 'P2',
        tone: 'opportunity',
        title: 'Emergency buffer below 3 months',
        body: `Emergency reserves cover ${cushionMonths.toFixed(1)} months of typical burn. A 3 to 6-month buffer protects against unexpected cash flow disruptions.`,
        metric: `${cushionMonths.toFixed(1)} mos`,
        action: { label: 'Top up emergency goal', to: '/app/goals' },
      });
    }
  }

  // Filter out any dismissed recommendations
  const dismissed = new Set(profile.dismissedRecommendations || []);
  return insights.filter((item) => !dismissed.has(item.id));
};

