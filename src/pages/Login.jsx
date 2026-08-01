import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      showToast('Welcome back! 🐝', 'success', 2000);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-hive-dark px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-hive-yellow flex items-center justify-center font-black text-black text-xl mb-3">B</div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Buzz<span className="text-hive-yellow">Hive</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Share Stories. Connect People.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-hive-panel border border-gray-200 dark:border-hive-border rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Welcome back</h2>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-100 dark:bg-white/5 rounded-lg px-3 py-2.5 text-sm outline-none text-gray-800 dark:text-gray-100"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Password</label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-100 dark:bg-white/5 rounded-lg px-3 py-2.5 text-sm outline-none text-gray-800 dark:text-gray-100"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg bg-hive-yellow text-black font-semibold hover:brightness-95 disabled:opacity-50 transition"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-hive-yellow font-semibold">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
