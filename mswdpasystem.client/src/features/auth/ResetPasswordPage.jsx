import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Eye, EyeOff } from 'lucide-react';
import api from '../../shared/utils/api';
import AuthCard from './AuthCard';
import Button from '../../shared/components/ui/Button';
import FormField, { Input } from '../../shared/components/ui/FormField';
import PasswordStrength from '../../shared/components/ui/PasswordStrength';

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'At least 8 characters.')
      .regex(/[A-Z]/, 'Include an uppercase letter.')
      .regex(/[a-z]/, 'Include a lowercase letter.')
      .regex(/\d/, 'Include a digit.')
      .regex(/[^A-Za-z0-9]/, 'Include a special character.'),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const email = params.get('email') ?? '';
  const token = params.get('token') ?? '';
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState('');
  const [show, setShow] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const newPassword = useWatch({ control, name: 'newPassword' }) ?? '';

  if (!email || !token) {
    return (
      <AuthCard title="Invalid reset link" subtitle="This link is missing information or has expired.">
        <p className="text-sm text-gray-600">
          Request a new link from the{' '}
          <Link to="/forgot-password" className="font-medium text-primary-700 hover:underline">
            forgot password page
          </Link>
          .
        </p>
      </AuthCard>
    );
  }

  const onSubmit = async ({ newPassword }) => {
    setServerError('');
    try {
      await api.post('/auth/reset-password', { email, token, newPassword });
      setDone(true);
    } catch (err) {
      setServerError(err.response?.data?.message ?? 'The reset link is invalid or has expired.');
    }
  };

  return (
    <AuthCard title="Choose a new password" subtitle={`for ${email}`}>
      {done ? (
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 size={24} aria-hidden="true" />
          </div>
          <p className="mt-4 text-sm text-gray-700">
            Your password has been reset. You can now sign in with your new password.
          </p>
          <Button as={Link} to="/login" className="mt-5">
            Go to sign in
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError && (
            <div role="alert" className="px-4 py-3 bg-accent-50 border border-accent-200 rounded-lg text-sm text-accent-800">
              {serverError}
            </div>
          )}
          <FormField label="New password" htmlFor="newPassword" error={errors.newPassword?.message}>
            <div className="relative">
              <Input
                id="newPassword"
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                className="pr-10"
                error={errors.newPassword?.message}
                {...register('newPassword')}
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <PasswordStrength password={newPassword} className="mt-2" />
          </FormField>
          <FormField label="Confirm new password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
            <Input
              id="confirmPassword"
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </FormField>
          <Button type="submit" className="w-full" loading={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Reset password'}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
