import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Gauge,
  Lightbulb,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { Badge } from '@/components/ui/Badge';
import { buttonStyles } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const FEATURES: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  body: string;
  metric: string;
  tone: string;
  span: string;
}[] = [
  {
    icon: Wallet,
    eyebrow: 'Proactive Guardrails',
    title: 'Budgets with 80% early-warning velocity radar',
    body: 'Set monthly category ceilings with one-click historical averages and receive instant alerts at 80% utilization before overspending happens.',
    metric: '80% Alert Threshold',
    tone: 'text-lime-300 bg-lime-400/12 ring-lime-400/30',
    span: 'md:col-span-2',
  },
  {
    icon: BarChart3,
    eyebrow: 'Cash-Flow Telemetry',
    title: 'Six-month inflow vs. outflow clarity',
    body: 'Track net liquidity, savings rate momentum, and weekday spending peaks with interactive visual analytics.',
    metric: 'Real-Time Net Worth',
    tone: 'text-cyan-300 bg-cyan-400/12 ring-cyan-400/30',
    span: 'md:col-span-1',
  },
  {
    icon: PiggyBank,
    eyebrow: 'Goal Pacing Engine',
    title: 'Automated monthly target calculations',
    body: 'Every savings goal calculates the exact monthly contribution required to hit your deadline on schedule.',
    metric: 'Dynamic Pacing',
    tone: 'text-emerald-300 bg-emerald-400/12 ring-emerald-400/30',
    span: 'md:col-span-1',
  },
  {
    icon: Lightbulb,
    eyebrow: 'Behavioral Intelligence',
    title: 'Actionable insights tailored to your ledger',
    body: 'Spots category spikes, recurring subscription creep, and unbudgeted top expenses automatically.',
    metric: 'Zero Generic Advice',
    tone: 'text-amber-300 bg-amber-400/12 ring-amber-400/30',
    span: 'md:col-span-1',
  },
  {
    icon: Gauge,
    eyebrow: 'Category Forensics',
    title: 'Month-over-month delta breakdowns',
    body: 'Compare every expense category against prior months and identify top merchants in a single glance.',
    metric: 'MoM Variance',
    tone: 'text-rose-300 bg-rose-500/12 ring-rose-500/30',
    span: 'md:col-span-1',
  },
  {
    icon: ShieldCheck,
    eyebrow: 'Sovereign Privacy',
    title: 'Local-first architecture with instant JSON portability',
    body: 'Your financial data stays under your control with one-click balance masking and full workspace backup.',
    metric: '100% Data Ownership',
    tone: 'text-sky-300 bg-sky-400/12 ring-sky-400/30',
    span: 'md:col-span-3',
  },
];

const STEPS = [
  {
    title: 'Log activity or launch with 6 months of demo telemetry',
    body: 'Record income and expenses in seconds with smart category tags, or load realistic sample data to test-drive every chart immediately.',
    tag: 'Step 01 • Capture',
  },
  {
    title: 'Calibrate category guardrails from your real averages',
    body: 'SpendSense calculates your trailing 3-month category spend and suggests realistic monthly limits with a single click.',
    tag: 'Step 02 • Calibrate',
  },
  {
    title: 'Compound your savings rate with automated pacing',
    body: 'Watch your net worth sparkline climb as proactive alerts prevent category overruns and keep every goal on schedule.',
    tag: 'Step 03 • Compound',
  },
];

const REVEAL = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

