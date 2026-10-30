import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, CheckCircle2, ShieldCheck, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { RingProgress } from '@/components/ui/RingProgress';
import { buttonStyles, Button } from '@/components/ui/Button';
import { formatMoney } from '@/lib/format';

const BARS = [
  { month: 'May', income: 68, expense: 42 },
  { month: 'Jun', income: 74, expense: 48 },
  { month: 'Jul', income: 70, expense: 39 },
  { month: 'Aug', income: 85, expense: 52 },
  { month: 'Sep', income: 82, expense: 44 },
  { month: 'Oct', income: 96, expense: 46 },
];

const STATS = [
  { value: 24.8, format: (v: number) => `${v.toFixed(1)}k+`, label: 'Active earner workspaces' },
  { value: 4.2, format: (v: number) => `$${v.toFixed(1)}M`, label: 'Monthly cash flow analyzed' },
  { value: 31, format: (v: number) => `+${Math.round(v)}%`, label: 'Avg. savings rate lift in 90d' },
];

interface HeroProps {
  onExploreDemo: () => void;
}

export function LandingHero({ onExploreDemo }: HeroProps) {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-36 md:pt-44">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-20 -z-10 h-[520px] w-[920px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-lime-400/12 via-emerald-400/10 to-cyan-400/12 blur-3xl"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1.08fr_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-lime-400/30 bg-lime-400/10 px-3.5 py-1.5 text-xs font-semibold text-lime-300 shadow-[0_0_24px_-6px_rgba(190,242,100,0.4)]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>SpendSense Intelligence 2.4 • Built for modern earners</span>
          </div>

          <h1 className="mt-7 text-5xl font-extrabold leading-[1.04] tracking-tight sm:text-6xl lg:text-[4.25rem]">
            Command every <span className="text-gradient">dollar</span> with precision velocity.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Transform raw transactions into live cash-flow telemetry, proactive budget guardrails, and automated savings
            pacing—designed with the speed and clarity of a modern financial terminal.
          </p>

          <div className="mt-9 flex flex-col gap-3.5 sm:flex-row sm:items-center">
            <Link to="/register" className={buttonStyles({ size: 'lg', className: 'group' })}>
              Launch your workspace
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Button variant="secondary" size="lg" onClick={onExploreDemo} className="group">
              <Zap className="h-4 w-4 text-lime-300 transition-transform group-hover:scale-110" />
              Explore interactive demo
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Instant 6-month sandbox demo
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
              Zero bank credentials required
            </span>
          </div>

          <dl className="mt-12 grid max-w-xl grid-cols-3 gap-6 rounded-2xl border border-line/12 bg-surface/60 p-5 backdrop-blur-xl">
            {STATS.map((stat) => (
              <div key={stat.label} className="border-l border-line/12 pl-4 first:border-l-0 first:pl-0">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-mono text-2xl font-bold tabular-nums text-fg sm:text-3xl">
                  <AnimatedNumber value={stat.value} format={stat.format} duration={1.6} />
                </dd>
                <p className="mt-1 text-xs leading-snug text-muted">{stat.label}</p>
              </div>
            ))}
          </dl>
        </motion.div>

        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.85, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto h-[540px] w-full max-w-[540px]"
    >
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/20 blur-3xl"
      />

      {/* Primary Command Card */}
      <div className="card-mesh absolute inset-x-0 top-10 p-7 animate-float">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Net Liquidity • Live Telemetry
            </span>
            <p className="mt-1.5 font-display text-4xl font-extrabold tabular-nums tracking-tight">
              <AnimatedNumber value={18420.5} format={(v) => formatMoney(v, 'USD')} duration={1.8} />
            </p>
          </div>
          <Badge tone="lime" dot className="px-3 py-1 font-mono">
            +14.8% MoM
          </Badge>
        </div>

        {/* Dual Cash Flow Bars */}
        <div className="mt-7 rounded-2xl border border-line/12 bg-canvas/55 p-4">
          <div className="mb-3 flex items-center justify-between text-xs">
            <span className="font-mono uppercase tracking-wider text-muted">6-Month Cash Velocity</span>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="flex items-center gap-1.5 text-lime-300">
                <span className="h-2 w-2 rounded-full bg-lime-300" /> Inflow
              </span>
              <span className="flex items-center gap-1.5 text-cyan-300">
                <span className="h-2 w-2 rounded-full bg-cyan-400" /> Outflow
              </span>
            </div>
          </div>
          <div className="flex h-28 items-end gap-3">
            {BARS.map((bar, index) => (
              <div key={bar.month} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex h-24 w-full items-end justify-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${bar.income}%` }}
                    transition={{ delay: 0.4 + index * 0.07, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full rounded-t-md bg-gradient-to-t from-emerald-500/50 to-lime-300"
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${bar.expense}%` }}
                    transition={{ delay: 0.48 + index * 0.07, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full rounded-t-md bg-gradient-to-t from-cyan-500/30 to-cyan-300/80"
                  />
                </div>
                <span className="font-mono text-[10px] text-muted">{bar.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl border border-line/10 bg-surface/65 p-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Inflow</p>
            <p className="mt-1 font-mono font-bold tabular-nums text-emerald-300">+$5,640</p>
          </div>
          <div className="rounded-xl border border-line/10 bg-surface/65 p-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Outflow</p>
            <p className="mt-1 font-mono font-bold tabular-nums text-fg">$2,790</p>
          </div>
          <div className="rounded-xl border border-lime-400/25 bg-lime-400/10 p-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-lime-300">Savings Rate</p>
            <p className="mt-1 font-mono font-bold tabular-nums text-lime-300">50.5%</p>
          </div>
        </div>
      </div>

      {/* Floating Budget Guardrail Card */}
      <div className="glass absolute -left-3 bottom-3 w-64 p-4 shadow-2xl animate-float [animation-delay:-2.2s]">
        <div className="mb-2.5 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-fg">
            <TrendingUp className="h-3.5 w-3.5 text-amber-300" />
            Dining Out Guardrail
          </span>
          <span className="font-mono font-bold text-amber-300">86%</span>
        </div>
        <ProgressBar value={86} tone="amber" marker={80} />
        <p className="mt-2.5 text-[11px] text-muted">
          Threshold alert triggered at 80% • <span className="font-mono text-fg">$44</span> left
        </p>
      </div>

      {/* Floating Goal Ring Card */}
      <div className="glass absolute -right-3 top-0 flex items-center gap-3.5 p-4 shadow-2xl animate-float [animation-delay:-4s]">
        <RingProgress value={84} size={54} stroke={5} color="#bef264">
          <span className="font-mono text-xs font-bold text-lime-300">84%</span>
        </RingProgress>
        <div>
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-lime-300">
            Goal Pacing <ArrowUpRight className="h-3 w-3" />
          </span>
          <p className="text-sm font-bold text-fg">Tokyo Reserve</p>
          <p className="font-mono text-xs text-muted">$2,688 / $3,200</p>
        </div>
      </div>
    </motion.div>
  );
}
