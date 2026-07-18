import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import api from '../../shared/utils/api';
import AuthCard from './AuthCard';
import Button from '../../shared/components/ui/Button';
import LoadingSpinner from '../../shared/components/LoadingSpinner';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const userId = params.get('userId');
  const token = params.get('token');
  const hasParams = !!userId && !!token;
  // Missing-link state is derived up front so the effect never calls setState synchronously.
  const [status, setStatus] = useState(() => (hasParams ? 'verifying' : 'error'));
  const [message, setMessage] = useState(() =>
    hasParams ? '' : 'This verification link is missing required information.');
  const ran = useRef(false);

  useEffect(() => {
    if (!hasParams || ran.current) return undefined;
    ran.current = true;
    let active = true;

    api.post('/auth/confirm-email', { userId, token })
      .then((res) => {
        if (!active) return;
        setStatus('success');
        setMessage(res.data?.message ?? 'Email verified. You can now sign in.');
      })
      .catch((err) => {
        if (!active) return;
        setStatus('error');
        setMessage(err.response?.data?.message ?? 'This verification link is invalid or has expired.');
      });

    return () => { active = false; };
  }, [userId, token, hasParams]);

  return (
    <AuthCard title="Email verification">
      {status === 'verifying' && (
        <div className="text-center py-4">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-gray-600">Verifying your email address…</p>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 size={24} aria-hidden="true" />
          </div>
          <p className="mt-4 text-sm text-gray-700">{message}</p>
          <Button as={Link} to="/login" variant="primary" className="mt-5">Continue to sign in</Button>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-100 text-accent-700">
            <XCircle size={24} aria-hidden="true" />
          </div>
          <p className="mt-4 text-sm text-gray-700">{message}</p>
          <p className="mt-5 text-sm">
            <Link to="/login" className="font-medium text-primary-700 hover:underline">Back to sign in</Link>
          </p>
        </div>
      )}
    </AuthCard>
  );
}
