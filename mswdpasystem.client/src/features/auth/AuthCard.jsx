import { Link } from 'react-router-dom';
import Logo from '../../shared/components/ui/Logo';

/**
 * Centered card shell for the smaller auth pages (forgot/reset password,
 * email verification).
 */
export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-10">
      <Link to="/" aria-label="Back to MSWD Caba home">
        <Logo size={44} />
      </Link>
      <div className="mt-6 w-full max-w-md bg-white dark:bg-gray-100 rounded-2xl border border-gray-200 shadow-card p-6 sm:p-8">
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