export function FeaturesSection() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div {...REVEAL} className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <Badge tone="lime" dot>
              Fintech Architecture
            </Badge>
            <h2 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Engineered like a trading desk. <span className="text-gradient">Calm like a notebook.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted">
            Every surface is designed to surface signal over noise—combining tabular precision with effortless daily
            workflows.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <motion.article
              key={feature.title}
              {...REVEAL}
              transition={{ ...REVEAL.transition, delay: index * 0.06 }}
              className={cn('card card-interactive group relative flex flex-col justify-between overflow-hidden p-7', feature.span)}
            >
              <div>
                <div className="flex items-center justify-between gap-4">
                  <span className={cn('flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ring-inset', feature.tone)}>
                    <feature.icon className="h-6 w-6" />
                  </span>
                  <span className="rounded-full border border-line/15 bg-raised/70 px-3 py-1 font-mono text-[11px] font-semibold text-muted">
                    {feature.metric}
                  </span>
                </div>
                <p className="mt-6 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                  {feature.eyebrow}
                </p>
                <h3 className="mt-2 text-xl font-bold tracking-tight text-fg">{feature.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">{feature.body}</p>
              </div>
              <div className="mt-6 h-0.5 w-10 rounded-full bg-gradient-to-r from-lime-300 to-cyan-400 transition-all duration-300 group-hover:w-full" />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StepsSection() {
  return (
    <section id="how-it-works" className="px-6 py-24">
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <motion.div {...REVEAL} className="card-mesh p-8 sm:p-10">
          <Badge tone="cyan" dot>
            How It Works
          </Badge>
          <h2 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl">
            From scattered receipts to a high-conviction wealth plan.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
            No cluttered spreadsheets or rigid accounting jargon. SpendSense automates the analysis so you can focus on
            decisions that move your net worth.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-fg/90">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-lime-300" />
              Real-time budget status recalculation on every transaction
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-lime-300" />
              Multi-currency formatting (USD, EUR, GBP, INR)
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-lime-300" />
              One-click privacy shield for working in public spaces
            </li>
          </ul>
        </motion.div>

        <ol className="space-y-5">
          {STEPS.map((step, index) => (
            <motion.li
              key={step.title}
              {...REVEAL}
              transition={{ ...REVEAL.transition, delay: index * 0.1 }}
              className="card card-interactive flex gap-5 p-6 sm:p-7"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-lime-400/30 bg-lime-400/10 font-mono text-base font-bold text-lime-300">
                0{index + 1}
              </span>
              <div>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-emerald-300">
                  {step.tag}
                </span>
                <h3 className="mt-1 text-lg font-bold text-fg">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const STORIES = [
  {
    quote: 'The 80% budget velocity alert saved me from a painful month-end. It warned me days before my bank statement ever would.',
    name: 'Marcus T.',
    role: 'Systems Engineer',
    metric: '+28% Savings Rate',
  },
  {
    quote: 'I stopped opening three different finance apps every week. The goal pacing ring tells me exactly how much to set aside on payday.',
    name: 'Elena R.',
    role: 'Product Designer',
    metric: '$9,000 Emergency Fund',
  },
  {
    quote: 'Finally a personal finance tool that feels like modern software instead of a tax spreadsheet. The dark mode aesthetic is unmatched.',
    name: 'Devon K.',
    role: 'Quantitative Analyst',
    metric: '6 Budgets Automated',
  },
];

export function StoriesSection() {
  return (
    <section id="stories" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div {...REVEAL} className="max-w-2xl">
          <Badge tone="emerald" dot>
            Verified Outcomes
          </Badge>
          <h2 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">
            Trusted by builders, designers, and operators.
          </h2>
        </motion.div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {STORIES.map((story, index) => (
            <motion.figure
              key={story.name}
              {...REVEAL}
              transition={{ ...REVEAL.transition, delay: index * 0.08 }}
              className="glass flex flex-col justify-between p-7"
            >
              <div>
                <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-lime-400/25 bg-lime-400/10 px-3 py-1 font-mono text-xs font-semibold text-lime-300">
                  <Sparkles className="h-3 w-3" />
                  {story.metric}
                </div>
                <blockquote className="text-base leading-relaxed text-fg/90">&ldquo;{story.quote}&rdquo;</blockquote>
              </div>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-line/10 pt-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-lime-300 to-cyan-400 font-mono text-xs font-bold text-slate-950">
                  {story.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </span>
                <div>
                  <p className="text-sm font-semibold text-fg">{story.name}</p>
                  <p className="text-xs text-muted">{story.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="px-6 pb-24 pt-8">
      <motion.div
        {...REVEAL}
        className="card-mesh relative mx-auto max-w-6xl overflow-hidden px-8 py-16 text-center sm:px-16 sm:py-20"
      >
        <div className="relative">
          <Badge tone="lime" dot>
            Ready in 30 Seconds
          </Badge>
          <h2 className="mx-auto mt-5 max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
            Start your next month with <span className="text-gradient">total financial clarity.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted">
            Create your free workspace in under a minute, or jump straight into the live sandbox with six months of sample
            data.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <Link to="/register" className={buttonStyles({ size: 'lg', className: 'group' })}>
              Create free account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/login" className={buttonStyles({ variant: 'secondary', size: 'lg' })}>
              Sign in to workspace
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-line/10 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 text-sm text-muted sm:flex-row">
        <Logo wordmarkClassName="text-base" />
        <p className="font-mono text-xs">&copy; {new Date().getFullYear()} SpendSense Financial Technologies. Crafted for clarity.</p>
      </div>
    </footer>
  );
}
