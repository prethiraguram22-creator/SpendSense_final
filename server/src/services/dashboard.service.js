import { getUserProfile } from './user.service.js';
import { listTransactions } from './transaction.service.js';
import { listBudgets } from './budget.service.js';
import { listGoals } from './goal.service.js';

export const getDashboardSummary = async (userId, customDate = null) => {
  const now = customDate ? new Date(customDate) : new Date();
  const currentKey = now.toISOString().slice(0, 7);

  // Calculate prior month
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevKey = prevDate.toISOString().slice(0, 7);

  // Fetch all user records
  const [profile, allTransactions, budgets, goals] = await Promise.all([
    getUserProfile(userId),
    listTransactions(userId, { limit: 1000 }),
    listBudgets(userId, currentKey),
    listGoals(userId),
  ]);

  // 1. Total Balance Calculation
  let totalIncome = 0;
  let totalExpenses = 0;
  for (const t of allTransactions) {
    if (t.type === 'income') totalIncome += t.amount;
    else totalExpenses += t.amount;
  }
  const netBalance = Math.round((profile.openingBalance + totalIncome - totalExpenses) * 100) / 100;

  // 2. Current Month & Prior Month Aggregations
  let curIncome = 0;
  let curExpenses = 0;
  let prevIncome = 0;
  let prevExpenses = 0;

  const currentCategoryExpenses = {};

  for (const t of allTransactions) {
    const month = t.date.slice(0, 7);
    if (month === currentKey) {
      if (t.type === 'income') curIncome += t.amount;
      else {
        curExpenses += t.amount;
        currentCategoryExpenses[t.categoryId] = (currentCategoryExpenses[t.categoryId] || 0) + t.amount;
      }
    } else if (month === prevKey) {
      if (t.type === 'income') prevIncome += t.amount;
      else prevExpenses += t.amount;
    }
  }

  curIncome = Math.round(curIncome * 100) / 100;
  curExpenses = Math.round(curExpenses * 100) / 100;
  prevIncome = Math.round(prevIncome * 100) / 100;
  prevExpenses = Math.round(prevExpenses * 100) / 100;

  const curNet = Math.round((curIncome - curExpenses) * 100) / 100;
  const prevNet = Math.round((prevIncome - prevExpenses) * 100) / 100;
  const curSavingsRate = curIncome > 0 ? Math.max(0, Math.round((curNet / curIncome) * 100)) : 0;
  const prevSavingsRate = prevIncome > 0 ? Math.max(0, Math.round((prevNet / prevIncome) * 100)) : 0;

  // 3. Trends (% change)
  const calcTrend = (cur, prev) => {
    if (prev === 0) return cur > 0 ? 100 : 0;
    return Math.round(((cur - prev) / prev) * 100);
  };

  const incomeTrend = calcTrend(curIncome, prevIncome);
  const expenseTrend = calcTrend(curExpenses, prevExpenses);
  const savingsTrend = curSavingsRate - prevSavingsRate;

  // 4. Category Breakdown
  const categoryBreakdown = Object.entries(currentCategoryExpenses).map(([categoryId, amount]) => ({
    categoryId,
    amount: Math.round(amount * 100) / 100,
    percentage: curExpenses > 0 ? Math.round((amount / curExpenses) * 100) : 0,
  })).sort((a, b) => b.amount - a.amount);

  // 5. 6-Month Cash-Flow History
  const cashFlowHistory = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const k = d.toISOString().slice(0, 7);
    const monthLabel = d.toLocaleString('en-US', { month: 'short' });

    let inc = 0;
    let exp = 0;
    for (const t of allTransactions) {
      if (t.date.startsWith(k)) {
        if (t.type === 'income') inc += t.amount;
        else exp += t.amount;
      }
    }
    cashFlowHistory.push({
      key: k,
      month: monthLabel,
      income: Math.round(inc),
      expenses: Math.round(exp),
      net: Math.round(inc - exp),
    });
  }

  // 6. Recent Transactions (last 6)
  const recentTransactions = allTransactions.slice(0, 6);

  // 7. Goals Overview
  let totalGoalTarget = 0;
  let totalGoalSaved = 0;
  for (const g of goals) {
    totalGoalTarget += g.target;
    totalGoalSaved += g.saved;
  }
  const overallGoalProgress = totalGoalTarget > 0 ? Math.round((totalGoalSaved / totalGoalTarget) * 100) : 0;

  return {
    balance: netBalance,
    currency: profile.currency,
    hideBalance: profile.hideBalance,
    currentMonth: {
      key: currentKey,
      income: curIncome,
      expenses: curExpenses,
      net: curNet,
      savingsRate: curSavingsRate,
    },
    priorMonth: {
      key: prevKey,
      income: prevIncome,
      expenses: prevExpenses,
      net: prevNet,
      savingsRate: prevSavingsRate,
    },
    trends: {
      income: incomeTrend,
      expenses: expenseTrend,
      savingsRate: savingsTrend,
    },
    budgets,
    categoryBreakdown,
    cashFlowHistory,
    recentTransactions,
    goalsSummary: {
      count: goals.length,
      totalTarget: totalGoalTarget,
      totalSaved: totalGoalSaved,
      progress: overallGoalProgress,
    },
  };
};

