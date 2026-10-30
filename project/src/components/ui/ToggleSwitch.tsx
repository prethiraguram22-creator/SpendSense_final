import { useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

export function ToggleSwitch({ checked, onChange, label, description }: ToggleSwitchProps) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <div>
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors duration-300',
          checked ? 'bg-teal-400' : 'bg-line/25',
        )}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
          className={cn('h-5 w-5 rounded-full bg-white shadow-md', checked ? 'ml-auto' : '')}
        />
      </button>
    </div>
  );
}
