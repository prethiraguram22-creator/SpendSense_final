import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, TextInput } from '@/components/ui/FormField';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { GOAL_COLORS } from '@/data/categories';
import { useFinance, type GoalInput } from '@/context/FinanceContext';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { toISODate } from '@/lib/dates';
import { cn } from '@/lib/utils';
import type { Goal } from '@/types/finance';

interface GoalModalProps {
  open: boolean;
  onClose: () => void;
  goal?: Goal | null;
}

export function GoalModal({ open, onClose, goal = null }: GoalModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={goal ? 'Edit savings goal' : 'New savings goal'}
      description="Give your goal a target and a date. We will work out the monthly pace."
    >
      {open && <GoalForm key={goal?.id ?? 'new'} goal={goal} onDone={onClose} />}
    </Modal>
  );
}

function GoalForm({ goal, onDone }: { goal: Goal | null; onDone: () => void }) {
  const { saveGoal } = useFinance();
  const money = useFormatMoney();
  const [name, setName] = useState(goal?.name ?? '');
  const [target, setTarget] = useState(goal ? String(goal.target) : '');
  const [saved, setSaved] = useState(goal ? String(goal.saved) : '0');
  const [deadline, setDeadline] = useState(goal?.deadline ?? '');
  const [color, setColor] = useState(goal?.color ?? GOAL_COLORS[0]);
  const [errors, setErrors] = useState<Partial<Record<'name' | 'target' | 'saved' | 'deadline', string>>>({});

  const targetValue = Number(target);
  const savedValue = Number(saved);
  const preview = targetValue > 0 ? Math.min(100, (savedValue / targetValue) * 100) : 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = 'Give this goal a name.';
    if (!target || Number.isNaN(targetValue) || targetValue <= 0) next.target = 'Enter a target greater than zero.';
    if (Number.isNaN(savedValue) || savedValue < 0) next.saved = 'Saved amount cannot be negative.';
    else if (targetValue > 0 && savedValue > targetValue) next.saved = 'Saved amount cannot exceed the target.';
    if (!deadline) next.deadline = 'Pick a target date.';
    else if (deadline < toISODate(new Date())) next.deadline = 'The target date should be in the future.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const input: GoalInput = {
      name: name.trim(),
      target: targetValue,
      saved: savedValue,
      deadline,
      color,
    };
    saveGoal(goal?.id ?? null, input);
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <Field label="Goal name" htmlFor="goal-name" error={errors.name}>
        <TextInput
          id="goal-name"
          placeholder="e.g. Summer in Lisbon"
          maxLength={40}
          value={name}
          invalid={Boolean(errors.name)}
          onChange={(event) => setName(event.target.value)}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Target amount" htmlFor="goal-target" error={errors.target}>
          <TextInput
            id="goal-target"
            type="number"
            min="1"
            step="1"
            placeholder="5000"
            value={target}
            invalid={Boolean(errors.target)}
            onChange={(event) => setTarget(event.target.value)}
          />
        </Field>
        <Field label="Saved so far" htmlFor="goal-saved" error={errors.saved}>
          <TextInput
            id="goal-saved"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={saved}
            invalid={Boolean(errors.saved)}
            onChange={(event) => setSaved(event.target.value)}
          />
        </Field>
      </div>

      <Field label="Target date" htmlFor="goal-deadline" error={errors.deadline}>
        <TextInput
          id="goal-deadline"
          type="date"
          min={toISODate(new Date())}
          value={deadline}
          invalid={Boolean(errors.deadline)}
          onChange={(event) => setDeadline(event.target.value)}
        />
      </Field>

      <div className="space-y-2.5">
        <span className="text-sm font-medium text-fg/90">Colour</span>
        <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Goal colour">
          {GOAL_COLORS.map((swatch) => (
            <button
              key={swatch}
              type="button"
              role="radio"
              aria-checked={color === swatch}
              aria-label={`Colour ${swatch}`}
              onClick={() => setColor(swatch)}
              className={cn(
                'h-8 w-8 rounded-full ring-offset-2 ring-offset-surface transition-transform hover:scale-110',
                color === swatch && 'ring-2 ring-fg',
              )}
              style={{ background: swatch }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2 rounded-2xl border border-line/10 bg-raised/50 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Progress preview</span>
          <span className="font-medium tabular-nums">
            {money(savedValue || 0)} of {money(targetValue || 0)}
          </span>
        </div>
        <ProgressBar value={preview} />
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit">{goal ? 'Save goal' : 'Create goal'}</Button>
      </div>
    </form>
  );
}
