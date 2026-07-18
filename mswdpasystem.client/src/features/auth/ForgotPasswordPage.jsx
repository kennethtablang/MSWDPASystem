import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MailCheck } from 'lucide-react';
import api from '../../shared/utils/api';
import AuthCard from './AuthCard';
import Button from '../../shared/components/ui/Button';
import FormField, { Input } from '../../shared/components/ui/FormField';

const schema = z.object({
  email: z.string().email('Enter a valid email address.'),
});

export default function ForgotPasswordPage() {
  const [result, setResult] = useState(null);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }) => {
    setServerError('');
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setResult(data);
    } catch {
      setServerError('Something went wrong. Please try again.');
    }
  };

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter the email address of your account and we'll send you a reset link."
    >
      {result ? (
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <MailCheck size={24} aria-hidden="true" />
          </div>
          <p className="mt-4 text-sm text-gray-700">{result.message}</p>
          {result.devResetLink && (
            <Button as="a" href={result.devResetLink} variant="secondary" className="mt-4">
              Open reset link (development)
            </Button>
          )}
          <p className="mt-6 text-sm">
            <Link to="/login" className="font-medium text-primary-700 hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError && (
            <div role="alert" className="px-4 py-3 bg-accent-50 border border-accent-200 rounded-lg text-sm text-accent-800">
              {serverError}
            </div>
          )}
          <FormField label="Email address" htmlFor="email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
          </FormField>
          <Button type="submit" className="w-full" loading={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Send reset link'}
          </Button>
          <p className="text-center text-sm text-gray-600">
            Remembered it?{' '}
            <Link to="/login" className="font-medium text-primary-700 hover:underline">
              Back to sign in
            </Link>
          </p>
        </form>
      )}
    </AuthCard>
  );
}
