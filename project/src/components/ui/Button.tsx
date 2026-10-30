import type { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-lime-300 via-emerald-300 to-teal-300 text-slate-950 font-semibold shadow-[0_12px_32px_-10px_rgba(52,211,153,0.65)] hover:shadow-[0_16px_38px_-8px_rgba(190,242,100,0.65)] hover:brightness-105',
  secondary:
    'border border-line/18 bg-raised/85 text-fg shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] hover:border-emerald-400/35 hover:bg-elevated/90',
  ghost: 'text-muted hover:bg-line/10 hover:text-fg',
  danger:
    'bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold shadow-[0_12px_28px_-10px_rgba(244,63,94,0.6)] hover:brightness-110',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-xs sm:text-sm rounded-xl',
  md: 'h-11 px-5 text-sm rounded-xl',
  lg: 'h-12 px-6 text-base rounded-2xl',
};

export function buttonStyles({
  variant = 'primary',
  size = 'md',
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return cn(
    'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export function Button({
  variant,
  size,
  loading = false,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button type={type} disabled={disabled || loading} className={buttonStyles({ variant, size, className })} {...rest}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
