import { useState, type FormEvent } from 'react';
import {
  Bell,
  Database,
  Download,
  Moon,
  Shield,
  Sparkles,
  Sun,
  Trash2,
  User,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { usePageLoading } from '@/hooks/usePageLoading';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Field, SelectInput, TextInput } from '@/components/ui/FormField';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CURRENCY_OPTIONS } from '@/lib/format';
import type { CurrencyCode } from '@/types/finance';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { data, updateSettings, replaceData, loadSampleData, clearAllData } = useFinance();
  const { theme, toggleTheme } = useTheme();
  const { notify } = useToast();
  const loading = usePageLoading();

  const [name, setName] = useState(data.settings.name);
  const [email, setEmail] = useState(data.settings.email);
  const [currency, setCurrency] = useState<CurrencyCode>(data.settings.currency);
  const [openingBalance, setOpeningBalance] = useState(String(data.openingBalance));
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  if (loading) return <PageSkeleton variant="list" />;

  const handleProfileSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedOpening = Number(openingBalance);
    const validOpening = !Number.isNaN(parsedOpening) ? parsedOpening : undefined;

    updateSettings({
      name: name.trim() || 'Alex Morgan',
      email: email.trim(),
      currency,
      openingBalance: validOpening,
    });

    if (validOpening !== undefined && validOpening !== data.openingBalance) {
      replaceData({
        ...data,
        openingBalance: validOpening,
        settings: {
          ...data.settings,
          name: name.trim() || 'Alex Morgan',
          email: email.trim(),
          currency,
        },
      });
    }
    notify({ tone: 'success', title: 'Preferences saved', message: 'Your workspace profile and currency are updated.' });
  };

  const handleExportBackup = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `spendsense-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    notify({ tone: 'info', title: 'Workspace exported', message: 'Downloaded full JSON ledger backup.' });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workspace Configuration"
        title="Settings & Profile"
        description="Customize your personal profile, display currency, privacy shield, alert preferences, and local ledger data."
      />

      <div className="grid gap-6 xl:grid-cols-12">
        {/* Profile & Currency Form */}
        <section className="card p-6 sm:p-7 xl:col-span-7">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400/12 text-lime-300 ring-1 ring-lime-400/30">
              <User className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold">Profile &amp; Base Currency</h2>
              <p className="text-xs text-muted">Used across your dashboard, greetings, and formatted numbers</p>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Display Name" htmlFor="settings-name">
                <TextInput
                  id="settings-name"
                  value={name}
                  placeholder="Alex Morgan"
                  onChange={(event) => setName(event.target.value)}
                />
              </Field>
              <Field label="Email Address" htmlFor="settings-email">
                <TextInput
                  id="settings-email"
                  type="email"
                  value={email}
                  placeholder="alex@spendsense.app"
                  onChange={(event) => setEmail(event.target.value)}
                />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Display Currency" htmlFor="settings-currency" hint="Formats all balances, budgets, and charts">
                <SelectInput
                  id="settings-currency"
                  value={currency}
                  onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
                >
                  {CURRENCY_OPTIONS.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.label}
                    </option>
                  ))}
                </SelectInput>
              </Field>

              <Field
                label="Opening Reserve Balance"
                htmlFor="settings-opening-balance"
                hint="Starting account balance before logged transactions"
              >
                <TextInput
                  id="settings-opening-balance"
                  type="number"
                  step="1"
                  value={openingBalance}
                  onChange={(event) => setOpeningBalance(event.target.value)}
                  className="font-mono"
                />
              </Field>
            </div>

            <div className="flex justify-end border-t border-line/10 pt-4">
              <Button type="submit">Save profile changes</Button>
            </div>
          </form>
        </section>

        {/* Appearance & Privacy Shield */}
        <section className="card flex flex-col justify-between p-6 sm:p-7 xl:col-span-5">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/12 text-cyan-300 ring-1 ring-cyan-400/30">
                <Shield className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold">Appearance &amp; Privacy</h2>
                <p className="text-xs text-muted">Switch interface theme and control sensitive balance visibility</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => theme !== 'dark' && toggleTheme()}
                className={cn(
                  'flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all',
                  theme === 'dark'
                    ? 'border-lime-400/50 bg-lime-400/10 shadow-[0_0_20px_-6px_rgba(190,242,100,0.3)]'
                    : 'border-line/15 bg-raised/50 text-muted hover:text-fg',
                )}
              >
                <Moon className="h-5 w-5 text-lime-300" />
                <div>
                  <p className="text-sm font-bold text-fg">Midnight Obsidian</p>
                  <p className="text-xs text-muted">High-contrast dark fintech</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => theme !== 'light' && toggleTheme()}
                className={cn(
                  'flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all',
                  theme === 'light'
                    ? 'border-emerald-500/50 bg-emerald-500/10'
                    : 'border-line/15 bg-raised/50 text-muted hover:text-fg',
                )}
              >
                <Sun className="h-5 w-5 text-amber-400" />
                <div>
                  <p className="text-sm font-bold text-fg">Daylight Alabaster</p>
                  <p className="text-xs text-muted">Crisp editorial light mode</p>
                </div>
              </button>
            </div>

            <div className="mt-6 border-t border-line/10 pt-2">
              <ToggleSwitch
                checked={data.settings.hideBalance}
                onChange={(checked) => updateSettings({ hideBalance: checked })}
                label="Privacy Shield (Hide Balances)"
                description="Mask dollar figures across the dashboard, ledger, and sidebar when working in public."
              />
            </div>
          </div>
        </section>

        {/* Notification Controls */}
        <section className="card p-6 sm:p-7 xl:col-span-7">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/12 text-amber-300 ring-1 ring-amber-400/30">
              <Bell className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold">Telemetry &amp; Alert Preferences</h2>
              <p className="text-xs text-muted">Choose which real-time financial events trigger in-app notifications</p>
            </div>
          </div>

          <div className="divide-y divide-line/10">
            <ToggleSwitch
              checked={data.settings.notifications.budgetAlerts}
              onChange={(checked) =>
                updateSettings({
                  notifications: { ...data.settings.notifications, budgetAlerts: checked },
                })
              }
              label="80% Budget Velocity Warnings"
              description="Notify immediately when a new expense pushes a category past 80% or 100% of its monthly ceiling."
            />
            <ToggleSwitch
              checked={data.settings.notifications.goalMilestones}
              onChange={(checked) =>
                updateSettings({
                  notifications: { ...data.settings.notifications, goalMilestones: checked },
                })
              }
              label="Savings Goal Completion Celebrations"
              description="Alert when a contribution fully funds one of your active savings goals."
            />
            <ToggleSwitch
              checked={data.settings.notifications.weeklyDigest}
              onChange={(checked) =>
                updateSettings({
                  notifications: { ...data.settings.notifications, weeklyDigest: checked },
                })
              }
              label="Weekly Cash-Flow Digest"
              description="Surface weekly spending rhythm summaries and subscription reminders."
            />
          </div>
        </section>

        {/* Sandbox & Data Portability */}
        <section className="card flex flex-col justify-between p-6 sm:p-7 xl:col-span-5">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/12 text-emerald-300 ring-1 ring-emerald-400/30">
                <Database className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold">Workspace Data &amp; Sandbox</h2>
                <p className="text-xs text-muted">Manage sample telemetry, export backups, or reset your ledger</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-line/12 bg-raised/45 p-4">
                <p className="text-sm font-bold text-fg">Populate 6-Month Demo Dataset</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  Replaces current transactions, budgets, and goals with six months of realistic sample activity.
                </p>
                <Button variant="secondary" size="sm" onClick={loadSampleData} className="mt-3">
                  <Sparkles className="h-4 w-4 text-lime-300" />
                  Load sample data
                </Button>
              </div>

              <div className="rounded-2xl border border-line/12 bg-raised/45 p-4">
                <p className="text-sm font-bold text-fg">Export Full JSON Backup</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  Download a portable JSON snapshot of your transactions, budgets, goals, and settings.
                </p>
                <Button variant="secondary" size="sm" onClick={handleExportBackup} className="mt-3">
                  <Download className="h-4 w-4 text-cyan-300" />
                  Download JSON backup
                </Button>
              </div>

              <div className="rounded-2xl border border-rose-500/25 bg-rose-500/8 p-4">
                <p className="text-sm font-bold text-rose-300">Reset Workspace Ledger</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  Permanently clears all transactions, budgets, and savings goals from this browser.
                </p>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setConfirmClearOpen(true)}
                  className="mt-3"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear all workspace data
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        onConfirm={clearAllData}
        title="Clear all workspace data?"
        description="This will remove every transaction, monthly budget, and savings goal stored on this device. Your account profile will remain signed in."
        confirmLabel="Clear all data"
      />
    </div>
  );
}
