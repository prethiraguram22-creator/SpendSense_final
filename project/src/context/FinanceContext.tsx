import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Budget, FinanceData, Goal, Settings, TransactionInput } from '@/types/finance';
import { createDemoData, createEmptyData } from '@/data/mockData';
import { getCategory } from '@/data/categories';
import { currentMonthKey } from '@/lib/dates';
import { formatMoney } from '@/lib/format';
import { getBudgetStatuses, type BudgetState } from '@/lib/finance';
import { STORAGE_KEYS, readStorage, writeStorage } from '@/lib/storage';
import { createId, roundCents } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import { api, getAuthToken } from '@/lib/api';

export type BudgetInput = Pick<Budget, 'categoryId' | 'limit'>;
export type GoalInput = Omit<Goal, 'id'>;

interface FinanceContextValue {
  data: FinanceData;
  isLoading: boolean;
  addTransaction: (input: TransactionInput) => Promise<void>;
  updateTransaction: (id: string, input: TransactionInput) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  saveBudget: (id: string | null, input: BudgetInput) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  saveGoal: (id: string | null, input: GoalInput) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  contributeToGoal: (id: string, amount: number) => Promise<void>;
  updateSettings: (patch: Partial<Settings> & { openingBalance?: number }) => Promise<void>;
  dismissRecommendation: (id: string) => void;
  restoreRecommendations: () => void;
  loadSampleData: () => Promise<void>;
  clearAllData: () => Promise<void>;
  replaceData: (next: FinanceData) => void;
  refreshFromBackend: () => Promise<void>;
}

const STATE_RANK: Record<BudgetState, number> = { safe: 0, warning: 1, over: 2 };

const FinanceContext = createContext<FinanceContextValue | null>(null);

