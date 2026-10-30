import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, TextInput } from '@/components/ui/FormField';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useFinance } from '@/context/FinanceContext';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import type { Goal } from '@/types/finance';

interface ContributeModalProps {
  open: boolean;
  onClose: () => void;
  goal: Goal | null;
}

export function ContributeModal({ open, onClose, goal }: ContributeModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={goal ? `Add funds to ${goal.name}` : 'Add funds'}
      description="Every contribution brings you closer to the finish line."
    >
      {open && goal && <ContributeForm key={goal.id} goal={goal} onDone={onClose} />}
    </Modal>
  );
}

const QUICK_AMOUNTS = [25, 50, 100, 250];

function ContributeForm({ goal, onDone }: { goal: Goal; onDone: () => void }) {
  const { contributeToGoal } = useFinance();
  const money = useFormatMoney();
  const remaining = Math.max(0, goal.target - goal.saved);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const value = Number(amount);
  const validValue = !Number.isNaN(value) && value > 0 ? value : 0;
  const projected = Math.min(goal.target, goal.saved + validValue);
  const projectedPercent = goal.target > 0 ? (projected / goal.target) * 100 : 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!amount || Number.isNaN(value) || value <= 0) {
      setError('Enter an amount greater than zero.');
      return;
    }
    if (value > remaining) {
      setError(`That is more than the ${money(remaining)} still needed for this goal.`);
      return;
    }
    contributeToGoal(goal.id, value);
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Quick amounts">
        {QUICK_AMOUNTS.map((quick) => (
          <button
            key={quick}
            type="button"
            disabled={quick > remaining}
            onClick={() => {
              setAmount(String(quick));
              setError(null);
            }}
            className="rounded-full border border-line/15 px-4 py-1.5 text-sm transition hover:border-teal-400/50 hover:text-teal-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {money(quick)}
          </button>
        ))}
      </div>

      <Field label="Amount to add" htmlFor="contribute-amount" error={error ?? undefined} hint={`${money(remaining)} remaining to reach your target.`}>
        <TextInput
          id="contribute-amount"
          type="number"
          min="1"
          step="1"
          inputMode="decimal"
          placeholder="0"
          value={amount}
          invalid={Boolean(error)}
          onChange={(event) => {
            setAmount(event.target.value);
            setError(null);
          }}
        />
      </Field>

      <div className="space-y-3 rounded-2xl border border-line/10 bg-raised/50 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Balance after this deposit</span>
          <span className="font-semibold tabular-nums">{money(projected)}</span>
        </div>
        <ProgressBar value={projectedPercent} tone={projectedPercent >= 100 ? 'amber' : 'teal'} />
        <p className="text-xs text-muted">{Math.round(projectedPercent)}% of {money(goal.target)}</p>
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={remaining <= 0}>
          Add funds
        </Button>
      </div>
    </form>
  );
}
