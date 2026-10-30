import type { CurrencyCode } from '@/types/finance';
import { parseISODate, toISODate } from '@/lib/dates';

const LOCALES: Record<CurrencyCode, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  INR: 'en-IN',
};

export const CURRENCY_OPTIONS: { code: CurrencyCode; label: string }[] = [
  { code: 'USD', label: 'US Dollar ($)' },
  { code: 'EUR', label: 'Euro (€)' },
  { code: 'GBP', label: 'British Pound (£)' },
  { code: 'INR', label: 'Indian Rupee (₹)' },
];

export function formatMoney(amount: number, currency: CurrencyCode = 'USD', digits = 2) {
  return new Intl.NumberFormat(LOCALES[currency], {
    style: 'currency',
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount);
}

export function formatCompactMoney(amount: number, currency: CurrencyCode = 'USD') {
  return new Intl.NumberFormat(LOCALES[currency], {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

export function getCurrencySymbol(currency: CurrencyCode) {
  return (
    new Intl.NumberFormat(LOCALES[currency], { style: 'currency', currency })
      .formatToParts(0)
      .find((part) => part.type === 'currency')?.value ?? currency
  );
}

export function formatPercent(value: number, digits = 0) {
  return `${value.toFixed(digits)}%`;
}

export function formatSignedPercent(value: number) {
  return `${value > 0 ? '+' : ''}${Math.round(value)}%`;
}

export function formatShortDate(iso: string) {
  return parseISODate(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatLongDate(iso: string) {
  return parseISODate(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDayHeading(iso: string) {
  const today = new Date();
  if (iso === toISODate(today)) return 'Today';
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  if (iso === toISODate(yesterday)) return 'Yesterday';
  return parseISODate(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export function formatToday() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}
