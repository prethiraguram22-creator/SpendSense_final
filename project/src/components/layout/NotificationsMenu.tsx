import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useFinance } from '@/context/FinanceContext';
import { useFormatMoney } from '@/hooks/useFormatMoney';
import { currentMonthKey } from '@/lib/dates';
import { getBudgetStatuses } from '@/lib/finance';
import { cn } from '@/lib/utils';

export function NotificationsMenu() {
  const { data } = useFinance();
  const money = useFormatMoney();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const alerts = useMemo(
    () =>
      data.settings.notifications.budgetAlerts
        ? getBudgetStatuses(data.budgets, data.transactions, currentMonthKey()).filter((s) => s.state !== 'safe')
        : [],
    [data.budgets, data.transactions, data.settings.notifications.budgetAlerts],
  );

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handlePointer);
    return () => document.removeEventListener('mousedown', handlePointer);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Notifications, ${alerts.length} budget alerts`}
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-line/15 bg-surface/70 text-muted transition hover:border-teal-400/40 hover:text-teal-300"
      >
        <Bell className="h-[18px] w-[18px]" />
        {alerts.length > 0 && (
          <span className="absolute right-2 top-2 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-400" />
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="card absolute right-0 top-14 z-50 w-[min(22rem,calc(100vw-2rem))] p-4 shadow-2xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Budget alerts</h3>
              <Badge tone={alerts.length > 0 ? 'rose' : 'teal'}>{alerts.length > 0 ? `${alerts.length} active` : 'All clear'}</Badge>
            </div>
            {alerts.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">Every budget is within its limit this month.</p>
            ) : (
              <ul className="space-y-2">
                {alerts.map((alert) => {
                  const over = alert.state === 'over';
                  return (
                    <li
                      key={alert.budget.id}
                      className={cn(
                        'rounded-xl border px-3.5 py-3',
                        over ? 'border-rose-500/30 bg-rose-500/10' : 'border-amber-400/30 bg-amber-400/10',
                      )}
                    >
                      <p className="text-sm font-medium">{alert.category.label}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {over
                          ? `Over by ${money(Math.abs(alert.remaining))} this month`
                          : `${Math.round(alert.ratio * 100)}% used, ${money(alert.remaining)} left`}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
            <Link
              to="/app/budgets"
              onClick={() => setOpen(false)}
              className="mt-4 block rounded-xl py-2 text-center text-sm font-medium text-teal-300 transition hover:bg-teal-400/10"
            >
              Manage budgets
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
