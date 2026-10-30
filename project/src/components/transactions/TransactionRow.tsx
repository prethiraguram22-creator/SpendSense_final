import { ArrowDownLeft, ArrowUpRight, Pencil, Trash2 } from 'lucide-react';
import { getCategory } from '@/data/categories';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { useFinance } from '@/context/FinanceContext';
import { formatShortDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/types/finance';

interface TransactionRowProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
}

export function TransactionRow({ transaction, onEdit, onDelete }: TransactionRowProps) {
  const category = getCategory(transaction.categoryId);
  const Icon = category.icon;
  const money = useFormatMoney();
  const { data } = useFinance();
  const hideBalance = data.settings.hideBalance;
  const isIncome = transaction.type === 'income';
  const hasActions = Boolean(onEdit || onDelete);

  return (
    <li className="group relative flex items-center gap-3.5 rounded-2xl border border-transparent px-3.5 py-3 transition-all duration-200 hover:border-line/12 hover:bg-raised/60">
      <div className="relative shrink-0">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-2xl ring-1 ring-inset transition-transform duration-200 group-hover:scale-105"
          style={{
            backgroundColor: `${category.color}18`,
            color: category.color,
            boxShadow: `inset 0 0 0 1px ${category.color}35`,
          }}
        >
          <Icon className="h-5 w-5" />
        </span>
        <span
          className={cn(
            'absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full ring-2 ring-surface',
            isIncome ? 'bg-emerald-400 text-slate-950' : 'bg-raised text-muted',
          )}
        >
          {isIncome ? <ArrowDownLeft className="h-2.5 w-2.5 stroke-[2.5]" /> : <ArrowUpRight className="h-2.5 w-2.5 stroke-[2.5]" />}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-fg">{transaction.description}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium"
            style={{ backgroundColor: `${category.color}14`, color: category.color }}
          >
            {category.label}
          </span>
          <span>•</span>
          <span className="font-mono text-[11px]">{formatShortDate(transaction.date)}</span>
        </div>
      </div>

      <div className="text-right">
        <p
          className={cn(
            'shrink-0 font-mono text-sm font-semibold tabular-nums',
            isIncome
              ? 'rounded-lg bg-emerald-400/10 px-2.5 py-1 text-emerald-300 ring-1 ring-emerald-400/25'
              : 'text-fg',
          )}
        >
          {hideBalance ? '••••' : `${isIncome ? '+' : '-'}${money(transaction.amount, 2)}`}
        </p>
      </div>

      {hasActions && (
        <div className="flex shrink-0 gap-1 md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:group-focus-within:opacity-100">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(transaction)}
              aria-label={`Edit ${transaction.description}`}
              className="rounded-xl p-2 text-muted transition hover:bg-line/12 hover:text-lime-300"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(transaction)}
              aria-label={`Delete ${transaction.description}`}
              className="rounded-xl p-2 text-muted transition hover:bg-rose-500/15 hover:text-rose-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </li>
  );
}
