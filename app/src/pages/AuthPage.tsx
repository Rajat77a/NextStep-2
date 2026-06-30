import { useState, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Mail, User, Chrome, Heart, Users, Building, Home, Sparkles, Search } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/types'

const roles: { id: UserRole; icon: React.ReactNode; title: string; desc: string }[] = [
  { id: 'parent', icon: <Heart size={20} />, title: 'Parent', desc: 'Understand my child\'s report card' },
  { id: 'teacher', icon: <Users size={20} />, title: 'Teacher', desc: 'See class-level insights' },
  { id: 'admin', icon: <Building size={20} />, title: 'School Admin', desc: 'Manage my school\'s account' },
]

type Mode = 'login' | 'signup'

function PillToggle({ mode, onSwitch }: { mode: Mode; onSwitch: (m: Mode) => void }) {
  return (
    <div
      className="relative flex"
      style={{ perspective: '600px', transformStyle: 'preserve-3d' }}
    >
      {(['login', 'signup'] as const).map((tab) => {
        const active = mode === tab
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onSwitch(tab)}
            className="relative z-10 px-7 py-2.5 font-body text-sm font-semibold tracking-wide transition-all duration-300 select-none"
            style={{
              transform: active
                ? 'translateZ(16px) scale(1.02)'
                : 'translateZ(0px) scale(0.96)',
              color: active ? '#fff' : 'rgba(41,37,36,0.5)',
              textShadow: active ? '0 1px 6px rgba(228,88,74,0.4)' : 'none',
            }}
          >
            <span className="relative z-10">
              {tab === 'login' ? 'Sign In' : 'Sign Up'}
            </span>
          </button>
        )
      })}
      <motion.div
        layout
        layoutId="auth-pill-bg"
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="absolute inset-y-1 rounded-full bg-gradient-to-r from-coral to-[#d94a3e] shadow-lg"
        style={{
          width: '50%',
          left: mode === 'login' ? '2px' : 'calc(50% + 2px)',
          boxShadow: '0 4px 20px rgba(228,88,74,0.35)',
        }}
      />
    </div>
  )
}