function loadInitialData(): FinanceData {
  const stored = readStorage<FinanceData>(STORAGE_KEYS.data);
  if (stored && Array.isArray(stored.transactions) && Array.isArray(stored.budgets) && stored.settings) {
    return stored;
  }
  return createEmptyData('', '');
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { notify } = useToast();
  const [data, setData] = useState<FinanceData>(loadInitialData);
  const [isLoading, setIsLoading] = useState(false);

  // Sync to local storage for offline resilience
  useEffect(() => {
    writeStorage(STORAGE_KEYS.data, data);
  }, [data]);

  // Refresh live records from backend API when token is available
  const refreshFromBackend = useCallback(async () => {
    const token = getAuthToken();
    if (!token || token === 'demo-token') return;

    try {
      setIsLoading(true);
      const [txRes, bRes, gRes, pRes] = await Promise.all([
        api.transactions.list().catch(() => null),
        api.budgets.list().catch(() => null),
        api.goals.list().catch(() => null),
        api.user.getProfile().catch(() => null),
      ]);

      setData((prev) => {
        const next = { ...prev };
        if (txRes?.data) next.transactions = txRes.data;
        if (bRes?.data) next.budgets = bRes.data;
        if (gRes?.data) next.goals = gRes.data;
        if (pRes?.data) {
          next.openingBalance = pRes.data.openingBalance ?? prev.openingBalance;
          next.settings = {
            ...prev.settings,
            ...pRes.data,
          };
        }
        return next;
      });
    } catch {
      // Graceful fallback to local cache
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load from backend if user already logged in
  useEffect(() => {
    refreshFromBackend();
  }, [refreshFromBackend]);

  const announceBudgetChange = useCallback(
    (previous: FinanceData, next: FinanceData, categoryId: string) => {
      if (!next.settings.notifications.budgetAlerts) return;
      const key = currentMonthKey();
      const before = getBudgetStatuses(previous.budgets, previous.transactions, key).find(
        (status) => status.budget.categoryId === categoryId,
      );
      const after = getBudgetStatuses(next.budgets, next.transactions, key).find(
        (status) => status.budget.categoryId === categoryId,
      );
      if (!after || after.state === 'safe' || before?.state === after.state) return;
      if (before && STATE_RANK[after.state] <= STATE_RANK[before.state]) return;

      const label = getCategory(categoryId).label;
      if (after.state === 'over') {
        const overBy = formatMoney(Math.abs(after.remaining), next.settings.currency, 0);
        notify({ tone: 'error', title: `${label} budget exceeded`, message: `You are ${overBy} over this month's limit.` });
      } else {
        notify({
          tone: 'warning',
          title: `${label} is nearing its limit`,
          message: `${Math.round(after.ratio * 100)}% of this month's budget is already used.`,
        });
      }
    },
    [notify],
  );

  const addTransaction = useCallback(
    async (input: TransactionInput) => {
      const localId = createId();
      const transaction = {
        ...input,
        id: localId,
        amount: roundCents(input.amount),
        createdAt: Date.now(),
      };
      const next = { ...data, transactions: [transaction, ...data.transactions] };
      setData(next);
      notify({ tone: 'success', title: 'Transaction added', message: input.description });
      if (input.type === 'expense') announceBudgetChange(data, next, input.categoryId);

      // Async backend sync
      const token = getAuthToken();
      if (token && token !== 'demo-token') {
        try {
          const res = await api.transactions.create(input);
          if (res.data?.id) {
            setData((current) => ({
              ...current,
              transactions: current.transactions.map((t) => (t.id === localId ? res.data : t)),
            }));
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Sync failed';
          console.warn('Backend sync failed, stored locally:', msg);
        }
      }
    },
    [data, notify, announceBudgetChange],
  );

  const updateTransaction = useCallback(
    async (id: string, input: TransactionInput) => {
      const next = {
        ...data,
        transactions: data.transactions.map((t) =>
          t.id === id ? { ...t, ...input, amount: roundCents(input.amount) } : t,
        ),
      };
      setData(next);
      notify({ tone: 'success', title: 'Transaction updated', message: input.description });
      if (input.type === 'expense') announceBudgetChange(data, next, input.categoryId);

      const token = getAuthToken();
      if (token && token !== 'demo-token') {
        try {
          await api.transactions.update(id, input);
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Sync failed';
          console.warn('Backend sync update failed:', msg);
        }
      }
    },
    [data, notify, announceBudgetChange],
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      setData({ ...data, transactions: data.transactions.filter((t) => t.id !== id) });
      notify({ tone: 'info', title: 'Transaction deleted' });

      const token = getAuthToken();
      if (token && token !== 'demo-token') {
        try {
          await api.transactions.delete(id);
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Sync failed';
          console.warn('Backend sync delete failed:', msg);
        }
      }
    },
    [data, notify],
  );

  const saveBudget = useCallback(
    async (id: string | null, input: BudgetInput) => {
      const localId = id || createId();
      const budgets = id
        ? data.budgets.map((b) => (b.id === id ? { ...b, ...input } : b))
        : [...data.budgets.filter((b) => b.categoryId !== input.categoryId), { id: localId, ...input }];
      setData({ ...data, budgets });
      notify({
        tone: 'success',
        title: 'Budget saved',
        message: `${getCategory(input.categoryId).label} limit set to ${formatMoney(input.limit, data.settings.currency, 0)} a month.`,
      });

      const token = getAuthToken();
      if (token && token !== 'demo-token') {
        try {
          const res = await api.budgets.save(input);
          if (res.data?.id && !id) {
            setData((cur) => ({
              ...cur,
              budgets: cur.budgets.map((b) => (b.id === localId ? res.data : b)),
            }));
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Sync failed';
          console.warn('Backend budget sync failed:', msg);
        }
      }
    },
    [data, notify],
  );

  const deleteBudget = useCallback(
    async (id: string) => {
      setData({ ...data, budgets: data.budgets.filter((b) => b.id !== id) });
      notify({ tone: 'info', title: 'Budget removed' });

      const token = getAuthToken();
      if (token && token !== 'demo-token') {
        try {
          await api.budgets.delete(id);
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Sync failed';
          console.warn('Backend budget delete failed:', msg);
        }
      }
    },
    [data, notify],
  );

  const saveGoal = useCallback(
    async (id: string | null, input: GoalInput) => {
      const localId = id || createId();
      const goals = id
        ? data.goals.map((g) => (g.id === id ? { ...g, ...input } : g))
        : [...data.goals, { id: localId, ...input }];
      setData({ ...data, goals });
      notify({ tone: 'success', title: id ? 'Goal updated' : 'Goal created', message: input.name });

      const token = getAuthToken();
      if (token && token !== 'demo-token') {
        try {
          if (id) {
            await api.goals.update(id, input);
          } else {
            const res = await api.goals.create(input);
            if (res.data?.id) {
              setData((cur) => ({
                ...cur,
                goals: cur.goals.map((g) => (g.id === localId ? res.data : g)),
              }));
            }
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Sync failed';
          console.warn('Backend goal sync failed:', msg);
        }
      }
    },
    [data, notify],
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      setData({ ...data, goals: data.goals.filter((g) => g.id !== id) });
      notify({ tone: 'info', title: 'Goal removed' });

      const token = getAuthToken();
      if (token && token !== 'demo-token') {
        try {
          await api.goals.delete(id);
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Sync failed';
          console.warn('Backend goal delete failed:', msg);
        }
      }
    },
    [data, notify],
  );

  const contributeToGoal = useCallback(
    async (id: string, amount: number) => {
      const goal = data.goals.find((g) => g.id === id);
      if (!goal) return;
      const saved = Math.min(goal.target, roundCents(goal.saved + amount));
      setData({ ...data, goals: data.goals.map((g) => (g.id === id ? { ...g, saved } : g)) });
      const reached = saved >= goal.target && goal.saved < goal.target;
      if (reached && data.settings.notifications.goalMilestones) {
        notify({ tone: 'success', title: 'Goal reached', message: `${goal.name} is fully funded. Well done.` });
      } else {
        notify({
          tone: 'success',
          title: 'Contribution added',
          message: `${formatMoney(amount, data.settings.currency, 0)} moved toward ${goal.name}.`,
        });
      }

      const token = getAuthToken();
      if (token && token !== 'demo-token') {
        try {
          await api.goals.contribute(id, amount);
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Sync failed';
          console.warn('Backend goal contribute sync failed:', msg);
        }
      }
    },
    [data, notify],
  );

  const updateSettings = useCallback(
    async (patch: Partial<Settings> & { openingBalance?: number }) => {
      setData((prev) => ({
        ...prev,
        openingBalance: patch.openingBalance !== undefined ? patch.openingBalance : prev.openingBalance,
        settings: { ...prev.settings, ...patch },
      }));

      const token = getAuthToken();
      if (token && token !== 'demo-token') {
        try {
          await api.user.updateProfile(patch);
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Sync failed';
          console.warn('Backend settings sync failed:', msg);
        }
      }
    },
    [],
  );

  const dismissRecommendation = useCallback(
    (id: string) => {
      setData((prev) => ({ ...prev, dismissedRecommendations: [...prev.dismissedRecommendations, id] }));
      const token = getAuthToken();
      if (token && token !== 'demo-token') {
        api.insights.dismiss(id).catch(() => null);
      }
    },
    [],
  );

  const restoreRecommendations = useCallback(() => {
    setData((prev) => ({ ...prev, dismissedRecommendations: [] }));
    const token = getAuthToken();
    if (token && token !== 'demo-token') {
      api.insights.restore().catch(() => null);
    }
  }, []);

  const loadSampleData = useCallback(async () => {
    const demo = createDemoData();
    setData({
      ...data,
      openingBalance: demo.openingBalance,
      transactions: demo.transactions,
      budgets: demo.budgets,
      goals: demo.goals,
      dismissedRecommendations: [],
    });
    notify({ tone: 'success', title: 'Sample data loaded', message: 'Six months of activity is ready to explore.' });

    const token = getAuthToken();
    if (token && token !== 'demo-token') {
      try {
        await api.user.loadDemoData();
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Sync failed';
        console.warn('Backend load demo data sync failed:', msg);
      }
    }
  }, [data, notify]);

  const clearAllData = useCallback(async () => {
    setData(createEmptyData(data.settings.name, data.settings.email));
    notify({ tone: 'info', title: 'All data cleared' });

    const token = getAuthToken();
    if (token && token !== 'demo-token') {
      try {
        await api.user.clearData();
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Sync failed';
        console.warn('Backend clear data sync failed:', msg);
      }
    }
  }, [data.settings.name, data.settings.email, notify]);

  const replaceData = useCallback((next: FinanceData) => {
    setData(next);
  }, []);

  const value = useMemo<FinanceContextValue>(
    () => ({
      data,
      isLoading,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      saveBudget,
      deleteBudget,
      saveGoal,
      deleteGoal,
      contributeToGoal,
      updateSettings,
      dismissRecommendation,
      restoreRecommendations,
      loadSampleData,
      clearAllData,
      replaceData,
      refreshFromBackend,
    }),
    [
      data,
      isLoading,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      saveBudget,
      deleteBudget,
      saveGoal,
      deleteGoal,
      contributeToGoal,
      updateSettings,
      dismissRecommendation,
      restoreRecommendations,
      loadSampleData,
      clearAllData,
      replaceData,
      refreshFromBackend,
    ],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within FinanceProvider');
  return context;
}
