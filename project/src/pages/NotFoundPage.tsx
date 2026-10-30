import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { buttonStyles } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="page-shell-notfound flex min-h-screen flex-col items-center justify-center px-6 text-center" data-page="notfound">
      <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-400/10 text-teal-300">
        <Compass className="h-8 w-8" />
      </span>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">Error 404</p>
      <h1 className="mt-3 text-4xl font-semibold">This page wandered off.</h1>
      <p className="mt-3 max-w-md text-muted">The link may be outdated, or the page may have moved. Let&apos;s get you back to your money.</p>
      <Link to="/" className={buttonStyles({ className: 'mt-8' })}>
        Back to home
      </Link>
    </div>
  );
}
