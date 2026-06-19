import { useState, useEffect, useRef, type MouseEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, Upload, Brain, FileText, Heart,
  Users, Building, ChevronLeft, ChevronRight, Menu, X, Check, Calendar
} from 'lucide-react';
import ScrollReveal from '@/components/shared/ScrollReveal';

const testimonials = [
  { name: 'Meera Krishnan', role: 'Parent of Grade 5 student', text: 'The AI analysis helped me understand what my daughter\'s teacher was really trying to say. The conversation guide made our talk so much more productive.' },
  { name: 'Ravi Nair', role: 'Parent of Grade 7 student', text: 'I used to dread report card day. Now I feel prepared. The 30-day plan gave us small, doable steps instead of overwhelming advice.' },
  { name: 'Anita Desai', role: 'Parent of twins in Grade 4', text: 'Being able to compare terms and see what actually worked was eye-opening. We could see the improvement from following the plan.' },
  { name: 'Suresh Patel', role: 'Parent of Grade 6 student', text: 'The questions for the teacher were spot-on. Our parent-teacher meeting was the most productive one we\'ve had.' },
  { name: 'Lakshmi Menon', role: 'Parent of Grade 8 student', text: 'I love that it doesn\'t make predictions about my son\'s future. It just gives clear, gentle guidance on what to do next.' },
];

const faqs = [
  { q: 'Is my child\'s data secure?', a: 'Absolutely. All report cards and analysis are stored with encryption. Your child\'s information is never shared with third parties. Teachers and admins cannot see your Clarity Check or conversation guides — only aggregate, anonymized data.' },
  { q: 'What school boards do you support?', a: 'We support CBSE, ICSE, IGCSE, and all major State Boards. Our AI understands the grading system for each board, so a "B" in CBSE is interpreted differently than a "B" in ICSE.' },
  { q: 'Can teachers see what parents see?', a: 'No. Teachers see class-level patterns and individual student flag summaries, but they cannot access your conversation scripts, teacher questions, or 30-day home plans. Your guidance is private to you.' },
  { q: 'How accurate is the AI analysis?', a: 'Our AI is designed to be supportive and advisory, not diagnostic. It identifies patterns in grades and comments, then suggests gentle next steps. Always consult your child\'s teacher for professional educational advice.' },
  { q: 'What if my child\'s school isn\'t using NextStep.AI?', a: 'Parents can use NextStep.AI independently. Simply upload your child\'s report card and select their school board. All features work the same way.' },
];

const subjectRows = [
  { subject: 'Mathematics', status: 'On Track', color: 'bg-sage' },
  { subject: 'Science', status: 'Watch', color: 'bg-amber' },
  { subject: 'English', status: 'Address', color: 'bg-coral' },
  { subject: 'Social Studies', status: 'On Track', color: 'bg-sage' },
  { subject: 'Hindi', status: 'Watch', color: 'bg-amber' },
];

const scriptRows = [
  { label: 'Instead of:', text: 'How did you get a C in Science?' },
  { label: 'Try:', text: 'Which subject felt hardest this term, and why?' },
  { label: 'Instead of:', text: 'You need to study more.' },
  { label: 'Try:', text: 'What would make it easier to focus at home?' },
];

const planRows = [
  { week: 'Week 1', text: 'Ask your child one question about their day at dinner. 5 minutes.' },
  { week: 'Week 2', text: 'Read one page together before bed, 3x a week.' },
  { week: 'Week 3', text: 'Let your child teach you something they learned this week.' },
  { week: 'Week 4', text: 'Check in with the teacher - share one thing that improved.' },
];

const teacherWatchRows = [
  { name: 'Aarav M.', subject: 'English', color: 'bg-coral' },
  { name: 'Maya S.', subject: 'Science', color: 'bg-amber' },
  { name: 'Rohan I.', subject: 'Math', color: 'bg-amber' },
];

