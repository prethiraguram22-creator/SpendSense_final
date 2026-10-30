import type { ReactNode, InputHTMLAttributes, SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  htmlFor: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, error, hint, htmlFor, children, className }: FieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor={htmlFor} className="block text-xs font-semibold uppercase tracking-[0.08em] text-muted">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-xs font-medium text-rose-400">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-muted">{hint}</p>
      )}
    </div>
  );
}

export function TextInput({
  invalid,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input aria-invalid={invalid || undefined} className={cn('field', className)} {...rest} />;
}

export function SelectInput({
  invalid,
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <div className="relative">
      <select aria-invalid={invalid || undefined} className={cn('field appearance-none pr-10', className)} {...rest}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
    </div>
  );
}
