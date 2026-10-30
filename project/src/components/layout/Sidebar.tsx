import { useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { NAV_ITEMS } from '@/components/layout/navigation';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
import { currentMonthKey } from '@/lib/dates';
import { summarizeMonth } from '@/lib/finance';
import { formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const { logout } = useAuth();
  const { data } = useFinance();
  const navigate = useNavigate();
  const name = data.settings.name || 'Your account';
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const currentSummary = useMemo(
    () => summarizeMonth(data.transactions, currentMonthKey()),
    [data.transactions],
  );
  const savingsRateClamped = Math.max(0, Math.min(100, currentSummary.savingsRate));

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-20 flex-col border-r border-line/12 bg-surface/85 px-3 py-6 backdrop-blur-2xl md:flex lg:w-64 lg:px-4">
      <div className="px-2 lg:px-3">
        <Logo wordmarkClassName="hidden lg:flex" showBadge />
      </div>

      <div className="mt-8 hidden px-3 lg:block">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted/75">
          Workspace
        </p>
      </div>

      <nav className="mt-3 flex flex-1 flex-col gap-1.5" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={item.label}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center justify-center gap-3.5 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 lg:justify-start',
                isActive ? 'text-fg font-semibold' : 'text-muted hover:bg-line/8 hover:text-fg',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-2xl border border-emerald-400/30 bg-gradient-to-r from-lime-400/15 via-emerald-400/10 to-transparent shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                  />
                )}
                {isActive && (
                  <motion.span
                    layoutId="sidebar-bar"
                    className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full bg-gradient-to-b from-lime-300 to-emerald-400 shadow-[0_0_10px_#bef264]"
                  />
                )}
                <item.icon
                  className={cn(
                    'relative h-[19px] w-[19px] shrink-0 transition-transform duration-200 group-hover:scale-105',
                    isActive ? 'text-lime-300' : 'text-muted group-hover:text-fg',
                  )}
                />
                <span className="relative hidden lg:inline">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Monthly Savings Pulse Widget on Desktop */}
      <div className="mb-4 hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 via-surface to-cyan-500/10 p-3.5 lg:block">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-medium text-fg/90">
            <ShieldCheck className="h-3.5 w-3.5 text-lime-300" />
            Savings Velocity
          </span>
          <span className="font-mono font-semibold text-lime-300">
            {data.settings.hideBalance ? '••%' : formatPercent(currentSummary.savingsRate)}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line/15">
          <div
            className="h-full rounded-full bg-gradient-to-r from-lime-300 to-emerald-400 transition-all duration-500"
            style={{ width: `${savingsRateClamped}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-muted">
          {currentSummary.savingsRate >= 20
            ? 'Outperforming 20% monthly target'
            : 'Target: 20% monthly net savings'}
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-line/12 bg-raised/70 p-2.5 lg:p-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-lime-300 via-emerald-400 to-cyan-400 font-mono text-xs font-bold text-slate-950 shadow-sm">
          {initials || 'SS'}
        </div>
        <div className="hidden min-w-0 flex-1 lg:block">
          <p className="truncate text-sm font-semibold text-fg">{name}</p>
          <p className="truncate font-mono text-[11px] text-muted">{data.settings.email || 'Local Workspace'}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Sign out"
          title="Sign out"
          className="rounded-xl p-2 text-muted transition hover:bg-rose-500/15 hover:text-rose-400"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
