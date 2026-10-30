import { Search, SlidersHorizontal, X, ArrowDownLeft, ArrowUpRight, Layers } from 'lucide-react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/data/categories';
import { Field, SelectInput, TextInput } from '@/components/ui/FormField';
import { cn } from '@/lib/utils';
import {
  countActiveFilters,
  DEFAULT_TRANSACTION_FILTERS,
  type SortKey,
  type TransactionFilters,
  type TypeFilter,
} from '@/lib/transactionQuery';

const TYPE_OPTIONS: { value: TypeFilter; label: string; icon: typeof Layers }[] = [
  { value: 'all', label: 'All Flow', icon: Layers },
  { value: 'income', label: 'Inflow', icon: ArrowDownLeft },
  { value: 'expense', label: 'Outflow', icon: ArrowUpRight },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'date-desc', label: 'Newest first' },
  { value: 'date-asc', label: 'Oldest first' },
  { value: 'amount-desc', label: 'Largest amount' },
  { value: 'amount-asc', label: 'Smallest amount' },
];

interface TransactionFiltersBarProps {
  filters: TransactionFilters;
  onChange: (next: TransactionFilters) => void;
}

export function TransactionFiltersBar({ filters, onChange }: TransactionFiltersBarProps) {
  const patch = (next: Partial<TransactionFilters>) => onChange({ ...filters, ...next });
  const activeCount = countActiveFilters(filters);
  const categories =
    filters.type === 'income'
      ? INCOME_CATEGORIES
      : filters.type === 'expense'
        ? EXPENSE_CATEGORIES
        : [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

  return (
    <div className="glass space-y-5 p-5">
      <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <TextInput
            type="search"
            aria-label="Search transactions"
            placeholder="Search merchants, descriptions, or categories..."
            value={filters.query}
            onChange={(event) => patch({ query: event.target.value })}
            className="pl-11"
          />
        </div>
        <div
          role="radiogroup"
          aria-label="Transaction type"
          className="inline-flex shrink-0 rounded-2xl border border-line/15 bg-raised/90 p-1"
        >
          {TYPE_OPTIONS.map((option) => {
            const active = filters.type === option.value;
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => patch({ type: option.value, categoryId: 'all' })}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all sm:text-sm',
                  active
                    ? 'bg-gradient-to-r from-lime-300 to-emerald-400 text-slate-950 shadow-sm'
                    : 'text-muted hover:text-fg',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_1.1fr_auto]">
        <Field label="Category" htmlFor="filter-category">
          <SelectInput
            id="filter-category"
            value={filters.categoryId}
            onChange={(event) => patch({ categoryId: event.target.value })}
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="From date" htmlFor="filter-from">
          <TextInput
            id="filter-from"
            type="date"
            value={filters.from}
            max={filters.to || undefined}
            onChange={(event) => patch({ from: event.target.value })}
          />
        </Field>
        <Field label="To date" htmlFor="filter-to">
          <TextInput
            id="filter-to"
            type="date"
            value={filters.to}
            min={filters.from || undefined}
            onChange={(event) => patch({ to: event.target.value })}
          />
        </Field>
        <Field label="Sort order" htmlFor="filter-sort">
          <SelectInput
            id="filter-sort"
            value={filters.sort}
            onChange={(event) => patch({ sort: event.target.value as SortKey })}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </Field>
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => onChange(DEFAULT_TRANSACTION_FILTERS)}
            disabled={activeCount === 0 && filters.sort === DEFAULT_TRANSACTION_FILTERS.sort}
            className="inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-line/15 bg-raised/70 px-4 text-xs font-semibold uppercase tracking-wider text-muted transition hover:border-rose-400/35 hover:text-rose-300 disabled:opacity-40 sm:w-auto"
          >
            {activeCount > 0 ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
            Reset{activeCount > 0 ? ` (${activeCount})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
