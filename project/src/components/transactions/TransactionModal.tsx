import { useState, type FormEvent } from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, TextInput } from '@/components/ui/FormField';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/data/categories';
import { useFinance } from '@/context/FinanceContext';
import { getCurrencySymbol } from '@/lib/format';
import { toISODate } from '@/lib/dates';
import { cn } from '@/lib/utils';
import type { Transaction, TransactionInput, TransactionType } from '@/types/finance';

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
}

type FormErrors = Partial<Record<'amount' | 'description' | 'categoryId' | 'date', string>>;

export function TransactionModal({ open, onClose, transaction = null }: TransactionModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={transaction ? 'Edit transaction' : 'Record transaction'}
      description={
        transaction
          ? 'Update the amount, category, or date for this ledger entry.'
          : 'Log an inflow or outflow with instant category tagging.'
      }
    >
      {open && <TransactionForm key={transaction?.id ?? 'new'} transaction={transaction} onDone={onClose} />}
    </Modal>
  );
}

function TransactionForm({ transaction, onDone }: { transaction: Transaction | null; onDone: () => void }) {
  const { data, addTransaction, updateTransaction } = useFinance();
  const [type, setType] = useState<TransactionType>(transaction?.type ?? 'expense');
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : '');
  const [description, setDescription] = useState(transaction?.description ?? '');
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? '');
  const [date, setDate] = useState(transaction?.date ?? toISODate(new Date()));
  const [errors, setErrors] = useState<FormErrors>({});

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const symbol = getCurrencySymbol(data.settings.currency);

  const changeType = (next: TransactionType) => {
    setType(next);
    const allowed = next === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    if (!allowed.some((category) => category.id === categoryId)) setCategoryId('');
  };

  const validate = (): FormErrors => {
    const parsed = Number(amount);
    const next: FormErrors = {};
    if (!amount || Number.isNaN(parsed) || parsed <= 0) next.amount = 'Enter an amount greater than zero.';
    else if (parsed > 10_000_000) next.amount = 'That amount looks too large. Check the value.';
    if (description.trim().length < 2) next.description = 'Describe this transaction (at least 2 characters).';
    if (!categoryId) next.categoryId = 'Choose a category below.';
    if (!date) next.date = 'Pick a date.';
    return next;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: TransactionInput = {
      type,
      amount: Number(amount),
      description: description.trim(),
      categoryId,
      date,
    };
    if (transaction) updateTransaction(transaction.id, payload);
    else addTransaction(payload);
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div
        className="grid grid-cols-2 gap-2 rounded-2xl border border-line/15 bg-raised/70 p-1.5"
        role="group"
        aria-label="Transaction type"
      >
        {(['expense', 'income'] as const).map((option) => {
          const active = type === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => changeType(option)}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all duration-200',
                active
                  ? option === 'income'
                    ? 'bg-gradient-to-r from-lime-300 to-emerald-400 text-slate-950 shadow-lg shadow-emerald-400/20'
                    : 'bg-gradient-to-r from-rose-500 to-orange-400 text-white shadow-lg shadow-rose-500/25'
                  : 'text-muted hover:text-fg',
              )}
            >
              {option === 'expense' ? (
                <>
                  <ArrowUpRight className="h-4 w-4" />
                  Expense (Outflow)
                </>
              ) : (
                <>
                  <ArrowDownLeft className="h-4 w-4" />
                  Income (Inflow)
                </>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 sm:grid-cols-[1.2fr_1fr]">
        <Field label="Amount" htmlFor="tx-amount" error={errors.amount}>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-2xl font-bold text-muted">
              {symbol}
            </span>
            <input
              id="tx-amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              aria-invalid={Boolean(errors.amount) || undefined}
              onChange={(event) => setAmount(event.target.value)}
              className="field h-14 pl-12 font-mono text-2xl font-bold tabular-nums"
            />
          </div>
        </Field>

        <Field label="Transaction Date" htmlFor="tx-date" error={errors.date}>
          <TextInput
            id="tx-date"
            type="date"
            value={date}
            max={toISODate(new Date())}
            invalid={Boolean(errors.date)}
            onChange={(event) => setDate(event.target.value)}
            className="h-14 font-mono"
          />
        </Field>
      </div>

      <Field label="Merchant or Description" htmlFor="tx-description" error={errors.description}>
        <TextInput
          id="tx-description"
          placeholder={type === 'income' ? 'e.g. Northwind Labs — Monthly Salary' : 'e.g. Whole Foods Market'}
          maxLength={60}
          value={description}
          invalid={Boolean(errors.description)}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Field>

      <Field label="Select Category" htmlFor="tx-category" error={errors.categoryId}>
        <div
          id="tx-category"
          role="radiogroup"
          aria-label="Category"
          className="grid max-h-52 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3"
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            const selected = categoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setCategoryId(cat.id)}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition-all',
                  selected
                    ? 'border-lime-400/60 bg-lime-400/12 text-fg shadow-[0_0_16px_-4px_rgba(190,242,100,0.35)]'
                    : 'border-line/12 bg-raised/50 text-muted hover:border-line/25 hover:text-fg',
                )}
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${cat.color}22`, color: cat.color }}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="truncate">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </Field>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit">{transaction ? 'Save changes' : 'Record transaction'}</Button>
      </div>
    </form>
  );
}
