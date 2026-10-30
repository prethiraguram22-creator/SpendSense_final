import { Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { NotificationsMenu } from '@/components/layout/NotificationsMenu';
import { formatMoney, formatToday } from '@/lib/format';
import { getBalance } from '@/lib/finance';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const location = useLocation();
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

function getAppPageKey(pathname: string): string {
  if (pathname.includes('/transactions')) return 'transactions';
  if (pathname.includes('/budgets')) return 'budgets';
  if (pathname.includes('/insights')) return 'insights';
  if (pathname.includes('/goals')) return 'goals';
  if (pathname.includes('/recommendations')) return 'recommendations';
  if (pathname.includes('/settings')) return 'settings';
  return 'dashboard';
}

export function AppLayout() {
  const location = useLocation();
  const { data, updateSettings } = useFinance();
  const balance = getBalance(data);
  const { hideBalance, currency } = data.settings;
  const pageKey = getAppPageKey(location.pathname);

  return (
    <div className={`min-h-screen page-shell page-shell-${pageKey}`} data-page={pageKey}>
      <Sidebar />
      <div className="flex min-h-screen flex-col md:pl-20 lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-line/10 bg-canvas/80 px-4 backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-4">
            <Logo className="md:hidden" wordmarkClassName="text-base" />
            <div className="hidden items-center gap-3 sm:flex">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line/12 bg-surface/80 px-3 py-1 font-mono text-xs text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {formatToday()}
              </span>
              <div className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/8 px-3.5 py-1 text-xs lg:inline-flex">
                <span className="text-muted">Net Liquidity:</span>
                <span className="font-mono font-semibold tabular-nums text-lime-300">
                  {hideBalance ? '••••••' : formatMoney(balance, currency)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/app/transactions"
              className="hidden items-center gap-1.5 rounded-xl border border-lime-400/30 bg-lime-400/10 px-3 py-2 text-xs font-semibold text-lime-300 transition hover:bg-lime-400/20 sm:inline-flex"
            >
              <Plus className="h-3.5 w-3.5" />
              Quick Log
            </Link>
            <button
              type="button"
              onClick={() => updateSettings({ hideBalance: !hideBalance })}
              aria-label={hideBalance ? 'Show balances' : 'Hide balances'}
              title={hideBalance ? 'Show balances' : 'Privacy mode: hide balances'}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-line/15 bg-surface/70 text-muted transition hover:border-emerald-400/40 hover:text-emerald-300"
            >
              {hideBalance ? <EyeOff className="h-[18px] w-[18px] text-amber-300" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
            <NotificationsMenu />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 px-4 pb-32 pt-7 md:px-8 md:pb-16 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
