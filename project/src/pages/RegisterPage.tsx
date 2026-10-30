import { useMemo, useState, type FormEvent } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Eye, EyeOff, Sparkles } from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { Field, TextInput } from '@/components/ui/FormField';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RegisterErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
  terms?: string;
  form?: string;
}

function passwordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

const STRENGTH_LABEL = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];

export default function RegisterPage() {
  const { session, register, startDemo } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const strength = useMemo(() => passwordStrength(password), [password]);

  if (session) return <Navigate to="/app/dashboard" replace />;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: RegisterErrors = {};
    if (name.trim().length < 2) next.name = 'Enter your name.';
    if (!EMAIL_PATTERN.test(email.trim())) next.email = 'Enter a valid email address.';
    if (password.length < 8) next.password = 'Use at least 8 characters.';
    if (confirm !== password) next.confirm = 'Passwords do not match.';
    if (!terms) next.terms = 'Please accept the terms to continue.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      const error = await register(name, email, password);
      setSubmitting(false);
      if (error) {
        setErrors({ form: error });
        return;
      }
      navigate('/app/dashboard', { replace: true });
    } catch (err) {
      setSubmitting(false);
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      setErrors({ form: msg });
    }
  };

  const exploreDemo = () => {
    startDemo();
    navigate('/app/dashboard', { replace: true });
  };

  return (
    <AuthShell
      page="register"
      title="Create your workspace"
      subtitle="Start with a clean personal ledger or load sample data anytime from Settings."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-lime-300 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errors.form && (
          <div
            role="alert"
            className="rounded-xl border border-rose-500/35 bg-rose-500/12 px-4 py-3 text-xs font-medium text-rose-300"
          >
            {errors.form}
          </div>
        )}
        <Field label="Full Name" htmlFor="register-name" error={errors.name}>
          <TextInput
            id="register-name"
            autoComplete="name"
            placeholder="Jordan Lee"
            value={name}
            invalid={Boolean(errors.name)}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Field label="Email Address" htmlFor="register-email" error={errors.email}>
          <TextInput
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="jordan@spendsense.app"
            value={email}
            invalid={Boolean(errors.email)}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
        <Field label="Password" htmlFor="register-password" error={errors.password}>
          <div className="relative">
            <TextInput
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              invalid={Boolean(errors.password)}
              onChange={(event) => setPassword(event.target.value)}
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted transition hover:text-fg"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password && (
            <div className="mt-2 space-y-1.5">
              <div className="flex gap-1.5" aria-hidden="true">
                {[1, 2, 3, 4].map((level) => (
                  <span
                    key={level}
                    className={cn(
                      'h-1.5 flex-1 rounded-full transition-colors duration-300',
                      strength >= level
                        ? strength >= 3
                          ? 'bg-gradient-to-r from-lime-300 to-emerald-400'
                          : 'bg-amber-400'
                        : 'bg-line/15',
                    )}
                  />
                ))}
              </div>
              <p className="font-mono text-[11px] text-muted">Security: {STRENGTH_LABEL[strength]}</p>
            </div>
          )}
        </Field>
        <Field label="Confirm Password" htmlFor="register-confirm" error={errors.confirm}>
          <TextInput
            id="register-confirm"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Repeat your password"
            value={confirm}
            invalid={Boolean(errors.confirm)}
            onChange={(event) => setConfirm(event.target.value)}
          />
        </Field>

        <div className="space-y-1.5 pt-1">
          <label className="flex cursor-pointer items-start gap-3 text-xs text-muted">
            <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
              <input
                type="checkbox"
                checked={terms}
                onChange={(event) => setTerms(event.target.checked)}
                className="peer sr-only"
              />
              <span className="flex h-5 w-5 items-center justify-center rounded-md border border-line/30 bg-raised transition peer-checked:border-lime-300 peer-checked:bg-lime-300">
                {terms && <Check className="h-3.5 w-3.5 text-slate-950" strokeWidth={3} />}
              </span>
            </span>
            <span className="leading-relaxed">
              I agree to the <span className="font-medium text-fg">Terms of Service</span> and{' '}
              <span className="font-medium text-fg">Privacy Policy</span>.
            </span>
          </label>
          {errors.terms && (
            <p role="alert" className="text-xs font-medium text-rose-400">
              {errors.terms}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" loading={submitting} className="w-full">
          Create workspace
          <ArrowRight className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="sm" onClick={exploreDemo} className="w-full text-xs">
          <Sparkles className="h-3.5 w-3.5 text-lime-300" />
          Or explore with 6-month demo data first
        </Button>
      </form>
    </AuthShell>
  );
}
