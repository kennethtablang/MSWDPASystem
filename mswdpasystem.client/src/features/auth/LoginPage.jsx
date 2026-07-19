import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn, ShieldCheck, QrCode, FileText } from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';
import Logo, { LogoMark } from '../../shared/components/ui/Logo';
import Button from '../../shared/components/ui/Button';
import FormField, { Input } from '../../shared/components/ui/FormField';
import MathCaptcha from '../../shared/components/ui/MathCaptcha';

const schema = z.object({
  userName: z.string().min(1, 'Enter your username or email.'),
  password: z.string().min(1, 'Enter your password.'),
  rememberMe: z.boolean().optional(),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  // Set when the session was ended for the user (e.g. the FR-1.9 idle timeout)
  // so they are told why they are back at the sign-in screen. Navigation state is
  // untrusted input here, so anything that is not a string is ignored rather than
  // handed to React as a child.
  const rawNotice = useLocation().state?.notice;
  const notice = typeof rawNotice === 'string' ? rawNotice : null;
  const [showPassword, setShowPassword] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      userName: localStorage.getItem('rememberedUserName') ?? '',
      rememberMe: !!localStorage.getItem('rememberedUserName'),
    },
  });

  const onSubmit = async ({ userName, password, rememberMe }) => {
    setServerError('');
    try {
      if (rememberMe) localStorage.setItem('rememberedUserName', userName);
      else localStorage.removeItem('rememberedUserName');
      const data = await login(userName, password);

      // Honour the user's chosen landing page. Citizens are always sent to the
      // portal — the staff pages would only 403 for them.
      const landing = data.role === 'Citizen'
        ? '/portal'
        : (data.preferences?.landingPage ?? '/dashboard');
      navigate(landing);
    } catch (err) {
      setServerError(err.response?.data?.message ?? 'Sign in failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Form panel */}
      <div className="flex flex-col flex-1 px-6 py-10 sm:px-10">
        <Link to="/" aria-label="Back to MSWD Caba home" className="self-start">
          <Logo size={40} />
        </Link>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="mt-1 text-sm text-gray-500">
              Sign in to the MSWD Caba Profiling &amp; Assistance System.
            </p>

            {notice && !serverError && (
              <div
                role="status"
                className="mt-5 px-4 py-3 bg-gold-50 border border-gold-300 rounded-lg text-sm text-gold-900"
              >
                {notice}
              </div>
            )}

            {serverError && (
              <div
                role="alert"
                className="mt-5 px-4 py-3 bg-accent-50 border border-accent-200 rounded-lg text-sm text-accent-800"
              >
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
              <FormField label="Username or Email" htmlFor="userName" error={errors.userName?.message}>
                <Input
                  id="userName"
                  type="text"
                  autoComplete="username"
                  placeholder="e.g. juandelacruz"
                  error={errors.userName?.message}
                  {...register('userName')}
                />
              </FormField>

              <FormField label="Password" htmlFor="password" error={errors.password?.message}>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="pr-10"
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FormField>

              <MathCaptcha onValidChange={setCaptchaValid} />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-700 focus:ring-primary-500"
                    {...register('rememberMe')}
                  />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-sm font-medium text-primary-700 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={isSubmitting}
                disabled={!captchaValid}
              >
                {!isSubmitting && <LogIn size={16} aria-hidden="true" />}
                {isSubmitting ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              New here?{' '}
              <Link to="/register" className="font-medium text-primary-700 hover:underline">
                Create a citizen account
              </Link>
            </p>

            <p className="mt-8 text-center text-xs text-gray-400">
              Authorized access only · Protected under RA 10173
              <br />
              (Data Privacy Act of 2012)
            </p>
          </div>
        </div>
      </div>

      {/* Illustration panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 text-white p-12">
        <div
          aria-hidden="true"
          className="absolute -right-32 -bottom-32 opacity-[0.08] pointer-events-none select-none"
        >
          <LogoMark size={520} />
        </div>

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
            Municipality of Caba · La Union
          </p>
          <h2 className="mt-4 text-3xl font-bold leading-tight max-w-md">
            One office. Every welfare service. Transparent records.
          </h2>
          <p className="mt-4 text-primary-200 max-w-md leading-relaxed">
            Profiling, assistance tracking, and QR-based identity verification for the Municipal
            Social Welfare and Development Office.
          </p>
        </div>

        <ul className="relative space-y-4 text-sm text-primary-100 dark:text-primary-200">
          <li className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-gold-400">
              <ShieldCheck size={18} aria-hidden="true" />
            </span>
            Role-based access with a full audit trail
          </li>
          <li className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-gold-400">
              <QrCode size={18} aria-hidden="true" />
            </span>
            QR-coded beneficiary identity verification
          </li>
          <li className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-gold-400">
              <FileText size={18} aria-hidden="true" />
            </span>
            Assistance requests tracked from intake to release
          </li>
        </ul>
      </div>
    </div>
  );
}
