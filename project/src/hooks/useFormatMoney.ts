import { useCallback } from 'react';
import { formatMoney } from '@/lib/format';
import type { CurrencyCode } from '@/types/finance';
import { useFinance } from '@/context/FinanceContext';

export function useFormatMoney() {
  const { data } = useFinance();
  const currency: CurrencyCode = data.settings.currency;
  return useCallback((amount: number, digits = 0) => formatMoney(amount, currency, digits), [currency]);
}
