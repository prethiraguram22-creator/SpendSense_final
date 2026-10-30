import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, Sparkles, TrendingUp, Lock } from 'lucide-react';

const HIGHLIGHTS = [
  {
    icon: Sparkles,
    title: 'Intelligent Category Velocity',
    text: 'Automated 80% budget alerts and month-over-month spike detection before overspending compounds.',
  },
  {
    icon: TrendingUp,
    title: 'Dynamic Goal Pacing',
    text: 'Real-time monthly contribution targets calibrated to your deadlines and historical savings rate.',
  },
  {
    icon: ShieldCheck,
    title: 'Private Local-First Ledger',
    text: 'Instant sandbox demo mode, one-click balance privacy masking, and full JSON export.',
  },
];

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
  page?: 'login' | 'register';
}

export function AuthShell({ title, subtitle, children, footer, page = 'login' }: AuthShellProps) {
  return (
    <div className={`page-shell-auth page-shell-${page} grid min-h-screen lg:grid-cols-[1.08fr_1fr]`} data-page={page}>
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-line/12 bg-surface/65 p-12 lg:flex">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-lime-400/12 via-transparent to-cyan-400/12"
        />
        <div
          aria-hidden="true"
          className="absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-emerald-400/15 blur-3xl"
        />

        <div className="relative flex items-center justify-between">
          <Link to="/" aria-label="SpendSense home">
            <Logo showBadge />
          </Link>
          <Badge tone="lime" dot>
            256-Bit Local Storage
          </Badge>
        </div>

        <div className="relative max-w-lg animate-fade-up">
          <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-lime-300">
            Personal Wealth Terminal
          </p>
          <h2 className="text-4xl font-extrabold leading-[1.12] tracking-tight">
            Know where every dollar goes—and where it should <span className="text-gradient">compound next.</span>
          </h2>
          <ul className="mt-9 space-y-5">
            {HIGHLIGHTS.map((item) => (
              <li key={item.title} className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-lime-400/25 bg-lime-400/10">
                  <item.icon className="h-5 w-5 text-lime-300" />
                </span>
                <div>
                  <p className="text-sm font-bold text-fg">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <figure className="card-mesh relative max-w-md p-6">
          <div className="mb-3 flex items-center justify-between text-xs">
            <span className="font-mono font-semibold uppercase tracking-wider text-lime-300">Verified Member</span>
            <span className="font-mono text-emerald-300">42% Savings Rate</span>
          </div>
          <blockquote className="text-sm leading-relaxed text-fg/90">
            &ldquo;I finally stopped guessing at month-end. The savings pace view alone got me to my emergency fund in half
            the time.&rdquo;
          </blockquote>
          <figcaption className="mt-4 text-xs text-muted">
            Priya S. — Senior Product Designer
          </figcaption>
        </figure>
      </aside>

      <main className="relative flex flex-col px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between">
          <Link to="/" className="lg:hidden" aria-label="SpendSense home">
            <Logo wordmarkClassName="text-base" />
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden items-center gap-1.5 font-mono text-xs text-muted sm:inline-flex">
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              Encrypted Session
            </span>
            <ThemeToggle />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-md animate-fade-up">
            <div className="glass p-7 sm:p-9">
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
              <p className="mt-2 text-sm leading-relaxed text-muted">{subtitle}</p>
              <div className="mt-7">{children}</div>
            </div>
            <div className="mt-6 text-center text-sm text-muted">{footer}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
