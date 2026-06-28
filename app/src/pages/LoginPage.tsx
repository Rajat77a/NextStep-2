import { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Chrome, Home } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signInWithGoogle, sendOtp, verifyOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleGoogleSignIn = async () => {
    setError('');
    await signInWithGoogle();
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await sendOtp(email);
      setOtpSent(true);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillOtp = useCallback((code: string) => {
    const digits = code.replace(/\D/g, '').split('');
    if (digits.length !== 6) return;
    setOtp(digits);
    inputRefs.current[5]?.focus();
    setLoading(true);
    verifyOtp(email, digits.join(''))
      .then(user => navigate(`/${user.role}`))
      .catch(() => setError('Invalid or expired code. Please try again.'))
      .finally(() => setLoading(false));
  }, [email, navigate, verifyOtp]);

  const handleOtpChange = (index: number, value: string) => {
    if (!value) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }
    if (value.length > 1) {
      fillOtp(value);
      return;
    }
    if (!/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the full 6-digit code');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await verifyOtp(email, code);
      navigate(`/${user.role}`);
    } catch {
      setError('Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-5 relative">
      <Link
        to="/"
        className="absolute top-5 right-5 flex items-center gap-2 py-2 px-4 rounded-[10px] bg-coral text-white font-body font-semibold text-sm hover:bg-coral-dark hover:scale-[1.02] active:scale-[0.98] shadow-md transition-all duration-200"
      >
        <Home size={16} />
        Home
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[420px]"
      >
        <Link to="/" className="flex items-baseline gap-0.5 justify-center mb-8">
          <span className="font-display text-3xl font-semibold text-charcoal tracking-tight">NextStep</span>
          <span className="text-coral text-xs font-body font-bold">●</span>
          <span className="font-body text-sm font-semibold text-charcoal tracking-wider">AI</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-card p-8 md:p-10">
          <h2 className="font-display text-2xl md:text-3xl font-medium text-charcoal text-center mb-1">
            {otpSent ? 'Check your email' : 'Welcome back'}
          </h2>
          <p className="font-body text-medium-gray text-center mb-8">
            {otpSent ? `We sent a code to ${email}` : 'Sign in to your portal'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-coral/10 border border-coral/20 rounded-lg text-coral text-sm font-body">
              {error}
            </div>
          )}

          {!otpSent ? (
            <>
              <button
                onClick={handleGoogleSignIn}
                className="w-full py-3.5 rounded-[10px] border-[1.5px] border-light-gray bg-white text-charcoal font-body font-semibold text-sm hover:border-charcoal/30 hover:shadow-card transition-all duration-200 flex items-center justify-center gap-3"
              >
                <Chrome size={18} />
                Continue with Google
              </button>

              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-light-gray" />
                <span className="font-body text-xs text-medium-gray">or</span>
                <div className="flex-1 h-px bg-light-gray" />
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4">
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-[10px] bg-coral text-white font-body font-semibold text-sm hover:bg-coral-dark transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Send OTP <ArrowRight size={14} /></>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={i === 0 ? 6 : 1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className="w-11 h-12 text-center rounded-[10px] border-[1.5px] border-light-gray bg-white font-body text-lg font-semibold text-charcoal focus:border-coral focus:ring-[3px] focus:ring-coral/10 outline-none transition-all"
                  />
                ))}
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.join('').length !== 6}
                className="w-full py-3.5 rounded-[10px] bg-coral text-white font-body font-semibold text-sm hover:bg-coral-dark transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Verify & Sign In <ArrowRight size={14} /></>
                )}
              </button>

              <div className="text-center">
                <button
                  onClick={() => { setOtpSent(false); setOtp(['', '', '', '', '', '']); }}
                  className="font-body text-sm text-medium-gray hover:text-charcoal transition-colors"
                >
                  Use a different email
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="font-body text-sm text-medium-gray">
              Don't have an account? <Link to="/signup" className="text-coral font-semibold hover:underline">Sign up</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}