import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const demoAccounts = [
  { role: 'Parent', email: 'parent@demo.com', pass: 'demo123' },
  { role: 'Teacher', email: 'teacher@demo.com', pass: 'demo123' },
  { role: 'Admin', email: 'admin@demo.com', pass: 'demo123' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(`/${user.role}`);
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[420px]"
      >
        {/* Logo */}
        <Link to="/" className="flex items-baseline gap-0.5 justify-center mb-8">
          <span className="font-display text-3xl font-semibold text-charcoal tracking-tight">NextStep</span>
          <span className="text-coral text-xs font-body font-bold">●</span>
          <span className="font-body text-sm font-semibold text-charcoal tracking-wider">AI</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-card p-8 md:p-10">
          <h2 className="font-display text-2xl md:text-3xl font-medium text-charcoal text-center mb-1">Welcome back</h2>
          <p className="font-body text-medium-gray text-center mb-8">Sign in to your portal</p>

          {error && (
            <div className="mb-4 p-3 bg-coral/10 border border-coral/20 rounded-lg text-coral text-sm font-body">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-body text-sm font-medium text-charcoal mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-medium-gray" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-[10px] border-[1.5px] border-light-gray bg-white font-body text-sm text-charcoal placeholder:text-medium-gray focus:border-coral focus:ring-[3px] focus:ring-coral/10 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-body text-sm font-medium text-charcoal mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-medium-gray" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 rounded-[10px] border-[1.5px] border-light-gray bg-white font-body text-sm text-charcoal placeholder:text-medium-gray focus:border-coral focus:ring-[3px] focus:ring-coral/10 outline-none transition-all"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-medium-gray hover:text-charcoal">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <span className="font-body text-sm text-coral cursor-default">Forgot password?</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-[10px] bg-coral text-white font-body font-semibold text-sm hover:bg-coral-dark transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Sign In <ArrowRight size={14} /></>}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="font-body text-sm text-medium-gray">
              Don't have an account? <Link to="/signup" className="text-coral font-semibold hover:underline">Sign up</Link>
            </p>
          </div>
        </div>

        {/* Demo Accounts */}
        <div className="mt-8">
          <p className="label-text text-medium-gray text-center mb-4">Demo Accounts — Click to Auto-fill</p>
          <div className="grid grid-cols-3 gap-3">
            {demoAccounts.map(acc => (
              <button
                key={acc.email}
                onClick={() => { setEmail(acc.email); setPassword(acc.pass); }}
                className="p-3 rounded-xl bg-white border border-light-gray hover:border-coral hover:shadow-card transition-all text-center"
              >
                <p className="font-body text-xs font-semibold text-charcoal">{acc.role}</p>
                <p className="font-body text-[10px] text-medium-gray mt-1">{acc.email}</p>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
