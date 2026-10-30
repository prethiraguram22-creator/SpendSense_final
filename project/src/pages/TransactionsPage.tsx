import { useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Download, Layers, Plus, Receipt, SearchX } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { useToast } from '@/context/ToastContext';
import { usePageLoading } from '@/hooks/usePageLoading';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TransactionRow } from '@/components/transactions/TransactionRow';
import { TransactionModal } from '@/components/transactions/TransactionModal';
import { TransactionFiltersBar } from '@/components/transactions/TransactionFiltersBar';
import { getCategory } from '@/data/categories';
import { formatDayHeading, formatMoney } from '@/lib/format';
import {
  DEFAULT_TRANSACTION_FILTERS,
  groupByDay,
  queryTransactions,
  countActiveFilters,
  type TransactionFilters,
} from '@/lib/transactionQuery';
import type { Transaction } from '@/types/finance';
import { cn } from '@/lib/utils';

type EditorState = { open: false } | { open: true; transaction: Transaction | null };

export default function TransactionsPage() {
  const { data, deleteTransaction } = useFinance();
  const { notify } = useToast();
  const loading = usePageLoading();
  const [filters, setFilters] = useState<TransactionFilters>(DEFAULT_TRANSACTION_FILTERS);
  const [editor, setEditor] = useState<EditorState>({ open: false });
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  const { currency, hideBalance } = data.settings;
  const visible = useMemo(() => queryTransactions(data.transactions, filters), [data.transactions, filters]);
  const groups = useMemo(() => groupByDay(visible), [visible]);
  const totals = useMemo(
    () =>
      visible.reduce(
        (acc, t) => {
          if (t.type === 'income') acc.income += t.amount;
          else acc.expenses += t.amount;
          return acc;
        },
        { income: 0, expenses: 0 },
      ),
    [visible],
  );

  if (loading) return <PageSkeleton variant="list" />;

  const hasAnyTransactions = data.transactions.length > 0;
  const filtersActive = countActiveFilters(filters) > 0;
  const netFlow = totals.income - totals.expenses;

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteTransaction(deleteTarget.id);
    notify({ tone: 'success', title: 'Transaction deleted', message: deleteTarget.description });
    setDeleteTarget(null);
  };

  const handleExportCsv = () => {
    if (visible.length === 0) return;
    const header = ['Date', 'Type', 'Category', 'Description', 'Amount'];
    const rows = visible.map((t) => [
      t.date,
      t.type,
      `"${getCategory(t.categoryId).label}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.type === 'income' ? t.amount.toFixed(2) : (-t.amount).toFixed(2),
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `spendsense-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    notify({ tone: 'info', title: 'CSV exported', message: `Exported ${visible.length} transactions.` });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ledger & Activity"
        title="Transactions"
        description="Every inflow and outflow in one high-speed ledger. Search, filter by category or date range, and export anytime."
        actions={
          <>
            {visible.length > 0 && (
              <Button variant="secondary" size="sm" onClick={handleExportCsv}>
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            )}
            <Button onClick={() => setEditor({ open: true, transaction: null })}>
              <Plus className="h-4 w-4" />
              Add transaction
            </Button>
          </>
        }
      />

      {hasAnyTransactions && <TransactionFiltersBar filters={filters} onChange={setFilters} />}

      {hasAnyTransactions && visible.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="card flex items-center gap-3.5 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-line/10 text-muted">
              <Layers className="h-5 w-5" />
            </span>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Matching Entries</p>
              <p className="font-mono text-lg font-bold text-fg">{visible.length}</p>
            </div>
          </div>

          <div className="card flex items-center gap-3.5 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/12 text-emerald-300">
              <ArrowDownLeft className="h-5 w-5" />
            </span>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Period Inflow</p>
              <p className="font-mono text-lg font-bold tabular-nums text-emerald-300">
                {hideBalance ? '••••••' : `+${formatMoney(totals.income, currency)}`}
              </p>
            </div>
          </div>

          <div className="card flex items-center gap-3.5 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/12 text-rose-300">
              <ArrowUpRight className="h-5 w-5" />
            </span>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Period Outflow</p>
              <p className="font-mono text-lg font-bold tabular-nums text-fg">
                {hideBalance ? '••••••' : `-${formatMoney(totals.expenses, currency)}`}
              </p>
            </div>
          </div>

          <div className="card flex items-center gap-3.5 p-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Net Cash Flow</p>
              <p
                className={cn(
                  'font-mono text-lg font-bold tabular-nums',
                  netFlow >= 0 ? 'text-lime-300' : 'text-rose-300',
                )}
              >
                {hideBalance ? '••••••' : `${netFlow >= 0 ? '+' : '-'}${formatMoney(Math.abs(netFlow), currency)}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {!hasAnyTransactions && (
        <div className="card">
          <EmptyState
            icon={Receipt}
            title="No transactions recorded yet"
            description="Add your first income or expense to start building your financial picture. You can edit or remove entries anytime."
            action={{ label: 'Add transaction', onClick: () => setEditor({ open: true, transaction: null }) }}
          />
        </div>
      )}

      {hasAnyTransactions && visible.length === 0 && (
        <div className="card">
          <EmptyState
            icon={SearchX}
            title="Nothing matches those filters"
            description="Try a different search keyword, widen the date range, or reset the active filters."
            action={
              filtersActive
                ? { label: 'Reset all filters', onClick: () => setFilters(DEFAULT_TRANSACTION_FILTERS) }
                : undefined
            }
          />
        </div>
      )}

      {groups.length > 0 && (
        <div className="space-y-4">
          {groups.map((group) => (
            <section key={group.date} className="card overflow-hidden p-3 sm:p-4">
              <header className="mb-2 flex items-center justify-between border-b border-line/10 px-3.5 pb-2.5 pt-1">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-muted">
                    {formatDayHeading(group.date)}
                  </h2>
                  <Badge tone="neutral" className="font-mono text-[10px]">
                    {group.items.length}
                  </Badge>
                </div>
                <span
                  className={cn(
                    'font-mono text-xs font-semibold tabular-nums',
                    group.net >= 0 ? 'text-emerald-300' : 'text-muted',
                  )}
                >
                  {hideBalance
                    ? '••••'
                    : `${group.net >= 0 ? '+' : '-'}${formatMoney(Math.abs(group.net), currency)}`}
                </span>
              </header>
              <ul className="space-y-1">
                {group.items.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    onEdit={(item) => setEditor({ open: true, transaction: item })}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {editor.open && (
        <TransactionModal open onClose={() => setEditor({ open: false })} transaction={editor.transaction} />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete this transaction?"
        description={
          deleteTarget
            ? `"${deleteTarget.description}" will be permanently removed and your charts will recalculate immediately.`
            : ''
        }
        confirmLabel="Delete transaction"
      />
    </div>
  );
}
