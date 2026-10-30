import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { Field, TextInput } from '@/components/ui/FormField';
import { useAuth } from '@/context/AuthContext';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const { session, login, startDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/app/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  if (session) return <Navigate to="/app/dashboard" replace />;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (!EMAIL_PATTERN.test(email.trim())) next.email = 'Enter a valid email address.';
    if (password.length < 6) next.password = 'Your password must be at least 6 characters.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      const error = await login(email, password);
      setSubmitting(false);
      if (error) {
        setErrors({ form: error });
        return;
      }
      navigate(from, { replace: true });
    } catch (err) {
      setSubmitting(false);
      const msg = err instanceof Error ? err.message : 'Login failed.';
      setErrors({ form: msg });
    }
  };

  const exploreDemo = () => {
    startDemo();
    navigate('/app/dashboard', { replace: true });
  };

  return (
    <AuthShell
      page="login"
      title="Welcome back"
      subtitle="Sign in to inspect your monthly cash velocity, budgets, and savings goals."
      footer={
        <>
          New to SpendSense?{' '}
          <Link to="/register" className="font-semibold text-lime-300 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {errors.form && (
          <div
            role="alert"
            className="rounded-xl border border-rose-500/35 bg-rose-500/12 px-4 py-3 text-xs font-medium text-rose-300"
          >
            {errors.form}
          </div>
        )}
        <Field label="Email Address" htmlFor="login-email" error={errors.email}>
          <TextInput
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="alex@spendsense.app"
            value={email}
            invalid={Boolean(errors.email)}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
        <Field label="Password" htmlFor="login-password" error={errors.password}>
          <div className="relative">
            <TextInput
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
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
        </Field>
        <Button type="submit" size="lg" loading={submitting} className="w-full">
          Sign in to workspace
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <div className="relative my-6 flex items-center gap-4 font-mono text-[11px] uppercase tracking-widest text-muted">
        <span className="h-px flex-1 bg-line/15" />
        instant sandbox
        <span className="h-px flex-1 bg-line/15" />
      </div>

      <Button variant="secondary" size="lg" className="w-full" onClick={exploreDemo}>
        <Sparkles className="h-4 w-4 text-lime-300" />
        Launch interactive demo
      </Button>
      <p className="mt-2.5 text-center font-mono text-[11px] text-muted">
        Pre-loads 6 months of realistic transactions, budgets &amp; goals.
      </p>
    </AuthShell>
  );
}
