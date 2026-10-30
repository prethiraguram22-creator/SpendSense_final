import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Menu, Sparkles, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button, buttonStyles } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '#features', label: 'Architecture' },
  { href: '#how-it-works', label: 'Workflow' },
  { href: '#stories', label: 'Customer Stories' },
];

export function LandingHeader({ onExploreDemo }: { onExploreDemo: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-4 pt-4 transition-all duration-300 sm:px-6">
      <div
        className={cn(
          'mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-3 transition-all duration-300 sm:px-6',
          scrolled
            ? 'border border-line/15 bg-surface/85 shadow-2xl backdrop-blur-2xl'
            : 'border border-transparent bg-transparent',
        )}
      >
        <Link to="/" aria-label="SpendSense home">
          <Logo showBadge />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-muted md:flex" aria-label="Landing">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative transition hover:text-fg after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-lime-300 after:transition-all hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 md:flex">
          <ThemeToggle />
          <button
            type="button"
            onClick={onExploreDemo}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-3.5 py-2 text-xs font-semibold text-lime-300 transition hover:bg-emerald-400/20"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Live Demo
          </button>
          <Link to="/login" className={buttonStyles({ variant: 'ghost', size: 'sm' })}>
            Sign in
          </Link>
          <Link to="/register" className={buttonStyles({ size: 'sm' })}>
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-line/15 bg-surface/80"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mx-auto mt-2 max-w-6xl space-y-2 rounded-2xl border border-line/15 bg-surface/95 p-4 shadow-2xl backdrop-blur-2xl md:hidden">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted hover:bg-line/8 hover:text-fg"
            >
              {link.label}
            </a>
          ))}
          <div className="grid gap-2 border-t border-line/10 pt-3">
            <Link to="/register" className={buttonStyles({ className: 'w-full' })}>
              Get started free
            </Link>
            <Link to="/login" className={buttonStyles({ variant: 'secondary', className: 'w-full' })}>
              Sign in
            </Link>
            <Button variant="ghost" onClick={onExploreDemo} className="w-full">
              <Sparkles className="h-4 w-4 text-lime-300" />
              Explore interactive demo
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
