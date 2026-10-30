import type { Budget, FinanceData, Goal, Settings, Transaction } from '@/types/finance';
import { addMonths, toISODate } from '@/lib/dates';
import { createId, roundCents } from '@/lib/utils';

export const DEFAULT_SETTINGS: Omit<Settings, 'name' | 'email'> = {
  currency: 'USD',
  notifications: { budgetAlerts: true, weeklyDigest: true, goalMilestones: true },
  hideBalance: false,
};

export function createEmptyData(name: string, email: string): FinanceData {
  return {
    openingBalance: 0,
    transactions: [],
    budgets: [],
    goals: [],
    dismissedRecommendations: [],
    settings: { ...DEFAULT_SETTINGS, name, email },
  };
}

function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createDemoData(
  now: Date = new Date(),
  name = 'Alex Morgan',
  email = 'alex@spendsense.app',
): FinanceData {
  const random = createRandom(2026);
  const between = (min: number, max: number) => min + random() * (max - min);
  const count = (min: number, max: number) => Math.round(between(min, max));
  const pick = <T,>(items: T[]) => items[Math.floor(random() * items.length)];
  const transactions: Transaction[] = [];

  for (let back = 5; back >= 0; back--) {
    const first = new Date(now.getFullYear(), now.getMonth() - back, 1);
    const year = first.getFullYear();
    const month = first.getMonth();
    const lastDay = back === 0 ? now.getDate() : new Date(year, month + 1, 0).getDate();

    const push = (
      day: number,
      type: Transaction['type'],
      categoryId: string,
      description: string,
      amount: number,
    ) => {
      if (day > lastDay) return;
      const date = new Date(year, month, day);
      transactions.push({
        id: createId(),
        type,
        categoryId,
        description,
        amount: roundCents(amount),
        date: toISODate(date),
        createdAt: date.getTime(),
      });
    };
    const randomDay = () => count(1, 28);

    push(1, 'income', 'salary', 'Northwind Labs - Salary', 4850);
    push(1, 'expense', 'housing', 'Maple Court Apartments - Rent', 1650);
    push(4, 'expense', 'utilities', 'Fiberline Internet', 62);
    push(6, 'expense', 'utilities', pick(['City Electric Co.', 'Metro Water & Sewer']), between(58, 96));
    push(5, 'expense', 'subscriptions', 'Netflix', 15.49);
    push(8, 'expense', 'subscriptions', 'Spotify Premium', 10.99);
    push(11, 'expense', 'subscriptions', 'iCloud+ 200GB', 2.99);
    push(9, 'expense', 'health', 'FitHub Gym', 39);
    if (month % 2 === 0) push(2, 'expense', 'education', 'Coursera Plus', 49.99);
    if (random() > 0.3) {
      push(
        count(10, 22),
        'income',
        'freelance',
        pick(['Brand identity sprint', 'Landing page build', 'UX audit retainer']),
        between(350, 900),
      );
    }
    if (back === 2) push(14, 'income', 'investments', 'Index fund dividend', 128.4);
    if (back === 3) {
      push(18, 'expense', 'travel', 'Lisbon return flights', 286);
      push(19, 'expense', 'travel', 'Airbnb - Alfama', 412);
    }
    if (back === 1) push(21, 'expense', 'travel', 'Train tickets - Porto weekend', 74);

    for (let i = 0; i < count(4, 5); i++) {
      push(randomDay(), 'expense', 'groceries', pick(['Whole Foods Market', "Trader Joe's", 'Local Greens Co-op', 'Costco Wholesale']), between(38, 128));
    }
    for (let i = 0; i < count(7, 10); i++) {
      push(randomDay(), 'expense', 'food', pick(['Sushi Bar Nori', 'Blue Bottle Coffee', 'Chipotle', 'Pho Saigon', 'Sunday Brunch Club', 'Thai Garden']), between(9, 64));
    }
    for (let i = 0; i < count(6, 9); i++) {
      push(randomDay(), 'expense', 'transport', pick(['Uber', 'Metro Transit Pass', 'Shell Fuel', 'Lyft']), between(3, 42));
    }
    for (let i = 0; i < count(2, 3); i++) {
      push(randomDay(), 'expense', 'entertainment', pick(['Cinema City', 'Live Music Hall', 'Bowling Lane', 'Steam Games']), between(12, 58));
    }
    for (let i = 0; i < count(2, 3); i++) {
      push(randomDay(), 'expense', 'shopping', pick(['Amazon', 'Uniqlo', 'IKEA', 'Apple Store']), between(35, 180));
    }
  }

  const budgets: Budget[] = [
    { id: createId(), categoryId: 'housing', limit: 1700 },
    { id: createId(), categoryId: 'groceries', limit: 420 },
    { id: createId(), categoryId: 'food', limit: 320 },
    { id: createId(), categoryId: 'transport', limit: 160 },
    { id: createId(), categoryId: 'utilities', limit: 220 },
    { id: createId(), categoryId: 'entertainment', limit: 150 },
    { id: createId(), categoryId: 'shopping', limit: 200 },
  ];

  const goals: Goal[] = [
    { id: createId(), name: 'Emergency fund', target: 9000, saved: 5400, deadline: toISODate(addMonths(now, 12)), color: '#2dd4bf' },
    { id: createId(), name: 'Japan trip', target: 3200, saved: 1450, deadline: toISODate(addMonths(now, 7)), color: '#fbbf24' },
    { id: createId(), name: 'New laptop', target: 2100, saved: 1900, deadline: toISODate(addMonths(now, 3)), color: '#38bdf8' },
    { id: createId(), name: 'Apartment down payment', target: 40000, saved: 6200, deadline: toISODate(addMonths(now, 30)), color: '#34d399' },
  ];

  return {
    openingBalance: 3800,
    transactions,
    budgets,
    goals,
    dismissedRecommendations: [],
    settings: { ...DEFAULT_SETTINGS, name, email },
  };
}
