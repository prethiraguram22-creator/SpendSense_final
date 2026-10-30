import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NAV_ITEMS } from '@/components/layout/navigation';
import { cn } from '@/lib/utils';

export function MobileNav() {
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-3 bottom-3 z-30 rounded-2xl border border-line/15 bg-surface/90 px-1.5 py-1 pb-[calc(0.25rem+env(safe-area-inset-bottom))] shadow-2xl backdrop-blur-2xl md:hidden"
    >
      <ul className="grid grid-cols-7">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'relative flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-medium transition-colors',
                  isActive ? 'text-lime-300' : 'text-muted hover:text-fg',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="mobile-nav-pill"
                      className="absolute inset-0 rounded-xl bg-emerald-400/12 ring-1 ring-emerald-400/30"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <item.icon className="relative h-4 w-4" />
                  <span className="relative max-w-full truncate px-0.5">{item.shortLabel}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
