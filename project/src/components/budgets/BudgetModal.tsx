import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, SelectInput, TextInput } from '@/components/ui/FormField';
import { EXPENSE_CATEGORIES, getCategory } from '@/data/categories';
import { useFinance } from '@/context/FinanceContext';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { getCategoryMonthlyAverage } from '@/lib/finance';
import type { Budget } from '@/types/finance';

interface BudgetModalProps {
  open: boolean;
  onClose: () => void;
  budget?: Budget | null;
  unbudgetedCategoryIds: string[];
}

export function BudgetModal({ open, onClose, budget = null, unbudgetedCategoryIds }: BudgetModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={budget ? 'Edit budget' : 'New monthly budget'}
      description="Set a monthly spending limit and get an alert as you approach it."
    >
      {open && (
        <BudgetForm
          key={budget?.id ?? 'new'}
          budget={budget}
          unbudgetedCategoryIds={unbudgetedCategoryIds}
          onDone={onClose}
        />
      )}
    </Modal>
  );
}

function BudgetForm({
  budget,
  unbudgetedCategoryIds,
  onDone,
}: {
  budget: Budget | null;
  unbudgetedCategoryIds: string[];
  onDone: () => void;
}) {
  const { data, saveBudget } = useFinance();
  const money = useFormatMoney();
  const choices = budget
    ? EXPENSE_CATEGORIES.filter((category) => category.id === budget.categoryId)
    : EXPENSE_CATEGORIES.filter((category) => unbudgetedCategoryIds.includes(category.id));

  const [categoryId, setCategoryId] = useState(budget?.categoryId ?? choices[0]?.id ?? '');
  const [limit, setLimit] = useState(budget ? String(budget.limit) : '');
  const [error, setError] = useState<string | null>(null);

  const average = categoryId ? getCategoryMonthlyAverage(data.transactions, categoryId) : 0;
  const suggested = Math.max(10, Math.round(average / 10) * 10);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = Number(limit);
    if (!categoryId) {
      setError('Choose a category for this budget.');
      return;
    }
    if (!limit || Number.isNaN(parsed) || parsed <= 0) {
      setError('Enter a monthly limit greater than zero.');
      return;
    }
    saveBudget(budget?.id ?? null, { categoryId, limit: parsed });
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <Field label="Category" htmlFor="budget-category">
        <SelectInput
          id="budget-category"
          value={categoryId}
          disabled={Boolean(budget)}
          onChange={(event) => setCategoryId(event.target.value)}
        >
          {choices.length === 0 && <option value="">Every category already has a budget</option>}
          {choices.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </SelectInput>
      </Field>

      <Field
        label="Monthly limit"
        htmlFor="budget-limit"
        error={error ?? undefined}
        hint={average > 0 ? `You spend about ${money(average)} a month on ${getCategory(categoryId).label.toLowerCase()}.` : undefined}
      >
        <TextInput
          id="budget-limit"
          type="number"
          inputMode="decimal"
          min="1"
          step="1"
          placeholder="e.g. 300"
          value={limit}
          invalid={Boolean(error)}
          onChange={(event) => setLimit(event.target.value)}
        />
      </Field>

      {average > 0 && (
        <button
          type="button"
          onClick={() => setLimit(String(suggested))}
          className="w-full rounded-xl border border-dashed border-teal-400/40 px-4 py-3 text-left text-sm transition hover:bg-teal-400/5"
        >
          <span className="font-medium text-teal-300">Use suggested limit: {money(suggested)}</span>
          <span className="mt-0.5 block text-xs text-muted">Based on your recent average, rounded to the nearest ten.</span>
        </button>
      )}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={!categoryId}>
          {budget ? 'Save budget' : 'Create budget'}
        </Button>
      </div>
    </form>
  );
}
