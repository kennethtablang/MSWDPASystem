import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ userName: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.userName, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-blue-900 text-white p-12">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-lg">M</div>
            <span className="font-semibold text-lg">MSWD Caba, La Union</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Web-Based Profiling &<br />Assistance System
          </h1>
          <p className="text-blue-300 text-base leading-relaxed max-w-md">
            A centralized digital platform for beneficiary profiling, welfare assistance tracking,
            and QR-based identity verification for the Municipal Social Welfare and Development Office.
          </p>
        </div>
        <div className="flex gap-8 text-sm text-blue-300">
          <div><p className="text-2xl font-bold text-white">6</p><p>Welfare Programs</p></div>
          <div><p className="text-2xl font-bold text-white">8</p><p>System Modules</p></div>
          <div><p className="text-2xl font-bold text-white">3</p><p>User Roles</p></div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-col justify-center items-center flex-1 px-6 py-12 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-gray-900">Sign in to your account</h2>
            <p className="mt-1 text-sm text-gray-500">Enter your credentials to access the system</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="userName">
                Username or Email
              </label>
              <input
                id="userName"
                name="userName"
                type="text"
                autoComplete="username"
                required
                value={form.userName}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-700 text-white text-sm font-semibold rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <LogIn size={16} />
              )}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-400">
            MSWD Caba, La Union — Authorized Access Only<br />
            Pursuant to RA 10173 (Data Privacy Act of 2012)
          </p>
        </div>
      </div>
    </div>
  );
}
