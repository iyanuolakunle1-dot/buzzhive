import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const passwordRules = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'One lowercase letter', test: (v) => /[a-z]/.test(v) },
  { label: 'One number', test: (v) => /[0-9]/.test(v) },
];

export default function Register() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  const passwordValid = passwordRules.every((r) => r.test(form.password));
  const passwordsMatch = form.confirmPassword.length > 0 && form.password === form.confirmPassword;
  const showMismatch = form.confirmPassword.length > 0 && !passwordsMatch;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!passwordValid) {
      setError('Please meet all password requirements below.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // confirmPassword is a client-side check only — never sent to the API
      await register(form.name, form.username, form.email, form.password);
      showToast('Account created — welcome to BuzzHive! 🐝', 'success', 2500);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-hive-dark px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-hive-yellow flex items-center justify-center font-black text-black text-xl mb-3">B</div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Buzz<span className="text-hive-yellow">Hive</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Share Stories. Connect People.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-hive-panel border border-gray-200 dark:border-hive-border rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create your account</h2>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Full name</label>
            <input required value={form.name} onChange={update('name')}
              className="w-full bg-gray-100 dark:bg-white/5 rounded-lg px-3 py-2.5 text-sm outline-none text-gray-800 dark:text-gray-100" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Username</label>
            <input required value={form.username} onChange={update('username')}
              className="w-full bg-gray-100 dark:bg-white/5 rounded-lg px-3 py-2.5 text-sm outline-none text-gray-800 dark:text-gray-100" placeholder="johndoe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Email</label>
            <input type="email" required value={form.email} onChange={update('email')}
              className="w-full bg-gray-100 dark:bg-white/5 rounded-lg px-3 py-2.5 text-sm outline-none text-gray-800 dark:text-gray-100" placeholder="you@example.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required value={form.password} onChange={update('password')}
                className="w-full bg-gray-100 dark:bg-white/5 rounded-lg px-3 py-2.5 pr-10 text-sm outline-none text-gray-800 dark:text-gray-100"
                placeholder="Create a strong password"
              />
              <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {form.password.length > 0 && (
              <ul className="mt-2 space-y-1">
                {passwordRules.map((rule) => {
                  const ok = rule.test(form.password);
                  return (
                    <li key={rule.label} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-green-500' : 'text-gray-400'}`}>
                      {ok ? <Check size={12} /> : <X size={12} />} {rule.label}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Confirm password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required value={form.confirmPassword} onChange={update('confirmPassword')}
                className={`w-full bg-gray-100 dark:bg-white/5 rounded-lg px-3 py-2.5 pr-10 text-sm outline-none text-gray-800 dark:text-gray-100 ${
                  showMismatch ? 'ring-1 ring-red-400' : ''
                }`}
                placeholder="Re-enter your password"
              />
              <button type="button" onClick={() => setShowConfirm((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {showMismatch && <p className="mt-1 text-xs text-red-500">Passwords don't match.</p>}
            {passwordsMatch && <p className="mt-1 text-xs text-green-500 flex items-center gap-1"><Check size={12} /> Passwords match</p>}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg bg-hive-yellow text-black font-semibold hover:brightness-95 disabled:opacity-50 transition">
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-hive-yellow font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