function NoAccountBanner({
  email,
  onSignUp,
}: {
  email: string
  onSignUp: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="mb-5 p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-coral/5 border border-amber-200/60 shadow-inner overflow-hidden relative"
    >
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-coral/5 rounded-full blur-2xl" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-amber-200/20 rounded-full blur-xl" />
      <div className="relative z-10 flex items-start gap-3.5">
        <span className="shrink-0 mt-0.5 w-9 h-9 rounded-full bg-gradient-to-br from-amber-200 to-coral/20 flex items-center justify-center text-lg">
          <Search size={16} className="text-coral" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-body text-sm font-semibold text-charcoal mb-0.5">
            Hmm, we haven&apos;t met you yet!
          </p>
          <p className="font-body text-xs text-medium-gray leading-relaxed mb-3">
            This email doesn&apos;t have an account here. Let&apos;s fix that!
          </p>
          <button
            type="button"
            onClick={onSignUp}
            className="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-full bg-gradient-to-r from-coral to-[#d94a3e] text-white font-body text-xs font-semibold shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
          >
            Create your account <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function AuthPage({ initialMode = 'login' }: { initialMode?: Mode }) {
  const navigate = useNavigate()
  const { signInWithGoogle, sendOtp, verifyOtp, updateUser, error: authError } = useAuth()

  const [mode, setMode] = useState<Mode>(initialMode)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [userRole, setUserRole] = useState<UserRole>('parent')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [noAccount, setNoAccount] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const switchMode = useCallback((m: Mode) => {
    setMode(m)
    setOtpSent(false)
    setOtp(['', '', '', '', '', ''])
    setError('')
    setNoAccount(false)
  }, [])

  const handleGoogleSignIn = async () => {
    setError('')
    await signInWithGoogle()
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }
    if (mode === 'signup' && !fullName.trim()) {
      setError('Please enter your full name')
      return
    }
    setError('')
    setNoAccount(false)
    setLoading(true)
    try {
      if (mode === 'signup') {
        await sendOtp(email, { data: { full_name: fullName, role: userRole } })
      } else {
        await sendOtp(email, { shouldCreateUser: false })
      }
      setOtpSent(true)
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    } catch (e: any) {
      const msg = e?.message || ''
      if (mode === 'login' && /not found|does not exist|may not exist/i.test(msg)) {
        setNoAccount(true)
      } else {
        setError(msg || 'Failed to send OTP. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const fillOtp = useCallback((code: string) => {
    const digits = code.replace(/\D/g, '').split('')
    if (digits.length !== 6) return
    setOtp(digits)
    inputRefs.current[5]?.focus()
    setLoading(true)
    verifyOtp(email, digits.join(''))
      .then(user => navigate(`/${user.role}`))
      .catch((e: any) => setError(e?.message || 'Invalid or expired code. Please try again.'))
      .finally(() => setLoading(false))
  }, [email, navigate, verifyOtp])

  const handleOtpChange = (index: number, value: string) => {
    if (!value) {
      const newOtp = [...otp]
      newOtp[index] = ''
      setOtp(newOtp)
      return
    }
    if (value.length > 1) {
      fillOtp(value)
      return
    }
    if (!/^\d$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyOtp = async () => {
    const code = otp.join('')
    if (code.length !== 6) { setError('Please enter the full 6-digit code'); return }
    setError('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        await verifyOtp(email, code)
        await updateUser({ fullName, role: userRole })
        navigate(`/${userRole}`)
      } else {
        const user = await verifyOtp(email, code)
        navigate(`/${user.role}`)
      }
    } catch (e: any) {
      setError(e?.message || 'Invalid or expired code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const switchToSignup = useCallback(() => {
    switchMode('signup')
    setNoAccount(false)
  }, [switchMode])

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-5 relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="fixed top-1/4 -left-20 w-72 h-72 bg-coral/[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 -right-20 w-80 h-80 bg-amber-300/[0.03] rounded-full blur-3xl pointer-events-none" />

      {/* Home button */}
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-6 left-6 z-20"
      >
        <Link
          to="/"
          className="group flex items-center gap-2.5 py-2 pl-2.5 pr-4 rounded-full bg-white/95 border border-light-gray/70 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
        >
          <span className="w-7 h-7 rounded-full bg-coral/10 flex items-center justify-center group-hover:bg-coral/15 transition-colors duration-300">
            <Home size={14} className="text-coral" />
          </span>
          <span className="font-body text-sm font-semibold text-charcoal/80 group-hover:text-charcoal transition-colors duration-300">Home</span>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[420px] relative z-10"
      >
        {/* Logo */}
        <Link to="/" className="flex items-baseline gap-0.5 justify-center mb-6">
          <span className="font-display text-3xl font-semibold text-charcoal tracking-tight">NextStep</span>
          <span className="text-coral text-xs font-body font-bold">●</span>
          <span className="font-body text-sm font-semibold text-charcoal tracking-wider">AI</span>
        </Link>

        {/* 3D Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center mb-5"
        >
          <div
            className="inline-flex items-center h-12 p-1 rounded-full bg-white/90 border border-light-gray/60 shadow-sm backdrop-blur-sm"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <PillToggle mode={mode} onSwitch={switchMode} />
          </div>
        </motion.div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-card p-8 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode + (otpSent ? '-otp' : '-form')}
              initial={{ opacity: 0, x: mode === 'login' ? -16 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'login' ? 16 : -16 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 className="font-display text-2xl md:text-3xl font-medium text-charcoal text-center mb-1">
                {otpSent
                  ? 'Check your email'
                  : mode === 'login'
                    ? 'Welcome back'
                    : 'Get started'}
              </h2>
              <p className="font-body text-medium-gray text-center mb-8">
                {otpSent
                  ? `We sent a code to ${email}`
                  : mode === 'login'
                    ? 'Sign in to your portal'
                    : 'Create your account'}
              </p>

              {/* Error message */}
              {(error || authError) && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-coral/10 border border-coral/20 rounded-lg text-coral text-sm font-body"
                >
                  {error || authError}
                </motion.div>
              )}

              {/* "Account not found" creative banner */}
              <AnimatePresence>
                {noAccount && mode === 'login' && !otpSent && (
                  <NoAccountBanner email={email} onSignUp={switchToSignup} />
                )}
              </AnimatePresence>

              {!otpSent ? (
                <>
                  {/* Google OAuth */}
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

                  {/* Email form */}
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    {mode === 'signup' && (
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
                    )}

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

                    {mode === 'signup' && (
                      <div>
                        <label className="block font-body text-sm font-medium text-charcoal mb-1.5">I am a...</label>
                        <div className="grid grid-cols-3 gap-2">
                          {roles.map(r => (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => setUserRole(r.id)}
                              className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                                userRole === r.id
                                  ? 'border-coral bg-coral/[0.04]'
                                  : 'border-light-gray hover:border-charcoal/30'
                              }`}
                            >
                              <span className={`block mb-1 ${userRole === r.id ? 'text-coral' : 'text-medium-gray'}`}>{r.icon}</span>
                              <p className="font-body text-xs font-semibold text-charcoal">{r.title}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-[10px] bg-coral text-white font-body font-semibold text-sm hover:bg-coral-dark transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>{mode === 'login' ? 'Send OTP' : 'Send OTP'} <ArrowRight size={14} /></>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="space-y-6">
                  {/* OTP inputs */}
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => { inputRefs.current[i] = el }}
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
                      <>{mode === 'login' ? 'Verify & Sign In' : 'Create Account'} <ArrowRight size={14} /></>
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      onClick={() => { setOtpSent(false); setOtp(['', '', '', '', '', '']); setNoAccount(false) }}
                      className="font-body text-sm text-medium-gray hover:text-charcoal transition-colors"
                    >
                      Use a different email
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom switch link */}
              {!otpSent && (
                <div className="mt-6 text-center">
                  <p className="font-body text-sm text-medium-gray">
                    {mode === 'login' ? (
                      <>Don&apos;t have an account? <button type="button" onClick={() => switchMode('signup')} className="text-coral font-semibold hover:underline">Sign up</button></>
                    ) : (
                      <>Already have an account? <button type="button" onClick={() => switchMode('login')} className="text-coral font-semibold hover:underline">Log in</button></>
                    )}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}