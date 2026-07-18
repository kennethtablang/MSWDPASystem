import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, UserPlus, MailCheck } from 'lucide-react';
import api from '../../shared/utils/api';
import Logo, { LogoMark } from '../../shared/components/ui/Logo';
import Button from '../../shared/components/ui/Button';
import FormField, { Input, Select } from '../../shared/components/ui/FormField';
import PasswordStrength from '../../shared/components/ui/PasswordStrength';
import MathCaptcha from '../../shared/components/ui/MathCaptcha';

// Official barangays of Caba, La Union.
const BARANGAYS = [
  'Bautista', 'Gana', 'Juan Cariño', 'Las-ud', 'Liquicia', 'Poblacion Norte',
  'Poblacion Sur', 'San Carlos', 'San Cornelio', 'San Fermin', 'San Gregorio',
  'San Jose', 'Santiago Norte', 'Santiago Sur', 'Sobol', 'Urayong', 'Wenceslao',
];

const schema = z.object({
  fullName: z.string().min(1, 'Enter your full name.').max(150),
  userName: z.string().min(3, 'At least 3 characters.').max(50)
    .regex(/^[a-zA-Z0-9._-]+$/, 'Letters, numbers, and . _ - only.'),
  email: z.string().email('Enter a valid email address.'),
  contactNumber: z.string().max(20).optional().or(z.literal('')),
  barangay: z.string().min(1, 'Select your barangay.'),
  password: z.string().min(8, 'At least 8 characters.')
    .regex(/[A-Z]/, 'Include an uppercase letter.')
    .regex(/[a-z]/, 'Include a lowercase letter.')
    .regex(/[0-9]/, 'Include a number.')
    .regex(/[^a-zA-Z0-9]/, 'Include a special character.'),
  confirmPassword: z.string().min(1, 'Confirm your password.'),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms.' }) }),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [serverError, setServerError] = useState('');
  const [result, setResult] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { barangay: '' } });

  const password = useWatch({ control, name: 'password' }) ?? '';

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const { data } = await api.post('/auth/register', {
        fullName: values.fullName,
        userName: values.userName,
        email: values.email,
        contactNumber: values.contactNumber || null,
        barangay: values.barangay,
        password: values.password,
        acceptTerms: values.acceptTerms,
      });
      setResult(data);
    } catch (err) {
      const errs = err.response?.data?.errors;
      setServerError(Array.isArray(errs) && errs.length ? errs.join(' ') : (err.response?.data?.message ?? 'Registration failed. Please try again.'));
    }
  };

  if (result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-10">
        <Link to="/" aria-label="Back to MSWD Caba home"><Logo size={44} /></Link>
        <div className="mt-6 w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-card p-6 sm:p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <MailCheck size={24} aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-gray-900">Check your email</h1>
          <p className="mt-2 text-sm text-gray-600">{result.message}</p>
          {result.devConfirmationLink && (
            <Button as="a" href={result.devConfirmationLink} variant="secondary" className="mt-4">
              Open verification link (development)
            </Button>
          )}
          <p className="mt-6 text-sm">
            <Link to="/login" className="font-medium text-primary-700 hover:underline">Back to sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="flex flex-col flex-1 px-6 py-10 sm:px-10">
        <Link to="/" aria-label="Back to MSWD Caba home" className="self-start">
          <Logo size={40} />
        </Link>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <h1 className="text-2xl font-bold text-gray-900">Create a citizen account</h1>
            <p className="mt-1 text-sm text-gray-500">
              Register to track your MSWD Caba assistance requests online.
            </p>

            {serverError && (
              <div role="alert" className="mt-5 px-4 py-3 bg-accent-50 border border-accent-200 rounded-lg text-sm text-accent-800">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
              <FormField label="Full Name" htmlFor="fullName" required error={errors.fullName?.message}>
                <Input id="fullName" autoComplete="name" placeholder="Juan Dela Cruz" error={errors.fullName?.message} {...register('fullName')} />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Username" htmlFor="userName" required error={errors.userName?.message}>
                  <Input id="userName" autoComplete="username" placeholder="juandelacruz" error={errors.userName?.message} {...register('userName')} />
                </FormField>
                <FormField label="Barangay" htmlFor="barangay" required error={errors.barangay?.message}>
                  <Select id="barangay" error={errors.barangay?.message} {...register('barangay')}>
                    <option value="">Select…</option>
                    {BARANGAYS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </Select>
                </FormField>
              </div>

              <FormField label="Email Address" htmlFor="email" required error={errors.email?.message}>
                <Input id="email" type="email" autoComplete="email" placeholder="juan@example.com" error={errors.email?.message} {...register('email')} />
              </FormField>

              <FormField label="Contact Number" htmlFor="contactNumber" error={errors.contactNumber?.message} hint="Optional">
                <Input id="contactNumber" autoComplete="tel" placeholder="09XX XXX XXXX" error={errors.contactNumber?.message} {...register('contactNumber')} />
              </FormField>

              <FormField label="Password" htmlFor="password" required error={errors.password?.message}>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                    placeholder="Create a password" className="pr-10" error={errors.password?.message} {...register('password')} />
                  <button type="button" onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {password && <div className="mt-2"><PasswordStrength password={password} /></div>}
              </FormField>

              <FormField label="Confirm Password" htmlFor="confirmPassword" required error={errors.confirmPassword?.message}>
                <Input id="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                  placeholder="Re-enter your password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
              </FormField>

              <div>
                <label className="flex items-start gap-2 text-sm text-gray-600">
                  <input type="checkbox" className="mt-0.5 rounded border-gray-300 text-primary-700 focus:ring-primary-500" {...register('acceptTerms')} />
                  <span>
                    I agree to the processing of my personal data under the{' '}
                    <Link to="/privacy" className="font-medium text-primary-700 hover:underline">Data Privacy Act (RA 10173)</Link>.
                  </span>
                </label>
                {errors.acceptTerms && <p className="mt-1 text-xs text-accent-700">{errors.acceptTerms.message}</p>}
              </div>

              <MathCaptcha onValidChange={setCaptchaValid} />

              <Button type="submit" className="w-full" loading={isSubmitting} disabled={!captchaValid}>
                {!isSubmitting && <UserPlus size={16} aria-hidden="true" />}
                {isSubmitting ? 'Creating account…' : 'Create Account'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-700 hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 text-white p-12">
        <div aria-hidden="true" className="absolute -right-32 -bottom-32 opacity-[0.08] pointer-events-none select-none">
          <LogoMark size={520} />
        </div>
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">Municipality of Caba · La Union</p>
          <h2 className="mt-4 text-3xl font-bold leading-tight max-w-md">Your welfare records, accessible to you.</h2>
          <p className="mt-4 text-primary-200 max-w-md leading-relaxed">
            Create an account to view your beneficiary profile and follow your assistance
            requests from submission to release.
          </p>
        </div>
        <p className="relative text-xs text-primary-300 max-w-md">
          Your data is processed solely for MSWD Caba welfare services in compliance with the
          Data Privacy Act of 2012 (RA 10173).
        </p>
      </div>
    </div>
  );
}
