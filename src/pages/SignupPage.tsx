import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, User, Chrome, Heart, Users, Building } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';

const roles: { id: UserRole; icon: React.ReactNode; title: string; desc: string }[] = [
  { id: 'parent', icon: <Heart size={20} />, title: 'Parent', desc: 'Understand my child\'s report card' },
  { id: 'teacher', icon: <Users size={20} />, title: 'Teacher', desc: 'See class-level insights' },
  { id: 'admin', icon: <Building size={20} />, title: 'School Admin', desc: 'Manage my school\'s account' },
];

export default function SignupPage() {
  const navigate = useNavigate();
  const { signInWithGoogle, sendOtp, verifyOtp, updateUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('parent');
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
    if (!fullName.trim()) { setError('Please enter your full name'); return; }
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

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
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
    if (code.length !== 6) { setError('Please enter the full 6-digit code'); return; }
    setError('');
    setLoading(true);
    try {
      const user = await verifyOtp(email, code);
      await updateUser({ fullName, role });
      navigate(`/${user.role}`);
    } catch {
      setError('Invalid or expired code. Please try again.');
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
          <span className="font-display text-3xl font-semibold text-charcoal tracking-tight">NextStep</span>
          <span className="text-coral text-xs font-body font-bold">●</span>
          <span className="font-body text-sm font-semibold text-charcoal tracking-wider">AI</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-card p-8 md:p-10">
          <h2 className="font-display text-2xl md:text-3xl font-medium text-charcoal text-center mb-1">
            {otpSent ? 'Check your email' : 'Get started'}
          </h2>
          <p className="font-body text-medium-gray text-center mb-8">
            {otpSent ? `We sent a code to ${email}` : 'Create your account'}
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
                  <label className="block font-body text-sm font-medium text-charcoal mb-1.5">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-medium-gray" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full pl-10 pr-4 py-3 rounded-[10px] border-[1.5px] border-light-gray bg-white font-body text-sm text-charcoal placeholder:text-medium-gray focus:border-coral focus:ring-[3px] focus:ring-coral/10 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

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
                  <label className="block font-body text-sm font-medium text-charcoal mb-1.5">I am a...</label>
                  <div className="grid grid-cols-3 gap-2">
                    {roles.map(r => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRole(r.id)}
                        className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                          role === r.id
                            ? 'border-coral bg-coral/[0.04]'
                            : 'border-light-gray hover:border-charcoal/30'
                        }`}
                      >
                        <span className={`block mb-1 ${role === r.id ? 'text-coral' : 'text-medium-gray'}`}>{r.icon}</span>
                        <p className="font-body text-xs font-semibold text-charcoal">{r.title}</p>
                      </button>
                    ))}
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
                    maxLength={1}
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
                  <>Create Account <ArrowRight size={14} /></>
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
              Already have an account? <Link to="/login" className="text-coral font-semibold hover:underline">Log in</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}