function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const shouldReduceMotion = useReducedMotion();
  const [count, setCount] = useState(shouldReduceMotion ? value : 0);

  useEffect(() => {
    if (!isInView || shouldReduceMotion) {
      if (shouldReduceMotion) setCount(value);
      return;
    }

    let frame = 0;
    const frames = 48;
    const timer = window.setInterval(() => {
      frame += 1;
      const progress = 1 - Math.pow(1 - frame / frames, 3);
      setCount(Math.round(value * progress));
      if (frame >= frames) window.clearInterval(timer);
    }, 24);

    return () => window.clearInterval(timer);
  }, [isInView, shouldReduceMotion, value]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

function TiltCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-6, 6]);

  function handleMove(event: MouseEvent<HTMLDivElement>) {
    if (shouldReduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  }

  function handleLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <motion.div
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={shouldReduceMotion ? undefined : { rotateX, rotateY, transformPerspective: 1000 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
}

function ClarityCheckMock() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div>
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 26 }}
        whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="rounded-2xl shadow-card bg-white p-6 md:p-7">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="label-text text-coral mb-1">Clarity Check</p>
              <h4 className="font-display text-2xl font-medium text-charcoal">Term 2</h4>
            </div>
            <span className="font-body text-xs font-semibold text-charcoal/50">Grade 6</span>
          </div>
          <motion.div
            className="space-y-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{
              visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.1 } },
            }}
          >
            {subjectRows.map((row) => (
              <motion.div
                key={row.subject}
                variants={shouldReduceMotion ? undefined : {
                  hidden: { opacity: 0, x: 18 },
                  visible: { opacity: 1, x: 0 },
                }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="flex items-center justify-between rounded-xl border border-light-gray bg-card-surface-alt px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${row.color}`} />
                  <span className="font-body text-sm font-semibold text-charcoal">{row.subject}</span>
                </div>
                <span className="font-body text-xs font-semibold text-charcoal/60">{row.status}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function FloatingMockCard({ children }: { children: ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <TiltCard>
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
        whileInView={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <motion.div
          animate={shouldReduceMotion ? undefined : { y: [0, -6, 0] }}
          transition={shouldReduceMotion ? undefined : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="rounded-2xl shadow-card bg-white p-6 md:p-7"
        >
          {children}
        </motion.div>
      </motion.div>
    </TiltCard>
  );
}

function TonightScriptMock() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <FloatingMockCard>
      <p className="label-text text-coral mb-1">Tonight's Script</p>
      <h4 className="font-display text-2xl font-medium text-charcoal mb-5">A calmer way in</h4>
      <motion.div
        className="space-y-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={{ visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.15 } } }}
      >
        {scriptRows.map((row, index) => (
          <motion.div
            key={`${row.label}-${row.text}`}
            variants={shouldReduceMotion ? undefined : {
              hidden: { opacity: 0, y: 18 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={`rounded-2xl px-4 py-3 ${index % 2 === 0 ? 'bg-card-surface-alt' : 'bg-coral/10 ml-4'}`}
          >
            <span className="font-body text-xs font-semibold text-coral">{row.label}</span>
            <p className="font-body text-sm text-charcoal/80 mt-1">{row.text}</p>
          </motion.div>
        ))}
      </motion.div>
    </FloatingMockCard>
  );
}

function DayPlanMock() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <FloatingMockCard>
      <p className="label-text text-coral mb-1">Your 30-Day Plan</p>
      <h4 className="font-display text-2xl font-medium text-charcoal mb-5">Four small weeks</h4>
      <motion.div
        className="space-y-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={{ visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.1 } } }}
      >
        {planRows.map((row) => (
          <motion.div
            key={row.week}
            variants={shouldReduceMotion ? undefined : {
              hidden: { opacity: 0, x: 18 },
              visible: { opacity: 1, x: 0 },
            }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="rounded-xl border border-light-gray bg-card-surface-alt px-4 py-3"
          >
            <span className="font-body text-xs font-bold text-coral">{row.week}</span>
            <p className="font-body text-sm text-charcoal/80 mt-1">{row.text}</p>
          </motion.div>
        ))}
      </motion.div>
    </FloatingMockCard>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [testimonialPaused, setTestimonialPaused] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const testimonialResumeTimer = useRef<number | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroBgY = useTransform(scrollYProgress, [0, 1], ['0px', '110px']);
  const heroGlowX = useTransform(scrollYProgress, [0, 1], ['12%', '28%']);
  const heroGlowY = useTransform(scrollYProgress, [0, 1], ['18%', '38%']);
  const heroGlowBackground = useTransform(
    [heroGlowX, heroGlowY],
    ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(232, 93, 62, 0.08), transparent 36%)`
  );

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const timer = window.setInterval(() => {
      if (testimonialPaused) return;
      setTestimonialIdx((current) => (current + 1) % testimonials.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [testimonialPaused, shouldReduceMotion]);

  useEffect(() => {
    return () => {
      if (testimonialResumeTimer.current) window.clearTimeout(testimonialResumeTimer.current);
    };
  }, []);

  const pauseTestimonials = () => {
    if (testimonialResumeTimer.current) window.clearTimeout(testimonialResumeTimer.current);
    setTestimonialPaused(true);
  };
  const resumeTestimonialsSoon = () => {
    if (testimonialResumeTimer.current) window.clearTimeout(testimonialResumeTimer.current);
    testimonialResumeTimer.current = window.setTimeout(() => setTestimonialPaused(false), 3000);
  };
  const changeTestimonial = (idx: number) => {
    pauseTestimonials();
    resumeTestimonialsSoon();
    setTestimonialIdx((idx + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-cream/95 backdrop-blur-md border-b border-light-gray' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-5 md:px-12 h-16 md:h-[72px] flex items-center justify-between">
          <Link to="/" className="flex items-baseline gap-0.5">
            <span className="font-display text-xl md:text-2xl font-semibold text-charcoal tracking-tight">NextStep</span>
            <span className="text-coral text-[10px] font-body font-bold">•</span>
            <span className="font-body text-[11px] font-semibold text-charcoal tracking-wider">AI</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <a href="#parents" className="landing-nav-link nav-text text-medium-gray transition-colors duration-200">For Parents</a>
            <a href="#teachers" className="landing-nav-link nav-text text-medium-gray transition-colors duration-200">For Teachers</a>
            <a href="#schools" className="landing-nav-link nav-text text-medium-gray transition-colors duration-200">For Schools</a>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link to="/login" className="btn-text px-5 py-2.5 rounded-lg text-charcoal hover:bg-white/60 transition-colors">Log In</Link>
            <Link to="/signup" className="btn-text px-5 py-2.5 rounded-[10px] bg-coral text-white hover:bg-coral-dark transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">Get Started</Link>
          </div>

          <button onClick={() => setMobileMenu(!mobileMenu)} className="lg:hidden p-2">
            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenu && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-40 bg-charcoal pt-20 px-6 lg:hidden">
          <div className="flex flex-col gap-4">
            <a href="#parents" onClick={() => setMobileMenu(false)} className="text-white/80 text-lg font-body">For Parents</a>
            <a href="#teachers" onClick={() => setMobileMenu(false)} className="text-white/80 text-lg font-body">For Teachers</a>
            <a href="#schools" onClick={() => setMobileMenu(false)} className="text-white/80 text-lg font-body">For Schools</a>
            <div className="border-t border-white/10 pt-4 mt-4 flex flex-col gap-3">
              <Link to="/login" onClick={() => setMobileMenu(false)} className="text-white text-lg font-body">Log In</Link>
              <Link to="/signup" onClick={() => setMobileMenu(false)} className="btn-text px-5 py-3 rounded-[10px] bg-coral text-white text-center">Get Started</Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        className="min-h-screen pt-24 md:pt-[72px] flex items-center relative overflow-hidden"
      >
        {!shouldReduceMotion && (
          <>
            <motion.div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                y: heroBgY,
                background: 'radial-gradient(circle at 78% 24%, rgba(232, 93, 62, 0.08), transparent 34%)',
                willChange: 'transform',
              }}
            />
            <motion.div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background: heroGlowBackground,
              }}
            />
          </>
        )}
        <div className="max-w-7xl mx-auto px-5 md:px-12 w-full">
          <div className="grid lg:grid-cols-[55%_45%] gap-12 lg:gap-8 items-center">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                className="label-text text-coral mb-4"
              >
                Report Card Clarity for Every Parent
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
                className="font-display text-[40px] md:text-[72px] font-medium text-charcoal leading-[1.0] tracking-tight mb-6"
              >
                Turn your child's report card into your{' '}
                <motion.span
                  initial={shouldReduceMotion ? false : { backgroundPosition: '100% 0' }}
                  animate={{ backgroundPosition: '0% 0' }}
                  transition={{ duration: 0.95, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block font-semibold text-transparent bg-clip-text"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, var(--coral) 0 50%, var(--charcoal) 50% 100%)',
                    backgroundSize: '200% 100%',
                  }}
                >
                  next move
                </motion.span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.55 }}
                className="font-body text-lg md:text-xl text-charcoal/70 max-w-[480px] mb-8 leading-relaxed"
              >
                Upload a report card. Get a clear, honest breakdown of what matters — plus the exact words to use with your child and their teacher.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.7 }}
                className="flex flex-wrap gap-4 mb-8"
              >
                <Link to="/signup" className="btn-text px-7 py-3.5 rounded-[10px] bg-coral text-white hover:bg-coral-dark transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2">
                  Upload a Report Card <ArrowRight size={16} />
                </Link>
                <a href="#how-it-works" className="btn-text px-7 py-3.5 rounded-[10px] border-[1.5px] border-charcoal text-charcoal hover:bg-charcoal hover:text-cream transition-all duration-250">
                  See How It Works
                </a>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
                className="flex items-center gap-3"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="w-7 h-7 rounded-full bg-coral/15 border-2 border-cream flex items-center justify-center text-[9px] font-body font-bold text-coral">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <p className="font-body text-sm text-medium-gray">Join <CountUp value={2500} suffix="+" /> parents getting clarity this term</p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.4 }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden shadow-card bg-gradient-to-br from-[#E8DDD0] to-[#D4C4B0] aspect-[4/3] flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 rounded-full bg-coral/15 flex items-center justify-center mx-auto mb-4">
                    <Heart size={32} className="text-coral" />
                  </div>
                  <p className="font-display text-2xl text-charcoal mb-2">Every report card tells a story</p>
                  <p className="font-body text-charcoal/60">We help you read between the grades</p>
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
                className="absolute -bottom-6 -left-6 md:-left-10 bg-white rounded-xl shadow-card-hover p-4 w-[200px]"
              >
                <p className="label-text text-coral mb-2">Clarity Check</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sage" /><span className="font-body text-xs text-charcoal/70">Math — On Track</span></div>
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber" /><span className="font-body text-xs text-charcoal/70">Science — Watch</span></div>
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-coral" /><span className="font-body text-xs text-charcoal/70">English — Address</span></div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-5 md:px-12">
          <ScrollReveal>
            <h2 className="font-display text-[32px] md:text-[56px] font-medium text-charcoal text-center mb-16">Three steps to clarity</h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
            {[
              { num: '01', title: 'Upload', desc: "Snap or upload your child's report card. We support all major school boards and formats.", icon: <Upload size={28} className="text-coral" /> },
              { num: '02', title: 'AI Analysis', desc: 'Our system reads grades, comments, and patterns. We understand context, not just numbers.', icon: <Brain size={28} className="text-coral" /> },
              { num: '03', title: 'Your Plan', desc: 'Get personalized flags, talking points, and a 30-day plan tailored to your child.', icon: <FileText size={28} className="text-coral" /> },
            ].map((step, i) => (
              <ScrollReveal key={step.num} delay={i * 0.2}>
                <div className="text-center md:text-left">
                  <span className="font-display text-[88px] md:text-[104px] font-semibold text-coral/80 leading-none drop-shadow-[0_10px_24px_rgba(232,93,62,0.20)]">{step.num}</span>
                  <div className="flex items-center gap-3 mt-2 mb-3">
                    {step.icon}
                    <h3 className="font-display text-2xl font-medium text-charcoal">{step.title}</h3>
                  </div>
                  <p className="font-body text-charcoal/70 leading-relaxed">{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section id="parents" className="py-20 md:py-28 bg-cream">
        <div className="max-w-7xl mx-auto px-5 md:px-12 space-y-24 md:space-y-32">
          {[
            { label: 'CLARITY CHECK', title: "Know what's worth worrying about", desc: "Our AI flags each subject as green, yellow, or red — with gentle, advisory language. No predictions about your child's future. Just clear, actionable insights.", bullets: ['Board-specific grade interpretation', 'Soft, non-judgmental language', 'Teacher comment analysis'], bg: 'cream' },
            { label: "TONIGHT'S CONVERSATION", title: 'Talk to your child with confidence', desc: 'Get a personalized conversation script that opens dialogue instead of interrogation. Connection-focused phrasing that strengthens your relationship.', bullets: ['Age-appropriate language', 'Connection over evaluation', 'Copy-paste ready scripts'], bg: 'white' },
            { label: '30-DAY PLAN', title: 'Small habits, real progress', desc: 'A concrete, week-by-week action plan tied directly to what was flagged. Not generic advice — targeted steps that address the specific areas from the report card.', bullets: ['Daily and weekly actions', 'Progress tracking', 'Evidence-based suggestions'], bg: 'cream' },
          ].map((feature, i) => (
            <ScrollReveal key={feature.label} direction={i % 2 === 0 ? 'left' : 'right'}>
              <div className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center ${i % 2 !== 0 ? 'md:[direction:rtl]' : ''}`}>
                <div className={`${i % 2 !== 0 ? 'md:[direction:ltr]' : ''}`}>
                  <p className="label-text text-coral mb-3">{feature.label}</p>
                  <h3 className="font-display text-[28px] md:text-[42px] font-normal text-charcoal leading-tight mb-4">{feature.title}</h3>
                  <p className="font-body text-lg text-charcoal/70 leading-relaxed mb-6">{feature.desc}</p>
                  <motion.ul
                    className="space-y-3"
                    initial={shouldReduceMotion ? false : 'hidden'}
                    whileInView={shouldReduceMotion ? undefined : 'visible'}
                    viewport={{ once: true, margin: '-80px' }}
                    variants={{
                      visible: { transition: { staggerChildren: 0.12 } },
                    }}
                  >
                    {feature.bullets.map(b => (
                      <motion.li
                        key={b}
                        variants={shouldReduceMotion ? undefined : {
                          hidden: { opacity: 0, y: 18 },
                          visible: { opacity: 1, y: 0 },
                        }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="flex items-center gap-3"
                      >
                        <Check size={16} className="text-sage flex-shrink-0" />
                        <span className="font-body text-charcoal/80">{b}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </div>
                {feature.label === 'CLARITY CHECK' ? (
                  <ClarityCheckMock />
                ) : feature.label === "TONIGHT'S CONVERSATION" ? (
                  <TonightScriptMock />
                ) : feature.label === '30-DAY PLAN' ? (
                  <DayPlanMock />
                ) : (
                  <TiltCard>
                    <div className={`rounded-2xl overflow-hidden shadow-card aspect-[16/10] flex items-center justify-center ${feature.bg === 'cream' ? 'bg-white' : 'bg-card-surface-alt'}`}>
                      <div className="text-center p-8">
                        <div className="w-16 h-16 rounded-full bg-coral/10 flex items-center justify-center mx-auto mb-3">
                          {feature.label === "TONIGHT'S CONVERSATION" ? <Heart size={24} className="text-coral" /> : <Calendar size={24} className="text-coral" />}
                        </div>
                        <p className="font-display text-lg text-charcoal/80">{feature.title.split(' ').slice(0, 3).join(' ')}...</p>
                      </div>
                    </div>
                  </TiltCard>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Role Entry */}
      <section className="py-20 md:py-28 bg-charcoal">
        <div className="max-w-7xl mx-auto px-5 md:px-12">
          <ScrollReveal>
            <h2 className="font-display text-[32px] md:text-[56px] font-medium text-white text-center mb-4">Built for everyone in your school community</h2>
            <p className="font-body text-lg text-white/60 text-center mb-12">Choose your portal to get started</p>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { id: 'community-parents', icon: <Heart size={32} className="text-coral" />, title: 'For Parents', desc: 'Upload report cards, get AI-powered clarity checks, conversation guides, and personalized 30-day plans.', link: '/signup', cta: 'Enter Parent Portal' },
              { id: 'teachers', icon: <Users size={32} className="text-coral" />, title: 'For Teachers', desc: 'See class-wide patterns, identify students who need attention, and track academic trends across terms.', link: '/signup', cta: 'Enter Teacher Portal' },
              { id: 'schools', icon: <Building size={32} className="text-coral" />, title: 'For Schools', desc: 'Manage classes, student rosters, teacher assignments, and monitor school-wide academic health.', link: '/signup', cta: 'Enter Admin Portal' },
            ].map((role, i) => (
              <ScrollReveal key={role.title} delay={i * 0.12}>
                <TiltCard>
                  <Link id={role.id} to={role.link} className="block bg-dark-surface border border-white/[0.08] rounded-2xl p-8 hover:border-white/[0.15] transition-all duration-300 group scroll-mt-28">
                    {role.icon}
                    <h3 className="font-display text-2xl font-medium text-white mt-4 mb-2">{role.title}</h3>
                    <p className="font-body text-white/60 mb-6 leading-relaxed">{role.desc}</p>
                    {role.title === 'For Teachers' && (
                      <div className="space-y-4 mb-6">
                        <ul className="space-y-2">
                          {[
                            'See which subjects are flagged across your whole class',
                            'Auto-surfaced list of students who need attention',
                            'Add context notes that parents see alongside the AI guidance',
                          ].map((item) => (
                            <li key={item} className="flex items-start gap-2 font-body text-sm text-white/70">
                              <Check size={14} className="text-sage mt-0.5 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                          <p className="label-text text-coral mb-3">Students to Watch</p>
                          <motion.div
                            className="space-y-2"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-80px' }}
                            variants={{ visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.1 } } }}
                          >
                            {teacherWatchRows.map((student) => (
                              <motion.div
                                key={student.name}
                                variants={shouldReduceMotion ? undefined : {
                                  hidden: { opacity: 0, x: 14 },
                                  visible: { opacity: 1, x: 0 },
                                }}
                                className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
                              >
                                <span className="font-body text-sm text-white/80">{student.name}</span>
                                <span className="flex items-center gap-2 font-body text-xs text-white/50">
                                  <span className={`w-2 h-2 rounded-full ${student.color}`} />
                                  {student.subject}
                                </span>
                              </motion.div>
                            ))}
                          </motion.div>
                        </div>
                      </div>
                    )}
                    {role.title === 'For Schools' && (
                      <div className="space-y-4 mb-6">
                        <ul className="space-y-2">
                          {[
                            'Bulk upload report cards for the whole school',
                            'School-wide flag distribution dashboard',
                            'Embed parent guidance directly into your existing parent portal',
                          ].map((item) => (
                            <li key={item} className="flex items-start gap-2 font-body text-sm text-white/70">
                              <Check size={14} className="text-sage mt-0.5 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                        <motion.div
                          className="grid grid-cols-3 gap-2"
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true, margin: '-80px' }}
                          variants={{ visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.1 } } }}
                        >
                          {[
                            ['45', 'Students'],
                            ['3', 'Classes'],
                            ['12', 'Flagged'],
                          ].map(([value, label]) => (
                            <motion.div
                              key={label}
                              variants={shouldReduceMotion ? undefined : {
                                hidden: { opacity: 0, y: 14 },
                                visible: { opacity: 1, y: 0 },
                              }}
                              className="rounded-xl bg-white/5 border border-white/10 p-3 text-center"
                            >
                              <p className="font-display text-2xl text-white mb-1">{value}</p>
                              <p className="font-body text-[11px] text-white/50">{label}</p>
                            </motion.div>
                          ))}
                        </motion.div>
                      </div>
                    )}
                    <span className="font-body text-sm font-semibold text-coral inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                      {role.cta} <ArrowRight size={14} />
                    </span>
                  </Link>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28 bg-cream">
        <div className="max-w-7xl mx-auto px-5 md:px-12">
          <ScrollReveal>
            <h2 className="font-display text-[32px] md:text-[56px] font-medium text-charcoal text-center mb-12">What parents are saying</h2>
          </ScrollReveal>
          <div className="relative" onMouseEnter={pauseTestimonials} onMouseLeave={resumeTestimonialsSoon}>
            <div className="relative min-h-[330px] md:min-h-[280px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={testimonialIdx}
                  initial={shouldReduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                  className="grid md:grid-cols-2 gap-6 absolute inset-0"
                >
                  {[0, 1].map((offset) => {
                    const t = testimonials[(testimonialIdx + offset) % testimonials.length];
                    return (
                      <div key={`${testimonialIdx}-${t.name}`} className="bg-white rounded-2xl shadow-card p-8 h-full">
                        <p className="font-display text-lg md:text-xl text-charcoal italic leading-relaxed mb-6">"{t.text}"</p>
                        <div>
                          <p className="font-body font-medium text-charcoal">{t.name}</p>
                          <p className="font-body text-sm text-medium-gray">{t.role}</p>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => changeTestimonial(testimonialIdx - 1)}
                className="w-10 h-10 rounded-full bg-white border border-light-gray flex items-center justify-center hover:bg-cream transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {testimonials.map((_, i) => (
                <motion.button
                  key={i}
                  onClick={() => changeTestimonial(i)}
                  animate={{ scale: i === testimonialIdx ? 1.3 : 1, opacity: i === testimonialIdx ? 1 : 0.55 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className={`w-2 h-2 rounded-full transition-colors ${i === testimonialIdx ? 'bg-coral' : 'bg-light-gray'}`}
                />
              ))}
              <button
                onClick={() => changeTestimonial(testimonialIdx + 1)}
                className="w-10 h-10 rounded-full bg-white border border-light-gray flex items-center justify-center hover:bg-cream transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-5 md:px-12">
          <ScrollReveal>
            <h2 className="font-display text-[32px] md:text-[56px] font-medium text-charcoal text-center mb-12">Common questions</h2>
          </ScrollReveal>
          <div className="space-y-0">
            {faqs.map((faq, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <div className="border-b border-light-gray">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full py-5 flex items-center justify-between text-left">
                    <span className="font-display text-lg md:text-xl font-medium text-charcoal pr-4">{faq.q}</span>
                    <span className="text-coral text-xl flex-shrink-0">{openFaq === i ? '×' : '+'}</span>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="font-body text-charcoal/70 pb-5 leading-relaxed max-w-xl">{faq.a}</p>
                  </motion.div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-5 md:px-12">
          <div className="grid md:grid-cols-[1fr_1fr_1fr_1fr] gap-10 mb-12">
            <div className="md:col-span-1">
              <span className="font-display text-2xl font-semibold text-white tracking-tight">NextStep<span className="text-coral">.AI</span></span>
              <p className="font-body text-sm text-white/50 mt-3 leading-relaxed">Turn your child's report card into your next move.</p>
            </div>
            <div>
              <p className="label-text text-white/40 mb-4">Product</p>
              <ul className="space-y-2">
                <li><span className="font-body text-sm text-white/60 hover:text-white transition-colors cursor-default">For Parents</span></li>
                <li><span className="font-body text-sm text-white/60 hover:text-white transition-colors cursor-default">For Teachers</span></li>
                <li><span className="font-body text-sm text-white/60 hover:text-white transition-colors cursor-default">For Schools</span></li>
              </ul>
            </div>
            <div>
              <p className="label-text text-white/40 mb-4">Company</p>
              <ul className="space-y-2">
                <li><span className="font-body text-sm text-white/60 hover:text-white transition-colors cursor-default">About</span></li>
                <li><span className="font-body text-sm text-white/60 hover:text-white transition-colors cursor-default">Blog</span></li>
                <li><span className="font-body text-sm text-white/60 hover:text-white transition-colors cursor-default">Support</span></li>
              </ul>
            </div>
            <div>
              <p className="label-text text-white/40 mb-4">Legal</p>
              <ul className="space-y-2">
                <li><span className="font-body text-sm text-white/60 hover:text-white transition-colors cursor-default">Privacy</span></li>
                <li><span className="font-body text-sm text-white/60 hover:text-white transition-colors cursor-default">Terms</span></li>
                <li><span className="font-body text-sm text-white/60 hover:text-white transition-colors cursor-default">Data Security</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-body text-sm text-white/40">© 2026 NextStep.AI. All rights reserved.</p>
            <p className="font-body text-xs text-white/30">Your child's data is private and secure.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
