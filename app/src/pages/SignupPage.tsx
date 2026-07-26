import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Heart,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function SignupPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateStep1 = () => {
    if (!fullName.trim()) return 'Full name is required';
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password !== confirmPassword) return 'Passwords do not match';
    return '';
  };

  const handleNext = () => {
    const err = validateStep1();

    if (err) {
      setError(err);
      return;
    }

    setError('');
    setStep(2);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setLoading(true);
    setError('');

    try {
      await register({
        email,
        password,
        fullName,
        role: 'parent',
      });

      navigate('/parent');
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
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
        <Link to="/" className="flex items-baseline gap-0.5 justify-center mb-8">
          <span className="font-display text-3xl font-semibold text-charcoal tracking-tight">
            NextStep
          </span>
          <span className="text-coral text-xs font-body font-bold">.</span>
          <span className="font-body text-sm font-semibold text-charcoal tracking-wider">
            AI
          </span>
        </Link>

        <div className="bg-white rounded-2xl shadow-card p-8 md:p-10">
          <div className="flex items-center justify-between mb-6">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="text-medium-gray hover:text-charcoal transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
            )}

            <p className="font-body text-xs text-medium-gray ml-auto">
              Step {step} of 2
            </p>
          </div>

          <h2 className="font-display text-2xl md:text-3xl font-medium text-charcoal text-center mb-1">
            {step === 1 ? 'Get started' : 'Parent portal'}
          </h2>

          <p className="font-body text-medium-gray text-center mb-8">
            {step === 1 ? 'Create your account' : 'Confirm your parent account'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-coral/10 border border-coral/20 rounded-lg text-coral text-sm font-body">
              {error}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <label className="block font-body text-sm font-medium text-charcoal mb-1.5">
                  Full Name
                </label>

                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-medium-gray"
                  />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Your full name"
                    className="w-full pl-10 pr-4 py-3 rounded-[10px] border-[1.5px] border-light-gray bg-white font-body text-sm text-charcoal placeholder:text-medium-gray focus:border-coral focus:ring-[3px] focus:ring-coral/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-body text-sm font-medium text-charcoal mb-1.5">
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-medium-gray"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-[10px] border-[1.5px] border-light-gray bg-white font-body text-sm text-charcoal placeholder:text-medium-gray focus:border-coral focus:ring-[3px] focus:ring-coral/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-body text-sm font-medium text-charcoal mb-1.5">
                  Password
                </label>

                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-medium-gray"
                  />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-10 pr-10 py-3 rounded-[10px] border-[1.5px] border-light-gray bg-white font-body text-sm text-charcoal placeholder:text-medium-gray focus:border-coral focus:ring-[3px] focus:ring-coral/10 outline-none transition-all"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-medium-gray hover:text-charcoal"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-body text-sm font-medium text-charcoal mb-1.5">
                  Confirm Password
                </label>

                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-4 py-3 rounded-[10px] border-[1.5px] border-light-gray bg-white font-body text-sm text-charcoal placeholder:text-medium-gray focus:border-coral focus:ring-[3px] focus:ring-coral/10 outline-none transition-all"
                />
              </div>

              <button
                onClick={handleNext}
                className="w-full py-3.5 rounded-[10px] bg-coral text-white font-body font-semibold text-sm hover:bg-coral-dark transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
              >
                Continue <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="w-full p-4 rounded-xl border-2 border-coral bg-coral/[0.04] text-left flex items-start gap-4">
                <span className="mt-0.5 text-coral">
                  <Heart size={24} />
                </span>

                <div>
                  <p className="font-body font-semibold text-charcoal">Parent</p>
                  <p className="font-body text-sm text-medium-gray">
                    Upload report cards and get clarity checks, teacher conversation
                    support, and 30-day plans.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-[10px] bg-coral text-white font-body font-semibold text-sm hover:bg-coral-dark transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Create Parent Account <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="font-body text-sm text-medium-gray">
              Already have an account?{' '}
              <Link to="/login" className="text-coral font-semibold hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
